# make_context.ps1
$outfile = "context_package.txt"
"=== CONTEXT PACKAGE - Reinicio Metabolico ===`n" | Out-File $outfile -Encoding utf8
"Date: $(Get-Date)`n" | Out-File $outfile -Append
"Git branch: $(git rev-parse --abbrev-ref HEAD 2>$null)`n" | Out-File $outfile -Append
"`n--- Modified files (git status) ---`n" | Out-File $outfile -Append
# Try to get git status; if git not available this will write nothing
try {
  git status --porcelain 2>$null | Out-File -Append $outfile
} catch {}
"`n--- Git diff (names only) ---`n" | Out-File -Append $outfile
try {
  git diff --name-only HEAD 2>$null | Out-File -Append $outfile
} catch {}
"`n--- Last commits (5) ---`n" | Out-File -Append $outfile
try {
  git log -n 5 --oneline 2>$null | Out-File -Append $outfile
} catch {}
"`n--- HEAD of key files ---`n" | Out-File -Append $outfile
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
  "`n--- FILE: $f ---`n" | Out-File -Append $outfile
  if (Test-Path $f) {
    # write up to 200 lines from the file (if shorter, write whole file)
    Get-Content $f -TotalCount 200 | Out-File -Append $outfile
  } else {
    "FILE NOT FOUND: $f" | Out-File -Append $outfile
  }
}

"`n--- END OF CONTEXT PACKAGE ---`n" | Out-File -Append $outfile

Write-Host "Context package creado: $outfile"
