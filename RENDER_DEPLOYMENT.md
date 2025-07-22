# Render Deployment Guide

## מדריך פרסום ב-Render

### שלב 1: הכנת הפרויקט ✅
- מבנה הפרויקט נוקה ומוכן
- `package.json` מעודכן עם הגדרות נכונות
- משתני סביבה מוכנים

### שלב 2: פרסום ב-Render

#### א. הירשמות ל-Render
1. לך ל-[render.com](https://render.com)
2. הירשם עם GitHub
3. חבר את הGitHub שלך

#### ב. יצירת Web Service
1. לחץ "New +" ואז "Web Service"
2. בחר את הrepository `Copilot-ai`
3. הגדרות פרסום:
   - **Name**: `copilot-ai-tshirt`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free` (או Starter $7/חודש)

#### ג. הגדרת משתני סביבה
בעמוד הגדרות, הוסף:
```
OPENAI_API_KEY = your_actual_openai_api_key_here
PORT = 10000
NODE_ENV = production
```

#### ד. פרסום
לחץ "Create Web Service" והמתן לפרסום.

### שלב 3: עדכונים אוטומטיים
- כל push ל-GitHub יעדכן אוטומטית את האתר
- הכתובת תהיה: `https://copilot-ai-tshirt.onrender.com`

### שלב 4: תחזוקה
- **ביצועים**: הinstance החינמי "ישן" אחרי 15 דקות חוסר פעילות
- **שדרוג**: עבור $7/חודש תקבל uptime 24/7
- **לוגים**: זמינים בדשבורד של Render

### יתרונות Render:
✅ פרסום חינמי
✅ תמיכה מלאה ב-Node.js
✅ HTTPS אוטומטי
✅ עדכונים אוטומטיים
✅ קל להגדרה

## הפרויקט מוכן לפרסום! 🚀
