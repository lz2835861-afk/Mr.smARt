"""Split a flat output dir into per-公众号 subfolders.

Reads the `> 公众号:` field from each article's MD frontmatter. Articles
missing that field (e.g. fetched via Camoufox fallback when WeChat returned
a verify page) go to `_unclassified/` for manual review.

Idempotent: already-moved dirs are skipped.

Usage:
    uv run python sort_into_accounts.py output_backfill output_by_account

The first arg is the flat input dir, the second is where per-account
subfolders will be created.
"""
from __future__ import annotations

import argparse
import re
import shutil
from collections import Counter
from pathlib import Path


def get_account(md_path: Path) -> str | None:
    text = md_path.read_text(encoding="utf-8")
    m = re.search(r"^> 公众号: (.+)$", text, re.MULTILINE)
    return m.group(1).strip() if m else None


def get_publish_date(md_path: Path) -> str:
    text = md_path.read_text(encoding="utf-8")
    m = re.search(r"^> 发布时间: (.+)$", text, re.MULTILINE)
    return m.group(1).strip() if m else "0000-00-00"


def safe_dir_name(name: str) -> str:
    return re.sub(r'[/\\?%*:|"<>]', "_", name)


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("input_dir", type=Path, help="flat dir of <title>/<title>.md article folders")
    ap.add_argument("output_dir", type=Path, help="dir where per-account subfolders go")
    args = ap.parse_args()

    if not args.input_dir.is_dir():
        raise SystemExit(f"input_dir not a directory: {args.input_dir}")
    args.output_dir.mkdir(parents=True, exist_ok=True)

    counts: Counter[str] = Counter()
    moved = 0
    unclassified: list[Path] = []

    for art_dir in sorted(args.input_dir.iterdir()):
        if not art_dir.is_dir():
            continue
        mds = list(art_dir.glob("*.md"))
        if not mds:
            continue
        account = get_account(mds[0])
        if account is None:
            unclassified.append(art_dir)
            continue

        bucket = args.output_dir / safe_dir_name(account)
        bucket.mkdir(parents=True, exist_ok=True)
        target = bucket / art_dir.name
        if target.exists():
            continue
        shutil.move(str(art_dir), str(target))
        counts[account] += 1
        moved += 1

    if unclassified:
        unc_dir = args.output_dir / "_unclassified"
        unc_dir.mkdir(exist_ok=True)
        for art_dir in unclassified:
            target = unc_dir / art_dir.name
            if not target.exists():
                shutil.move(str(art_dir), str(target))

    print(f"📂 moved {moved} articles into {len(counts)} account folders:")
    for account, n in counts.most_common():
        print(f"   {account}: {n}")
    if unclassified:
        print(f"⚠ {len(unclassified)} articles missing 公众号 metadata → _unclassified/")
        print("   (likely Camoufox fallback failures — inspect titles + move manually)")


if __name__ == "__main__":
    main()
