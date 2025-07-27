#!/bin/bash

# Pre-deployment checklist for Render

echo "🔍 בודק מוכנות לפרסום ב-Render..."
echo ""

# Check if package.json has correct start script
echo "✅ בודק package.json..."
if grep -q '"start": "node src/server/index.js"' package.json; then
    echo "  ✓ Start script נכון"
else
    echo "  ❌ Start script לא נכון"
fi

# Check if .env.example exists
echo "✅ בודק .env.example..."
if [ -f ".env.example" ]; then
    echo "  ✓ .env.example קיים"
else
    echo "  ❌ .env.example חסר"
fi

# Check if main files exist
echo "✅ בודק קבצים עיקריים..."
if [ -f "src/server/index.js" ]; then
    echo "  ✓ שרת קיים"
else
    echo "  ❌ קובץ שרת חסר"
fi

if [ -f "public/html/index.html" ]; then
    echo "  ✓ דף בית קיים"
else
    echo "  ❌ דף בית חסר"
fi

# Check API endpoint configuration
echo "✅ בודק הגדרות API..."
if grep -q "getAPIBaseURL" public/js/script.js; then
    echo "  ✓ API endpoints מוגדרים דינמית"
else
    echo "  ❌ API endpoints לא מוגדרים נכון"
fi

echo ""
echo "🚀 סיכום:"
echo "הפרויקט מוכן לפרסום ב-Render!"
echo ""
echo "צעדים הבאים:"
echo "1. העלה את הקוד ל-GitHub"
echo "2. צור Web Service ב-Render"
echo "3. הגדר משתני סביבה"
echo "4. פרסם!"
