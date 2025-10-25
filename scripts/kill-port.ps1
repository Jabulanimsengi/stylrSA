param(
    [Parameter(Mandatory = $true)]
    [int]$Port
)

Write-Host "Attempting to free port $Port..." -ForegroundColor Cyan

try {
    $conns = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
} catch {
    $conns = $null
}

if (-not $conns) {
    Write-Host "No process is listening on port $Port" -ForegroundColor Gray
    exit 0
}

$pids = $conns | Select-Object -ExpandProperty OwningProcess -Unique
foreach ($procId in $pids) {
    if ($procId -le 4) {
        Write-Host "Skipping system PID $procId" -ForegroundColor Gray
        continue
    }
    try {
        $proc = Get-Process -Id $procId -ErrorAction SilentlyContinue
        $name = if ($proc) { $proc.ProcessName } else { 'Unknown' }
        Stop-Process -Id $procId -Force
        Write-Host "Stopped PID $procId ($name)" -ForegroundColor Yellow
    } catch {
        Write-Host "Failed to stop PID $procId. Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Start-Sleep -Seconds 1
$remaining = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
if ($remaining) {
    Write-Host "Warning: port $Port still has listeners" -ForegroundColor Red
    $remaining | Select-Object -Property OwningProcess, State, LocalAddress, LocalPort | Format-Table -AutoSize
    exit 1
} else {
    Write-Host "Port $Port is now free" -ForegroundColor Green
    exit 0
}
