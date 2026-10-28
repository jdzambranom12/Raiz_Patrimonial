# ==============================================================================
# RAÍZ — Laboratorio Patrimonial
# Local Development Web Server (PowerShell + System.Net.HttpListener)
# ==============================================================================
param(
    [int]$Port = 8080
)

$listener = New-Object System.Net.HttpListener
$prefix = "http://localhost:$Port/"
$listener.Prefixes.Add($prefix)

try {
    $listener.Start()
} catch {
    Write-Error "No se pudo iniciar el servidor en el puerto $Port : $_"
    exit 1
}

$baseDir = $PSScriptRoot
Write-Host "=================================================================" -ForegroundColor DarkYellow
Write-Host " RAÍZ — Laboratorio Patrimonial" -ForegroundColor Yellow
Write-Host " Servidor web activo en: $prefix" -ForegroundColor Green
Write-Host " Rutas disponibles:" -ForegroundColor Cyan
Write-Host "   - Inicio:         http://localhost:$Port/" -ForegroundColor White
Write-Host "   - Nuestro proceso: http://localhost:$Port/proceso" -ForegroundColor White
Write-Host "   - El proyecto:    http://localhost:$Port/proyecto" -ForegroundColor White
Write-Host " Presione Ctrl+C para detener el servidor en cualquier momento." -ForegroundColor Gray
Write-Host "=================================================================" -ForegroundColor DarkYellow

$mimeMap = @{
    ".html" = "text/html; charset=utf-8"
    ".css"  = "text/css; charset=utf-8"
    ".js"   = "application/javascript; charset=utf-8"
    ".json" = "application/json; charset=utf-8"
    ".svg"  = "image/svg+xml"
    ".jpg"  = "image/jpeg"
    ".jpeg" = "image/jpeg"
    ".png"  = "image/png"
    ".webp" = "image/webp"
    ".ico"  = "image/x-icon"
}

try {
    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        $path = $request.Url.LocalPath.TrimStart('/')
        if ([string]::IsNullOrWhiteSpace($path)) {
            $path = "index.html"
        } elseif ($path -eq "proceso") {
            $path = "proceso.html"
        } elseif ($path -eq "proyecto") {
            $path = "proyecto.html"
        }

        # Normalize path separators
        $normalizedPath = $path.Replace('/', [System.IO.Path]::DirectorySeparatorChar)
        $filePath = Join-Path $baseDir $normalizedPath

        # Check if file exists; if directory, look for index.html
        if ((Test-Path $filePath -PathType Container)) {
            $filePath = Join-Path $filePath "index.html"
        }

        # Clean URL fallback (e.g. /proceso -> /proceso.html)
        if (-not (Test-Path $filePath -PathType Leaf) -and (Test-Path ($filePath + ".html") -PathType Leaf)) {
            $filePath = $filePath + ".html"
        }

        if (Test-Path $filePath -PathType Leaf) {
            $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
            $mime = if ($mimeMap.ContainsKey($ext)) { $mimeMap[$ext] } else { "application/octet-stream" }
            $bytes = [System.IO.File]::ReadAllBytes($filePath)

            $response.ContentType = $mime
            $response.ContentLength64 = $bytes.Length
            $response.AddHeader("Access-Control-Allow-Origin", "*")
            $response.AddHeader("Cache-Control", "no-cache, no-store, must-revalidate")
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
            Write-Host "200 OK: $($request.Url.LocalPath) -> $([System.IO.Path]::GetFileName($filePath))" -ForegroundColor Gray
        } else {
            $response.StatusCode = 404
            $msg = [System.Text.Encoding]::UTF8.GetBytes("404 - Página no encontrada en RAÍZ")
            $response.ContentType = "text/plain; charset=utf-8"
            $response.ContentLength64 = $msg.Length
            $response.OutputStream.Write($msg, 0, $msg.Length)
            Write-Host "404 Not Found: $($request.Url.LocalPath)" -ForegroundColor Red
        }

        $response.Close()
    }
} finally {
    $listener.Stop()
    Write-Host "`nServidor detenido." -ForegroundColor Yellow
}
