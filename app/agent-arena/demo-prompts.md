# Agent Arena Demo Prompts

Use these prompts one step at a time in GitHub Copilot Agent Mode while editing `station/vibe_coding/challenge.py`.

## Step 1: Lab orientation

Purpose: use this before changing code. It helps the presenter explain what the workflow currently does and what must stay stable.

```text
Read station/vibe_coding/challenge.py and explain the current agent workflow in simple terms. Identify the inputs, outputs, cost/quality metrics, and the return contract that must not break when we optimize it. Do not change code yet.
```

## Step 2: Token hotspots

Purpose: use this to find where tokens and cost are wasted before choosing an optimization.

```text
Analyze this workflow for token and cost hotspots. Which steps are likely wasting the most tokens and why? Do not change code yet. Return a prioritized list of optimization opportunities that preserve quality.
```

## Step 3: First safe optimization

Purpose: use this for the first live code change. It should reduce cost/tokens without hurting quality.

```text
Refactor the workflow so lookup and ranking are handled by deterministic tools or lightweight logic instead of premium reasoning. Keep the same output contract and keep quality at or above 85. Add clear trace steps showing what was routed away from premium reasoning.
```

## Step 4: Quality without extra cost

Purpose: use this after the first optimization. It adds context control and an eval gate so the demo proves quality, not only savings.

```text
Improve quality control without increasing total cost. Add compact context between stages and a deterministic quality gate. The optimized workflow should keep or improve quality while keeping cost and tokens below the YOLO baseline. Make the trace explain the eval decision.
```

## Step 5: Premium model decision

Purpose: use this at the end to explain when a premium model is worth paying for.

```text
Now that we have a low-cost workflow, identify where a premium model is truly justified. Compare a minimum-cost path with a premium-final-answer path. Keep the code simple and return cost, quality, tokens, and trace so we can explain the tradeoff live.
```

## Backup prompt

Purpose: use this if Copilot starts over-engineering or breaks the demo.

```text
Keep the implementation simple and deterministic. This is a live booth demo. Preserve the existing run() return shape, keep the code easy to explain, and prefer clear staged trace output over clever abstractions.
```
