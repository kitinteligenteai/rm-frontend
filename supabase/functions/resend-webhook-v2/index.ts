// supabase/functions/resend-webhook-v2/index.ts
// Versión final corregida - 30 Sept 2025
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
console.log('Function resend-webhook-v2 started');
Deno.serve(async (req)=>{
  try {
    console.log('Request received. Method:', req.method);
    if (req.method === 'OPTIONS') {
      console.log('Responding to OPTIONS request');
      return new Response('ok', {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'content-type'
        }
      });
    }
    const body = await req.json();
    console.log('Request body parsed:', JSON.stringify(body, null, 2));
    const eventType = body.type;
    // --- LA LÍNEA CORREGIDA ---
    const emailId = body.data?.email_id;
    if (!emailId) {
      console.error('CRITICAL: No email_id found in payload. Cannot process. Payload:', body);
      return new Response('OK (No email_id found)', {
        status: 200
      });
    }
    console.log(`Processing event: ${eventType} for email_id: ${emailId}`);
    const supabase = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '');
    console.log('Supabase client created.');
    let updatePayload = {
      updated_at: new Date().toISOString()
    };
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
      const { data, error } = await supabase.from('outbox_emails').update(updatePayload).eq('provider_message_id', emailId).select();
      if (error) {
        console.error('Supabase update error:', error.message);
        throw new Error(`Supabase update failed: ${error.message}`);
      }
      console.log('Supabase update successful. Rows updated:', data);
      if (data && data.length === 0) {
        console.warn('WARNING: Update query ran, but no rows matched the provider_message_id. Check if the ID exists in the outbox_emails table.');
      }
    } else {
      console.log(`Event type ${eventType} is not handled. Ignoring.`);
    }
    return new Response('OK', {
      status: 200
    });
  } catch (e) {
    console.error('FATAL ERROR in webhook:', e.message);
    return new Response(`Internal Server Error: ${e.message}`, {
      status: 200
    });
  }
});
