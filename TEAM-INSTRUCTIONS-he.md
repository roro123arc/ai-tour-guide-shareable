# הנחיות לצוות העמדה

## מטרת העמדה

להראות למשתתפים איך GitHub Copilot עוזר לעבוד על אפליקציה אמיתית: להבין codebase קיים, לעבוד עם נתוני אירוע, ולהוסיף שיפורים קטנים בצורה מהירה.

המסר המרכזי:

```text
First use the guide as an attendee.
Then switch to builder mode and improve it with GitHub Copilot.
```

## מה המשתתף רואה קודם

פותחים את האתר הציבורי:

```text
https://roro123arc.github.io/ai-tour-guide-shareable/app/
```

נותנים למשתתף לבחור:

- Fast path, למשל Developer / Security / Data / AI Agents
- או sample profile
- או custom profile

מראים לו:

- recommended workshops
- recommended demo booths
- venue map with pins
- Your ideal path
- time conflict notes
- כפתור QR בדף

## מה אומרים בזמן השימוש בדף

אפשר להגיד:

```text
This guide helps attendees decide where to go next at AI Tour.
It uses local event data, the venue map, and simple recommendation logic.
```

ואז:

```text
Now let’s switch to builder mode and see how GitHub Copilot can help improve it.
```

## מה עושים ב-VS Code

פותחים את הרפו:

```text
ai-tour-guide-shareable
```

מראים בקצרה את המבנה:

```text
app/
  index.html
  app.js
  styles.css

data/
  workshops.json
  booths.json
  sample_profiles.json
  catalog_filters.json

prompts/
  05-demo-extensions.txt
```

הסבר קצר:

```text
This is a simple static app: HTML, CSS, JavaScript, and JSON.
No backend, no login, no external API.
```

## שלב Copilot

פותחים את GitHub Copilot Chat ב-VS Code.

פותחים את הקובץ:

```text
prompts/05-demo-extensions.txt
```

נותנים למשתתף לבחור אחד מהשיפורים:

1. Official catalog filters
2. Where should I go now?
3. Why this?
4. Copy my route

מדביקים את הפרומפט המתאים ל-Copilot Chat.

## אם אין זמן לבצע שינוי בלייב

פותחים את גרסת ה-preview:

```text
https://roro123arc.github.io/ai-tour-guide-shareable/app/?demo=copilot
```

שם כבר רואים את התוספות:

- Official catalog filters
- Where should I go now?
- Why this? explanations

הסבר מומלץ:

```text
This preview shows the kind of enhancement GitHub Copilot can help us add.
```

## מה להדגיש

- GitHub Copilot עוזר להבין קוד קיים, לא רק להשלים שורה.
- Copilot יכול להסביר איפה הנתונים נמצאים ואיפה הלוגיקה מחושבת.
- Copilot עוזר להוסיף capability קטן במהירות.
- הדמו מבוסס JSON מקומי כדי להיות יציב בכנס.

## מה לא להגיד

לא להגיד:

```text
GitHub Copilot built the whole app from scratch live.
```

כן להגיד:

```text
This app is a Copilot-ready prototype.
We use GitHub Copilot to understand it, adapt it, and add features live.
```

## משפט פתיחה קצר לעמדה

```text
Want to know where to go next at AI Tour?
Try the guide, then use GitHub Copilot to improve it.
```

## משפט סיום קצר

```text
GitHub Copilot is more than autocomplete:
it helps developers understand, change, and improve real applications.
```

