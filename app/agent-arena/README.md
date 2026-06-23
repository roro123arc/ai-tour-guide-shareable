# Agent Arena - Microsoft conference kit

ערכת דמו לכנס Microsoft: מסך גדול, leaderboard חי, וסקריפט תחנה לשליחת תוצאות אחרי optimization.

המסלול המומלץ הוא להריץ מקומית על המחשב שמחובר למסך הגדול. אם צריך ענן, מעלים את אותו שרת ל-Azure App Service.

## מבנה

```text
agent-arena/
├── big-screen/
│   └── index.html       # המסך הגדול
├── data/
│   └── leaderboard.json # נוצר אוטומטית בזמן ריצה
├── server.py            # שרת מקומי / Azure App Service
├── run.sh               # הפעלה מהירה
├── foundry_mapping.md   # מיפוי מהדמו המקומי ל-Foundry production
├── station_challenge.md # תסריט משתתף + talk track
└── station/
    ├── vibe_coding/    # קבצי VS Code לעמדת וייב-קודינג
    ├── run_workflow.py  # workflow מקומי אמיתי עם trace
    ├── foundry_runner.py # Foundry mode אופציונלי עם fallback מקומי
    └── submit.py        # helper לשליחה מתחנות המשתתפים
```

## הפעלה מקומית לכנס

במחשב שמחובר למסך הגדול:

```bash
cd /Users/rotemlevi/Documents/Clawpilot/agent-arena
./run.sh
```

פתחי במסך הגדול:

```text
http://127.0.0.1:8765
```

Chrome/Edge במסך מלא: `F11`.

## תחנות משתתפים באותה רשת

פתחי לכל תחנה את `station_challenge.md`. זה הדף שמסביר למשתתף את המשימה ואת היכולות של Microsoft Build שכדאי לדבר עליהן בזמן הדמו.

מצאי את ה-IP של המחשב שמריץ את המסך:

```bash
ipconfig getifaddr en0
```

בכל תחנה:

```bash
export ARENA_API_URL="http://YOUR_MAC_IP:8765/api"
```

הדרך המומלצת בתחנה היא להריץ workflow אמיתי מקומי שמחשב cost/quality/speed ו-trace:

```bash
cd /Users/rotemlevi/Documents/Clawpilot/agent-arena/station
ARENA_API_URL="http://YOUR_MAC_IP:8765/api" python3 run_workflow.py --name "Ayelet"
```

הסקריפט מבצע בפועל:

```text
route models -> tool lookup -> eval gate -> trace capture -> submit
```

## עמדת VS Code / vibe coding

פתחי את התיקייה הזו ב-VS Code:

```text
/Users/rotemlevi/Documents/Clawpilot/agent-arena
```

הקבצים שהמשתתף רואה:

```text
station/vibe_coding/challenge.py          # הקוד הנאיבי שאותו מבקשים מ-Copilot לשפר
station/vibe_coding/prompts.md            # prompt מוכן ל-Agent Mode
station/vibe_coding/solution_architect.py # reference implementation
station/vibe_coding/run.py                # מריץ baseline/architect ושולח למסך
```

ב-VS Code אפשר להריץ מה-Command Palette:

```text
Tasks: Run Task -> Vibe: submit YOLO baseline
Tasks: Run Task -> Vibe: submit architect solution
```

הסיפור למשתתף:

```text
1. הנה קוד YOLO שעושה הכול בפרומפט אחד.
2. תבקש מ-Copilot Agent Mode להפוך אותו ל-Architect.
3. נריץ baseline מול architect.
4. המסך הגדול מתעדכן עם cost, quality, time, tokens ו-trace.
```

אם רוצים להראות Foundry-ready mode:

```bash
cd /Users/rotemlevi/Documents/Clawpilot/agent-arena/station
python3 foundry_runner.py --name "Ayelet"
```

בלי משתני Foundry הוא יריץ local fallback יציב. עם endpoint אמיתי:

```bash
export AZURE_AI_FOUNDRY_RESPONSES_URL="https://YOUR_ENDPOINT/openai/responses?api-version=YOUR_API_VERSION"
export AZURE_AI_FOUNDRY_API_KEY="..."
export AZURE_AI_FOUNDRY_MODEL="..."
python3 foundry_runner.py --name "Ayelet"
```

המיפוי המלא נמצא ב-`foundry_mapping.md`.

אם רוצים לשלוח תוצאה ידנית בסוף workflow אחר:

```python
from station.submit import submit_result

submit_result(
    name="Ayelet",
    cost=0.74,
    quality=90,
    speed=4.8,
    workflow="Travel Planner",
    prompt="parallelize + route models",
    tokens=41,
)
```

## בדיקת end-to-end

בטרמינל אחד:

```bash
./run.sh
```

בטרמינל שני:

```bash
cd station
ARENA_API_URL="http://127.0.0.1:8765/api" python3 run_workflow.py --name "Tester"
```

או בלי שאלות:

```bash
cd station
python3 run_workflow.py --name "Tester"
```

בדיקת Foundry-ready fallback:

```bash
cd station
python3 foundry_runner.py --name "Foundry Ready"
```

בדיקת API:

```text
http://127.0.0.1:8765/api?action=leaderboard
```

Reset:

```text
http://127.0.0.1:8765/api?action=reset
```

## Azure App Service

אותו `server.py` יכול לרוץ ב-Azure App Service כ-Python app.

דוגמת פריסה עם Azure CLI מתוך תיקיית `agent-arena`:

```bash
az login
az group create --name rg-agent-arena --location westeurope
az appservice plan create --name plan-agent-arena --resource-group rg-agent-arena --sku B1 --is-linux
az webapp create --name YOUR_UNIQUE_APP_NAME --resource-group rg-agent-arena --plan plan-agent-arena --runtime "PYTHON:3.11"
az webapp config set --resource-group rg-agent-arena --name YOUR_UNIQUE_APP_NAME --startup-file "python server.py --host 0.0.0.0 --port 8000"
az webapp config appsettings set --resource-group rg-agent-arena --name YOUR_UNIQUE_APP_NAME --settings PORT=8000
az webapp up --name YOUR_UNIQUE_APP_NAME --resource-group rg-agent-arena --runtime "PYTHON:3.11"
```

לאחר פריסה:

```text
https://YOUR_UNIQUE_APP_NAME.azurewebsites.net
```

תחנות שולחות אל:

```bash
export ARENA_API_URL="https://YOUR_UNIQUE_APP_NAME.azurewebsites.net/api"
```

## גיבוי בזמן אמת

לחצי `P` במסך הגדול כדי לפתוח panel של facilitator ולהוסיף תוצאה ידנית.

אפשר גם לפתוח:

```text
http://127.0.0.1:8765?name=Ayelet&cost=0.74&quality=90&workflow=Travel%20Planner
```

## טיפים לכנס

- לעבוד עם Edge או Chrome במסך מלא.
- להשאיר את השרת המקומי פתוח בטרמינל גלוי.
- אם רשת התחנות לא יציבה, להשתמש ב-panel הידני עם `P`.
- איכות מתחת ל-80 נשמרת אבל לא נכנסת ל-leaderboard.
- להשתמש ב-talk track מתוך `station_challenge.md`: הסיפור הוא routing, MCP Toolboxes, eval gates, observability ו-Foundry Agent Service.
