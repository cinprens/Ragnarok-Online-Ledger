param(
  [int]$Port = 5173
)

$ErrorActionPreference = "Stop"

$root = Resolve-Path $PSScriptRoot
$rootPath = $root.Path

function Get-ContentType([string]$path) {
  switch -Regex ($path) {
    "\.html?$" { return "text/html; charset=utf-8" }
    "\.css$" { return "text/css; charset=utf-8" }
    "\.js$" { return "application/javascript; charset=utf-8" }
    "\.json$" { return "application/json; charset=utf-8" }
    "\.svg$" { return "image/svg+xml" }
    "\.png$" { return "image/png" }
    "\.jpe?g$" { return "image/jpeg" }
    "\.gif$" { return "image/gif" }
    "\.webp$" { return "image/webp" }
    "\.ico$" { return "image/x-icon" }
    "\.wasm$" { return "application/wasm" }
    "\.gz$" { return "application/gzip" }
    "\.map$" { return "application/json; charset=utf-8" }
    default { return "application/octet-stream" }
  }
}

function TryStartListener([int]$port) {
  $listener = [System.Net.HttpListener]::new()
  $prefix = "http://localhost:$port/"
  $listener.Prefixes.Add($prefix)
  try {
    $listener.Start()
    return @{ Listener = $listener; Prefix = $prefix; Port = $port }
  } catch {
    $listener.Close()
    return $null
  }
}

$listenerInfo = $null
for ($i = 0; $i -lt 10; $i++) {
  $tryPort = $Port + $i
  $listenerInfo = TryStartListener $tryPort
  if ($listenerInfo) { break }
}

if (-not $listenerInfo) {
  Write-Host "Unable to start local server. Try another port." -ForegroundColor Red
  exit 1
}

$listener = $listenerInfo.Listener
$prefix = $listenerInfo.Prefix

Write-Host "Ragnarok Helper Tool running at $prefix" -ForegroundColor Green
Write-Host "Serving from $rootPath" -ForegroundColor DarkGray
Write-Host "Press Ctrl+C to stop." -ForegroundColor DarkGray

Start-Process $prefix | Out-Null

try {
  while ($listener.IsListening) {
    $context = $listener.GetContext()
    $request = $context.Request
    $response = $context.Response

    $path = $request.Url.AbsolutePath
    if ([string]::IsNullOrWhiteSpace($path) -or $path -eq "/") {
      $path = "/index.html"
    }

    $decoded = [System.Uri]::UnescapeDataString($path.TrimStart("/").Replace("/", [System.IO.Path]::DirectorySeparatorChar))
    $target = Join-Path $rootPath $decoded
    $fullPath = [System.IO.Path]::GetFullPath($target)

    if (-not $fullPath.StartsWith($rootPath, [System.StringComparison]::OrdinalIgnoreCase)) {
      $response.StatusCode = 403
      $buffer = [System.Text.Encoding]::UTF8.GetBytes("403 Forbidden")
      $response.OutputStream.Write($buffer, 0, $buffer.Length)
      $response.Close()
      continue
    }

    if (Test-Path -Path $fullPath -PathType Container) {
      $fullPath = Join-Path $fullPath "index.html"
    }

    if (-not (Test-Path -Path $fullPath -PathType Leaf)) {
      $response.StatusCode = 404
      $buffer = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found")
      $response.OutputStream.Write($buffer, 0, $buffer.Length)
      $response.Close()
      continue
    }

    $response.StatusCode = 200
    $response.ContentType = Get-ContentType $fullPath
    $bytes = [System.IO.File]::ReadAllBytes($fullPath)
    $response.ContentLength64 = $bytes.Length
    $response.OutputStream.Write($bytes, 0, $bytes.Length)
    $response.OutputStream.Close()
  }
} catch {
  Write-Host "Server stopped." -ForegroundColor Yellow
} finally {
  if ($listener -and $listener.IsListening) {
    $listener.Stop()
    $listener.Close()
  }
}
