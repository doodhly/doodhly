# Kill all orphaned simulation processes
Write-Host "Cleaning up orphaned simulation processes..." -ForegroundColor Yellow

$processes = Get-Process -Name "node" -ErrorAction SilentlyContinue | 
    Where-Object { 
        try {
            $_.CommandLine -like "*simulate_partner_movement.ts*"
        } catch {
            $false
        }
    }

if ($processes) {
    $count = ($processes | Measure-Object).Count
    Write-Host "Found $count simulation process(es) running" -ForegroundColor Cyan
    
    foreach ($proc in $processes) {
        try {
            Stop-Process -Id $proc.Id -Force
            Write-Host "  ✓ Killed process $($proc.Id)" -ForegroundColor Green
        } catch {
            Write-Host "  ✗ Failed to kill process $($proc.Id): $_" -ForegroundColor Red
        }
    }
    
    Write-Host "`nCleanup complete!" -ForegroundColor Green
} else {
    Write-Host "No simulation processes found running" -ForegroundColor Green
}

# Verify cleanup
Start-Sleep -Seconds 1
$remaining = Get-Process -Name "node" -ErrorAction SilentlyContinue | 
    Where-Object {
        try {
            $_.CommandLine -like "*simulate_partner_movement.ts*"
        } catch {
            $false
        }
    }

if ($remaining) {
    Write-Host "`nWARNING: Some processes are still running" -ForegroundColor Red
} else {
    Write-Host "✓ All simulation processes terminated" -ForegroundColor Green
}
