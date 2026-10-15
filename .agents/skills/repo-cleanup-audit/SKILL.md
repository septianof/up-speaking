---
name: repo-cleanup-audit
description: Performs an evidence-based repository cleanup audit in two phases: read-only inventory and risk-ranked approval proposal first, then only executes explicitly approved cleanup items while preserving behavior and public APIs.
---

# Repository Cleanup Audit

## Role

Act as a senior engineer conducting a conservative cleanup pass. Find genuinely unused code, dependencies, configuration, and duplicated logic, then propose a safe, reviewable cleanup plan. Optimize for correctness and maintainability, not maximum deletion.

## Non-negotiable two-phase workflow

This skill must operate in two distinct phases.

- **Phase 1 — Audit:** read-only inspection only. Do not edit, delete, rename, reformat, install, uninstall, or generate project files.
- **Stop:** after presenting the evidence-based audit table, wait for explicit user approval.
- **Phase 2 — Execution:** execute only approved items. Preserve behavior, avoid new dependencies, and do not rename public APIs.
- Approval of the audit in general does not approve every item. If approval is partial or ambiguous, act only on the specifically approved items.
- If the user asks to execute without identifying approved items, ask which item IDs they approve.

## When to use

Use when the user requests a repository cleanup, dead-code audit, dependency cleanup, duplication removal, or splitting oversized files.

## Safety and baseline

- Inspect the repository and determine its stack, package manager, test/build commands, module system, and existing conventions.
- Check `git status --short --branch` and inspect relevant diffs before planning. Treat pre-existing changes as user work and preserve them.
- Do not use destructive Git commands or discard changes.
- Do not add new dependencies.
- Do not rename, remove, or change the signature/behavior of public APIs, routes, exports, CLI commands, or externally consumed contracts.
- If a requested cleanup appears to require a public API change, mark it out of scope and ask for a separate decision.
- Do not claim a build or test passed unless it was actually executed and its result observed.
- If repository access is unavailable or incomplete, state the limitation rather than claiming a complete audit.

## Phase 1 — Audit only

### Step 1: Establish baseline
Read-only inspect:
- Repository status and current branch.
- Project manifests and lockfiles.
- Build, test, lint, type-check, and static-analysis scripts.
- Source directories, entry points, route registration, dynamic imports, plugin registries, reflection/DI patterns, and generated code boundaries.
- Existing tests and CI configuration.
- Relevant architecture and project documentation.

Do not modify anything during this phase.

### Step 2: Search for candidate cleanup items
Inspect the following categories:

1. **Unused files/components/hooks/utilities**
   - Search imports, references, route registration, dynamic loading, framework conventions, and runtime registries.
   - A file with no direct import is not automatically unused; check framework auto-discovery, code generation, reflection, plugin registration, and external entry points.
2. **Unused imports, variables, functions, and exports**
   - Use compiler/linter/static analysis when already available.
   - Check indirect usage, callbacks, reflection, tests, public package exports, and external consumers where relevant.
3. **Unused dependencies**
   - Inspect manifest and lockfile.
   - Check imports, scripts, config files, build plugins, CLI usage, peer dependencies, and packages referenced by tooling.
   - Do not remove a dependency merely because it is not imported in application source.
4. **Unused environment variables**
   - Search code, deployment configuration, CI, scripts, documentation, and runtime config access.
   - Consider variables read indirectly by frameworks or deployment platforms.
   - Do not expose actual secret values in the report.
5. **Unused routes and API endpoints**
   - Search frontend callers, backend route registration, external integrations, webhooks, mobile clients, documentation, tests, scheduled jobs, and public contracts.
   - Lack of an internal caller does not prove an endpoint is unused externally.
6. **Commented-out code**
   - Identify substantial commented-out logic separately from explanatory comments, examples, migration notes, and code intentionally retained for documentation.
   - Do not treat ordinary comments as dead code.
7. **Duplicated logic**
   - Identify equivalent behavior duplicated in two or more locations.
   - Compare edge cases, error handling, side effects, authorization, ordering, and data transformations before proposing extraction.
   - Do not abstract code solely because it looks similar.
8. **Oversized files**
   - Use objective signals such as line count, number of responsibilities, cohesion, coupling, complexity, and testability.
   - Do not split files based on line count alone.
   - Propose boundaries based on responsibility and dependency direction.

### Step 3: Gather evidence and confidence
For each candidate:
- Record exact file paths and line ranges when available.
- State the search or analysis used to establish usage/non-usage.
- Include relevant tool output or references to concrete code paths.
- Estimate confidence from the available evidence; do not imply mathematical precision.
- Mark any item with confidence **below 90%** as `DO NOT DELETE / DO NOT CHANGE`. It must not be included in Phase 2 unless new evidence raises confidence and the user separately approves it.
- If a tool is unavailable, do not substitute assumptions for evidence.
- Distinguish:
  - `Confirmed unused`
  - `Likely unused`
  - `Needs runtime/external verification`
  - `Duplication candidate`
  - `Oversized / extraction candidate`

### Step 4: Assign risk
Use:
- **Low:** local, isolated cleanup with strong evidence and no public contract impact.
- **Medium:** changes cross module boundaries, require regression testing, or have some indirect-usage uncertainty.
- **High:** could affect runtime behavior, public API, auth/security, data access, routing, environment configuration, build/release behavior, or external consumers.
- **Critical:** likely to cause severe data loss, security regression, broad outage, or irreversible effects if mishandled.

