# Recipe: AI Chat Workspace

Use this when building a GAIA-style assistant screen.

## Components

- `Composer`
- `SlashCommandDropdown`
- `FilePreview`
- `MessageBubble`
- `ToolCallsSection`
- `ModelSelector`
- `WaveSpinner`

## Layout

Use a three-zone surface:

- Left: model/session/context controls.
- Center: chat transcript, tool trace, composer.
- Right: notifications, files, or workflow status.

## Notes

- Keep the composer near the bottom of the conversation area.
- Show attached files before submit.
- Use slash tools for explicit agent actions.
- Keep tool calls visible enough to build trust.
- Use `ModelSelector` when the user can choose capability modes.
