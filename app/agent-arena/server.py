#!/usr/bin/env python3
"""Local Agent Arena server for conference use."""

from __future__ import annotations

import argparse
import json
import mimetypes
import os
import threading
from datetime import datetime
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, unquote, urlparse

ROOT = Path(__file__).resolve().parent
SCREEN = ROOT / "big-screen" / "index.html"
DATA_DIR = ROOT / "data"
DATA_FILE = DATA_DIR / "leaderboard.json"
BASELINE_COST = 3.82
MIN_QUALITY_FOR_BOARD = 80
LOCK = threading.Lock()


def load_rows() -> list[dict]:
    if not DATA_FILE.exists():
        return []
    with DATA_FILE.open("r", encoding="utf-8") as handle:
        data = json.load(handle)
    rows = data.get("rows", [])
    if not isinstance(rows, list):
        raise ValueError("leaderboard data is corrupt: rows must be a list")
    return rows


def save_rows(rows: list[dict]) -> None:
    DATA_DIR.mkdir(exist_ok=True)
    tmp = DATA_FILE.with_suffix(".tmp")
    with tmp.open("w", encoding="utf-8") as handle:
        json.dump({"rows": rows}, handle, indent=2, ensure_ascii=False)
    tmp.replace(DATA_FILE)


def clean_text(value: object, max_length: int) -> str:
    return str(value or "").strip()[:max_length]


def submit_result(data: dict) -> dict:
    name = clean_text(data.get("name"), 80)
    workflow = clean_text(data.get("workflow") or "Travel Planner", 120)
    prompt = clean_text(data.get("prompt"), 180)

    if not name:
        return {"ok": False, "error": "missing name"}
    try:
        cost = float(data.get("cost"))
        quality = int(float(data.get("quality")))
    except (TypeError, ValueError):
        return {"ok": False, "error": "invalid cost or quality"}

    tokens_value = data.get("tokens")
    tokens = None
    if tokens_value not in (None, ""):
        try:
            tokens = int(float(tokens_value))
        except (TypeError, ValueError):
            return {"ok": False, "error": "invalid tokens"}

    speed_value = data.get("speed")
    speed = None
    if speed_value not in (None, ""):
        try:
            speed = float(speed_value)
        except (TypeError, ValueError):
            return {"ok": False, "error": "invalid speed"}

    if cost < 0:
        return {"ok": False, "error": "cost must be non-negative"}
    if quality < 0 or quality > 100:
        return {"ok": False, "error": "quality must be between 0 and 100"}
    if tokens is not None and tokens < 0:
        return {"ok": False, "error": "tokens must be non-negative"}
    if speed is not None and speed < 0:
        return {"ok": False, "error": "speed must be non-negative"}

    now = datetime.now()
    saving = round((1 - cost / BASELINE_COST) * 100)
    row = {
        "name": name,
        "cost": round(cost, 4),
        "quality": quality,
        "saving": saving,
        "workflow": workflow,
        "prompt": prompt,
        "tokens": tokens,
        "speed": round(speed, 2) if speed is not None else None,
        "trace": data.get("trace") if isinstance(data.get("trace"), list) else [],
        "time": now.strftime("%H:%M"),
        "timestamp": now.isoformat(timespec="seconds"),
    }

    with LOCK:
        rows = load_rows()
        rows.append(row)
        save_rows(rows)
        leaderboard = leaderboard_data(rows)

    rank = next(
        (
            index + 1
            for index, entry in enumerate(leaderboard["entries"])
            if entry["name"] == row["name"] and entry["cost"] == row["cost"]
        ),
        None,
    )

    return {
        "ok": True,
        "saving": saving,
        "rank": rank,
        "isRecord": leaderboard["topEntry"] == row if leaderboard["topEntry"] else False,
    }


