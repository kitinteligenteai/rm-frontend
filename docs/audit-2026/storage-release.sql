-- SEPARATE EXPLICIT PRODUCTION APPROVAL REQUIRED.
-- First upload the clinically corrected kit PDF and test signed delivery in staging.
-- Then coordinate this with removal of /public/kits/kit-7-dias.pdf and email template changes.
begin;
update storage.buckets set public=false where id='productos-digitales';
commit;
-- Verify: old public Storage URL and old web /kits URL must not return PDF bytes.
-- Existing recipients of the former public link need a support/download recovery path.
