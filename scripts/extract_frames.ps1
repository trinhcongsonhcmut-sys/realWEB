# AURA SCROLL - High Performance Frame Extraction Utility
# Extracts WebP frame sequences from any video using FFmpeg

param (
    [string]$InputVideo = "",
    [string]$Resolution = "1080p", # "1080p", "720p", or "original"
    [int]$Quality = 85,
    [int]$Fps = 0 # 0 = keep source video fps
)

$ErrorActionPreference = "Stop"
$WorkspaceRoot = (Get-Item $PSScriptRoot).Parent.FullName
Set-Location $WorkspaceRoot

# 1. Resolve source video
if ($InputVideo -eq "") {
    $defaultVideo = Join-Path $WorkspaceRoot "public/assets/videos/video.mp4"
    if (Test-Path $defaultVideo) {
        $InputVideo = $defaultVideo
    } else {
        # Check any video in public/assets/videos/
        $found = Get-ChildItem -Path (Join-Path $WorkspaceRoot "public/assets/videos") -Filter "*.mp4" | Select-Object -First 1
        if ($found) {
            $InputVideo = $found.FullName
        }
    }
}

if ($InputVideo -eq "" -or !(Test-Path $InputVideo)) {
    Write-Host "`n[ERROR] Khong tim thay file video dau vao!" -ForegroundColor Red
    Write-Host "Cach dung:" -ForegroundColor Yellow
    Write-Host "  powershell -ExecutionPolicy Bypass -File scripts/extract_frames.ps1 -InputVideo `"duong_dan_den_video.mp4`""
    Write-Host "Hoac copy file video dat vao thu muc: public/assets/videos/video.mp4"
    exit 1
}

Write-Host "`n=======================================================" -ForegroundColor Cyan
Write-Host "   AURA SCROLL - BỘ TRÍCH XUẤT FRAME WEBP ĐIỆN ẢNH     " -ForegroundColor Cyan
Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host "File nguon: $InputVideo" -ForegroundColor Green
Write-Host "Do phan giai: $Resolution | Chat luong WebP: $Quality" -ForegroundColor Green

# 2. Output directory setup
$OutputDir = Join-Path $WorkspaceRoot "public/assets/frames"
if (!(Test-Path $OutputDir)) {
    New-Item -ItemType Directory -Force -Path $OutputDir | Out-Null
} else {
    Write-Host "Don dep cac frame cu trong $OutputDir..." -ForegroundColor Gray
    Get-ChildItem -Path $OutputDir -Filter "*.webp" | Remove-Item -Force
}

# 3. Build FFmpeg command filters
$vfList = @()
if ($Resolution -eq "1080p") {
    $vfList += "scale=1920:1080:force_original_aspect_ratio=decrease"
} elseif ($Resolution -eq "720p") {
    $vfList += "scale=1280:720:force_original_aspect_ratio=decrease"
}

if ($Fps -gt 0) {
    $vfList += "fps=$Fps"
}

$vfArg = if ($vfList.Count -gt 0) { "-vf `"$($vfList -join ',')`"" } else { "" }

$outputPattern = Join-Path $OutputDir "frame_%04d.webp"
$cmd = "ffmpeg -i `"$InputVideo`" $vfArg -c:v libwebp -lossless 0 -compression_level 4 -preset photo -q:v $Quality -start_number 0 `"$outputPattern`" -y"

Write-Host "`nDang xu ly trich xuat qua FFmpeg..." -ForegroundColor Yellow
Invoke-Expression $cmd | Out-Null

$extractedFiles = Get-ChildItem -Path $OutputDir -Filter "*.webp" | Sort-Object Name
$totalBytes = ($extractedFiles | Measure-Object -Property Length -Sum).Sum
$totalMB = [math]::Round($totalBytes / 1MB, 2)

# 4. Generate manifest.json
$manifest = @{
    version = "1.0"
    generatedAt = (Get-Date).ToString("o")
    sourceFile = [System.IO.Path]::GetFileName($InputVideo)
    resolution = $Resolution
    quality = $Quality
    totalFrames = $extractedFiles.Count
    totalSizeMB = $totalMB
    pattern = "/assets/frames/frame_%04d.webp"
}

$manifestPath = Join-Path $OutputDir "manifest.json"
$manifest | ConvertTo-Json -Depth 4 | Set-Content -Path $manifestPath -Encoding UTF8

Write-Host "`n[HOAN TAT] Da trich xuat thanh cong!" -ForegroundColor Green
Write-Host "  Tong so frame: $($extractedFiles.Count)" -ForegroundColor Green
Write-Host "  Dung luong: $totalMB MB" -ForegroundColor Green
Write-Host "  Manifest da luu: $manifestPath" -ForegroundColor Green

