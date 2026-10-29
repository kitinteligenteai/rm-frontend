-- Read-only metadata inspection. Do not print application data or cron command text.
select c.relname,c.relkind,c.relrowsecurity,c.reloptions,
 has_table_privilege('anon',c.oid,'select') anon_select,
 has_table_privilege('authenticated',c.oid,'select') authenticated_select
from pg_class c join pg_namespace n on n.oid=c.relnamespace
where n.nspname='public' and c.relkind in ('r','v') order by c.relname;

select p.oid::regprocedure signature,p.prosecdef,p.proconfig,
 has_function_privilege('anon',p.oid,'execute') anon_execute,
 has_function_privilege('authenticated',p.oid,'execute') authenticated_execute
from pg_proc p join pg_namespace n on p.pronamespace=n.oid
where n.nspname='public' and p.prokind='f' order by p.proname;

select tablename,policyname,roles,cmd,qual,with_check
from pg_policies where schemaname in ('public','storage');