Risk level represents the potential impact if the cleanup is wrong, not the confidence that the item is unused. Report confidence and risk separately.

### Step 5: Present the audit table
Use a table with:
- ID
- Category
- Candidate and location (file:line)
- Evidence of non-use or duplication
- Proposed action
- Confidence (%)
- Risk level
- Verification needed
- Decision status

For candidates below 90% confidence, make the warning prominent: `DO NOT DELETE / DO NOT CHANGE — confidence below 90%`.

For dependency, route, API, and environment-variable removals, explicitly state what external or runtime usage could not be ruled out.

### Step 6: Summarize and stop
Include:
- A brief inventory of categories inspected.
- Build/test/static-analysis checks actually run and results.
- Important limitations and uninspected areas.
- Items recommended for cleanup, separated from items requiring more evidence.
- A request for approval by item ID.

**Stop after Phase 1. Do not perform any cleanup in the same turn.**

## Phase 2 — Execute only after explicit approval

### Step 7: Confirm approved scope
- Match user approval to specific audit item IDs.
- Exclude rejected, ambiguous, and unapproved items.
- Re-check current Git status and relevant diffs, since the repository may have changed after the audit.
- If files or references changed since the audit, re-evaluate affected items and ask for approval again if the scope or risk changed.
- Re-check confidence for every approved deletion. Do not delete or change an item still below 90% confidence.
- If a proposed action would alter a public API, add a dependency, or change behavior, stop and ask; these are outside the approved cleanup constraints.

### Step 8: Execute in small, reviewable batches
- Group only logically related approved changes.
- Delete only confirmed-unused items approved by the user.
- Remove unused dependencies from manifest and lockfile using the existing package manager, without adding dependencies.
- Extract duplicated logic into shared utilities only when behavior, edge cases, and side effects are equivalent.
- Split oversized files along clear responsibility boundaries, preserving import/export contracts and public APIs.
- Avoid opportunistic formatting, renaming, unrelated refactors, or scope expansion.
- After each logical batch, inspect the diff before proceeding.
- If a change reveals an unexpected dependency or behavior difference, stop and report it rather than improvising.

### Step 9: Preserve behavior
- Keep externally observable behavior identical.
- Preserve public export names, signatures, route paths, API contracts, environment variable names, and CLI behavior.
- Maintain authorization, validation, error handling, ordering, and side effects during deduplication.
- Avoid new dependencies.
- For dependency removal, verify the lockfile remains consistent with the manifest.
- If preserving behavior cannot be demonstrated safely, do not perform the change without a new approval decision.

### Step 10: Verify
After each logical batch, run the most relevant available checks:
- Targeted tests.
- Type checks and lint.
- Build.
- Full relevant test suite.
- Static analysis or unused-export checks when already configured.

Compare behavior-sensitive code before and after. Do not claim verification passed unless checks were actually run. If tests cannot run, explain why and mark the result as unverified.

### Step 11: Report and stop
Provide a concise change log:
- Approved item IDs completed.
- Files changed/deleted and reason.
- Duplicate logic extracted and new shared utility location.
- Oversized files split and responsibility boundaries.
- Tests/build/lint commands and actual results.
- Approved items skipped, blocked, or found unsafe.
- Any behavior-preservation uncertainty.
- A summary of the diff for review.

Do not create a commit unless the user explicitly asks.

## Required Phase 1 output

# Repository Cleanup Audit — Phase 1

## 1. Repository baseline
Branch, working tree, stack, package manager, and pre-existing changes.

## 2. Audit method and coverage
Tools/searches actually used and categories inspected.

## 3. Evidence-based candidate table
Include all requested categories and explicit risk/confidence values.

## 4. Below-90% confidence items
List separately with the warning: **DO NOT DELETE / DO NOT CHANGE**.

## 5. Verification and limitations
Checks run, results, and what could not be determined.

## 6. Approval request
Ask the user to approve or reject specific item IDs. Explicitly confirm that nothing was changed.

## Required Phase 2 output

# Repository Cleanup — Phase 2

## 1. Approved scope
List exactly which item IDs were approved.

## 2. Changes by intent
Explain each logical batch and why it was necessary.

## 3. Files changed
List added/modified/deleted files and public contracts preserved.

## 4. Verification
Exact commands and observed results; clearly identify checks not run.

## 5. Remaining risks and skipped items
Explain any unresolved items and why they were not changed.

## 6. Diff review summary
Summarize the final diff and confirm no new dependencies or public API renames were introduced.

## Rules
- Phase 1 is read-only.
- Never proceed to Phase 2 without explicit item-level approval.
- Never delete or change candidates with confidence below 90%.
- Never infer that a route, API, env var, dependency, or file is unused solely because no direct reference was found.
- Never change public API names/contracts or add dependencies.
- Never bundle unrelated cleanup into the approved scope.
- Never claim behavior stayed identical without appropriate verification; describe evidence and limits.
- Never discard user changes or create a commit without authorization.

## Completion criteria
Phase 1 is complete when every requested category has been assessed as far as possible, candidates are evidence-backed and risk-ranked, confidence below 90% is explicitly flagged, and the agent stops for approval.
Phase 2 is complete when only approved, sufficiently verified items have been changed, behavior-preservation checks are reported honestly, and the final diff is summarized for review.
