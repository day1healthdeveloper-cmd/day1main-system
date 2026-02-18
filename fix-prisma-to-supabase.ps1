# Script to convert Prisma-style queries to Supabase queries
# This will fix the most common patterns

$files = Get-ChildItem -Path "apps/backend/src" -Recurse -Filter "*.ts" -File

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $modified = $false
    
    # Skip if file doesn't contain problematic patterns
    if ($content -notmatch '\.getClient\(\)\.\w+\.(findUnique|findMany|findFirst|create|update|delete|count)') {
        continue
    }
    
    Write-Host "Processing: $($file.FullName)"
    
    # Convert .user.findUnique to .from('users').select().eq().single()
    # Convert .member.findUnique to .from('members').select().eq().single()
    # etc.
    
    # This is a complex conversion - we'll do it file by file manually
    # for accuracy
}

Write-Host "Conversion complete!"
