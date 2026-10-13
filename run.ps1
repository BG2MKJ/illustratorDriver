# 把一个 ExtendScript (.jsx) 送进 Illustrator 执行，打印 JSX 最后表达式的返回值。
# 用法: powershell -File run.ps1 draw.jsx
param(
    [Parameter(Mandatory = $true)][string]$Script,
    [switch]$Quiet
)
$ErrorActionPreference = 'Stop'
$path = (Resolve-Path $Script).Path
$app = New-Object -ComObject Illustrator.Application
$result = $app.DoJavaScriptFile($path)
Write-Output "RESULT: $result"
