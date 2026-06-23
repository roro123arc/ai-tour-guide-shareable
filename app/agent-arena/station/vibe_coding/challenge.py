#!/usr/bin/env python3
"""Vibe-coding challenge file.

Start here in VS Code. Ask Copilot Agent Mode to optimize this workflow.

The current implementation is intentionally YOLO:
- premium reasoning is used for every step
- lookup/ranking/summarization are not separated
- full context is carried everywhere
- quality is assumed instead of evaluated
- no trace is captured
"""

from __future__ import annotations

from dataclasses import dataclass


MIN_QUALITY = 85


BASELINE = {
    "cost": 3.82,
    "quality": 92,
    "speed": 18.0,
    "tokens": 220,
    "workflow": "Travel Planner",
    "prompt": "YOLO baseline: premium model for every step",
}


@dataclass(frozen=True)
class Destination:
    city: str
    score: int
    cost_level: int
    highlights: tuple[str, ...]


CATALOG = [
    Destination("Barcelona", 91, 2, ("architecture", "food", "walkable neighborhoods")),
    Destination("Lisbon", 89, 1, ("sunset viewpoints", "seafood", "historic tram")),
    Destination("Athens", 86, 2, ("history", "street food", "day trip options")),
    Destination("Amsterdam", 84, 3, ("museums", "canals", "bike routes")),
]


def record(trace: list[dict], step: str, capability: str, impact: str, tokens: int, cost: float, seconds: float) -> None:
    trace.append(
        {
            "step": step,
            "capability": capability,
            "impact": impact,
            "tokens": tokens,
            "cost": round(cost, 4),
            "seconds": round(seconds, 2),
        }
    )


def tool_search_destinations(destination_hint: str, budget: str) -> list[Destination]:
    budget_level = {"low": 1, "mid": 2, "high": 3}.get(budget, 2)
    pool = [item for item in CATALOG if item.cost_level <= budget_level]

    if destination_hint.lower() == "europe":
        return pool
    return [item for item in pool if destination_hint.lower() in item.city.lower()] or pool


def rank_destinations(destinations: list[Destination]) -> list[Destination]:
    return sorted(destinations, key=lambda item: (item.score, -item.cost_level), reverse=True)


def build_compact_context(destination_hint: str, budget: str, ranked: list[Destination]) -> dict:
    return {
        "destination_hint": destination_hint,
        "budget": budget,
        "top_options": [item.city for item in ranked[:3]],
        "rules": "2-day itinerary + alternatives",
    }


def evaluate_plan(plan: str, ranked: list[Destination], budget: str) -> int:
    has_day_split = "Day 1:" in plan and "Day 2:" in plan
    has_alternatives = "Alternatives:" in plan
    top_fit_budget = all(item.cost_level <= {"low": 1, "mid": 2, "high": 3}.get(budget, 2) for item in ranked[:3])
    has_highlights = all(len(item.highlights) >= 3 for item in ranked[:3])

    quality = 84
    quality += 3 if has_day_split else 0
    quality += 2 if has_alternatives else 0
    quality += 2 if top_fit_budget else 0
    quality += 1 if has_highlights else 0
    return quality


def build_travel_plan(destination_hint: str = "Europe", budget: str = "mid") -> str:
    """Use staged routing to keep premium reasoning only for final phrasing."""
    candidates = tool_search_destinations(destination_hint, budget)
    ranked = rank_destinations(candidates)
    compact_context = build_compact_context(destination_hint, budget, ranked)

    top = ranked[0]
    alternatives = ", ".join(item.city for item in ranked[1:3])
    highlights = ", ".join(top.highlights)
    return (
        f"Day 1: arrive in {top.city} and focus on {highlights}. "
        f"Day 2: keep a flexible route around local neighborhoods and food spots. "
        f"Alternatives: {alternatives}. "
        f"Context used: {compact_context}."
    )


def run() -> dict:
    destination_hint = "Europe"
    budget = "mid"
    trace: list[dict] = []

    candidates = tool_search_destinations(destination_hint, budget)
    record(
        trace,
        "Lookup",
        "deterministic tool",
        "retrieved budget-fit candidates without premium reasoning",
        2_000,
        0.03,
        0.15,
    )

    ranked = rank_destinations(candidates)
    record(
        trace,
        "Rank",
        "small model",
        "used lightweight ranking on structured candidates",
        4_000,
        0.06,
        0.18,
    )

    plan = build_travel_plan(destination_hint=destination_hint, budget=budget)
    record(
        trace,
        "Compose",
        "premium model once",
        "premium reasoning reserved for final itinerary wording",
        24_000,
        0.42,
        0.35,
    )

    quality = evaluate_plan(plan, ranked, budget)
    record(
        trace,
        "Quality gate",
        "deterministic evaluator",
        f"accepted only if quality >= {MIN_QUALITY}",
        2_000,
        0.03,
        0.08,
    )

    if quality < MIN_QUALITY:
        plan += " Backup: choose Lisbon for the strongest budget stability and similar experience."
        quality = evaluate_plan(plan, ranked, budget)

    total_cost = round(sum(item["cost"] for item in trace), 2)
    total_tokens_k = round(sum(item["tokens"] for item in trace) / 1000)
    total_seconds = round(sum(item["seconds"] for item in trace), 1)

    return {
        **BASELINE,
        "cost": total_cost,
        "quality": quality,
        "speed": total_seconds,
        "tokens": total_tokens_k,
        "prompt": "routed workflow: tools + small ranker + single premium compose + quality gate",
        "plan": plan,
        "trace": trace,
    }


if __name__ == "__main__":
    result = run()
    print(result["plan"])
    print(f"cost=${result['cost']} quality={result['quality']} tokens={result['tokens']}k")
