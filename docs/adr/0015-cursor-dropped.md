# 0015: Cursor is no longer a target harness

Date: 2026-07-23 (recording the decision of 2026-07-21, release 0.78.0)

The cross-harness method (ADR 0005) named three target harnesses: Claude Code, Codex, and Cursor. Release 0.78.0 removed Cursor entirely (its manifest, hook registration, and every mention) because Cursor has no self-serve third-party plugin install path, so bottega could not be installed there by the method's own install story. The method remains two-harness: Claude Code and Codex, with the codex plugin installed from this repo's marketplace. Re-adding a harness starts from the install path: a target must be installable from this repo before its mechanics earn a place in the skills.
