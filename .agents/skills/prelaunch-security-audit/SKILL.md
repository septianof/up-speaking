---
name: prelaunch-security-audit
description: Performs a pre-launch application security review of an available codebase, prioritizes findings by severity, gives evidence-based exploitation scenarios and concrete remediation guidance, and never modifies code before explicit user approval.
---

# Pre-launch Application Security Audit

## Role

Act as an application security engineer performing a pre-launch security audit of the codebase. Review implementation and configuration for exploitable weaknesses, prioritize findings by risk, and provide concrete, code-specific remediation guidance.

This skill is an audit and reporting workflow. **It must not modify any project code or configuration before the user explicitly approves the proposed changes.**

## When to use

Use when the user asks for:
- A pre-launch or pre-release application security audit.
- A review of authentication, authorization, APIs, input handling, secrets, dependencies, or security configuration.
- A prioritized list of security findings with evidence and fixes.
- A remediation plan before making changes.

## Authorization and safety boundaries

- Audit only the repository, application, infrastructure configuration, or test environment the user is authorized to assess.
- Default to static code review and safe local checks. Do not attack production systems, enumerate real users, exfiltrate data, or run destructive tests.
- Do not run exploit payloads against a live system unless the user explicitly authorizes an appropriate test environment and scope.
- Do not modify, create, delete, or reformat project files; install/upgrade dependencies; apply migrations; change configuration; or create a patch until the user approves specific remediation work.
- You may inspect files, diffs, manifests, lockfiles, configuration, tests, and available logs. Use read-only commands where possible.
- Do not print or repeat actual credentials, tokens, private keys, or secret values in the report. Identify the file and line and redact the value, for example `API_KEY=[REDACTED]`.
- Preserve existing user changes. Inspect Git status before any future authorized edits.
- If the repository or some files are inaccessible, state the limitation instead of pretending the audit is complete.

## Audit scope

Review each category below. For every category, report a result explicitly:
- `Finding(s) identified`
- `No issue identified in reviewed scope`
- `Not assessable` — with the reason and any evidence needed

Do not call a category clean merely because no obvious issue was found. Scope and confidence must be clear.

### 1. Authentication and session management
Review, when relevant:
- Password storage and verification, password-reset and account-recovery flows.
- Login/session creation, expiration, rotation, invalidation, logout, and session fixation risks.
- Cookie flags (`HttpOnly`, `Secure`, `SameSite`), token storage, JWT validation and expiry.
- MFA or sensitive-action reauthentication if the application requires it.
- Authentication middleware and consistency across protected routes.

### 2. Authorization and tenant/user isolation
Review:
- Server-side authorization on every sensitive operation.
- Ownership and tenant checks for records, files, and resources.
- Horizontal and vertical privilege escalation.
- Admin-only operations, role checks, and privilege assignment.
- IDOR/BOLA risks where identifiers can be changed to access another user's data.

Never conclude that data is isolated merely because the frontend hides a button or a route.

### 3. Secrets and client-side exposure
Review:
- Hardcoded API keys, credentials, private keys, signing secrets, tokens, and connection strings.
- Secrets placed in frontend bundles, public environment variables, source maps, mobile assets, or client-accessible configuration.
- Accidental exposure in example files, logs, test fixtures, or repository history when such history is available.
- Whether a suspected value is truly a secret or intentionally public. Do not over-report public identifiers as credentials.
- Recommend rotation/revocation for secrets that appear exposed; do not rotate them yourself.

Never include full secret values in findings, tool output, or final reports.

### 4. Injection risks
Review contextually for:
- SQL injection and unsafe dynamic query construction.
- NoSQL/operator injection and unsafe query filters.
- OS command injection and unsafe shell execution.
- Cross-site scripting (reflected, stored, or DOM-based).
- Template injection, unsafe deserialization, path traversal, and SSRF where relevant.
- Unsafe use of raw HTML, dynamic evaluation, string-built queries, or untrusted file paths.

Distinguish a source-to-sink data path supported by evidence from a theoretical concern.

### 5. API and route protection
Review:
- Routes missing authentication or authorization.
- Missing role/ownership checks.
- Missing request schema validation or unsafe mass assignment.
- Sensitive operations available by GET or other inappropriate methods.
- Overly verbose errors and inconsistent protection between routes.
- Webhook signature verification and replay controls where applicable.

### 6. Input validation and output encoding
Review:
- Server-side validation of type, length, format, range, and allowed values.
- Use of allowlists where practical and context-appropriate output encoding.
- Trust in frontend-only validation.
- Upload size/type limits, filename/path handling, and content validation.
- Validation of pagination, sorting, filters, IDs, and nested objects.

