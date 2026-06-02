# Microsoft AI Tour Guide - חבילת שיתוף

אפליקציית Web סטטית עבור Microsoft AI Tour Tel Aviv. האפליקציה עוזרת למשתתפים לבחור מסלול באירוע לפי תחום עניין, פרופיל לדוגמה או תיאור תפקיד חופשי, ומציגה המלצות ל-workshops, demo booths, אזור התחלה ומפה עם pins.

## מה יש ברפו

- `app/` - האפליקציה עצמה: HTML, CSS, JavaScript ותמונות.
- `data/` - קבצי JSON לעריכת תוכן האירוע.
- `prompts/` - פרומפטים מוכנים ל-GitHub Copilot עבור המעבדה.
- `LAB-FLOW-he.md` - Flow מוצע למנחה.
- `QR-INSTRUCTIONS-he.md` - הוראות ליצירת QR.
- `scripts/start-local.sh` - סקריפט הרצה מקומי.

## איך מורידים

אם הרפו נמצא ב-GitHub:

1. ללחוץ על **Code**.
2. לבחור **Download ZIP** כדי להוריד בלי Git.
3. לחלופין, להעתיק את כתובת הרפו ולהריץ:

```bash
git clone <REPO_URL>
cd ai-tour-guide-shareable
```

## איך מריצים מקומית

חשוב להריץ שרת מקומי מתיקיית הרפו, ולא לפתוח את `app/index.html` ישירות, כדי שקבצי ה-JSON תחת `data/` ייטענו נכון.

```bash
./scripts/start-local.sh
```

ואז לפתוח בדפדפן:

```text
http://localhost:8000/app/
```

אם צריך פורט אחר:

```bash
./scripts/start-local.sh 5174
```

ואז לפתוח:

```text
http://localhost:5174/app/
```

## איך מעלים לאתר ציבורי

האפליקציה סטטית לחלוטין: אין backend, אין build, ואין התקנות.

אפשרויות מומלצות:

1. **GitHub Pages** - להעלות את הרפו ל-GitHub, להפעיל Pages מה-branch הראשי, ולפתוח:

```text
https://<user-or-org>.github.io/<repo-name>/app/
```

2. **Azure Static Web Apps** - להגדיר את מיקום האפליקציה כ-root (`/`) ולפרסם את כל הרפו.
3. **שרת פנימי של הכנס** - להגיש את תיקיית הרפו כ-static site ולכוון את המשתתפים ל-`/app/`.

## איך יוצרים QR

אחרי שיש URL סופי, למשל:

```text
https://<host>/<repo-or-site>/app/
```

אפשר ליצור QR באחת מהדרכים:

1. לפתוח את ה-URL ב-Microsoft Edge, קליק ימני, ואז **Create QR code for this page**.
2. לבקש ב-Microsoft 365 Copilot Chat:

```text
Create a QR code that points to https://<host>/<repo-or-site>/app/
```

3. לדמו זמני באותה רשת Wi-Fi: להריץ מקומית, להשתמש בכתובת ה-IP של המחשב, וליצור QR לכתובת:

```text
http://<MACHINE-IP>:8000/app/
```

ראו גם `QR-INSTRUCTIONS-he.md`.

## איך מעדכנים תוכן

רוב התוכן נשלט מקבצי JSON תחת `data/`:

- `workshops.json` - רשימת workshops.
- `booths.json` - רשימת demo booths.
- `zones.json` - אזורי התחלה והמלצה.
- `agenda_summary.json` - לו"ז, lunch וחלונות שירות.
- `sample_profiles.json` - פרופילים לדוגמה.
- `interests_taxonomy.json` - תגיות התאמה להמלצות.

תמונת המפה נמצאת כאן:

```text
app/assets/unified-venue-map.png
```

מיקומי ה-pins נמצאים בקובץ:

```text
app/app.js
```

תחת האובייקט `venueLocations`.

## הערות

- אין צורך בלוגין.
- לא נאסף מידע אישי.
- אין צורך ב-`npm install`.
- אין build step.
- אם מעלים ל-GitHub Pages או לאתר ציבורי, ה-QR צריך להצביע לכתובת שמסתיימת ב-`/app/`.

