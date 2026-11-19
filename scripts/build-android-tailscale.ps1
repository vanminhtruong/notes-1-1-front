# Build the PlantHub Android APK using the existing Tailscale HTTPS backend.
# No device identifiers, hostnames, private keys or backend URL are printed.
$ErrorActionPreference = 'Continue'
$Project = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$Root = (Resolve-Path (Join-Path $Project '..')).Path
$Toolchain = 'E:\work\android-toolchain'
$Sdk = Join-Path $Toolchain 'android-sdk'
$Tailscale = 'C:\Program Files\Tailscale\tailscale.exe'

function Check($condition, $message) {
  if (-not $condition) { throw $message }
}

Check (Test-Path $Tailscale) 'Tailscale CLI was not found.'
Check (Test-Path "$Sdk\platforms\android-35\android.jar") 'Android SDK platform 35 was not found.'
$JdkHome = Get-ChildItem (Join-Path $Toolchain 'jdk') -Directory |
  Where-Object { Test-Path (Join-Path $_.FullName 'bin\java.exe') } |
  Select-Object -First 1 -ExpandProperty FullName
Check $JdkHome 'JDK 21 was not found.'
$env:JAVA_HOME = $JdkHome
$env:ANDROID_HOME = $Sdk
$env:ANDROID_SDK_ROOT = $Sdk
$env:GRADLE_USER_HOME = Join-Path $Toolchain 'gradle-cache'
$env:Path = "$JdkHome\bin;$env:Path"

$Raw = & $Tailscale serve status --json 2>$null
Check ($LASTEXITCODE -eq 0 -and $Raw) 'Unable to read Tailscale Serve configuration.'
$Serve = ($Raw | Out-String | ConvertFrom-Json)
$Candidates = @($Serve.Web.PSObject.Properties | Where-Object {
  $_.Name.EndsWith(':8443') -and
  (($_.Value | ConvertTo-Json -Depth 15 -Compress) -match ':3000')
})
Check ($Candidates.Count -eq 1) 'Expected one Tailscale HTTPS 8443 route to PlantHub backend port 3000.'
$Origin = 'https://' + $Candidates[0].Name
Check (([Uri]$Origin).Scheme -eq 'https') 'The backend must use HTTPS.'

$ResponseFile = [System.IO.Path]::GetTempFileName()
$HeaderFile = [System.IO.Path]::GetTempFileName()
$SocketFile = [System.IO.Path]::GetTempFileName()
try {
  # Do not use -k or disable certificate validation.
  $HealthCode = & curl.exe -s --max-time 20 -o $ResponseFile -D $HeaderFile -w '%{http_code}' -H 'Origin: https://localhost' "$Origin/api/health" 2>$null
  Check ($LASTEXITCODE -eq 0 -and $HealthCode -eq '200') 'Tailscale HTTPS health endpoint is not reachable.'
  $Health = Get-Content $ResponseFile -Raw | ConvertFrom-Json
  Check ($Health.status -eq 'ok') 'Backend health response is unexpected.'
  $Headers = Get-Content $HeaderFile -Raw
  Check ($Headers -match '(?i)Access-Control-Allow-Origin:\s*https://localhost') 'Android WebView CORS origin is not allowed.'
  $SocketCode = & curl.exe -s --max-time 20 -o $SocketFile -w '%{http_code}' -H 'Origin: https://localhost' "$Origin/socket.io/?EIO=4&transport=polling" 2>$null
  Check ($LASTEXITCODE -eq 0 -and $SocketCode -eq '200') 'Socket.IO through Tailscale HTTPS is not reachable.'
  Check (([System.IO.File]::ReadAllText($SocketFile)).StartsWith('0{')) 'Socket.IO handshake returned an unexpected response.'
} finally {
  Remove-Item $ResponseFile,$HeaderFile,$SocketFile -Force -ErrorAction SilentlyContinue
}
Write-Output 'Tailscale backend health, Android CORS and Socket.IO: verified'

# Vite embeds only the service endpoint, never Tailscale auth/session credentials.
# The environment variable is scoped to this PowerShell process only.
$env:VITE_ANDROID_BACKEND_HTTP_URL = $Origin
$env:VITE_ANDROID_BACKEND_WS_URL = $Origin
Push-Location $Project
try {
  & npm.cmd run build
  Check ($LASTEXITCODE -eq 0) 'React/Vite build failed.'
  & 'D:\nodejs\node.exe' 'node_modules\@capacitor\cli\bin\capacitor' sync android
  Check ($LASTEXITCODE -eq 0) 'Capacitor Android sync failed.'
  Push-Location (Join-Path $Project 'android')
  try {
    & .\gradlew.bat assembleDebug --no-daemon --console=plain
    Check ($LASTEXITCODE -eq 0) 'Gradle build failed.'
  } finally { Pop-Location }
} finally {
  Pop-Location
  Remove-Item Env:VITE_ANDROID_BACKEND_HTTP_URL,Env:VITE_ANDROID_BACKEND_WS_URL -ErrorAction SilentlyContinue
}
$Apk = Join-Path $Project 'android\app\build\outputs\apk\debug\app-debug.apk'
Check (Test-Path $Apk) 'APK output file was not created.'
$SignTool = Join-Path $Sdk 'build-tools\35.0.0\apksigner.bat'
Check (Test-Path $SignTool) 'Android APK signature verifier not found.'
& $SignTool verify --min-sdk-version 23 $Apk 2>$null
Check ($LASTEXITCODE -eq 0) 'APK signature verification failed.'
$Destination = Join-Path $Root 'PlantHub-Users-Tailscale.apk'
Copy-Item -LiteralPath $Apk -Destination $Destination -Force
Write-Output 'APK build: SUCCESS'
Write-Output ('APK path: ' + $Destination)
Write-Output ('APK size (MiB): ' + [Math]::Round((Get-Item $Destination).Length/1MB,2))
Write-Output ('APK SHA256: ' + (Get-FileHash $Destination -Algorithm SHA256).Hash)
