$ErrorActionPreference = 'Stop'
Write-Host "=== creating Illustrator COM object (may take 30-60s) ==="
$app = New-Object -ComObject Illustrator.Application
Write-Host "OK. Version: $($app.Version)"
Write-Host "Name: $($app.Name)"
Write-Host ""
Write-Host "=== Application methods ==="
$app | Get-Member -MemberType Method | Select-Object -ExpandProperty Name | Sort-Object
Write-Host ""
Write-Host "=== Application properties ==="
$app | Get-Member -MemberType Property | Select-Object -ExpandProperty Name | Sort-Object
Write-Host ""
Write-Host "=== open documents ==="
Write-Host $app.Documents.Count
