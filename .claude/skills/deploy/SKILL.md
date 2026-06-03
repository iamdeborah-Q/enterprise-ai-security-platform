---
name: deploy
description: Runs the deployment checklist
disable-model-invocation: true
---

# Deploy

Run the pre-deployment checklist for TeamPulse. This is a gated sequence — **stop
at the first failing step** and report it; do not continue to later steps.

## Steps

1. **Run the test suite.** Execute `npm test`.
   - If any test fails (non-zero exit), **abort the deployment.** Report which
     tests failed and stop. Do not build, do not log.

2. **Check for uncommitted changes.** Run `git status --porcelain`.
   - If the working tree is dirty, warn the user that there are uncommitted
     changes and list them. Ask for explicit confirmation before continuing —
     deploys should run from a clean, committed tree.

3. **Run the build.** Execute `npm run build`.
   - If the build fails, **abort** and report the error. Do not log a deployment.

4. **Log the deployment.** Only after tests and build pass, append one line to
   `deploy-log.txt` at the repo root recording the timestamp and the deployed
   commit. Build the line from real values:
   - timestamp: `date -u +"%Y-%m-%dT%H:%M:%SZ"` (UTC, ISO-8601)
   - git hash: `git rev-parse --short HEAD`
   - current branch: `git rev-parse --abbrev-ref HEAD`

   Append (do not overwrite) with a single command, e.g.:

   ```bash
   echo "$(date -u +"%Y-%m-%dT%H:%M:%SZ") deploy $(git rev-parse --abbrev-ref HEAD) $(git rev-parse --short HEAD)" >> deploy-log.txt
   ```

5. **Report.** Confirm the deployment was logged and show the line that was
   appended. Remember the repo's deploy rules: staging auto-deploys from a green
   `main`; **production requires explicit approval** — do not promote to prod from
   this skill without it.
