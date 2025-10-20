# Quick commit script - No prompts, just commit and push everything
# Usage: .\quick-commit.ps1 "Your commit message"

param(
    [string]$Message = "Update: Fix featured salons bug and improve carousel UI"
)

Set-Location "C:\Users\ramos\all_coding\hairprosdirectory"

Write-Host "Adding all changes..." -ForegroundColor Yellow
git add .

Write-Host "Committing..." -ForegroundColor Yellow
$fullMessage = "$Message

Co-authored-by: factory-droid[bot] <138933559+factory-droid[bot]@users.noreply.github.com>"

git commit -m $fullMessage

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Committed successfully" -ForegroundColor Green
    
    Write-Host "Pushing to GitHub..." -ForegroundColor Yellow
    git push
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Pushed to GitHub successfully!" -ForegroundColor Green
    } else {
        Write-Host "✗ Push failed" -ForegroundColor Red
        Write-Host "Try: git pull --rebase && git push" -ForegroundColor Yellow
    }
} else {
    Write-Host "✗ Commit failed" -ForegroundColor Red
}

git status --short
