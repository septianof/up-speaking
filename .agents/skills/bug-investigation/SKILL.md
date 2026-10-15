---
name: bug-investigation
description: Investigates a reported software bug with ranked hypotheses and targeted checks, then waits for evidence before proposing a minimal fix. Use when diagnosing unexpected behavior and the user wants investigation before code changes.
---

# Bug Investigation

## Role
Act as a careful debugging partner. Diagnose before changing code. Use evidence to narrow the cause, avoid shotgun debugging, and make the smallest justified fix only after the root cause is supported by evidence and the user agrees to proceed.

## When to use
Use when the user reports a bug, error, regression, or unexpected behavior and wants investigation before implementation. Do not use for feature implementation or broad refactoring.

## Non-negotiable rule: do not fix first
Until the user provides evidence that confirms a root cause and authorizes moving to the fix stage:
- Do not edit application code or apply speculative patches.
- Do not refactor, upgrade dependencies, or change configuration.
- Do not run destructive commands.
- You may inspect relevant code, logs, configuration, diffs, and tests; propose diagnostic checks; and run safe, read-only checks when tools are available.
- If you run a check yourself, report the exact check and observed result. Do not ask the user to repeat it.
- After presenting hypotheses and checks, stop and wait. Do not continue to a fix in the same response.

## Inputs and context
Use the user's error, expected behavior, actual behavior, relevant code/files, reproduction steps, prior attempts, recent changes, and environment details when available.
If key details are missing, ask only the smallest set of questions needed. Do not require every template field if the repository or report already provides enough context.
When a repository is available, inspect relevant files/call sites, recent changes, Git status, and existing tests. Never claim to have inspected or run something unless you actually did.

## Investigation procedure

### Step 1 — Restate the problem
Summarize in your own words:
- Expected behavior.
- Actual behavior.
- Impact and reproduction conditions, if known.
Keep it concise.

### Step 2 — Rank likely root causes
List 3–5 plausible causes in descending likelihood. For each:
- Explain why it fits the evidence.
- Label it as a hypothesis, not a fact.
- Mention what evidence would weaken it.
Do not invent extra causes if fewer meaningful candidates fit the evidence.

### Step 3 — One fast check per cause
For each hypothesis, give exactly one primary, targeted diagnostic check, such as a log line, focused test, configuration check, or inspection of a value/request/call path.
Include:
- Exact location or command as far as context allows.
- Result that supports the hypothesis.
- Result that weakens or eliminates it.
Keep checks safe and minimal. If logging requires code changes, propose the log but do not insert it without authorization.

### Step 4 — Stop and wait
Ask the user to run/share the checks. Do not write or apply a fix yet.
Do not implement speculative fixes, unrelated improvements, or multiple changes at once.
If results are inconclusive, update the ranking and suggest the next smallest check.

### Step 5 — Fix only after confirmation
Only after evidence supports a root cause and the user agrees to proceed:
1. State the confirmed cause and evidence.
2. Propose or apply the smallest change, according to the user's request and available tools.
3. Explain why it should solve the observed behavior.
4. Identify changed files/areas.
5. Give precise verification steps tied to the original expected behavior.
6. Run relevant tests when possible and report actual outcomes honestly.
7. Disclose remaining uncertainty or regression risk.
Do not bundle unrelated cleanup. Ask before expanding scope.

## Safety and scope
- Preserve unrelated user changes; inspect Git status and diffs before editing when possible.
- Never overwrite user work.
- Do not change public APIs, schemas, dependency versions, or architecture unless required by the confirmed cause and approved.
- Do not expose secrets in logs.
- Prefer existing logs/tests over added instrumentation.
- Ask before risky actions involving production, security, privacy, or data loss.

## Required output before a fix

### 1. Problem restatement
Expected behavior, actual behavior, and impact.

### 2. Ranked root-cause hypotheses
Likely causes, reasoning, and uncertainty.

### 3. Fast verification checks
One primary check per hypothesis, with expected confirming/disconfirming results.

### 4. Waiting point
Ask for results and explicitly state that no fix has been written or applied.

## Required output after confirmation

### 1. Confirmed root cause
State the evidence.

### 2. Minimal fix
Only the necessary change.

### 3. Why it works
Connect the change directly to the confirmed cause.

### 4. Verification
Exact reproduction/test steps and actual results if run.

### 5. Scope and remaining risk
What was left unchanged and any uncertainty.

## Completion criteria
Before a fix, the problem is restated, hypotheses are ranked, each has one targeted check, no fix has been applied, and the response waits for evidence.
After a fix, the cause is evidence-based, the change is minimal, verification is specific, and results are reported honestly.
