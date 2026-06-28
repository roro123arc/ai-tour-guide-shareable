# Station Challenge — Travel Planner Agent

Turn an expensive, wasteful AI agent into a lean, routed workflow — without
losing quality. You edit one file: `challenge.py`.

## The setup

You are handed a small **Travel Planner Agent** that builds a two-day Europe
itinerary on a mid-range budget. Right now it is YOLO: one premium model does
*everything* in a single pass and quality is just assumed.

```text
One premium model:  lookup -> summarize -> rank -> write -> assume quality
```

It works, but it is expensive:

```text
cost: $3.82   quality: 92   speed: 18.0s   tokens: 220k
```

## Your goal

Refactor `run()` in `challenge.py` into a staged, efficient recipe:

```text
structured lookup -> cheap ranking -> compact context -> premium compose once -> quality gate
```

Get the cost **way down** while keeping **quality at or above 85**. The cheapest
run that still passes the quality gate wins the board.

A strong optimized run lands around:

```text
cost: $0.50–$0.90   quality: 85+   speed: under 5s   tokens: far below 220k
```

## The challenges (do these in order)

Each one is a move toward the architect recipe. Use the matching prompt in
`prompts.md` with Copilot Agent Mode.

1. **Model routing** — use premium reasoning *only* for the final compose step;
   do lookup and ranking with cheap/deterministic steps.
2. **Tool grounding** — replace model guessing with a small destination catalog
   you filter by budget; let the trace show a tool did the lookup.
3. **Context reduction** — pass a compact intermediate state (destination hint,
   budget, top options, rules) instead of carrying raw data everywhere.
4. **Eval gate** — add a deterministic quality check (Day 1 / Day 2 split,
   alternatives, budget fit, enough highlights) so savings only count when
   quality stays ≥ 85.
5. **Readable trace** — return a trace that reads like a cost receipt so a human
   can see where every dollar and token went.

## Rules — keep `run()`'s shape

The big screen reads these fields. Do **not** change the return shape:

```python
{
    "cost": number, "quality": number, "speed": number, "tokens": number,
    "workflow": string, "prompt": string, "plan": string, "trace": list,
}
```

And no cheating: don't hard-set cost to zero, don't lower the quality bar, don't
drop the final plan, and keep the code simple enough to explain live. The arena
rewards architecture, not fake numbers.

## How to run

From the `app/agent-arena` folder:

```bash
# 1. see the YOLO starting point
python3 station/vibe_coding/challenge.py

# 2. ...edit challenge.py with Copilot Agent Mode (see prompts.md)...

# 3. submit your run to the big screen
ARENA_API_URL="http://127.0.0.1:8765/api" \
  python3 station/vibe_coding/run.py --mode challenge --name "Your Name"
```

Want to peek at the target? `solution_architect.py` is the reference solution and
`original_yolo.py` is the immutable baseline.