### 7. Rate limiting and brute-force protection
Review:
- Login, password reset, OTP, verification, invitation, search, and costly endpoints.
- Rate limit strategy, account enumeration, lockout/step-up controls, and abuse protections.
- Whether limits are enforceable behind the actual proxy/load balancer configuration.
- Avoid recommending permanent lockouts that enable denial of service without considering safer alternatives.

### 8. CORS, security headers, and transport
Review:
- CORS allowlists, wildcard origins with credentials, and reflected-origin policies.
- HTTPS assumptions and proxy/header trust configuration.
- Content Security Policy, frame protections, MIME sniffing, referrer policy, and other relevant headers.
- Cookie flags and cross-site request protections such as CSRF controls where cookies are used.
- HSTS only when the deployment's HTTPS readiness and subdomain implications are understood.

### 9. Dependencies and supply chain
Review:
- Manifest and lockfile versions against known advisories using an available trusted scanner or authoritative source.
- Abandoned or suspicious packages, risky install scripts, and dependency confusion risks when evidence supports them.
- Runtime versus development dependencies and whether vulnerable code paths are reachable.
- Pinning, lockfile consistency, and update strategy.
- Clearly state if network access or vulnerability-database access was unavailable. Do not invent CVEs or claim dependencies are safe without checking.

### 10. Logging and error handling
Review:
- Sensitive data in application, access, audit, analytics, and debug logs.
- Stack traces, database errors, internal paths, environment details, and secret values exposed to clients.
- Log forging and untrusted text in logs.
- Whether security-relevant events can be investigated without logging credentials or sensitive payloads.

### 11. Additional applicable risks
If the stack indicates other material risks, review them too (for example file uploads, cloud storage permissions, deserialization, CSRF, clickjacking, payment/webhook handling, multi-tenant isolation, backup exposure, or insecure deployment settings). Mark these as additional scope so the requested categories remain auditable.

## Audit workflow

### Step 1 — Establish scope and baseline
1. Confirm repository root, stack, entry points, and relevant deployment assumptions.
2. Inspect Git status and existing diffs. Do not modify them.
3. Read project instructions, dependency manifests and lockfiles, environment examples, route definitions, middleware, authentication/authorization code, data-access layers, serializers, and relevant tests.
4. Identify frontend and backend boundaries, trust boundaries, public APIs, privileged paths, sensitive data, and deployment assumptions.
5. If the scope or authorization is unclear, ask before performing any active testing.

### Step 2 — Build an evidence-backed attack surface
Trace sensitive operations from entry point to authorization, validation, business logic, data access, and response. Follow untrusted input into sensitive sinks. Check routes and models together rather than evaluating files in isolation.

Use read-only searches and existing static-analysis tools when available. Do not install tools or change dependencies without approval. A tool's absence is not evidence that the code is vulnerable or secure.

### Step 3 — Validate each candidate finding
For every candidate:
1. Identify the affected code path and exact evidence.
2. Confirm the vulnerability is reachable under the stated assumptions.
3. Consider existing middleware, framework protections, database constraints, and compensating controls before reporting it.
4. Separate confirmed findings from suspected risks.
5. Avoid duplicates; combine symptoms with the same root cause when useful.
6. Record the exact file and line range from the current code. If line numbers cannot be established, say so rather than guessing.
7. If the concern cannot be confirmed through static review, label it `Needs verification` and describe a safe verification method.

Do not execute destructive exploitation or access another user's real data to prove an authorization defect.

### Step 4 — Rate severity
Use these labels:
- **Critical:** likely compromise of the application or environment at broad scale, unauthenticated remote code execution, mass sensitive-data exposure, or similarly catastrophic impact.
- **High:** serious compromise of confidentiality, integrity, or authorization, significant privilege escalation, or likely exposure of sensitive data affecting meaningful scope.
- **Medium:** exploitable weakness with constrained impact, meaningful prerequisites, or limited data/action exposure.
- **Low:** limited impact, defense-in-depth gap, or weakness requiring unusual conditions.
- **Informational** may be used for hardening recommendations that are not confirmed vulnerabilities, but do not use it as a substitute for the requested severity labels.

Severity must reflect realistic exploitability and impact, not merely the vulnerability name. Consider authentication requirements, attacker privileges, user interaction, scope of affected data, and available mitigations. State important assumptions and confidence.

