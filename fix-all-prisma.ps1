# Comprehensive script to fix all Prisma-style queries to Supabase
$ErrorActionPreference = "Continue"

$files = Get-ChildItem -Path "apps/backend/src" -Recurse -Filter "*.service.ts" -File
Write-Host "Found $($files.Count) service files to process"

foreach ($file in $files) {
    Write-Host "`nProcessing: $($file.Name)"
    
    $content = Get-Content $file.FullName -Raw
    $originalContent = $content
    
    # Users table
    $content = $content -replace '\.getClient\(\)\.user\.findUnique\(', '.getClient().from(''users'').select(''*'').eq('
    $content = $content -replace '\.getClient\(\)\.user\.findMany\(', '.getClient().from(''users'').select(''*'')'
    $content = $content -replace '\.getClient\(\)\.user\.findFirst\(', '.getClient().from(''users'').select(''*'')'
    $content = $content -replace '\.getClient\(\)\.user\.create\(', '.getClient().from(''users'').insert('
    $content = $content -replace '\.getClient\(\)\.user\.update\(', '.getClient().from(''users'').update('
    $content = $content -replace '\.getClient\(\)\.user\.delete\(', '.getClient().from(''users'').delete('
    
    # Members table
    $content = $content -replace '\.getClient\(\)\.member\.findUnique\(', '.getClient().from(''members'').select(''*'').eq('
    $content = $content -replace '\.getClient\(\)\.member\.findMany\(', '.getClient().from(''members'').select(''*'')'
    $content = $content -replace '\.getClient\(\)\.member\.create\(', '.getClient().from(''members'').insert('
    $content = $content -replace '\.getClient\(\)\.member\.update\(', '.getClient().from(''members'').update('
    
    # Claims table
    $content = $content -replace '\.getClient\(\)\.claim\.findUnique\(', '.getClient().from(''claims'').select(''*'').eq('
    $content = $content -replace '\.getClient\(\)\.claim\.findMany\(', '.getClient().from(''claims'').select(''*'')'
    $content = $content -replace '\.getClient\(\)\.claim\.create\(', '.getClient().from(''claims'').insert('
    $content = $content -replace '\.getClient\(\)\.claim\.update\(', '.getClient().from(''claims'').update('
    
    # Policies table
    $content = $content -replace '\.getClient\(\)\.policy\.findUnique\(', '.getClient().from(''policies'').select(''*'').eq('
    $content = $content -replace '\.getClient\(\)\.policy\.findMany\(', '.getClient().from(''policies'').select(''*'')'
    $content = $content -replace '\.getClient\(\)\.policy\.create\(', '.getClient().from(''policies'').insert('
    $content = $content -replace '\.getClient\(\)\.policy\.update\(', '.getClient().from(''policies'').update('
    
    if ($content -ne $originalContent) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "  Fixed $($file.Name)" -ForegroundColor Green
    }
}

Write-Host "`nProcessing complete!" -ForegroundColor Green
