#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CLAUDE_SKILLS_DIR="${CLAUDE_SKILLS_DIR:-$HOME/.claude/skills}"

mkdir -p "$CLAUDE_SKILLS_DIR"

for skill in analyst-questionnaire-runner analyst-grounding analyst-wording answer-quality-checker; do
  source_dir="$ROOT_DIR/skills/$skill"
  target="$CLAUDE_SKILLS_DIR/$skill"

  if [[ ! -d "$source_dir" ]]; then
    echo "Missing bundled skill: $source_dir" >&2
    exit 1
  fi

  if [[ -e "$target" || -L "$target" ]]; then
    echo "Skipping existing target: $target"
    continue
  fi

  ln -s "$source_dir" "$target"
  echo "Linked $skill -> $target"
done

echo "Claude skills are installed in $CLAUDE_SKILLS_DIR"