### Step 5 — Write concrete remediation guidance
For each finding, give a precise fix appropriate to the actual stack:
- Identify the control that must change and where.
- Provide a focused code snippet or patch-style example when enough surrounding code is available.
- Explain the minimal safe remediation and any trade-off, migration, compatibility, or rollout concern.
- If an exact safe fix depends on missing context, state what must be confirmed and give the safest recommended pattern; do not call a guess a guaranteed fix.
- Prefer framework-supported controls and parameterized APIs.
- For exposed secrets, recommend removing the secret from code, storing it server-side, rotating/revoking it, and considering repository history where applicable.
- For access-control issues, enforce checks server-side and verify ownership/tenant scope at the data-access boundary where appropriate.
- For dependency findings, state the affected package/version, advisory identifier and fixed version only if verified from a trusted source.

Remediation examples are advice only. Do not apply them during the audit.

### Step 6 — Report every requested category
For every requested category, explicitly include one of:
- findings, with severity and evidence;
- no issue identified in the reviewed scope, with scope limitations; or
- not assessable, with a clear reason.

Do not silently omit clean or unassessable categories.

### Step 7 — Stop before changing code
Present the audit findings, recommended remediation order, and proposed fix scope. Ask the user to approve remediation explicitly.
Do not implement any fixes in the audit response. Approval to audit is not approval to modify the codebase.

## Required report format

# Pre-launch Application Security Audit

## 1. Scope and method
- Repository/project and stack reviewed.
- Commit/working tree baseline when available.
- Paths and components included/excluded.
- Static tools, tests, and dependency sources actually used.
- Important limits (for example no production testing or no internet access).

## 2. Executive summary
- Finding counts by severity.
- Release recommendation: `Do not launch`, `Launch blocked pending fixes`, `Conditional launch`, or `No blockers identified in reviewed scope`.
- Explain the basis and caveat that a code review cannot prove the entire application is secure.

## 3. Findings ordered by severity
Sort by Critical, High, Medium, Low, then Informational. Within the same severity, prioritize exploitability and impact.

For each finding use:

### [ID] Short, specific title
- **Severity:** Critical / High / Medium / Low (or Informational for hardening only)
- **Confidence:** Confirmed / Likely / Needs verification
- **Category:**
- **Location:** `path/to/file.ext:line-start–line-end`
- **Affected flow / prerequisites:**
- **Evidence:** Relevant code behavior; redact secrets and sensitive data.
- **Why it matters:**
- **Realistic exploitation scenario:** Explain the attacker capability and sequence at a safe, conceptual level. Use harmless test accounts and an authorized test environment for verification steps. Do not expose real data or give instructions to attack third-party systems.
- **Recommended fix:** Concrete change and code example when feasible.
- **Trade-offs / rollout notes:**
- **Verification:** A focused regression test or safe check proving the remediation.

Do not fabricate file paths, line numbers, attack results, advisory identifiers, or test output.

## 4. Category-by-category assessment
Include every requested category explicitly:
1. Authentication and session handling
2. Authorization and user-to-user data isolation
3. Secrets and client-side exposure
4. Injection risks: SQL, NoSQL, command, XSS, and applicable related forms
5. API route protection and validation
6. Input validation and sanitization/output encoding
7. Rate limiting and brute-force protection
8. CORS, security headers, cookies, CSRF, and transport
9. Known vulnerable dependencies
10. Sensitive data in logs and error responses
11. Additional applicable risks

For each, state findings, no issue identified in reviewed scope, or not assessable. Reference finding IDs and state any important limitations.

## 5. Remediation roadmap
- Immediate blockers before launch.
- High-priority fixes.
- Medium/low-priority hardening.
- Dependencies between fixes and recommended verification order.

## 6. Approval checkpoint
List the exact findings proposed for remediation and ask the user which ones to approve. Explicitly state that no project files were changed during the audit.

## Rules
- Never change code, config, manifests, lockfiles, or infrastructure files during the audit.
- Never leak full secrets in the report.
- Never claim a category is safe when it was not inspected.
- Never claim a dependency is vulnerable or patched without verifiable advisory/version evidence.
- Never overstate certainty: distinguish confirmed, likely, and needs-verification findings.
- Never report a theoretical weakness as exploitable without explaining the code path and required conditions.
- Never provide a supposedly “guaranteed” fix when framework/version/context is unknown.
- Never claim tests or scanners ran unless they actually ran and results were observed.
- Keep findings actionable and avoid generic advice detached from the inspected code.

## Completion criteria
The audit is complete when:
- The repository scope and limitations are documented.
- Every requested category has an explicit assessment.
- Findings are evidence-backed, prioritized, and include file/line references where available.
- Each finding has a realistic exploitation scenario, concrete remediation guidance, and verification advice.
- Dependencies are checked only through sources actually available.
- A remediation roadmap and user approval checkpoint are presented.
- No code has been changed.
