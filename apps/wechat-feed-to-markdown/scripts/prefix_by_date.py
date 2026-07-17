"""Rename article dirs with `YYYY-MM-DD - <title>` prefix.

Reads each MD's `> 发布时间:` field. Idempotent: skips already-prefixed dirs.

In Finder/file managers, set "Sort by name, descending" to put newest at top.
Stable when new articles arrive (no ordinal numbering to invalidate).
"""
from __future__ import annotations

import argparse
import re
import shutil
from pathlib import Path

PREFIXED = re.compile(r"^\d{4}-\d{2}-\d{2} - ")


def rename_in_folder(folder: Path) -> int:
    n = 0
    for d in sorted(folder.iterdir()):
        if not d.is_dir():
            continue
        if PREFIXED.match(d.name):
            continue
        mds = list(d.glob("*.md"))
        if not mds:
            continue
        text = mds[0].read_text(encoding="utf-8")
        m = re.search(r"^> 发布时间: (.+)$", text, re.MULTILINE)
        if not m:
            print(f"   ⚠ no publish time in {d.name}; skipping")
            continue
        date = m.group(1).strip()[:10]  # YYYY-MM-DD
        new_name = f"{date} - {d.name}"
        new_path = d.parent / new_name
        if new_path.exists() and new_path != d:
            print(f"   collision (same date + title): {new_name}")
            continue
        shutil.move(str(d), str(new_path))
        n += 1
    return n


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument(
        "folders",
        nargs="+",
        type=Path,
        help="folder(s) containing article subdirs (or per-account parent of such)",
    )
    args = ap.parse_args()

    for folder in args.folders:
        if not folder.exists() or not folder.is_dir():
            print(f"⚠ skip {folder}: not a directory")
            continue
        article_dirs = [d for d in folder.iterdir() if d.is_dir() and list(d.glob("*.md"))]
        if article_dirs:
            n = rename_in_folder(folder)
            print(f"📂 {folder}: renamed {n}")
        else:
            for sub in folder.iterdir():
                if sub.is_dir():
                    n = rename_in_folder(sub)
                    print(f"📂 {sub}: renamed {n}")


if __name__ == "__main__":
    main()
