# Analyst Questionnaire Suite Plugin

Run analyst questionnaire workflows end to end. This repo is the **single source
of truth** for four coordinated skills — author once here, and Claude Code,
Codex, and Cursor all read the same files via symlinks.

- `analyst-questionnaire-runner`: orchestrates intake, prioritization, per-question state, review status, cross-question audit, and submission packaging.
- `analyst-grounding`: gathers audit-tagged evidence from Tencent Cloud sources.
- `analyst-wording`: turns evidence into analyst-style questionnaire answers.
- `answer-quality-checker`: lints answers and evidence packages before submission.

## Repository Layout

```text
.codex-plugin/plugin.json
skills/
  analyst-questionnaire-runner/
  analyst-grounding/
  analyst-wording/
  answer-quality-checker/
scripts/
  install-skills.sh          # universal: links into every tool present
  install-claude-skills.sh   # legacy: Claude only (kept for back-compat)
```

## Single source of truth — install once, used everywhere

All three agent tools discover skills as `SKILL.md` folders under their own
skills directory. Rather than copy the content into each tool, we keep ONE copy
(this repo's `skills/`) and symlink it into each tool. Maintain one place; every
tool stays in sync automatically.

```bash
./scripts/install-skills.sh
```

This symlinks the four skills into the skills directory of every detected tool:

| Tool        | Skills directory                                 | How it reads this repo                  |
| ----------- | ------------------------------------------------ | --------------------------------------- |
| Claude Code | `~/.claude/skills/`                              | direct symlink                          |
| Codex       | `~/.codex/skills/`                               | direct symlink                          |
| Cursor      | reads `~/.claude/skills` (and `~/.codex/skills`) | covered by the above — no separate step |

Options:

```bash
./scripts/install-skills.sh --force     # replace existing links/dirs
./scripts/install-skills.sh --copy      # copy instead of symlink
./scripts/install-skills.sh --dry-run   # preview
# Custom targets (colon-separated):
TOOL_SKILL_DIRS="$HOME/.claude/skills:$HOME/.codex/skills" ./scripts/install-skills.sh
```

Because every install is a symlink to `skills/`, editing a `SKILL.md` (or its
`references/`) here updates the skill for Claude, Codex, and Cursor at once.

## Codex plugin manifest

The plugin manifest at `.codex-plugin/plugin.json` exposes all bundled skills
from `./skills/`. The intended entrypoint for a full questionnaire is
`analyst-questionnaire-runner`; use the sub-skills directly for narrower tasks
(evidence only: `analyst-grounding`; wording only: `analyst-wording`; lint only:
`answer-quality-checker`).

## Source Repositories

This bundle was consolidated from:

- https://github.com/AOMJ2PMP/analyst-questionnaire-runner-skill
- https://github.com/AOMJ2PMP/analyst-grounding-skill
- https://github.com/AOMJ2PMP/analyst-wording-skill
- https://github.com/AOMJ2PMP/answer-quality-checker-skill
