# Personal Guide — Running the Agent Arena Challenge

This is your personal, step-by-step guide for the station. Follow it top to
bottom. You only ever edit **one file**: `challenge.py`.

## Your Mission

You are given a small **Travel Planner Agent** that builds a two-day Europe
itinerary on a mid-range budget. Right now it is YOLO — one premium model does
*everything* in a single pass and quality is just assumed:

```text
One premium model:  lookup -> summarize -> rank -> write -> assume quality
```

It works, but it is expensive:

```text
cost: $3.82   quality: 92   speed: 18.0s   tokens: 220k
```

Your goal is to refactor it into a lean, routed workflow:

```text
structured lookup -> cheap ranking -> compact context -> premium compose once -> quality gate
```

Get cost **way down** while keeping **quality at or above 85**. The cheapest run
that still passes the quality gate wins the board.

## Step 0 — Read the Challenge Brief

Before touching code, read:

```text
app/agent-arena/station/vibe_coding/CHALLENGE.md
```

It lists the mission, the baseline numbers, the five moves to make, and the
rules (most importantly: keep the `run()` return shape and do not cheat).

## Step 1 — Open the File You Edit

Open:

```text
app/agent-arena/station/vibe_coding/challenge.py
```

It has one function that matters:

```python
def run() -> dict:
```

Do **not** change the return shape — the big screen reads these fields:

```python
{
    "cost": number, "quality": number, "speed": number, "tokens": number,
    "workflow": string, "prompt": string, "plan": string, "trace": list,
}
```

## Step 2 — Run the Starting Point

From the `app/agent-arena` folder:

```bash
python3 station/vibe_coding/challenge.py
```

You should see the expensive YOLO result:

```text
cost=$3.82 quality=92 tokens=220k
```

## Step 3 — Ask Copilot Agent Mode to Refactor

Open the ready-made prompts:

```text
app/agent-arena/station/vibe_coding/prompts.md
```

Use this prompt first:

```text
Convert the workflow into an efficient agent recipe: model routing, tool grounding, context reduction, final compose, and an eval gate. The target result should be much lower cost and tokens than the YOLO baseline, with quality still at or above 85. Preserve the existing run() return shape so the big screen can read cost, quality, speed, tokens, prompt, plan, and trace.
```

If Copilot gets too clever, fall back to:

```text
Keep the implementation simple and deterministic. Add a small structured destination catalog, rank it cheaply, pass a compact context to the final compose step, and add a deterministic quality gate. Preserve run() output.
```

Make the five moves in order:

1. **Model routing** — premium reasoning only for the final compose step.
2. **Tool grounding** — filter a small destination catalog by budget instead of guessing.
3. **Context reduction** — pass a compact state (hint, budget, top options, rules).
4. **Eval gate** — deterministic quality check; savings only count if quality ≥ 85.
5. **Readable trace** — a trace that reads like a cost receipt.

## Step 4 — Check Your Result

Run it again:

```bash
python3 station/vibe_coding/challenge.py
```

A strong optimized run lands around:

```text
cost: $0.50–$0.90   quality: 85+   speed: under 5s   tokens: far below 220k
```

Your `trace` should explain where the savings came from, e.g.:

```text
Lookup       - deterministic tool
Rank         - small model or deterministic scoring
Compose      - premium model once
Quality gate - accepted only if quality >= 85
```

Want to peek at the target? `solution_architect.py` is the reference solution and
`original_yolo.py` is the immutable baseline.

## Step 5 — Submit to the Big Screen

Ask the instructor for the screen's IP (or use `127.0.0.1` if you run locally).
From the `app/agent-arena` folder:

```bash
ARENA_API_URL="http://SCREEN_IP:8765/api" \
  python3 station/vibe_coding/run.py --mode challenge --name "Your Name"
```

You can also compare the two endpoints of the board:

```bash
# the expensive baseline
python3 station/vibe_coding/run.py --mode baseline  --name "Your Name"
# the reference target
python3 station/vibe_coding/run.py --mode architect --name "Your Name"
```

## Win By Architecture, Not By Cheating

The winning move is **not** "make the prompt shorter" — it is changing the
architecture:

- Do deterministic work with tools.
- Use smaller/cheaper steps before premium reasoning.
- Don't carry full raw context through every step.
- Add an eval gate so savings can't hide quality loss.
- Return a trace so humans can understand the run.

Avoid these shortcuts — they will not count:

- Don't set cost to zero without changing the trace.
- Don't lower the quality bar.
- Don't drop the final plan.
- Don't break the `run()` return shape.
- Don't make the code impossible to explain live.

The arena rewards architecture, not fake numbers.
