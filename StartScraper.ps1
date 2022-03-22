
while($true)
{
    Write-Host "Start Time of Scrape" (Get-Date -Format "yyyy/MM/dd HH:mm:ss") -ForegroundColor DarkYellow
    node .\App\App.js
    Write-Host "End Time of Scrape" (Get-Date -Format "yyyy/MM/dd HH:mm:ss") -ForegroundColor DarkYellow
    # 900 seconds is 15 minutes
    $sleepTime = 900
    Write-Host "Waiting for "($sleepTime/60)" minutes before next scrape." -ForegroundColor DarkMagenta
    Start-Sleep -Seconds $sleepTime
}