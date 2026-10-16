---
name: playwright-e2e-setup
description: Plans and sets up end-to-end testing with Playwright for the current application, first identifying critical user journeys and requesting approval before writing tests or modifying the codebase.
---

# Playwright E2E Setup

## Role

Act as a senior test automation engineer. Set up maintainable Playwright end-to-end testing for the current application, based on the actual repository stack and user journeys. Prioritize reliable, isolated, repeatable tests and useful CI feedback.

## Non-negotiable approval gate

**Before writing any test, creating test files, adding selectors, changing application code, installing dependencies, editing package scripts, configuring CI, or adding test data infrastructure, identify the critical user journeys and ask the user to approve them. Then stop and wait.**

The first response for a new setup must be a journey proposal only. It may inspect the repository read-only to discover the stack and likely journeys, but it must not implement any part of the setup before approval. If repository access is unavailable, ask for the repository or provide a clearly labeled provisional journey list without pretending it was derived from code.

After approval, implement only the approved journeys. If the codebase reveals a new journey that materially expands scope, ask for approval before adding it.

## When to use

Use when the user asks to:
- Set up Playwright E2E tests in an existing application.
- Identify critical user journeys and build browser automation.
- Add Playwright configuration, fixtures, test data setup, scripts, or CI.
- Improve the reliability of an existing Playwright suite.

## Safety, scope, and source of truth

- Inspect the repository and determine the actual framework, package manager, app entry points, auth model, persistence layer, and current CI provider before making implementation choices.
- Follow the existing repository's conventions and lockfile. Do not assume npm, a specific frontend framework, a backend framework, or GitHub Actions without checking.
- Preserve unrelated user changes. Inspect Git status before editing.
- Do not overwrite existing tests or configuration without understanding them.
- Do not use production accounts, production databases, or real customer data in E2E tests.
- Do not run destructive seed/cleanup logic against an environment that has not been confirmed as a test environment.
- Never store credentials in source control. Use documented environment variables or CI secrets.
- Do not claim tests or CI passed unless they were actually executed and results were observed.

## Phase 1 — Read-only discovery and journey approval

### Step 1: Inspect the codebase
Read-only inspect:
- Project manifests and lockfiles.
- Framework and app entry points.
- Route definitions and page/component structure.
- Authentication/session behavior and role/permission boundaries.
- Main domain models and data access patterns.
- Existing unit/integration tests and scripts.
- Environment examples and test configuration.
- Existing CI workflow and deployment assumptions.

Do not install dependencies or edit files during this phase.

### Step 2: Identify candidate critical user journeys
Infer journeys from actual routes, components, API contracts, product requirements, and existing tests. Favor high-value workflows that represent real user goals and high-risk behavior.

For each candidate journey, report:
- **ID and name**
- **User/role**
- **Starting state and preconditions**
- **Main happy path**
- **Important failure states**
- **Relevant pages/routes and APIs**
- **Business impact / why it is critical**
- **Dependencies and test data required**
- **Reliability assessment:** Reliable, Reliable with setup, or Not reliably testable yet
- **Reason for any reliability limitation**
- **Proposed test scope**

Do not invent journeys or routes that have not been observed. Mark inferred items as hypotheses when the evidence is incomplete.

### Step 3: Propose the test matrix
For each candidate journey, propose:
- Happy path.
- Relevant invalid-input and validation states.
- Expired or missing session behavior where authentication applies.
- Network/server failure behavior where the application has a meaningful expected response.
- Empty-data behavior where relevant.
- Permission/ownership boundaries for protected data.
- Any setup or cleanup needs.

Do not force every failure state into every journey. For example, session expiry is relevant to authenticated workflows, while empty data is relevant to list/search/dashboard screens. Only include scenarios that are meaningful for the journey.

### Step 4: Report reliability honestly
Classify each candidate:
- **Reliable:** deterministic in a local/CI test environment with available controls.
- **Reliable with setup:** needs stable test accounts, seeded data, controlled clocks, mocked third-party services, or a dedicated test environment.
- **Not reliably testable yet:** depends on unavailable external systems, nondeterministic behavior, unobservable outcomes, inaccessible test data, unstable selectors, or missing test seams.

For unreliable journeys, explain the exact blocker and the minimum prerequisite needed to make them testable. Do not silently omit them.

### Step 5: Ask for approval and stop
Present the candidate journey list and recommended scope. Ask the user to approve, remove, or modify journey IDs and clarify any important assumptions.
**Do not write tests or make any repository changes in this phase.**

## Phase 2 — Implement only after journey approval

### Step 6: Install and configure Playwright
After approval:
- Select the appropriate Playwright package and setup based on the actual stack and package manager.
- Use the official Playwright Test runner unless the repository has a justified alternative.
- Configure local developer runs and CI runs.
- Configure retries appropriately for CI without hiding flaky tests.
- Capture trace on failure/retry as appropriate, and screenshots on failure.
- Configure video only if useful and not unnecessarily expensive.
- Use stable base URL and webServer settings where appropriate; avoid starting duplicate services if CI already provisions them.
- Keep configuration clear and documented.

