#!/usr/bin/env python3
"""Reference optimized implementation for the VS Code station."""

from __future__ import annotations

import sys
from pathlib import Path

STATION_DIR = Path(__file__).resolve().parents[1]
if str(STATION_DIR) not in sys.path:
    sys.path.insert(0, str(STATION_DIR))

from run_workflow import run_workflow


def run() -> dict:
    return run_workflow()


if __name__ == "__main__":
    result = run()
    print(
        f"cost=${result['cost']} quality={result['quality']} "
        f"time={result['speed']}s tokens={result['tokens']}k"
    )
    for item in result["trace"]:
        print(f"- {item['step']}: {item['impact']} ({item['tokens'] / 1000:g}k, ${item['cost']:.2f})")
