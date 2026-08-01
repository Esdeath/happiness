from __future__ import annotations

import io
import json
import os
import subprocess
import tempfile
import unittest
from contextlib import redirect_stdout
from pathlib import Path

from scripts.deploy import COMMIT_MESSAGE, deploy


REPOSITORY_ROOT = Path(__file__).resolve().parent.parent


class RecordingRunner:
    def __init__(
        self,
        *,
        diff_exit_code: int = 1,
        fail_on: list[str] | None = None,
    ) -> None:
        self.diff_exit_code = diff_exit_code
        self.fail_on = fail_on
        self.calls: list[tuple[list[str], bool]] = []

    def __call__(self, command: list[str], *, check: bool = True) -> int:
        self.calls.append((command, check))
        if command == self.fail_on:
            raise subprocess.CalledProcessError(1, command)
        if command == ["git", "diff", "--cached", "--quiet"]:
            return self.diff_exit_code
        return 0


class DeployTest(unittest.TestCase):
    def test_runs_validation_commit_and_push_in_order(self) -> None:
        runner = RecordingRunner()

        deployed = deploy(runner)

        self.assertTrue(deployed)
        self.assertEqual(
            runner.calls,
            [
                (["npm", "test"], True),
                (["npm", "run", "build"], True),
                (["git", "add", "-A"], True),
                (["git", "diff", "--cached", "--quiet"], False),
                (["git", "commit", "-m", COMMIT_MESSAGE], True),
                (["git", "push"], True),
            ],
        )

    def test_stops_before_commit_when_there_are_no_changes(self) -> None:
        runner = RecordingRunner(diff_exit_code=0)
        output = io.StringIO()

        with redirect_stdout(output):
            deployed = deploy(runner)

        self.assertFalse(deployed)
        self.assertIn("没有需要部署的改动", output.getvalue())
        self.assertEqual(
            runner.calls,
            [
                (["npm", "test"], True),
                (["npm", "run", "build"], True),
                (["git", "add", "-A"], True),
                (["git", "diff", "--cached", "--quiet"], False),
            ],
        )

    def test_stops_after_a_validation_command_fails(self) -> None:
        runner = RecordingRunner(fail_on=["npm", "test"])

        with self.assertRaises(subprocess.CalledProcessError):
            deploy(runner)

        self.assertEqual(runner.calls, [(["npm", "test"], True)])

    def test_raises_when_git_cannot_inspect_staged_changes(self) -> None:
        runner = RecordingRunner(diff_exit_code=128)

        with self.assertRaises(subprocess.CalledProcessError) as raised:
            deploy(runner)

        self.assertEqual(raised.exception.returncode, 128)
        self.assertEqual(
            runner.calls[-1],
            (["git", "diff", "--cached", "--quiet"], False),
        )


class DeployWrapperTest(unittest.TestCase):
    def test_package_deploy_command_uses_root_wrapper(self) -> None:
        package = json.loads(
            (REPOSITORY_ROOT / "package.json").read_text(encoding="utf-8")
        )

        self.assertEqual(package["scripts"]["deploy"], "./deploy.sh")

    def test_runs_python_deployer_from_outside_repository(self) -> None:
        with tempfile.TemporaryDirectory() as temporary_directory:
            temporary_path = Path(temporary_directory)
            output_path = temporary_path / "python-arguments.txt"
            fake_python = temporary_path / "python3"
            fake_python.write_text(
                '#!/usr/bin/env bash\nprintf "%s\\n" "$@" > "$DEPLOY_TEST_OUTPUT"\n',
                encoding="utf-8",
            )
            fake_python.chmod(0o755)
            environment = os.environ.copy()
            environment["PATH"] = f"{temporary_path}:{environment['PATH']}"
            environment["DEPLOY_TEST_OUTPUT"] = str(output_path)

            result = subprocess.run(
                [REPOSITORY_ROOT / "deploy.sh"],
                cwd=temporary_path,
                env=environment,
                check=False,
            )

            self.assertEqual(result.returncode, 0)
            self.assertEqual(
                output_path.read_text(encoding="utf-8").splitlines(),
                [str(REPOSITORY_ROOT / "scripts" / "deploy.py")],
            )


if __name__ == "__main__":
    unittest.main()
