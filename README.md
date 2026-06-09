# Microsoft AI Tour Guide

Static web app for the Microsoft AI Tour Tel Aviv conference. The app helps attendees choose a practical route through recommended workshops, demo booths, zones, and the venue map based on a fast path, sample profile, or custom role description.

## What is included

- `app/` - static web app: HTML, CSS, JavaScript, and image assets.
- `data/` - editable event catalog data in JSON.
- `data/catalog_filters.json` - session-catalog filter values modeled from the official AI Tour catalog.
- `prompts/` - GitHub Copilot prompts for the workshop/lab flow.
- `LAB-FLOW-he.md` - suggested Hebrew facilitator flow.
- `QR-INSTRUCTIONS-he.md` - QR code options for the final event URL.
- `scripts/start-local.sh` - local web server helper.

## Run locally

Use a local web server from the repo root so the app can load `data/*.json` correctly.

```bash
./scripts/start-local.sh
```

Open:

```text
http://localhost:8000/app/
```

Optional custom port:

```bash
./scripts/start-local.sh 5174
```

Open:

```text
http://localhost:5174/app/
```

## Share with a colleague

If this repo is uploaded to GitHub:

1. Click **Code**.
2. Choose **Download ZIP** for a simple handoff, or copy the repo URL for `git clone`.
3. The colleague can run it locally with `./scripts/start-local.sh`.

Clone command example:

```bash
git clone <REPO_URL>
cd ai-tour-guide-shareable
./scripts/start-local.sh
```

## Publish for attendees

Any static hosting works because the app has no build step and no backend.

Recommended options:

1. **GitHub Pages** - enable Pages from the main branch and open `https://<org-or-user>.github.io/<repo-name>/app/`.
2. **Azure Static Web Apps** - deploy the repo as static content and set the app location to `/`.
3. **Internal event web server** - serve the repo root and point attendees to `/app/`.

## QR code option

After the app has a final URL, create a QR code for the exact `/app/` URL.

Example final URL:

```text
https://<host>/<repo-or-site>/app/
```

Fast options:

1. Open the final URL in Microsoft Edge, right-click the page, choose **Create QR code for this page**, and download the PNG.
2. In Microsoft 365 Copilot Chat, ask: `Create a QR code that points to https://<host>/<repo-or-site>/app/`.
3. For a temporary onsite demo on the same Wi-Fi, run the app locally and use the machine IP URL, for example `http://192.168.1.20:8000/app/`.

See `QR-INSTRUCTIONS-he.md` for a Hebrew handoff note.

## Update the event content

Edit the JSON files in `data/`:

- `workshops.json` - workshops shown in recommendations and the ideal path.
- `booths.json` - demo booths shown in recommendations and the ideal path.
- `catalog_filters.json` - filter values for session type, topic, and audience.
- `zones.json` - high-level recommended zones.
- `agenda_summary.json` - event timing, lunch, and service windows.
- `sample_profiles.json` - sample visitor profiles.
- `interests_taxonomy.json` - matching tags used by the recommendation logic.

The venue map image is stored at:

```text
app/assets/unified-venue-map.png
```

Pin locations are configured in `app/app.js` under `venueLocations`.

## Booth demo flow

Use this app as a Copilot-ready extension demo rather than a claim that the full app was generated live.

Suggested flow:

1. Open the attendee guide and choose a fast path such as **Developer**.
2. Show the recommendations, venue map, ideal path, and time-conflict handling.
3. Use **Official catalog filters** to mirror the public AI Tour catalog filters: session type, topic, and audience.
4. Use **Where should I go now?** to recommend a next stop based on current hall, time available, and interest.
5. In VS Code, show how GitHub Copilot can explain or extend the codebase:

```text
Explain how this app recommends workshops, booths, zones, map pins, and next-best stops.
Point me to the JSON files and functions I should edit to adapt it for another event.
```

Safe live prompts:

```text
Add another catalog filter for audience seniority using the existing JSON pattern.
```

```text
Improve the “Where should I go now?” explanation so it mentions walking time, hall, and matched interest.
```

```text
Add a “Copy my route” button that copies the recommended path, halls, and times to the clipboard.
```

Data note: this booth version uses curated local JSON based on the official event catalog so the demo stays fast, private, and reliable. A production version could connect to a catalog API, CMS export, or MCP-backed approved event-data source.

## Notes

- No login is required.
- No attendee data is collected.
- No package install or build command is required.
- The app should be served from the repo root, not by opening `app/index.html` directly from the filesystem.
