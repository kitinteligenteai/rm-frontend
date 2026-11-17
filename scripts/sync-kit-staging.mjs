import {readFile} from 'node:fs/promises';import {createHash} from 'node:crypto';import {createClient} from '@supabase/supabase-js';import {assertEnvironment} from '../supabase/functions/_shared/environment.ts';
if(process.env.PAYMENT_ENV!=='test')throw Error('Staging TEST only');assertEnvironment(key=>process.env[key]);
const path=process.argv[2];if(!path)throw Error('Pass the reviewed local candidate PDF path');const bytes=await readFile(path);if(bytes.subarray(0,5).toString()!=='%PDF-')throw Error('Expected a PDF');
const db=createClient(process.env.SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY);const bucket='productos-digitales';const {data,error}=await db.storage.getBucket(bucket);
if(error){const result=await db.storage.createBucket(bucket,{public:false,allowedMimeTypes:['application/pdf'],fileSizeLimit:10000000});if(result.error)throw Error('Unable to prepare private staging bucket');}else if(data.public)throw Error('Refusing a public product bucket');
const result=await db.storage.from(bucket).upload('kit-7-dias.pdf',bytes,{contentType:'application/pdf',upsert:false});if(result.error)throw Error('Upload failed; existing objects are never overwritten');
console.log(JSON.stringify({privateStagingKitUploaded:true,sha256:createHash('sha256').update(bytes).digest('hex')}));
