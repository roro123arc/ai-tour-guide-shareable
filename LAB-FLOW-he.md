# Flow טכני קצר למעבדה

## מטרה
לבנות עם המשתתפים אפליקציית **AI Tour Guide** שעוזרת לבחור מה לראות באירוע לפי תחומי עניין או תיאור תפקיד.

## קונספט
המשתתפים לא צריכים Login, לא LinkedIn, ולא קבצי משתמש אישיים.
ההתאמה האישית נעשית דרך:
- Quick buttons
- Sample profiles
- Title + Company + Description

## Flow מומלץ במעבדה
### 1. פתיחה (2 דקות)
- מציגים את הבעיה: יש הרבה תכנים באירוע, ואנחנו רוצים לעזור למבקר לדעת לאן ללכת
- מראים את האפליקציה המוכנה מראש בקצרה

### 2. Plan עם Copilot
להדביק את `prompts/01-plan.txt` בתוך GitHub Copilot Chat ב-VS Code.

### 3. Execute
להדביק את `prompts/02-execute.txt`.
הדגש: האפליקציה משתמשת ב-JSON מקומי כ-KB של האירוע.

### 4. Interaction
נותנים למשתתפים לנסות:
- Quick buttons
- Sample profiles
- Title + Company + Description

### 5. Validate
להדביק את `prompts/03-validate.txt`.
אם יש Playwright זמין – להריץ בדיקות. אם לא, לעשות smoke test ידני.

### 6. Polish
להדביק את `prompts/04-polish.txt`.

## Demo-safe inputs
מומלץ שהמשתתפים ינסו לפחות אחד מאלה:
- Junior Developer exploring GitHub Copilot and cloud-native tools
- Security Leader focused on SOC and exposure management
- Data Engineer working with Fabric and Power BI
- Finance Manager interested in productivity and insights
- Sales Executive looking for practical AI value stories
- Startup Founder exploring agentic workflows and GTM velocity

## מה לא לעשות במעבדה
- לא LinkedIn Login
- לא scraping חי
- לא inference מתמונה
- לא להסתמך על session times/rooms אם לא מולאו בפועל ב-`sessions.json`
