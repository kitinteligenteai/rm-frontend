import {test} from 'node:test';import assert from 'node:assert/strict';import {bootstrapSQL} from '../scripts/prepare-staging.mjs';import {PGlite} from '@electric-sql/pglite';
test('isolated bootstrap validates staging constraints and protections; refuses a nonempty project',async()=>{
 const db=new PGlite();try{
 await db.exec(`create role anon;create role authenticated;create role service_role bypassrls;create schema auth;create table auth.users(id uuid primary key,email text);create function auth.uid() returns uuid language sql stable as $$select null::uuid$$;create function auth.jwt() returns jsonb language sql stable as $$select '{}'::jsonb$$;grant usage on schema public,auth to anon,authenticated,service_role;`);
 const sql=await bootstrapSQL();await db.exec(sql);
 assert.equal((await db.query("select count(*)::int as n from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relkind='r'")).rows[0].n,11);
 assert.equal((await db.query("select has_function_privilege('anon','record_verified_gumroad_sale(uuid,text,text,text,integer,text,jsonb)','execute') as allowed")).rows[0].allowed,false);
 await assert.rejects(()=>db.exec(sql),/Refusing bootstrap/);
 }finally{await db.close();}
});
