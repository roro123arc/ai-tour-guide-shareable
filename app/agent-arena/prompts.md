# Agent Arena Vibe Coding Prompts

Use these prompts with Copilot Agent Mode while editing `station/vibe_coding/challenge.py`.

## Quick challenge

Refactor this agent workflow to reduce cost and token usage while keeping quality above 85. Preserve the existing `run()` return shape so the big screen can read cost, quality, speed, tokens, prompt, and trace.

## Model routing

Turn this YOLO workflow into staged model routing. Use cheap or deterministic steps for lookup and ranking, and reserve premium reasoning only for the final response. Keep the code easy to explain live.

## Tool grounding

Replace model guessing with deterministic tool/data lookup where possible. Add trace steps that show which work was handled by tools versus premium reasoning.

## Context redirection

Reduce the context passed between steps. Instead of carrying all raw data forward, create a compact intermediate state with only the fields needed by the next step.

## Eval gates

Add a quality gate so savings count only when quality stays above 85. If the optimized path fails the gate, surface that clearly in the returned trace.

## Full architect version

Convert the workflow into an efficient agent recipe: model routing, tool grounding, context redirection, final compose, and eval gate. The target result should be much lower cost and tokens than the YOLO baseline, with quality still at or above 85.

## If Copilot gets stuck

Keep the implementation simple and deterministic. This is a live demo, so prefer clear staged code and transparent trace output over clever abstractions.
