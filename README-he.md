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

זו הכתובת המקורית והנקייה למשתתפים.

כתובת preview לגרסה המשודרגת של דמו Copilot:

```text
http://localhost:8000/app/?demo=copilot
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
- `catalog_filters.json` - ערכי פילטרים לפי הקטלוג הרשמי: session type, topic, audience.
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

## Flow מומלץ לעמדה

הסיפור המדויק: זה לא דמו שטוען ש-GitHub Copilot בנה את כל האפליקציה מאפס בלייב. זה דמו שמראה איך משתמשים ב-GitHub Copilot על codebase אמיתי כדי להבין, להרחיב ולהתאים חוויית משתתפים.

חשוב: ברירת המחדל נשארת הדף המקורי:

```text
http://localhost:8000/app/
```

הגרסה המשודרגת קיימת רק כ-preview/reference:

```text
http://localhost:8000/app/?demo=copilot
```

מה להראות:

1. לפתוח את האפליקציה ולבחור fast path, למשל Developer.
2. להשתמש ב-intro popup כדי למסגר את הסיפור: קודם attendee mode, אחר כך builder mode עם GitHub Copilot.
3. להראות recommendations, מפת venue, ideal path ו-time conflicts.
4. לשאול את המשתתף/קהל: “מה הייתם מוסיפים עכשיו?”
5. לפתוח את `prompts/05-demo-extensions.txt`.
6. להריץ prompt אחד ב-GitHub Copilot Chat.
7. לפתוח את גרסת ה-preview כדי להראות את התוצאה הרצויה.

Prompt מומלץ:

```text
Explain how this app recommends workshops, booths, zones, map pins, and next-best stops.
Point me to the JSON files and functions I should edit to adapt it for another event.
```

עוד prompts בטוחים לדמו:

ראו גם:

```text
prompts/05-demo-extensions.txt
```

```text
Add another catalog filter for audience seniority using the existing JSON pattern.
```

```text
Improve the “Where should I go now?” explanation so it mentions walking time, hall, and matched interest.
```

```text
Add a “Copy my route” button that copies the recommended path, halls, and times to the clipboard.
```

הערת data: בגרסת העמדה אנחנו משתמשים ב-JSON מקומי ומסודר שמבוסס על הקטלוג הרשמי, כדי שהדמו יהיה מהיר, פרטי ויציב. בגרסת production אפשר לחבר ל-API רשמי, CMS export, או MCP tool שמחזיר event data מאושר.

## הערות

- אין צורך בלוגין.
- לא נאסף מידע אישי.
- אין צורך ב-`npm install`.
- אין build step.
- אם מעלים ל-GitHub Pages או לאתר ציבורי, ה-QR צריך להצביע לכתובת שמסתיימת ב-`/app/`.
