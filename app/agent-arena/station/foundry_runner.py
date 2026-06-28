#!/usr/bin/env python3
"""Foundry-ready workshop runner with deterministic local metrics."""

from __future__ import annotations

import argparse
import os

from run_workflow import run_workflow
from submit import submit_result


def main() -> None:
    parser = argparse.ArgumentParser(description="Run the Foundry-ready Agent Arena workshop fallback.")
    parser.add_argument("--name", default="Foundry Ready")
    args = parser.parse_args()

    result = run_workflow()
    result["prompt"] = (
        "Foundry-ready mode: routed workflow with local metrics"
        if os.environ.get("AZURE_AI_FOUNDRY_RESPONSES_URL")
        else "local fallback: Foundry-ready architecture pattern"
    )
    submit_result(
        name=args.name,
        cost=result["cost"],
        quality=result["quality"],
        speed=result["speed"],
        workflow=result["workflow"],
        prompt=result["prompt"],
        tokens=result["tokens"],
        trace=result["trace"],
    )


if __name__ == "__main__":
    main()