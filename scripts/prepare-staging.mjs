import { pathToFileURL } from 'node:url';
import {readFile,writeFile} from 'node:fs/promises';
import {schemaBaseline} from './schema-baseline.mjs';
export async function bootstrapSQL() {
const migrationNames=['20261029025222_launch_security_and_continuity.sql','20261029234602_gumroad_verified_sales.sql'];
const chunks=[];
for(const name of migrationNames)chunks.push((await readFile(new URL('../supabase/migrations/'+name,import.meta.url),'utf8')).replace(/^begin;\s*$/gmi,'').replace(/^commit;\s*$/gmi,''));
const guard=`-- ISOLATED EMPTY PROJECT ONLY. This file is not a production migration.
-- No customer rows, provider credentials, email workers or crons are copied.
begin;
do $$begin if exists(select 1 from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relkind='r') then raise exception 'Refusing bootstrap: public schema is not empty'; end if; end $$;
`;
const trigger='create trigger trg_sync_purchase_email after insert or update of email_final on public.checkout_sessions for each row execute function public.sync_purchase_email_from_session();';
return guard+schemaBaseline()+'\n'+chunks.join('\n')+'\n'+trigger+'\ncommit;\n';
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
await writeFile(new URL('../supabase/staging/bootstrap.sql',import.meta.url),await bootstrapSQL());
console.log('Prepared supabase/staging/bootstrap.sql; NOT executed. Empty isolated Supabase project required.');
}
