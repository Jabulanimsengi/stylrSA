# PowerShell script to commit all changes to GitHub
# Run this from the project root directory

Write-Host "=== Git Commit Script ===" -ForegroundColor Cyan
Write-Host ""

# Navigate to project directory
Set-Location "C:\Users\ramos\all_coding\hairprosdirectory"

# Check current status
Write-Host "Checking repository status..." -ForegroundColor Yellow
git status

Write-Host ""
Write-Host "=== Files to be committed ===" -ForegroundColor Cyan
git status --short

Write-Host ""
$confirm = Read-Host "Do you want to commit these changes? (y/n)"

if ($confirm -ne 'y') {
    Write-Host "Commit cancelled." -ForegroundColor Red
    exit
}

Write-Host ""
Write-Host "Enter commit message (or press Enter for default):" -ForegroundColor Yellow
$commitMessage = Read-Host

if ([string]::IsNullOrWhiteSpace($commitMessage)) {
    $commitMessage = "Fix featured salons bug and improve carousel UI

- Fixed .env configuration for local development
- Added PORT=5000 to backend/.env
- Updated frontend/.env.local to use localhost:5000
- Fixed featured salons carousel navigation buttons positioning
- Added padding to carousel container for visible arrows
- Updated UUID regex constraint on salons/:id route
- Improved responsive design for carousel navigation

Co-authored-by: factory-droid[bot] <138933559+factory-droid[bot]@users.noreply.github.com>"
}

Write-Host ""
Write-Host "Adding all changes to staging..." -ForegroundColor Yellow
git add .

Write-Host ""
Write-Host "Creating commit..." -ForegroundColor Yellow
git commit -m "$commitMessage"

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "Commit failed! Check the error above." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "✓ Commit successful!" -ForegroundColor Green

Write-Host ""
$push = Read-Host "Do you want to push to GitHub? (y/n)"

if ($push -eq 'y') {
    Write-Host ""
    Write-Host "Pushing to GitHub..." -ForegroundColor Yellow
    git push
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✓ Successfully pushed to GitHub!" -ForegroundColor Green
    } else {
        Write-Host ""
        Write-Host "Push failed! You may need to pull first or check your connection." -ForegroundColor Red
        Write-Host "Try: git pull --rebase && git push" -ForegroundColor Yellow
    }
} else {
    Write-Host ""
    Write-Host "Changes committed locally but not pushed." -ForegroundColor Yellow
    Write-Host "To push later, run: git push" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "Final status:" -ForegroundColor Cyan
git status
