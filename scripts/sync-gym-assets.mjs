import {readdir,readFile} from 'node:fs/promises';import {createClient} from '@supabase/supabase-js';
import {assertEnvironment} from '../supabase/functions/_shared/environment.ts';
if(process.env.PAYMENT_ENV!=='test')throw Error('This uploader is staging-only');
assertEnvironment(key=>process.env[key]);
const db=createClient(process.env.SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY);
const {data,error}=await db.storage.getBucket('gimnasio');
if(error){const result=await db.storage.createBucket('gimnasio',{public:true,allowedMimeTypes:['image/webp'],fileSizeLimit:500000});if(result.error)throw Error('Unable to prepare staging bucket');}
else if(!data.public)throw Error('Staging gym bucket must be public for exercise illustrations');
for(const name of await readdir(new URL('../public/media/gym/',import.meta.url))){
 if(!name.endsWith('.webp'))continue;
 const bytes=await readFile(new URL('../public/media/gym/'+name,import.meta.url));
 const result=await db.storage.from('gimnasio').upload(name,bytes,{contentType:'image/webp',upsert:false});
 if(result.error)throw Error(`Upload failed (existing assets are never overwritten): ${name}`);
}
console.log('20 staging exercise assets uploaded. No production target permitted.');
