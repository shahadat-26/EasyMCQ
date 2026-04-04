# Replace all DateTime.UtcNow with DateTime.Now in all C# files
Get-ChildItem -Path . -Include *.cs -Recurse | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    if ($content -match 'DateTime\.UtcNow') {
        $content = $content -replace 'DateTime\.UtcNow', 'DateTime.Now'
        Set-Content -Path $_.FullName -Value $content -NoNewline
        Write-Host "Updated: $($_.FullName)"
    }
}
Write-Host "Completed replacing DateTime.UtcNow with DateTime.Now"