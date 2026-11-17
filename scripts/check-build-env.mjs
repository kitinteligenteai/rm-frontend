// Avoid shipping a staging UI wired to the production database.
if(process.env.VITE_DEPLOYMENT_ENV==='staging'){
 const url=process.env.VITE_SUPABASE_URL||'';
 if(!url || url.includes('mgjzlohapnepvrqlxmpo'))throw Error('Staging build must use an isolated Supabase URL');
 if(process.env.VITE_PAYMENTS_ENV!=='test')throw Error('Staging build requires test payments');
}
