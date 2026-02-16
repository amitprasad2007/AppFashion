param (
    [string]$sourcePath,
    [string]$targetBaseDir
)

Add-Type -AssemblyName System.Drawing

function Resize-Image {
    param (
        [string]$sourceFile,
        [string]$destinationFile,
        [int]$width,
        [int]$height
    )
    
    $sourceImg = [System.Drawing.Image]::FromFile($sourceFile)
    $destImg = New-Object System.Drawing.Bitmap($width, $height)
    $graphics = [System.Drawing.Graphics]::FromImage($destImg)
    
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    
    $graphics.DrawImage($sourceImg, 0, 0, $width, $height)
    
    # Ensure directory exists
    $dir = Split-Path $destinationFile
    if (!(Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir | Out-Null
    }
    
    $destImg.Save($destinationFile, [System.Drawing.Imaging.ImageFormat]::Png)
    
    $graphics.Dispose()
    $destImg.Dispose()
    $sourceImg.Dispose()
    
    Write-Host "Created: $destinationFile"
}

$densities = @{
    "mipmap-mdpi" = 48
    "mipmap-hdpi" = 72
    "mipmap-xhdpi" = 96
    "mipmap-xxhdpi" = 144
    "mipmap-xxxhdpi" = 192
}

foreach ($density in $densities.Keys) {
    $size = $densities[$density]
    $destPath = Join-Path $targetBaseDir "$density\ic_launcher.png"
    $destPathRound = Join-Path $targetBaseDir "$density\ic_launcher_round.png"
    
    Resize-Image -sourceFile $sourcePath -destinationFile $destPath -width $size -height $size
    Resize-Image -sourceFile $sourcePath -destinationFile $destPathRound -width $size -height $size
}
