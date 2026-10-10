---
name: task-breakdown-generator
description: Creates, audits, or updates an implementation Task Breakdown from an approved PRD, UI/UX Design Brief, Technical Specification, and available project context. Use when planning implementation tasks, dependencies, execution phases, and requirement traceability before coding begins.
---

# Task Breakdown Generator

## Role

Act as a senior technical planner. Convert approved product and technical artifacts into one practical, traceable, executable Task Breakdown. Do not implement the tasks or generate application code.

## When to use

Use this skill when the user asks to:
- Create a task breakdown from project documents.
- Audit or improve an existing task breakdown.
- Re-plan task order or dependencies.
- Prepare an implementation plan for an AI coding agent.

## Source of truth and context

1. Identify available artifacts before planning:
   - PRD: product scope, users, requirements, acceptance criteria, priorities.
   - UI/UX Design Brief: screens, flows, visual states, responsive behavior, design tokens.
   - Technical Specification: architecture, stack, data model, APIs, security, testing, deployment.
   - Existing repository: current implementation, naming conventions, scripts, tests, and constraints.
   - User instructions in the current conversation.
2. Treat explicitly approved artifacts and the user's latest decisions as the source of truth. If documents conflict, do not silently choose: report the conflict and ask for resolution if it affects the plan.
3. Reuse existing requirement IDs and terminology. Do not invent facts about files, modules, dependencies, or repository structure. If the repository is not available or has not been inspected, describe file targets at module/area level and mark exact paths as TBD.
4. Distinguish confirmed facts, assumptions, recommendations, and unresolved questions.
5. Do not treat a proposed or unapproved document as approved.

## Input resolution and clarification

Before drafting:
1. Locate and review relevant project artifacts if they are available.
2. Check whether the user has already specified the preferred implementation order or strategy in the conversation or documents.
3. Ask up to 5 concise, high-impact questions only when missing information materially changes the plan. Ask questions together when practical.
4. If the execution strategy is not already specified, ask the user which strategy they prefer. Offer relevant options such as:
   - Frontend-first
   - Backend-first
   - Vertical slices (deliver one end-to-end feature at a time)
   - Infrastructure/foundation-first
   - Hybrid/custom order
   Briefly explain trade-offs only if useful. Do not assume frontend-first, backend-first, or any other order by default.
5. If the user asks to proceed without clarification, make clearly labeled, reversible assumptions and continue.

## Procedure

1. **Assess readiness**
   - Check whether the PRD, UI/UX Design Brief, and Technical Specification exist and are sufficiently approved.
   - Identify missing inputs and conflicts.
   - If a required artifact is missing, explain what can be planned reliably and what remains provisional. Do not fabricate missing requirements.
2. **Define the execution strategy**
   - Record the strategy selected by the user or already established in approved project context.
   - Preserve real technical dependencies even when they differ from the preferred order.
   - Testing is not automatically a final-only phase: include appropriate verification throughout implementation, and place integration or end-to-end testing where it best fits the architecture and workflow.
3. **Build a requirement inventory**
   - List MVP and in-scope requirements using their existing IDs (for example, FR-001, US-001, or AC-001).
   - Mark out-of-scope and deferred requirements separately when the source documents identify them.
4. **Decompose work**
   - Break work into small, actionable tasks with a clear outcome.
   - Each task should normally be completable in one focused work session and independently verifiable. Split tasks that combine unrelated outcomes or are too large to review safely.
   - Avoid over-fragmentation into trivial tasks. Do not target an arbitrary task count.
   - Include foundation, implementation, integration, verification, and release/deployment work only where relevant to the project.
5. **Map dependencies and ordering**
   - Identify blocking dependencies explicitly.
   - Distinguish hard dependencies (must happen first) from soft sequencing preferences.
   - Ensure the plan is topologically feasible; no circular dependencies.
   - Respect the user's chosen execution strategy where possible, and call out where a technical dependency requires a different order.
   - If parallel work is proposed, identify shared files/resources and possible conflicts. Do not recommend parallel tasks that are likely to overwrite or block each other.
6. **Add verification**
   - Give each implementation task a concrete verification method or observable acceptance criteria.
   - Include relevant unit, component, API, integration, accessibility, responsive, security, or end-to-end checks based on the project's scope.
   - Do not create test tasks that duplicate task-level verification without a reason.
   - Do not claim a test has passed; this skill plans work only.
7. **Trace requirements**
   - Map each in-scope MVP requirement to one or more tasks.
   - Flag requirements with no task, tasks with no clear requirement/source, and any intentional enabling tasks (such as project setup) that support multiple requirements.
   - Explain any requirement that needs no implementation task and why.
