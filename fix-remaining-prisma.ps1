# Comprehensive Prisma to Supabase conversion script
# This script fixes all remaining Prisma-style queries

$ErrorActionPreference = "Stop"

Write-Host "Starting comprehensive Prisma to Supabase conversion..." -ForegroundColor Cyan

# List of files to fix
$filesToFix = @(
    "apps/backend/src/auth/mfa/mfa.service.ts",
    "apps/backend/src/compliance/fraud.service.ts",
    "apps/backend/src/compliance/complaints.service.ts",
    "apps/backend/src/compliance/reporting.service.ts",
    "apps/backend/src/compliance/breach-incident.service.ts",
    "apps/backend/src/compliance/sars-reporting.service.ts",
    "apps/backend/src/finance/ledger.service.ts",
    "apps/backend/src/finance/reconciliation.service.ts",
    "apps/backend/src/popia/popia.service.ts",
    "apps/backend/src/popia/data-subject-request.service.ts"
)

$fixedCount = 0

foreach ($file in $filesToFix) {
    if (!(Test-Path $file)) {
        Write-Host "  Skipping $file (not found)" -ForegroundColor Yellow
        continue
    }
    
    Write-Host "`nProcessing: $file" -ForegroundColor Green
    $content = Get-Content $file -Raw
    $originalContent = $content
    
    # Fix common Prisma patterns
    # Pattern 1: .findUnique({ where: { ... } })
    $content = $content -replace '\.getClient\(\)\.([\w]+)\.findUnique\(\s*\{\s*where:', '.getClient().from(''$1s'').select(''*'').eq('
    
    # Pattern 2: .findMany({ where: { ... } })
    $content = $content -replace '\.getClient\(\)\.([\w]+)\.findMany\(\s*\{\s*where:', '.getClient().from(''$1s'').select(''*'').match('
    
    # Pattern 3: .findFirst({ where: { ... } })
    $content = $content -replace '\.getClient\(\)\.([\w]+)\.findFirst\(\s*\{\s*where:', '.getClient().from(''$1s'').select(''*'').match('
    
    # Pattern 4: .create({ data: { ... } })
    $content = $content -replace '\.getClient\(\)\.([\w]+)\.create\(\s*\{\s*data:', '.getClient().from(''$1s'').insert('
    
    # Pattern 5: .update({ where: { ... }, data: { ... } })
    $content = $content -replace '\.getClient\(\)\.([\w]+)\.update\(\s*\{\s*where:', '.getClient().from(''$1s'').update('
    
    # Pattern 6: .delete({ where: { ... } })
    $content = $content -replace '\.getClient\(\)\.([\w]+)\.delete\(\s*\{\s*where:', '.getClient().from(''$1s'').delete().match('
    
    # Pattern 7: .deleteMany({ where: { ... } })
    $content = $content -replace '\.getClient\(\)\.([\w]+)\.deleteMany\(\s*\{\s*where:', '.getClient().from(''$1s'').delete().match('
    
    # Pattern 8: .count({ where: { ... } })
    $content = $content -replace '\.getClient\(\)\.([\w]+)\.count\(\s*\{\s*where:', '.getClient().from(''$1s'').select(''*'', { count: ''exact'', head: true }).match('
    
    # Pattern 9: .count() without where
    $content = $content -replace '\.getClient\(\)\.([\w]+)\.count\(\s*\)', '.getClient().from(''$1s'').select(''*'', { count: ''exact'', head: true })'
    
    # Pattern 10: .groupBy({ by: [...] })
    $content = $content -replace '\.getClient\(\)\.([\w]+)\.groupBy\(', '// TODO: Implement groupBy with Supabase - .getClient().from(''$1s'').select('
    
    if ($content -ne $originalContent) {
        Set-Content -Path $file -Value $content -NoNewline
        Write-Host "  ✓ Fixed Prisma patterns in $file" -ForegroundColor Green
        $fixedCount++
    }
    else {
        Write-Host "  - No Prisma patterns found in $file" -ForegroundColor Gray
    }
}

Write-Host "`n✓ Conversion complete! Fixed $fixedCount files." -ForegroundColor Cyan
Write-Host "Note: Some complex queries may need manual review." -ForegroundColor Yellow
