#!/usr/bin/env bash
set -euo pipefail

# Single-source-of-truth installer.
#
# This repo's skills/ is the CANONICAL source. We symlink each skill into the
# skills directory of every agent tool present (Claude Code, Codex, ...), so you
# maintain ONE place and all tools read it.
#
# Cursor reads ~/.claude/skills (and ~/.codex/skills), so linking those two
# covers Cursor automatically — no separate Cursor step needed.
#
# Usage:
#   ./scripts/install-skills.sh             # symlink into all default tool dirs
#   ./scripts/install-skills.sh --force     # replace existing links/dirs
#   ./scripts/install-skills.sh --copy      # copy instead of symlink
#   ./scripts/install-skills.sh --dry-run   # show what would happen
#   TOOL_SKILL_DIRS="$HOME/.claude/skills:$HOME/.codex/skills" ./scripts/install-skills.sh

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SKILLS=(analyst-questionnaire-runner analyst-grounding analyst-wording answer-quality-checker)

FORCE=0; COPY=0; DRY=0
for arg in "$@"; do
  case "$arg" in
    --force) FORCE=1 ;;
    --copy) COPY=1 ;;
    --dry-run) DRY=1 ;;
    *) echo "unknown arg: $arg" >&2; exit 2 ;;
  esac
done

if [[ -n "${TOOL_SKILL_DIRS:-}" ]]; then
  IFS=':' read -r -a TARGET_DIRS <<< "$TOOL_SKILL_DIRS"
else
  TARGET_DIRS=("$HOME/.claude/skills" "$HOME/.codex/skills")
fi

link_one() {
  local src="$1" tgt="$2"
  if [[ $DRY -eq 1 ]]; then echo "[dry-run] would link: $tgt"; return; fi
  if [[ -e "$tgt" || -L "$tgt" ]]; then
    if [[ $FORCE -eq 1 ]]; then rm -rf "$tgt"; else echo "skip existing: $tgt"; return; fi
  fi
  if [[ $COPY -eq 1 ]]; then cp -R "$src" "$tgt"; echo "copied  -> $tgt";
  else ln -s "$src" "$tgt"; echo "linked  -> $tgt"; fi
}

for dir in "${TARGET_DIRS[@]}"; do
  echo "== $dir =="
  [[ $DRY -eq 1 ]] || mkdir -p "$dir"
  for skill in "${SKILLS[@]}"; do
    src="$ROOT_DIR/skills/$skill"
    [[ -d "$src" ]] || { echo "missing source: $src" >&2; exit 1; }
    link_one "$src" "$dir/$skill"
  done
done

echo "Done. Canonical source: $ROOT_DIR/skills"
