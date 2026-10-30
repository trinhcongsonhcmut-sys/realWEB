# ==============================================================================
# BAHA GROUP - EXECUTIVE REPORTING POWERSHELL DISPATCH SCRIPT
# Bot: @BAHA_DieuHanh_bot (ID: 8684276925)
# Destination: Founder Nguyen Canh Dieu (7775586213)
# ==============================================================================

param (
    [switch]$Send,
    [string]$Preset = "realweb", # "realweb" or "059"
    [string]$Project,
    [string]$Author,
    [string]$Token,
    [string]$ChatId
)

$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$WorkspaceRoot = (Get-Item $ScriptDir).Parent.FullName

Set-Location $WorkspaceRoot

$argsList = @("--experimental-strip-types", "scripts/send_executive_report.ts", "--preset", $Preset)

if ($Send) {
    $argsList += "--send"
}
if ($Project) {
    $argsList += @("--project", $Project)
}
if ($Author) {
    $argsList += @("--author", $Author)
}
if ($Token) {
    $argsList += @("--token", $Token)
}
if ($ChatId) {
    $argsList += @("--chat", $ChatId)
}

& node $argsList
