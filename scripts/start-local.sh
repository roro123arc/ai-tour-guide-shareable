#!/usr/bin/env bash
set -euo pipefail

PORT="${1:-8000}"
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

cd "$ROOT_DIR"
echo "Serving AI Tour Guide from: $ROOT_DIR"
echo "Open: http://localhost:${PORT}/app/"
python3 -m http.server "$PORT"

