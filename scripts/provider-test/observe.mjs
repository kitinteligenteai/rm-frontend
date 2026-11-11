import { createClient } from '@supabase/supabase-js';
import { appendFile, readFile } from 'node:fs/promises';
const db=createClient(process.env.API_URL,process.env.SERVICE_ROLE_KEY,{auth:{persistSession:false}});
if(process.env.API_URL!=='http://127.0.0.1:54321' || process.env.RM_PROVIDER_READY!=='true') throw Error('Configured disposable runner required');
const evidence={approvedKit:false,approvedProgram:false,rejectedOrPendingDenied:false,deliveryKit:false,deliveryProgram:false,activation:false};
// A private, expiring candidate URL may be supplied. It is never put in logs/artifacts.
if(process.env.RM_TEST_KIT_PDF_URL){
 const input=new URL(process.env.RM_TEST_KIT_PDF_URL);
 if(input.protocol!=='https:')throw Error('HTTPS candidate PDF required');
 const r=await fetch(input,{signal:AbortSignal.timeout(30000)});
 if(!r.ok)throw Error('Private PDF unavailable');
 const bytes=new Uint8Array(await r.arrayBuffer());
 if(bytes.length>10000000 || new TextDecoder().decode(bytes.slice(0,5))!=='%PDF-')throw Error('Invalid candidate PDF');
 const bucket=await db.storage.createBucket('productos-digitales',{public:false});
 if(bucket.error)throw Error('Private test bucket failed');
 const upload=await db.storage.from('productos-digitales').upload('kit-7-dias.pdf',bytes,{contentType:'application/pdf'});
 if(upload.error)throw Error('Private test PDF upload failed');
}
const until=Date.now()+25*60*1000;
console.log('TEST window open for 25 minutes. Configure TEST webhook URLs and purchase through the gated site.');
while(Date.now()<until){
 const worker=await fetch(process.env.API_URL+'/functions/v1/email-worker-v2',{method:'POST',headers:{authorization:'Bearer '+process.env.SERVICE_ROLE_KEY},signal:AbortSignal.timeout(25000)});
 if(!worker.ok)throw Error('Local email worker unavailable');
 const {data:p,error:pe}=await db.from('purchases').select('product_id,status');
 const {data:j,error:je}=await db.from('outbox_emails').select('template,status');
 if(pe||je)throw Error('Local evidence lookup failed');
 evidence.approvedKit=p.some(x=>x.product_id==='kit-7-dias'&&x.status==='approved');
 evidence.approvedProgram=p.some(x=>x.product_id==='programa-completo'&&x.status==='approved');
 evidence.deliveryKit=j.some(x=>x.template==='welcome-kit'&&x.status==='delivered');
 evidence.deliveryProgram=j.some(x=>x.template==='welcome-program'&&x.status==='delivered');
 const {data:users,error:ue}=await db.auth.admin.listUsers();
 if(ue)throw Error('Local activation lookup failed');
 evidence.activation=users.users.some(u=>!!u.last_sign_in_at);
 await new Promise(r=>setTimeout(r,10000));
}
await appendFile(process.env.GITHUB_STEP_SUMMARY,'\nObserved evidence (provider statuses only)\n```json\n'+JSON.stringify(evidence,null,2)+'\n```\nDownload bytes, rejected/pending access, retry idempotence, mailbox receipt and password recovery still require explicit verification.\n');
if(!Object.entries(evidence).filter(([k])=>k!=='rejectedOrPendingDenied').every(([,v])=>v))process.exitCode=1;
