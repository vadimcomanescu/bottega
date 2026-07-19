import glob, sys, yaml, os

repo = "/Users/vadimcomanescu/Code/bottega/.claude/worktrees/spec-rewrite"
files = sorted(glob.glob(os.path.join(repo, "skills/*/SKILL.md")))
fail = 0
for f in files:
    with open(f, "r") as fh:
        text = fh.read()
    if not text.startswith("---"):
        print(f"NO-FRONTMATTER {f}")
        fail += 1
        continue
    # split: first --- line, then content until next --- line
    parts = text.split("\n")
    assert parts[0].strip() == "---", parts[0]
    end = None
    for i in range(1, len(parts)):
        if parts[i].strip() == "---":
            end = i
            break
    if end is None:
        print(f"NO-CLOSING-DELIM {f}")
        fail += 1
        continue
    fm = "\n".join(parts[1:end])
    try:
        data = yaml.safe_load(fm)
        keys = list(data.keys()) if isinstance(data, dict) else type(data).__name__
        print(f"OK {os.path.relpath(f, repo)} keys={keys}")
    except Exception as e:
        print(f"PARSE-FAIL {os.path.relpath(f, repo)}: {type(e).__name__}: {e}")
        fail += 1

print("---")
print(f"total={len(files)} failures={fail}")
sys.exit(1 if fail else 0)
