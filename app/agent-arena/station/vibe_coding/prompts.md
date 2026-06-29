# Agent Arena Demo Prompts

Use these prompts one step at a time in GitHub Copilot Agent Mode while editing `station/vibe_coding/challenge.py`.

Each prompt asks GHCP to answer in a structured way so the presenter can show clear conclusions, not a long wall of text.

## Required answer format for GHCP

Ask GHCP to use this structure in every step:

```text
## Conclusion
One clear sentence: what changed or what we learned.

## Numbers
Baseline vs current/target: cost, tokens, speed, quality.

## Quality impact
Say whether quality is unchanged, improved, or reduced. If reduced, explain why the tradeoff is still/was not acceptable.

## What to show on the big screen
2-3 bullets for the presenter.

## Code changes
Short list of files/functions changed. If no code was changed, say "No code changes".
```

---

## Step 1: Lab orientation

Purpose: use this before changing code. It helps the presenter explain what the workflow currently does and what must stay stable.

```text
Read station/vibe_coding/challenge.py and explain the current agent workflow in simple terms.

Do not change code yet.

Return your answer in this exact structure:

## Conclusion
Explain what this agent currently does and why it is a good optimization lab.

## Numbers
List the current cost, tokens, speed, and quality values returned by run().

## Quality impact
Explain what the current quality number represents in this demo and what must stay above 85.

## What to show on the big screen
Give 2-3 short presenter bullets.

## Code changes
No code changes.
```

## Step 2: Token hotspots

Purpose: use this to find where tokens and cost are wasted before choosing an optimization.

```text
Analyze station/vibe_coding/challenge.py for token and cost hotspots.

Do not change code yet.

Return your answer in this exact structure:

## Conclusion
Name the biggest token/cost waste in one sentence.

## Hotspot ranking
Create a table with:
- Rank
- Workflow step
- Why it wastes tokens/cost
- Safe optimization idea
- Expected quality risk: none / low / medium / high

## Numbers
Use the current cost, tokens, speed, and quality as the baseline.

## Quality impact
Explain which optimizations should not affect quality and which might reduce quality.

## What to show on the big screen
Give 2-3 short presenter bullets.

## Code changes
No code changes.
```

## Step 3: First safe optimization

Purpose: use this for the first live code change. It should reduce cost/tokens without hurting quality.

```text
Refactor station/vibe_coding/challenge.py so lookup and ranking are handled by deterministic tools or lightweight logic instead of premium reasoning.

Keep the existing run() return contract. The big screen must still receive: cost, quality, speed, tokens, prompt, trace.

Target:
- Reduce cost and tokens materially.
- Keep quality at or above 85.
- Prefer quality unchanged or nearly unchanged.
- Add clear trace steps showing what was routed away from premium reasoning.

Return your answer in this exact structure:

## Conclusion
Summarize the optimization in one sentence.

## Numbers
Create a table:
- Baseline cost/tokens/speed/quality
- New cost/tokens/speed/quality
- Delta

## Quality impact
Explain why quality should stay stable. If quality changes, explain exactly what changed.

## What to show on the big screen
Give 2-3 short presenter bullets.

## Code changes
List the functions/sections changed.
```

## Step 4: Cheapest acceptable version

Purpose: use this after the safe optimization. This is the most aggressive low-cost variant. It should show the cheapest version that still passes the quality gate, and clearly state what quality tradeoff it creates.

```text
Create the cheapest acceptable version of station/vibe_coding/challenge.py.

This step is intentionally more aggressive than the first optimization.

Goal:
- Minimize cost and tokens as much as possible.
- Keep quality at or above 85.
- Clearly show how much quality is lost, if any.
- Do not hide the tradeoff: if the cheaper version reduces quality from 92 to 89, say that clearly.
- If quality would fall below 85, stop and explain why that version is not acceptable.

Keep the existing run() return contract. The big screen must still receive: cost, quality, speed, tokens, prompt, trace.

Return your answer in this exact structure:

## Conclusion
Say whether this is the cheapest acceptable version and name the main tradeoff.

## Numbers
Create a table:
- Previous version cost/tokens/speed/quality
- Cheapest acceptable version cost/tokens/speed/quality
- Savings
- Quality delta

## Quality impact
Be explicit:
- What quality was sacrificed?
- Why does it still pass?
- What would be risky in production?

## What to show on the big screen
Give 2-3 short presenter bullets, including the quality tradeoff.

## Code changes
List the functions/sections changed.
```

## Step 5: Premium model decision

Purpose: use this at the end to explain when a premium model is worth paying for after we know the minimum viable cost.

```text
Now that we have a cheapest acceptable workflow, identify where a premium model is truly justified.

Compare:
1. YOLO baseline: premium model everywhere.
2. Cheapest acceptable version: minimum cost that still passes quality.
3. Balanced architect version: premium model only where it improves quality enough to justify cost.

Keep the code simple. If you make changes, preserve the existing run() return contract.

Return your answer in this exact structure:

## Conclusion
Say where the premium model is worth using and where it is not.

## Numbers
Create a table comparing baseline, cheapest acceptable, and balanced architect:
- cost
- tokens
- speed
- quality
- recommendation

## Quality impact
Explain what quality improvement is bought by adding premium reasoning back to specific steps.

## What to show on the big screen
Give 2-3 short presenter bullets.

## Code changes
List the functions/sections changed, or say "No code changes" if this was analysis only.
```

## Backup prompt: keep it demo-safe

Purpose: use this if Copilot starts over-engineering or breaks the demo.

```text
Keep the implementation simple and deterministic. This is a live booth demo.

Preserve the existing run() return shape:
- cost
- quality
- speed
- tokens
- prompt
- trace

Keep the code easy to explain. Prefer clear staged trace output over clever abstractions.

Return your answer in this exact structure:

## Conclusion
What you simplified.

## Numbers
Current cost/tokens/speed/quality.

## Quality impact
Why the simplified version still passes or does not pass.

## What to show on the big screen
2-3 bullets.

## Code changes
Files/functions changed.
```

## Revert prompt: restore original source for the next participant

Purpose: use this at the end of a participant round. It restores the challenge file so the next person starts from the same source state.

```text
Revert station/vibe_coding/challenge.py back to the original starting version for the booth.

Use station/vibe_coding/original_yolo.py as the source of truth for the starting behavior and return shape, but keep the file name as station/vibe_coding/challenge.py.

Requirements:
- Preserve the run() contract expected by station/vibe_coding/run.py.
- Do not modify original_yolo.py, solution_architect.py, run.py, or prompts.md.
- After reverting, summarize the restored cost, quality, speed, and tokens.
- Make the code simple and ready for the next participant.

Return your answer in this exact structure:

## Conclusion
Confirm that challenge.py was restored for the next participant.

## Numbers
Restored cost/tokens/speed/quality.

## Quality impact
Say that this is the original baseline, not the optimized version.

## What to show on the big screen
Tell the presenter to run the baseline or restart the next participant flow.

## Code changes
Only station/vibe_coding/challenge.py should be changed.
```
