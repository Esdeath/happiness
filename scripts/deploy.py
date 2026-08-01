#!/usr/bin/env python3
from __future__ import annotations

import subprocess
from collections.abc import Callable
from pathlib import Path


REPOSITORY_ROOT = Path(__file__).resolve().parent.parent
COMMIT_MESSAGE = "chore: 发布网站"
CommandRunner = Callable[..., int]


def run_command(command: list[str], *, check: bool = True) -> int:
    result = subprocess.run(command, cwd=REPOSITORY_ROOT, check=check)
    return result.returncode


def deploy(run: CommandRunner = run_command) -> bool:
    run(["npm", "test"])
    run(["npm", "run", "build"])
    run(["git", "add", "-A"])

    diff_exit_code = run(
        ["git", "diff", "--cached", "--quiet"],
        check=False,
    )
    if diff_exit_code == 0:
        print("没有需要部署的改动")
        return False
    if diff_exit_code != 1:
        raise subprocess.CalledProcessError(
            diff_exit_code,
            ["git", "diff", "--cached", "--quiet"],
        )

    run(["git", "commit", "-m", COMMIT_MESSAGE])
    run(["git", "push"])
    return True


def main() -> int:
    deploy()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
