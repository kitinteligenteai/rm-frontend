import { readFile } from 'node:fs/promises';
if(process.env.RM_PROVIDER_READY==='true')throw Error('No public diagnostics with provider credentials');
for(const name of ['rm-functions.log','rm-gateway.log']){
 const content=await readFile(process.env.RUNNER_TEMP+'/'+name,'utf8').catch(()=>'');
 const lines=content.split('\n').filter(x=>/error|failed|exception|listening|serving/i.test(x)).slice(-12);
 console.log(name,lines.map(x=>x.replace(/[A-Za-z0-9_-]{30,}/g,'[redacted]').replace(/https?:\/\/[^\s]+/g,'[url]')).join('\n'));
}
const r=await fetch('http://127.0.0.1:54321/functions/v1/mp-webhook-v3',{method:'POST',body:'{}',signal:AbortSignal.timeout(10000)}).catch(()=>null);
if(r){const json=await r.json().catch(()=>({}));console.log('Local callback response',r.status,JSON.stringify({code:json.code,error:json.error,message:json.message}).slice(0,800).replace(/[A-Za-z0-9_-]{30,}/g,'[redacted]'));}
