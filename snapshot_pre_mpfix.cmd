@echo off
echo =============================================
echo 🧩 SNAPSHOT DE SEGURIDAD - PRE MP FIX (v7.8)
echo =============================================
cd /d C:\Users\Mike\Desktop\rm-frontend

echo.
echo 🗄️ 1. Creando carpeta de backups...
mkdir supabase\backups

echo.
echo 💾 2. Dump completo de la base actual...
npx supabase db dump -f supabase\backups\2025_10_27_pre_mpfix.sql

echo.
echo 🔐 3. Respaldando variables de entorno (.env.local)...
copy .env.local supabase\backups\.env_local_2025_10_27_pre_mpfix

echo.
echo 🏷️ 4. Etiquetando versión en Git...
git add -A
git commit -m "v7.8-pre-mpfix | estado funcional antes de ajustes MercadoPago"
git tag -a v7.8-pre-mpfix -m "Snapshot antes del fix MP"
git push origin main --tags

echo.
echo ✅ Snapshot completo creado.
pause
