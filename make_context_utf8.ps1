# make_context_utf8.ps1
$outfile = "context_package.txt"

# Borrar archivo viejo si existe
if (Test-Path $outfile) { Remove-Item $outfile -Force }

# Cabeceras (escribimos con UTF8)
"=== CONTEXT PACKAGE - Reinicio Metabolico ===" | Out-File -FilePath $outfile -Encoding UTF8
("Date: {0}" -f (Get-Date)) | Add-Content -Path $outfile -Encoding UTF8

# Intentar obtener branch git (si git no está, quedará vacío)
try {
  $branch = git rev-parse --abbrev-ref HEAD 2>$null
} catch {
  $branch = ""
}
("Git branch: {0}" -f $branch) | Add-Content -Path $outfile -Encoding UTF8

Add-Content -Path $outfile -Value "`n--- Modified files (git status) ---`n" -Encoding UTF8
try {
  git status --porcelain 2>$null | Add-Content -Path $outfile -Encoding UTF8
} catch {}

Add-Content -Path $outfile -Value "`n--- Git diff (names only) ---`n" -Encoding UTF8
try {
  git diff --name-only HEAD 2>$null | Add-Content -Path $outfile -Encoding UTF8
} catch {}

Add-Content -Path $outfile -Value "`n--- Last commits (5) ---`n" -Encoding UTF8
try {
  git log -n 5 --oneline 2>$null | Add-Content -Path $outfile -Encoding UTF8
} catch {}

Add-Content -Path $outfile -Value "`n--- HEAD of key files ---`n" -Encoding UTF8
$files = @(
  "supabase/functions/mp-generate-preference-v2/index.ts",
  "supabase/functions/mp-webhook-v3/index.ts",
  "src/components/common/MercadoPagoButton.jsx",
  "src/components/SmartCheckoutCTA.jsx",
  "src/pages/Home.jsx",
  "index.html",
  "tailwind.config.js",
  "src/index.css"
)

foreach ($f in $files) {
  Add-Content -Path $outfile -Value ("`n--- FILE: {0} ---`n" -f $f) -Encoding UTF8
  if (Test-Path $f) {
    # escribimos hasta 200 líneas del archivo con la misma codificación (UTF8)
    try {
      Get-Content -Path $f -TotalCount 200 | Add-Content -Path $outfile -Encoding UTF8
    } catch {
      Add-Content -Path $outfile -Value "ERROR READING FILE: $f" -Encoding UTF8
    }
  } else {
    Add-Content -Path $outfile -Value "FILE NOT FOUND: $f" -Encoding UTF8
  }
}

Add-Content -Path $outfile -Value "`n--- END OF CONTEXT PACKAGE ---`n" -Encoding UTF8

Write-Host "Context package (UTF8) creado: $outfile"
