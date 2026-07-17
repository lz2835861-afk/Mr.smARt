# Agent Quickstart

Use this file when another coding agent references the GAIA folder and needs to start fast.

## First Reads

1. `AGENTS.md`
2. `components-catalog/README.md`
3. The relevant `recipes/*.md`
4. The exact `registry-snapshot/items/<component>.json` files you plan to use

## Fast Component Lookup

- Need AI input: `composer`
- Need slash command tools: `slash-command-dropdown`
- Need attached file display: `file-preview`
- Need chat transcript: `message-bubble`
- Need tool trace: `tool-calls-section`
- Need automation card: `workflow-card`
- Need notifications: `notification-card`
- Need pricing: `pricing-card`
- Need CTA: `raised-button`
- Need compact metrics: `stat-row`
- Need charts: `area-chart`, `bar-chart`, `line-chart`, `pie-chart`, `radar-chart`, `scatter-chart`, `gauge-chart`

## Install Pattern

```bash
npx shadcn@latest add https://ui.heygaia.io/r/<component-name>.json
```

If the consuming project is not this repo, ensure it has:

- Tailwind CSS configured
- `@/*` path alias
- `src/lib/utils.ts` or `lib/utils.ts` with `cn()`
- Required npm dependencies from the component catalog

## Demo Pattern

The live demo in `src/components/gaia-agent-demo.tsx` shows how to combine:

- `Composer`
- `MessageBubble`
- `ToolCallsSection`
- `WorkflowCard`
- `ModelSelector`
- `NotificationCard`
- `PricingCard`
- `StatRow`
- `RaisedButton`

Use it as a composition example, not a rigid template.