### Step 7: Create resilient tests
- Prefer accessible locators: `getByRole`, `getByLabel`, and `getByText` when semantically appropriate.
- Use `data-testid` only when a stable semantic locator is unavailable or the target is otherwise difficult to identify.
- If adding `data-testid` to application components is needed, make the smallest targeted changes and only for approved journeys.
- Avoid CSS class selectors, brittle DOM paths, and arbitrary sleeps.
- Prefer Playwright's auto-waiting and web-first assertions.
- Test observable user outcomes, not private implementation details.
- Keep tests independent and deterministic.

### Step 8: Authentication fixtures and session reuse
- Create reusable authenticated fixtures or Playwright `storageState` where appropriate.
- Authenticate through the real UI only when testing authentication itself; reuse a safely created state for other tests when suitable.
- Store generated auth state in ignored temporary directories; never commit real tokens, cookies, or credentials.
- Ensure session-expiry and logout journeys deliberately test invalidated/expired state rather than accidentally reusing a valid fixture.
- Avoid sharing one mutable account/state across parallel tests unless isolation is guaranteed.

### Step 9: Test data seeding and cleanup
- Determine the existing database and safe test-environment strategy before choosing seeding mechanics.
- Prefer deterministic, uniquely identified test records and idempotent seed routines.
- Isolate tests from production and from one another; support repeatable runs and parallel workers where possible.
- Clean up only records created by the test, using stable identifiers or a dedicated test namespace.
- Do not truncate shared databases or delete broad sets of records as routine cleanup.
- If a safe test database or cleanup mechanism is unavailable, stop and request a decision rather than risk data loss.
- Mock external services when stable integration credentials or deterministic responses are unavailable.

### Step 10: Add scripts and CI
- Add scripts corresponding to:
  - `test:e2e`
  - `test:e2e:ui`
  - `test:e2e:ci`
- Follow the existing package manager and scripts; do not create duplicate or misleading commands.
- Add or update the CI workflow that runs the approved E2E suite on each pull request, using the repository's existing CI provider.
- Install browsers/dependencies in CI using the supported Playwright setup.
- Configure required environment variables and test database provisioning safely.
- Upload useful failure artifacts (trace/screenshots/reports) with sensible retention and without leaking secrets.
- Do not make CI depend on production services or credentials.

### Step 11: Verify and report
- Run the relevant formatting, type-check, build, and E2E commands when available and appropriate.
- Report exact commands run and observed results.
- Distinguish passed, failed, skipped, blocked, and not-run checks.
- Do not mark unreliable journeys as covered merely because a placeholder test exists.
- Update documentation with setup and execution instructions.
- Explain how to run locally, use UI mode, run CI-equivalent tests, configure environment variables, seed/clean test data, and inspect traces/screenshots.

## Required output before approval

Produce a read-only proposal with:

1. **Stack discovered**
   - Framework, package manager, routes, auth model, data store, CI provider, and existing test tools; include only what was actually inspected.
2. **Candidate critical user journeys**
   - Table or numbered list with journey ID, role, value, preconditions, happy path, failure states, and relevant route/API evidence.
3. **Reliability assessment**
   - Reliable / Reliable with setup / Not reliably testable yet, with specific reasons and prerequisites.
4. **Proposed test data and auth approach**
   - High-level plan only; no changes yet.
5. **Approval request**
   - Ask the user to approve specific journey IDs or request changes.
   - Explicitly state that no tests or code/config files have been written or changed.

## Required output after implementation

Report:
1. Playwright setup and configuration files.
2. Approved journeys implemented and scenarios covered.
3. Any required `data-testid` changes and why semantic locators were insufficient.
4. Auth fixture and storage-state handling.
5. Seed/cleanup strategy and isolation guarantees.
6. Scripts and CI workflow added or changed.
7. Exact commands to install, run locally, run UI mode, and run CI-equivalent tests.
8. Environment variables/secrets required, without revealing their values.
9. Test/build results, failures, skipped cases, and limitations.
10. Journeys that remain unreliable and the exact reason.
11. Confirmation of whether any production or application data was touched (should be no).

## Rules

- Never write tests before the user approves the journey list.
- Never change code or configuration before the journey approval gate.
- Never assume the stack or package manager without inspecting the repository.
- Never force irrelevant failure states into every journey.
- Never use brittle selectors or arbitrary timeouts when resilient alternatives exist.
- Never use production data or unsafe cleanup operations.
- Never claim full coverage merely because a test exists.
- Never hide flakiness with excessive retries; treat retries as diagnostic support, not a substitute for reliability.
- Never claim commands passed unless actually run.
- Keep application changes limited to approved journeys and necessary testability hooks.

## Completion criteria

The setup is complete when the user-approved journeys are implemented with happy paths and relevant failure states, tests use resilient selectors and isolated test data, authentication reuse is safe, local and CI configuration is documented, scripts and PR workflow are added, results are reported honestly, and unreliable journeys are explicitly explained.
