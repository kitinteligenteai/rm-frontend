// supabase/functions/resend-webhook/index.ts
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

console.log('Function resend-webhook started' );

Deno.serve(async (req) => {
  try {
    console.log('Request received. Method:', req.method);

    if (req.method === 'OPTIONS') {
      console.log('Responding to OPTIONS request');
      return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'content-type' } });
    }

    const body = await req.json();
    console.log('Request body parsed:', JSON.stringify(body, null, 2));

    const eventType = body.type;
    const emailId = body.data?.id;

    if (!emailId) {
      console.log('No email ID found in payload. Ignoring.');
      return new Response('OK (No email ID)', { status: 200 });
    }

    console.log(`Processing event: ${eventType} for email ID: ${emailId}`);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    console.log('Supabase client created.');

    let updatePayload: Record<string, any> = { updated_at: new Date().toISOString() };
    let newStatus = '';

    if (eventType === 'email.delivered') newStatus = 'delivered';
    if (eventType === 'email.bounced') newStatus = 'bounced';

    if (newStatus) {
      updatePayload.status = newStatus;
      if (body.data.bounce) {
        updatePayload.last_error = `Bounced: ${body.data.bounce.reason || 'Unknown'}`;
      }

      console.log('Attempting to update outbox_emails with payload:', updatePayload);
      console.log(`Matching provider_message_id: ${emailId}`);

      const { data, error } = await supabase
        .from('outbox_emails')
        .update(updatePayload)
        .eq('provider_message_id', emailId)
        .select();

      if (error) {
        console.error('Supabase update error:', error.message);
        throw new Error(`Supabase update failed: ${error.message}`);
      }

      console.log('Supabase update successful. Rows updated:', data);
      if (data && data.length === 0) {
        console.warn('Update successful, but no rows matched the provider_message_id. Check if the ID exists in the table.');
      }

    } else {
      console.log(`Event type ${eventType} is not handled. Ignoring.`);
    }

    return new Response('OK', { status: 200 });

  } catch (e) {
    console.error('FATAL ERROR in webhook:', e.message);
    return new Response(`Internal Server Error: ${e.message}`, { status: 200 });
  }
});
