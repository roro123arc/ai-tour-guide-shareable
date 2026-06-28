#!/usr/bin/env python3
"""Submit workshop station results to the Agent Arena big-screen API."""

from __future__ import annotations

import json
import os
from urllib import request


DEFAULT_API_URL = "http://127.0.0.1:8765/api"


def submit_result(
    *,
    name: str,
    cost: float,
    quality: int,
    speed: float,
    workflow: str,
    prompt: str,
    tokens: int,
    trace: list[dict],
) -> dict:
    api_url = os.environ.get("ARENA_API_URL", DEFAULT_API_URL)
    payload = {
        "name": name,
        "cost": cost,
        "quality": quality,
        "speed": speed,
        "workflow": workflow,
        "prompt": prompt,
        "tokens": tokens,
        "trace": trace,
    }
    data = json.dumps(payload).encode("utf-8")
    http_request = request.Request(api_url, data=data, headers={"Content-Type": "application/json"}, method="POST")
    with request.urlopen(http_request, timeout=5) as response:
        result = json.loads(response.read().decode("utf-8"))
    print(f"Submitted {name}: ${cost} quality={quality} tokens={tokens}k -> {result}")
    return result