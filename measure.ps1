# Measure vertical ink extents in align.png:
#   line  region: artboard x 20..60pt   -> px 120..360
#   text  region: artboard x 65..115pt  -> px 390..690
# Export is 600% => 6 px per pt; artboard 180x200pt -> 1080x1200px
Add-Type -AssemblyName System.Drawing
$bmp = [System.Drawing.Bitmap]::FromFile("C:\Users\lhw15\ai_driver\out\align.png")
Write-Output "png = $($bmp.Width) x $($bmp.Height)"

function RowExtent($x0, $x1, $thresh) {
    $hits = @()
    for ($y = 0; $y -lt $bmp.Height; $y++) {
        for ($x = $x0; $x -lt $x1; $x++) {
            $p = $bmp.GetPixel($x, $y)
            if ($p.R -lt $thresh -and $p.G -lt $thresh -and $p.B -lt $thresh) { $hits += $y; break }
        }
    }
    return $hits
}

$lineRows = RowExtent 120 360 200
$textRows = RowExtent 390 690 128

function Bands($rows) {
    $out = @(); $s = $null; $p = $null
    foreach ($r in $rows) {
        if ($null -eq $s) { $s = $r; $p = $r; continue }
        if ($r -eq $p + 1) { $p = $r } else { $out += "$s-$p"; $s = $r; $p = $r }
    }
    if ($null -ne $s) { $out += "$s-$p" }
    return ($out -join ", ")
}
function ToPt($px) { return (200 - $px / 6.0) }

Write-Output "line bands (px): $(Bands $lineRows)"
Write-Output "text bands (px): $(Bands $textRows)"
Write-Output ""
foreach ($b in (Bands $lineRows) -split ", ") {
    $lp = [double]($b -split '-')[0]; $lq = [double]($b -split '-')[1]
    $lmid = ($lp + $lq) / 2
    $near = $textRows | Where-Object { [Math]::Abs($_ - $lmid) -lt 120 }
    if ($near) {
        $t0 = ($near | Measure-Object -Minimum).Minimum
        $t1 = ($near | Measure-Object -Maximum).Maximum
        $tmid = ($t0 + $t1) / 2
        Write-Output ("line y={0:N2}pt   text ink {1:N2}..{2:N2}pt (centre {3:N2})   offset={4:N2}pt" -f `
            (ToPt $lmid), (ToPt $t1), (ToPt $t0), (ToPt $tmid), ((ToPt $tmid) - (ToPt $lmid)))
    }
}
$bmp.Dispose()
