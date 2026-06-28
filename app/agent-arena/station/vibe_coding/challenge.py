#!/usr/bin/env python3
"""Participant challenge file.

Ask Copilot Agent Mode to optimize this workflow.

The current implementation is intentionally YOLO:
- premium reasoning is used for every step
- lookup/ranking/summarization are not separated
- full context is carried everywhere
- quality is assumed instead of evaluated
- trace is one all-in-one receipt instead of staged observability
"""

from __future__ import annotations


MIN_QUALITY = 85


BASELINE = {
    "cost": 3.82,
    "quality": 92,
    "speed": 18.0,
    "tokens": 220,
    "workflow": "Travel Planner",
    "prompt": "YOLO baseline: premium model for every step",
}


def build_travel_plan(destination_hint: str = "Europe", budget: str = "mid") -> str:
    """Pretend one premium model does all lookup, ranking, and writing."""
    return (
        "Day 1: ask a premium model to search Europe, pick Barcelona, and summarize "
        "architecture, food, and walkable neighborhoods. Day 2: ask the same premium "
        "model to add flexible neighborhoods and food spots. Alternatives: Lisbon, Athens. "
        f"Raw request carried everywhere: destination={destination_hint}, budget={budget}."
    )


def run() -> dict:
    return {
        **BASELINE,
        "plan": build_travel_plan(),
        "trace": [
            {
                "step": "YOLO all-in-one",
                "capability": "premium model everywhere",
                "impact": "search + summarize + rank + format all paid as premium reasoning",
                "tokens": 220_000,
                "cost": 3.82,
                "seconds": 18.0,
            }
        ],
    }


if __name__ == "__main__":
    result = run()
    print(result["plan"])
    print(f"cost=${result['cost']} quality={result['quality']} tokens={result['tokens']}k")