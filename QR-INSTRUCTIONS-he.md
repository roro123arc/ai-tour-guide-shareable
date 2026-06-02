# QR - איך לייצר מהר

צריך ליצור QR רק אחרי שיש URL סופי לאפליקציה, למשל:

```text
https://<host>/<repo-or-site>/app/
```

## אופציה 1 - Microsoft Edge

1. לפתוח את ה-URL הסופי של האפליקציה ב-Edge.
2. קליק ימני על הדף.
3. לבחור `Create QR code for this page`.
4. להוריד PNG ולשלב במצגת/שילוט/דף ההנחיות.

## אופציה 2 - Microsoft 365 Copilot Chat

ב-Microsoft 365 Copilot Chat:

```text
Create a QR code that points to https://<host>/<repo-or-site>/app/
```

ואז להוריד את התמונה.

## אופציה 3 - דמו זמני על Wi-Fi מקומי

אם רוצים QR זמני רק בזמן ההכנה או בחדר המעבדה:

1. להריץ מה-repo:

```bash
./scripts/start-local.sh
```

2. למצוא את כתובת ה-IP של המחשב.
3. לפתוח מהנייד, באותו Wi-Fi:

```text
http://<MACHINE-IP>:8000/app/
```

4. ליצור QR לכתובת הזו.

חשוב: QR כזה יעבוד רק למי שמחובר לאותה רשת ושכללי הרשת מאפשרים גישה למחשב המריץ.

## מתי להשתמש ב-QR

מומלץ להציג את ה-QR בסוף המעבדה או במהלך שלב ה-Use, כדי שהמשתתפים יוכלו לפתוח את האפליקציה גם מהנייד.
