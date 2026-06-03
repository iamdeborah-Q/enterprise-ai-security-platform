# Enterprise AI Security Platform

> Enterprise security, governance, multi-agent workflows & CI/CD for teams deploying Claude Code at scale.

This repository is a reference implementation of a **secure-by-default governance stack**
for running an AI coding agent (Claude Code) across an engineering organization. It layers
defense-in-depth controls — deny-listed shell commands, scoped filesystem access, sandboxed
execution, automated post-edit testing, codified engineering standards, and an automated
security review gate on every pull request — on top of a real, working TypeScript monorepo
(**TeamPulse**, an internal team-health & standup API with a React dashboard).

The goal: let developers move fast with an autonomous agent **without** widening the attack
surface. Every control here is the kind of thing an Application Security engineer is asked to
design, justify, and enforce.

---

## What Was Built

A complete, layered governance configuration plus a feature delivered end-to-end through it:

### 1. Hardened deny rules (`managed-settings.json` / `.claude/settings.json`)
Organization-enforced guardrails that block the highest-risk operations outright:

- **No network exfiltration tools** — `curl`, `wget` denied.
- **No privilege escalation** — `sudo` denied.
- **No destructive filesystem ops** — `rm -rf`, `chmod 777` denied.
- **No secret access** — reads of `.env*`, `**/secrets/**`, `~/.ssh/**`, and `~/.aws/**` denied.
- **Least-privilege allow-list** — only `git commit`, `npm test`, `npm run *`, and reads under
  `packages/**` are explicitly permitted.

### 2. Team permissions, hooks & sandbox (`.claude/settings.json` + `.claude/settings.local.json`)
- **Scoped team permissions** — explicit allow/deny lists instead of open-ended trust.
- **`PostToolUse` hook** — automatically runs `npm test` after every `Edit`/`Write`/`MultiEdit`,
  so the agent can never leave the tree in a broken state unnoticed.
- **Sandbox mode** — filesystem and network access are confined; bash runs are auto-allowed only
  *because* they execute inside the sandbox.

### 3. Codified engineering & AppSec standards (3 × `CLAUDE.md`)
- **Root `CLAUDE.md`** — architecture, coding standards (TS strict, no `any`, no `console.log`,
  no hardcoded secrets), testing requirements (80% coverage), PR format, and deployment rules.
- **`packages/api/CLAUDE.md`** — API-layer conventions (consistent error handling, centralized validation).
- **`packages/web/CLAUDE.md`** — frontend conventions and test expectations.

These turn tribal knowledge and security policy into machine-readable constraints the agent
follows on every task.

### 4. Multi-agent skills (`.claude/skills/`)
- **`code-reviews`** — reviews **staged** git changes against the repo's `CLAUDE.md` standards and
  reports issues with file, line, severity, and a suggested fix.
- **`deploy`** — runs a **gated** pre-deployment checklist that stops at the first failing step.

### 5. Automated security review
A Claude Code security review runs automatically on every PR. Latest result:

> **0 Critical · 0 High · 0 Medium · 4 Low**

### 6. Feature delivered through the stack — Weekly Digest
- New endpoint: **`GET /api/digest`** (auth-gated, returns a per-team weekly health rollup).
- Implemented as a route + dedicated `DigestService`, fully typed, no `any`.
- **50/50 tests passing** across the suite, including dedicated digest route tests.

### 7. PR with automated security gating
The feature shipped via a pull request that passed CI (build → lint → test) **and** the automated
security review gate before merge — demonstrating the full secure-SDLC loop.

---

## Security Findings Summary

| Severity | Count | Status |
|----------|:-----:|--------|
| 🔴 Critical | 0 | ✅ Clean |
| 🟠 High | 0 | ✅ Clean |
| 🟡 Medium | 0 | ✅ Clean |
| 🔵 Low | 4 | ⚠️ Tracked / accepted |
| **Total** | **4** | **No blocking issues** |

*Low-severity findings are non-blocking and tracked for follow-up. No Critical/High/Medium
issues were present at merge.*

---

## Tech Stack

**Application (TeamPulse)**
- **Runtime:** Node.js 20+
- **Language:** TypeScript (strict mode, `no-explicit-any` enforced)
- **Backend:** Express 4.x
- **Database:** SQLite via `better-sqlite3`
- **Frontend:** React 18 + Vite + Tailwind CSS
- **Testing:** Vitest + supertest (80% coverage floor)
- **Packaging:** npm workspaces monorepo (`packages/shared`, `packages/api`, `packages/web`)

**Governance & Security**
- **Agent platform:** Claude Code (managed settings, project settings, hooks, sandbox)
- **Policy-as-config:** `managed-settings.json`, `.claude/settings.json`, `CLAUDE.md` files
- **Automation:** `PostToolUse` test hook, multi-agent skills, GitHub Actions CI
- **Security gate:** automated Claude Code security review on every PR

---

## How to Use This Governance Stack

### 1. Apply organization-wide controls
Deploy `managed-settings.json` to the managed-settings path on developer machines
(e.g. `/Library/Application Support/ClaudeCode/managed-settings.json` on macOS). Managed settings
**cannot be overridden** by users — use them for the non-negotiable deny rules.

### 2. Commit project-level policy
Keep `.claude/settings.json` (team permissions + hooks) in version control so every contributor
inherits the same guardrails. Keep machine-local toggles (like sandbox enablement) in
`.claude/settings.local.json`.

### 3. Codify standards in `CLAUDE.md`
Place a root `CLAUDE.md` plus per-package files. Encode coding standards, security rules
(no secrets in source, no `any`), testing thresholds, and deployment gates.

### 4. Wire up automation
- The `PostToolUse` hook runs `npm test` after edits — no extra effort required.
- Invoke skills from the agent: `/code-reviews` before committing, `/deploy` before shipping.

### 5. Gate every PR
Require CI (build → lint → test) **and** the automated security review to pass before merge.
Address findings in priority order (Critical → Low) before promoting a build.

### Run the app locally
```bash
npm install
cp .env.example .env
npm run db:migrate
npm run db:seed
npm run dev          # API on :3001, web on :5173
```

All `/api/*` routes require `Authorization: Bearer <API_KEY>`.

---

## Why This Matters for AppSec

| Capability | Demonstrated by |
|------------|-----------------|
| Threat modeling & control design | Deny rules targeting exfiltration, privilege escalation, secret access, destructive ops |
| Least privilege | Explicit allow-list of permitted commands and read paths |
| Defense in depth | Managed settings → project settings → sandbox → hooks → CI → security review |
| Policy as code | `managed-settings.json`, `.claude/settings.json`, `CLAUDE.md` standards |
| Secure SDLC | PR gating with automated security review + enforced test coverage |
| Automation over manual review | `PostToolUse` test hook and multi-agent review/deploy skills |

---

## Built with Claude Code

This entire governance stack — the deny rules, hooks, sandbox configuration, `CLAUDE.md`
standards, skills, the weekly-digest feature, and the security-gated PR — was designed and
implemented using **[Claude Code](https://claude.com/claude-code)**, Anthropic's agentic
coding tool, configured to govern itself.
