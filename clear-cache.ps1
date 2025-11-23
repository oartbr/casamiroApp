# PowerShell script to clear Next.js cache
Write-Host "Clearing Next.js cache..." -ForegroundColor Yellow

if (Test-Path .next) {
    Remove-Item -Recurse -Force .next
    Write-Host "✓ Cleared .next folder" -ForegroundColor Green
} else {
    Write-Host "  .next folder not found" -ForegroundColor Gray
}

if (Test-Path node_modules\.cache) {
    Remove-Item -Recurse -Force node_modules\.cache
    Write-Host "✓ Cleared node_modules cache" -ForegroundColor Green
} else {
    Write-Host "  node_modules cache not found" -ForegroundColor Gray
}

Write-Host "`nCache cleared successfully! You can now run 'npm run dev' again." -ForegroundColor Green




