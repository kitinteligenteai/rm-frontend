import {assertEnvironment} from '../supabase/functions/_shared/environment.ts';
const get=key=>process.env[key];
for(const key of ['PAYMENT_ENV','EMAIL_ENV','GUMROAD_ENV']){
 if(get(key)!=='test')throw Error(`${key} must be test`);assertEnvironment(get,key);
}
const url=new URL(get('SUPABASE_URL')||'');
if(url.protocol!=='https:' && !['127.0.0.1','localhost'].includes(url.hostname))throw Error('Invalid staging origin');
if(!get('MP_ACCESS_TOKEN')?.startsWith('TEST-'))throw Error('MP TEST credentials required');
for(const key of ['BARK_URL','NTFY_TOPIC'])if(get(key))throw Error('Disable production notifications in staging');
console.log('Staging target, explicit recipients and test mode validated. No external call made.');
