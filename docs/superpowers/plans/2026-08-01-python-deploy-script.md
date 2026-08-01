# Python Deploy Script Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a root-level `./deploy.sh` command that validates the site, commits all changes with a fixed message, and pushes them to GitHub through testable Python logic.

**Architecture:** A minimal Bash wrapper resolves the repository root and executes `scripts/deploy.py`. The Python module owns command sequencing and exposes `deploy()` with an injectable runner so unit tests can verify behavior without making real Git commits or pushes.

**Tech Stack:** Bash, Python 3 standard library (`subprocess`, `unittest`), npm, Git

## Global Constraints

- The user-facing command is exactly `./deploy.sh` from the repository root.
- The fixed commit message is exactly `chore: 发布网站`.
- Run `npm test` and `npm run build` before staging or publishing.
- A command failure stops the workflow and returns a non-zero status.
- No new Python or npm dependency is introduced.
- Automated verification must never create a real commit or push.

---

### Task 1: Testable Python Deployment Workflow

**Files:**
- Create: `scripts/test_deploy.py`
- Create: `scripts/deploy.py`

**Interfaces:**
- Produces: `deploy(run: CommandRunner = run_command) -> bool`, returning `True` after a push and `False` when there is nothing to commit.
- Produces: `run_command(command: list[str], *, check: bool = True) -> int`, running commands from the repository root and returning their exit status.
- Produces: `main() -> int`, translating successful deployment outcomes to process exit code `0` while command errors propagate as non-zero process exits.

- [x] **Step 1: Write failing workflow tests**

Create `scripts/test_deploy.py` with a recording fake runner. Add focused tests asserting that a changed tree runs these exact commands in order:

```python
[
    (["npm", "test"], True),
    (["npm", "run", "build"], True),
    (["git", "add", "-A"], True),
    (["git", "diff", "--cached", "--quiet"], False),
    (["git", "commit", "-m", "chore: 发布网站"], True),
    (["git", "push"], True),
]
```

Add a no-change test where the diff command returns `0` and assert that `deploy()` returns `False` without commit or push. Add a failure test where `npm test` raises `subprocess.CalledProcessError` and assert that only the first command was attempted.

- [x] **Step 2: Run tests and verify the missing module failure**

Run: `python3 -m unittest scripts/test_deploy.py -v`

Expected: FAIL because `scripts.deploy` does not exist.

- [x] **Step 3: Implement the minimal Python workflow**

Create `scripts/deploy.py` with `COMMIT_MESSAGE = "chore: 发布网站"`, a `run_command()` wrapper around `subprocess.run(..., cwd=REPOSITORY_ROOT, check=check)`, and `deploy()` using the command sequence specified in Step 1. Treat diff exit code `0` as no changes, `1` as changes, and any other result as `subprocess.CalledProcessError`.

Use the executable entry point:

```python
if __name__ == "__main__":
    raise SystemExit(main())
```

- [x] **Step 4: Run the Python tests and verify they pass**

Run: `python3 -m unittest scripts/test_deploy.py -v`

Expected: all workflow tests PASS and no Git commit or push is executed.

### Task 2: Root Command Integration

**Files:**
- Create: `deploy.sh`
- Modify: `package.json`
- Delete: `scripts/deploy.sh`
- Test: `scripts/test_deploy.py`

**Interfaces:**
- Consumes: `scripts/deploy.py` as the sole deployment implementation.
- Produces: executable command `./deploy.sh`.
- Produces: npm alias `npm run deploy` calling `./deploy.sh`.

- [x] **Step 1: Add a failing wrapper contract test**

Extend `scripts/test_deploy.py` to execute root `deploy.sh` from outside the repository with a temporary `python3` executable that records its arguments. Assert that the wrapper invokes the absolute `scripts/deploy.py` path and that `package.json` contains exactly `"deploy": "./deploy.sh"`.

- [x] **Step 2: Run tests and verify the wrapper contract fails**

Run: `python3 -m unittest scripts/test_deploy.py -v`

Expected: FAIL because root `deploy.sh` is missing.

- [x] **Step 3: Add the wrapper and connect the npm script**

Create root `deploy.sh` as:

```bash
#!/usr/bin/env bash
set -euo pipefail

repo_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
exec python3 "$repo_dir/scripts/deploy.py"
```

Mark it executable with `chmod +x deploy.sh`, update `package.json` to `"deploy": "./deploy.sh"`, and remove the superseded `scripts/deploy.sh`.

- [x] **Step 4: Run focused verification**

Run: `python3 -m unittest scripts/test_deploy.py -v`

Expected: all Python and wrapper contract tests PASS.

Run: `bash -n deploy.sh`

Expected: exit code `0`.

### Task 3: Full Project Verification

**Files:**
- Verify only; no production file changes expected.

**Interfaces:**
- Consumes: the completed root wrapper and Python deployment module.
- Produces: verification evidence without performing a real deployment.

- [x] **Step 1: Run all deployment unit tests**

Run: `python3 -m unittest scripts/test_deploy.py -v`

Expected: all tests PASS.

- [x] **Step 2: Run the existing project tests**

Run: `npm test`

Expected: Vitest exits `0` with no failed tests.

- [x] **Step 3: Build the production site**

Run: `npm run build`

Expected: Astro and Pagefind both exit `0`.

- [x] **Step 4: Inspect the final diff**

Run: `git diff --check && git status --short`

Expected: no whitespace errors; only the implementation plan, deployment scripts, tests, and `package.json` changes are present.
