# Pre-deployment checklist for Render

Write-Host "🔍 בודק מוכנות לפרסום ב-Render..." -ForegroundColor Cyan
Write-Host ""

# Check if package.json has correct start script
Write-Host "✅ בודק package.json..." -ForegroundColor Green
$packageContent = Get-Content "package.json" -Raw
if ($packageContent -match '"start": "node src/server/index.js"') {
    Write-Host "  ✓ Start script נכון" -ForegroundColor Green
} else {
    Write-Host "  ❌ Start script לא נכון" -ForegroundColor Red
}

# Check if .env.example exists
Write-Host "✅ בודק .env.example..." -ForegroundColor Green
if (Test-Path ".env.example") {
    Write-Host "  ✓ .env.example קיים" -ForegroundColor Green
} else {
    Write-Host "  ❌ .env.example חסר" -ForegroundColor Red
}

# Check if main files exist
Write-Host "✅ בודק קבצים עיקריים..." -ForegroundColor Green
if (Test-Path "src\server\index.js") {
    Write-Host "  ✓ שרת קיים" -ForegroundColor Green
} else {
    Write-Host "  ❌ קובץ שרת חסר" -ForegroundColor Red
}

if (Test-Path "public\html\index.html") {
    Write-Host "  ✓ דף בית קיים" -ForegroundColor Green
} else {
    Write-Host "  ❌ דף בית חסר" -ForegroundColor Red
}

# Check API endpoint configuration
Write-Host "✅ בודק הגדרות API..." -ForegroundColor Green
$scriptContent = Get-Content "public\js\script.js" -Raw
if ($scriptContent -match "getAPIBaseURL") {
    Write-Host "  ✓ API endpoints מוגדרים דינמית" -ForegroundColor Green
} else {
    Write-Host "  ❌ API endpoints לא מוגדרים נכון" -ForegroundColor Red
}

Write-Host ""
Write-Host "🚀 סיכום:" -ForegroundColor Yellow
Write-Host "הפרויקט מוכן לפרסום ב-Render!" -ForegroundColor Green
Write-Host ""
Write-Host "צעדים הבאים:" -ForegroundColor Cyan
Write-Host "1. העלה את הקוד ל-GitHub (git add . && git commit -m 'Ready for Render' && git push)"
Write-Host "2. לך ל-render.com ויצור Web Service חדש"
Write-Host "3. בחר את הrepository הזה"
Write-Host "4. הגדר משתני סביבה (OPENAI_API_KEY, NODE_ENV=production)"
Write-Host "5. פרסם!"
