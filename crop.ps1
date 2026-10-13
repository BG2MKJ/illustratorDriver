# Crop a region out of nature_style.png and blow it up, so small type can be judged.
# usage: crop.ps1 <x> <y> <w> <h> <zoom> <outName>
param([int]$x, [int]$y, [int]$w, [int]$h, [int]$zoom, [string]$outName)
Add-Type -AssemblyName System.Drawing
$src = [System.Drawing.Bitmap]::FromFile("C:\Users\lhw15\ai_driver\out\nature_style.png")
$rect = New-Object System.Drawing.Rectangle($x, $y, $w, $h)
$crop = $src.Clone($rect, $src.PixelFormat)
$big = New-Object System.Drawing.Bitmap($crop, ($w * $zoom), ($h * $zoom))
$big.Save("C:\Users\lhw15\ai_driver\out\$outName", [System.Drawing.Imaging.ImageFormat]::Png)
Write-Output "wrote $outName  ($($w*$zoom) x $($h*$zoom))"
$crop.Dispose(); $big.Dispose(); $src.Dispose()
