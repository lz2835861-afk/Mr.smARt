# Recipe: Workflow Dashboard

Use this when building automations, scheduled jobs, agent workflows, or productivity hubs.

## Components

- `WorkflowCard`
- `NotificationCard`
- `TodoItem` pattern
- `CalendarEventCard`
- `StatRow`
- `RaisedButton`

## Layout

Use a work-focused dashboard:

- Top bar: current workspace and primary action.
- Main area: workflow cards in a restrained grid.
- Side rail: notifications, pending tasks, and scheduled events.
- Metrics strip: `StatRow` for usage, runs, failures, or saved time.

## Notes

- Workflow cards should state what happens, when it runs, and which tools/integrations it touches.
- Notifications should stay actionable.
- Tasks should preserve priority and due-date visual signals.
