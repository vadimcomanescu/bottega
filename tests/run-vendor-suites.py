#!/usr/bin/env python3
"""Run the vendored autoreview test suites.

The vendored hardening suite guards its Java-dependent tests with
shutil.which("java"), but macOS ships a /usr/bin/java stub that resolves and
then fails with "Unable to locate a Java Runtime". When the stub cannot report
a version, hide java from shutil.which so those tests skip as upstream
intended. Vendored files are never edited; this runner is the bottega-owned
seam around them.
"""

import shutil
import subprocess
import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
VENDOR = ROOT / "skills" / "code-review"


def java_runs() -> bool:
    try:
        return subprocess.run(
            ["java", "-version"], capture_output=True, timeout=30
        ).returncode == 0
    except (OSError, subprocess.TimeoutExpired):
        return False


def main() -> int:
    if not java_runs():
        real_which = shutil.which
        shutil.which = lambda cmd, *a, **kw: (
            None if cmd == "java" else real_which(cmd, *a, **kw)
        )

    loader = unittest.TestLoader()
    suite = unittest.TestSuite()
    scripts_dir = str(VENDOR / "scripts")
    tests_dir = str(VENDOR / "tests")
    for start, pattern in ((scripts_dir, "autoreview_test.py"), (tests_dir, "test_autoreview_hardening.py")):
        found = loader.discover(start, pattern=pattern, top_level_dir=start)
        if not found.countTestCases():
            print(f"run-vendor-suites: no tests discovered in {start} ({pattern})", file=sys.stderr)
            return 1
        suite.addTests(found)
    result = unittest.TextTestRunner(verbosity=1).run(suite)
    return 0 if result.wasSuccessful() else 1


if __name__ == "__main__":
    sys.exit(main())
