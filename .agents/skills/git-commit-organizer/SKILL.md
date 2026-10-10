---
name: git-commit-organizer
description: Reviews staged and unstaged Git changes, groups them by intent, and prepares an ordered atomic commit plan with Conventional Commit messages and exact commands. Use before committing a batch of changes or when a working tree contains mixed changes.
---

# Git Commit Organizer

## Role

Act as a careful Git reviewer. Inspect the current working tree and turn existing changes into a clear, safe, ordered sequence of atomic commits. Prioritize preserving user work, maintaining a buildable/testable history, and explaining why each commit belongs separately.

This skill organizes existing changes. It does not implement new features or silently modify the code to make commits easier.

## When to use

Use this skill when the user asks to:
- Review staged and unstaged changes before committing.
- Separate mixed changes into logical commits.
- Draft Conventional Commit messages.
- Prepare exact Git commands for an ordered commit sequence.
- Audit a proposed commit plan.

Do not use this skill merely to plan future implementation tasks when there are no relevant changes in the working tree.

## Safety and permissions

- Default mode is **review and propose**, not execute.
- Do not create commits, stage files, unstage files, amend commits, rebase, reset, restore, clean, or otherwise mutate Git state unless the user explicitly authorizes execution.
- Never discard, overwrite, or revert user changes to make the plan simpler.
- Preserve unrelated staged and unstaged work. Treat pre-existing staged changes as intentional until evidence indicates otherwise.
- Never use destructive commands such as `git reset --hard`, `git clean`, or broad restore commands as part of routine organization.
- If the repository has merge conflicts, an in-progress rebase/cherry-pick, unresolved index state, or an unclear operation in progress, stop and report it before suggesting commit commands that could worsen the state.
- Do not include secrets, credentials, local environment files, generated artifacts, or unrelated user work in commits without explicit justification and authorization.
- If a change is sensitive or its purpose is unclear, ask rather than guessing.

## Inspection procedure

1. **Confirm repository state**
   - Inspect the repository root and current branch.
   - Check `git status --short --branch`.
   - Inspect staged changes with `git diff --cached`.
   - Inspect unstaged tracked changes with `git diff`.
   - Identify untracked files using `git status` and inspect their contents only when safe and relevant.
   - Check recent commit style with `git log` if useful.
   - Inspect relevant diffs, not just filenames. Do not assume a file's purpose from its name alone.
2. **Preserve scope**
   - Identify staged, unstaged, and untracked files separately.
   - Detect unrelated or pre-existing changes and keep them out of the proposed commits unless the user explicitly includes them.
   - If a diff is too large, binary, generated, or unavailable for reliable inspection, state the limitation.
3. **Group by intent**
   - Summarize what actually changed and why, using evidence from the diff.
   - Group related changes by logical purpose, such as feature, bug fix, refactor, tests, docs, build, or CI.
   - Do not group changes solely because they touch the same file or were made in the same coding session.
   - If a change mixes a bug fix and an unrelated refactor, separate them when possible.
   - If a file contains multiple intents, plan partial staging with `git add -p` or another precise staging method; do not assume whole-file staging is safe.
4. **Design atomic commits**
   - Prefer one logical change per commit.
   - Include tests and required implementation changes together when they are inseparable for a meaningful, passing commit.
   - Keep refactors separate from behavior changes unless separation would leave the history invalid or untestable.
   - Do not split changes so aggressively that commits become incoherent or fail because required code and tests are separated.
   - Do not invent changes that are not present in the working tree.
5. **Order commits**
   - Determine dependencies between proposed commits.
   - Order prerequisites before dependent changes.
   - Aim for every intermediate commit to build and pass relevant tests.
   - If the current diff does not contain enough information to guarantee intermediate build/test success, state the uncertainty and recommend the safest order.
   - Do not claim intermediate commits were tested unless they were actually checked out/applied and verified.