def leaderboard_data(rows: list[dict] | None = None) -> dict:
    if rows is None:
        with LOCK:
            rows = load_rows()

    best_by_name: dict[str, dict] = {}
    for row in rows:
        try:
            cost = float(row["cost"])
            quality = int(row["quality"])
        except (KeyError, TypeError, ValueError):
            continue
        if quality < MIN_QUALITY_FOR_BOARD:
            continue
        name = clean_text(row.get("name"), 80)
        enriched = {
            **row,
            "name": name,
            "cost": cost,
            "quality": quality,
            "saving": int(row.get("saving", round((1 - cost / BASELINE_COST) * 100))),
            "speed": row.get("speed"),
            "trace": row.get("trace", []),
        }
        if name and (name not in best_by_name or cost < float(best_by_name[name]["cost"])):
            best_by_name[name] = enriched

    entries = sorted(best_by_name.values(), key=lambda item: item["cost"])[:5]
    return {
        "ok": True,
        "entries": entries,
        "topEntry": entries[0] if entries else None,
        "latestEntry": rows[-1] if rows else None,
        "totalRuns": len(rows),
        "baseline": BASELINE_COST,
    }


def reset_leaderboard() -> dict:
    with LOCK:
        save_rows([])
    return {"ok": True, "message": "Leaderboard reset"}


class ArenaHandler(BaseHTTPRequestHandler):
    server_version = "AgentArena/1.0"

    def do_GET(self) -> None:
        parsed = urlparse(self.path)
        if parsed.path == "/api":
            query = parse_qs(parsed.query)
            action = query.get("action", ["leaderboard"])[0]
            if action == "leaderboard":
                self.send_json(leaderboard_data())
            elif action == "reset":
                self.send_json(reset_leaderboard())
            elif action == "submit":
                self.send_json(submit_result({key: values[-1] for key, values in query.items()}))
            else:
                self.send_json({"ok": False, "error": "unknown action"}, status=400)
            return

        self.serve_static(parsed.path)

    def do_POST(self) -> None:
        parsed = urlparse(self.path)
        if parsed.path != "/api":
            self.send_json({"ok": False, "error": "not found"}, status=404)
            return

        length = int(self.headers.get("Content-Length", "0") or "0")
        body = self.rfile.read(length).decode("utf-8") if length else "{}"
        try:
            data = json.loads(body)
        except json.JSONDecodeError as exc:
            self.send_json({"ok": False, "error": f"invalid json: {exc}"}, status=400)
            return
        self.send_json(submit_result(data))

    def do_OPTIONS(self) -> None:
        self.send_response(204)
        self.send_cors_headers()
        self.end_headers()

    def serve_static(self, path: str) -> None:
        if path in ("", "/"):
            file_path = SCREEN
        else:
            requested = (ROOT / unquote(path.lstrip("/"))).resolve()
            if ROOT not in requested.parents and requested != ROOT:
                self.send_error(403)
                return
            file_path = requested

        if not file_path.exists() or not file_path.is_file():
            self.send_error(404)
            return

        content_type = mimetypes.guess_type(file_path.name)[0] or "application/octet-stream"
        data = file_path.read_bytes()
        self.send_response(200)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def send_json(self, data: dict, status: int = 200) -> None:
        payload = json.dumps(data, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_cors_headers()
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Cache-Control", "no-store")
        self.send_header("Content-Length", str(len(payload)))
        self.end_headers()
        self.wfile.write(payload)

    def send_cors_headers(self) -> None:
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")

    def log_message(self, format: str, *args: object) -> None:
        print("[%s] %s" % (self.log_date_time_string(), format % args))


def main() -> None:
    parser = argparse.ArgumentParser(description="Run the Agent Arena local server.")
    parser.add_argument("--host", default="0.0.0.0", help="Host to bind. Use 0.0.0.0 for other laptops on the same network.")
    parser.add_argument("--port", type=int, default=int(os.environ.get("PORT", "8765")), help="Port to listen on.")
    args = parser.parse_args()

    server = ThreadingHTTPServer((args.host, args.port), ArenaHandler)
    print(f"Agent Arena is live: http://127.0.0.1:{args.port}")
    print(f"Station submit URL: http://127.0.0.1:{args.port}/api")
    print("Press Ctrl+C to stop.")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nStopping Agent Arena.")


if __name__ == "__main__":
    main()
