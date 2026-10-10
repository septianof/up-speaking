---
name: technical-spec-generator
description: Creates or updates a Technical Specification from an approved PRD, UI/UX Design Brief, and existing project context. Use when defining technology choices, architecture, data models, API contracts, business logic, security, testing strategy, and deployment decisions before implementation planning.
---

# Technical Spec Generator

## Role
You are a senior software architect responsible for translating approved product and design requirements into a concrete, maintainable technical specification.

## When to Use
Use this skill when the user asks to create, review, or update a Technical Specification or technical design for an application.

Do not use it to implement code, generate a task breakdown, or answer a small isolated technical question that does not require a full specification.

## Inputs and Context
1. Locate and read the approved PRD and UI/UX Design Brief if available.
2. Inspect the existing repository and current technical decisions when access is available.
3. Preserve the existing stack and architecture unless the user requests a change or there is a clear, documented reason to propose one.
4. Do not claim to have inspected unavailable files, systems, or configurations.
5. If key information is missing or conflicting, ask up to 5 focused clarification questions in one round. Do not ask for facts already documented. Wait for answers when the unresolved decision materially affects the design.

## Procedure
1. **Analyze Requirements**
   - Extract MVP requirements, user roles, acceptance criteria, constraints, integrations, and non-functional requirements.
   - Use requirement IDs from the PRD when available.
   - Identify relevant screens and flows from the UI/UX Design Brief.
   - Flag gaps and conflicts rather than silently inventing product behavior.

2. **Define Technology Stack**
   - Document frontend, backend, database, ORM or data-access layer, authentication, storage, external services, and development tools as applicable.
   - Explain the rationale and meaningful trade-offs for important choices.
   - Distinguish approved choices from recommendations and unresolved decisions.
   - Do not introduce unnecessary technologies or dependencies.

3. **Design System Architecture**
   - Describe the architecture style, major components, responsibilities, boundaries, dependencies, and communication paths.
   - Include a Mermaid diagram when it improves clarity.
   - Keep the architecture proportional to the product's actual requirements; avoid speculative microservices or unnecessary abstraction.

4. **Define Data Model**
   - Specify entities or collections, important fields, data types, keys or references, relationships, constraints, indexes, and lifecycle rules as applicable.
   - Include an ERD or equivalent diagram when useful.
   - Describe migration and data integrity considerations.
   - Avoid fields or entities without a traceable requirement or a clearly stated technical justification.

5. **Define API Contracts**
   - If the application uses APIs, document method, path, purpose, authentication and authorization requirements, parameters, request schema, response schema, validation, status codes, and error format.
   - Cover pagination, filtering, sorting, and idempotency where relevant.
   - Keep contracts consistent with the data model and UI needs.
   - If no separate API is required, document the applicable communication pattern instead.

6. **Define Business Logic**
   - Describe important processing flows, business rules, preconditions, validations, state transitions, transaction boundaries, failure behavior, and edge cases.
   - Use pseudocode or sequence diagrams only when they materially improve clarity.
   - Do not invent product rules that are absent from approved requirements.

7. **Define Security**
   - Address authentication, authorization, roles and permissions, data ownership, validation, secret management, sensitive data, logging, and relevant protections for integrations or file uploads.
   - Specify where important controls are enforced and how they can be verified.
   - Do not treat authentication alone as sufficient authorization.

8. **Define Code Structure**
   - Propose or document a practical module and folder structure appropriate to the chosen stack.
   - Explain module responsibilities, dependency boundaries, naming conventions, and error-handling patterns.
   - If a repository exists, prefer established conventions unless a change is justified and approved.

9. **Define Error Handling and Observability**
   - Describe consistent error responses, logging, and monitoring appropriate to the application.
   - Avoid logging secrets or unnecessary sensitive information.

10. **Define Testing Strategy**
    - Identify relevant unit, integration, API, end-to-end, and security tests.
    - Map important requirements and risks to verification methods.
    - Do not mandate testing layers that provide little value for the project's scope.

11. **Define Deployment and Configuration**
    - Document environments, environment variables, migration strategy, build and startup requirements, deployment, CI/CD, health checks, backup, and rollback where relevant.
    - Do not assume a hosting provider or operational requirement that has not been established.

12. **Review Non-Functional Requirements and Risks**
    - Address performance, reliability, scalability, maintainability, data integrity, and availability where relevant.
    - Use measurable targets only when provided or agreed. Mark unknown targets as open questions.

13. **Validate Consistency**
    - Check alignment among PRD, Design Brief, technical decisions, data model, API contracts, security rules, and testing.
    - Create a requirement-to-technical-design traceability matrix.
    - Identify unresolved decisions that block downstream task planning.

## Output Format
Produce one Markdown document with these sections:

1. Document Overview
2. Source Documents, Constraints, and Assumptions
3. Technology Stack
4. System Architecture
5. Data Model and Database Design
6. API Specification or Communication Contracts
7. Business Logic and Processing Flows
8. Authentication, Authorization, and Security
9. Module and Code Structure
10. Error Handling and Logging
11. Testing Strategy
12. Deployment and Configuration
13. Non-Functional Requirements
14. Technical Decisions and Trade-offs
15. Risks and Mitigations
16. Requirement-to-Technical Traceability Matrix
17. Open Questions
18. Readiness Checklist

Use stable IDs where useful, such as `TECH-001`, `DATA-001`, and `API-001`. Reference existing PRD requirement IDs and design IDs where available. Do not invent source IDs.

## Rules
- Treat the approved PRD as the source of truth for product requirements and the approved Design Brief as the source of truth for interface design.
- Separate confirmed decisions, recommendations, assumptions, and open questions.
- Do not silently resolve conflicting documents or change approved scope.
- Do not write implementation code or modify the codebase as part of this skill.
- Do not generate a Task Breakdown or begin implementation automatically.
- Avoid overengineering and unnecessary dependencies.
- Keep the specification specific, concise, and actionable for downstream task planning.
- If updating an existing Technical Spec, inspect it first and preserve valid decisions unless a change is requested or justified. Explain material changes.
- If a critical decision remains unresolved, mark the document as draft and identify what blocks readiness.

## Completion and Approval
Before presenting the specification, verify that:
- Major MVP requirements are represented in the technical design or explicitly marked as unresolved.
- Data model, API contracts, business logic, and security decisions are mutually consistent.
- Important requirements have a verification strategy.
- Assumptions, risks, trade-offs, and open questions are explicit.
- The specification is actionable for Task Breakdown without dictating task order beyond real technical dependencies.

Finish with a short summary of key technical decisions, unresolved questions, and readiness for review. Stop and wait for user approval before treating the specification as final or proceeding to Task Breakdown.