6. **Draft commit messages**
   - Use the repository's established convention if compatible with the user's request; otherwise use Conventional Commits.
   - Allowed types: `feat`, `fix`, `refactor`, `perf`, `docs`, `test`, `chore`, `style`, `build`, `ci`.
   - Format the subject as `type(scope): imperative summary`.
   - Keep the subject under 60 characters when feasible, counting the full subject line. If the scope makes this impossible, shorten the scope or summary.
   - Use a clear imperative verb and specific object. Avoid vague subjects such as `update`, `fix stuff`, `changes`, or `wip`.
   - After the subject, include a blank line and a body explaining **why** the change is needed and the relevant trade-off or limitation. Do not merely repeat the subject.
   - Include `BREAKING CHANGE: ...` in the body when the change intentionally breaks compatibility. Do not label a change breaking without evidence.
   - Keep message claims consistent with the actual diff.
7. **Map exact changes to commits**
   - For every commit, list exactly which files or diff hunks belong to it.
   - Distinguish whole-file staging from partial staging.
   - Ensure every relevant change is assigned once, intentionally left out, or flagged as unresolved.
   - Never silently omit staged changes or untracked files.
8. **Produce safe commands**
   - Give commands in the exact order needed to stage and commit each group.
   - Prefer explicit paths over `git add .` or `git add -A`.
   - When one file contains multiple intents, use interactive/patch staging and explain the intended hunk selection; do not fabricate line numbers or hunk identifiers.
   - For each commit, show the full commit message, including its body, using a shell-safe command or a clear multiline heredoc.
   - If the user's shell is unknown, prefer commands that are easy to adapt and clearly label shell assumptions.
   - Include verification commands where appropriate, such as tests, build, lint, `git diff --cached`, and `git status`.
   - Do not use `git commit --amend` unless explicitly requested.
9. **Final safety review**
   - Confirm no unrelated changes are included.
   - Confirm every staged/unstaged/untracked change is accounted for.
   - Check commit ordering and message format.
   - Note any build/test uncertainty or unresolved classification.
10. **Ask before execution**
   - Present the plan and commands for review.
   - Unless the user explicitly asked the agent to execute the commits, stop before changing Git state.
   - If execution is authorized, perform one commit at a time, verify the staged diff before each commit, run relevant checks when feasible, and report actual outcomes.

## Required output format

Produce the following sections:

### 1. Repository state
- Branch and working-tree summary.
- Counts or lists of staged, unstaged, and untracked changes where available.
- Any merge/rebase/conflict state or safety concern.

### 2. Changes grouped by intent
For each intent:
- What actually changed.
- Why it appears to have changed, grounded in the diff.
- Relevant files.
- Confidence or ambiguity if the purpose cannot be established.

### 3. Proposed atomic commit sequence
For each commit, provide:
- Order number.
- Intent and rationale.
- Exact files and, if needed, specific hunks.
- Full Conventional Commit message with subject, blank line, explanatory body, trade-off, and `BREAKING CHANGE:` when applicable.
- Dependencies on earlier commits.
- Required verification and whether it has actually been run.

### 4. Exact Git commands
- Commands in executable order.
- Explicit staging commands for each commit.
- Full commit message.
- Tests/build checks at the appropriate points.
- Commands to inspect staged changes before committing.
- Clearly identify commands that require interactive hunk selection.

### 5. Excluded or unresolved changes
- Changes intentionally left out and why.
- Files/hunks whose intent is unclear.
- Any follow-up question needed before safely assigning them.

### 6. Final checks
- Requirement that the working tree and staged contents are reviewed before each commit.
- Verification commands and known limitations.
- Confirmation that no commits were actually created unless execution was explicitly authorized.

## Commit message quality checklist

For every proposed commit:
- Does the subject use an allowed Conventional Commit type?
- Is the scope useful and accurate?
- Is the summary imperative, specific, and under 60 characters where feasible?
- Does the body explain why the change is needed and the trade-off?
- Is a breaking change called out only when justified?
- Does the commit represent one coherent intent?
- Can the commit plausibly build and pass relevant tests in sequence?

## Rules

- Never guess the contents of unseen diffs.
- Never say tests pass unless they were executed and passed.
- Never assume the entire file belongs to one commit if its diff contains multiple intents.
- Never use broad staging commands when they could capture unrelated work.
- Never silently execute a proposed plan.
- If there are no relevant changes, explain that there is nothing to organize and provide the minimal next step instead of inventing commits.

## Completion criteria

The skill is complete when the current changes are accounted for, intents are summarized, an ordered atomic commit plan is provided, each commit has a high-quality message and exact staging instructions, verification gaps are disclosed, and the user has a clear review/approval point before execution.
