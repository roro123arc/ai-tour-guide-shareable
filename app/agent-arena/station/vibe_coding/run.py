#!/usr/bin/env python3
"""Run the VS Code station workflows and submit them to the big screen."""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

STATION_DIR = Path(__file__).resolve().parents[1]
if str(STATION_DIR) not in sys.path:
    sys.path.insert(0, str(STATION_DIR))

import challenge
import original_yolo
import solution_architect
from submit import submit_result


def main() -> None:
    parser = argparse.ArgumentParser(description="Run an Agent Arena vibe-coding workflow.")
    parser.add_argument(
        "--mode",
        choices=["baseline", "challenge", "architect"],
        default="challenge",
        help="baseline=immutable YOLO, challenge=participant-edited challenge.py, architect=reference solution",
    )
    parser.add_argument("--name", default="VS Code Visitor")
    args = parser.parse_args()

    if args.mode == "baseline":
        result = original_yolo.run()
        prompt = result["prompt"]
    elif args.mode == "architect":
        result = solution_architect.run()
        prompt = result["prompt"]
    else:
        result = challenge.run()
        prompt = result.get("prompt", "participant-edited challenge.py")

    submit_result(
        name=args.name,
        cost=result["cost"],
        quality=result["quality"],
        speed=result["speed"],
        workflow=result.get("workflow", "Travel Planner"),
        prompt=prompt,
        tokens=result["tokens"],
        trace=result["trace"],
    )


if __name__ == "__main__":
    main()