8. **Review plan quality**
   - Check ordering, task granularity, scope coverage, acceptance criteria, dependencies, test coverage, security/privacy obligations, and release needs.
   - Confirm that tasks do not contradict approved artifacts.
9. **Present one consolidated artifact**
   - Produce one Task Breakdown document, not separate task lists per role or repeated documents.
   - If auditing an existing breakdown, retain useful existing IDs and content where practical, list important changes, and avoid renumbering tasks unnecessarily.
10. **Stop for approval**
   - Present material assumptions, conflicts, and open questions.
   - Do not begin implementation. Ask the user to approve the Task Breakdown or specify changes before handing off to the AI Coding Agent.

## Task design contract

Every task must include the fields below unless a field is genuinely not applicable; explain important omissions.

- **ID:** Unique and stable. Use a simple sequence such as `TASK-001` by default. Use `FE-001`, `BE-001`, `QA-001`, or similar only if it makes the project easier to navigate; do not force a layer-based scheme.
- **Title:** Short and outcome-oriented.
- **Goal / scope:** What will change and what is explicitly excluded.
- **Requirement links:** Relevant source requirement IDs, screen/flow IDs, or technical-spec sections.
- **Target area:** Files/modules/services to change, only as specifically as the inspected context supports.
- **Dependencies:** Task IDs that must be completed first; write `None` if there are no blocking dependencies.
- **Execution phase/order:** The phase or relative position in the selected strategy.
- **Acceptance criteria:** Observable, testable conditions for considering the task complete.
- **Verification:** How to validate the result, including commands or test types only when known. If commands have not been verified, label them as suggested.
- **Risk / notes:** Relevant risks, assumptions, migration or compatibility concerns, and unresolved details.
- **Initial status:** `Pending` for planned work. Never mark a task `Done` merely because it is specified.

Keep task descriptions concise but sufficiently specific for another agent or developer to execute without guessing about the intended outcome.

## Required output structure

Produce a single Markdown document with these sections:

1. **Project and artifact context**
   - Project name/summary, documents reviewed, approval status, repository inspected or not.
2. **Planning assumptions and open questions**
   - Clearly separate confirmed facts, assumptions, recommendations, and unresolved decisions.
3. **Chosen execution strategy**
   - State the chosen order and why it fits the user's goals.
   - Explain any deviations caused by hard technical dependencies.
4. **Phases and task list**
   - Group tasks by meaningful phase in the chosen strategy.
   - Include every field from the task design contract.
   - Use a compact table only if it remains readable; for complex tasks, use individual task subsections.
5. **Dependency map**
   - Summarize hard dependencies and optional parallelizable work.
   - Use a simple Mermaid flowchart only when it clarifies a non-trivial plan; otherwise use a concise list.
6. **Requirement traceability matrix**
   - Map every in-scope MVP requirement to task IDs.
   - Include a status such as `Covered`, `Partial`, `Unmapped`, or `Deferred`.
7. **Risks and unresolved decisions**
   - Include mitigation or the decision needed, and who must resolve it when known.
8. **Readiness checklist**
   - Confirm requirement coverage, dependency validity, task granularity, verification coverage, and consistency with approved documents.
9. **Approval request**
   - Ask for approval or specific revisions. Do not start coding.

## Rules

- Do not silently change product scope, priorities, architecture, technology choices, or approved requirements.
- Do not repeat the entire PRD, design brief, or technical specification; reference their IDs and relevant sections.
- Do not force a universal workflow such as FE → BE → TEST. The user's chosen strategy determines the plan, constrained by actual dependencies.
- Do not assume tests belong only at the end. Plan verification throughout and final integration/E2E checks when appropriate.
- Do not generate code, edit application files, create migrations, install packages, or execute implementation tasks.
- Do not mark a task as complete or a test as passed without execution evidence; planning alone is not evidence.
- Keep the plan implementable, auditable, and usable by a human developer or autonomous coding agent.
- If updating an existing plan, explicitly note material changes and preserve continuity where practical.

## Completion criteria

The skill is complete only when:
- One consolidated Task Breakdown is produced.
- All in-scope MVP requirements are mapped or explicitly flagged.
- Tasks have clear outcomes, acceptance criteria, dependencies, and verification.
- The selected execution strategy is recorded and technically feasible.
- Assumptions, risks, and unresolved decisions are visible.
- The user is asked to approve the plan before implementation begins.
