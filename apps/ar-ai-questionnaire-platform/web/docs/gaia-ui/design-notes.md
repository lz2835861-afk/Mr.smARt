# GAIA UI Design Notes

GAIA UI is optimized for conversational products, assistant workspaces, workflow automation, and productivity surfaces.

## Visual Language

- Primary accent: `#00bbff`
- Rounded but not bloated surfaces
- Soft zinc neutrals
- Dark-mode support
- Compact, readable product density
- Tactile CTAs through `RaisedButton`
- Traceable agent actions through `ToolCallsSection`

## Product Patterns

- Agent workspace: chat history, composer, tool trace, model selector, attached files.
- Workflow hub: workflow cards, notifications, todos, calendar cards.
- Metrics panel: stat rows and charts.
- Upgrade/onboarding: pricing cards, raised buttons, compact proof points.

## Avoid

- Rebuilding GAIA-specific components as generic cards.
- Hiding agent tool execution.
- Turning app/workspace requests into marketing-only landing pages.
- Using only a one-color blue palette; keep zinc, white, and semantic colors visible.
- Removing keyboard and dark-mode affordances from copied components.
