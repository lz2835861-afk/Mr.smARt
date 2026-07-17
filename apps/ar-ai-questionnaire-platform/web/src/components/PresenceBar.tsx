import { Tooltip } from "@heroui/react";
import type { OnlineUser } from "../hooks/usePresence";

interface Props {
  users: OnlineUser[];
  selfId?: string;
}

/** Inline pills showing the full name of every online team member, color-coded. */
export function PresenceBar({ users, selfId }: Props) {
  if (users.length === 0) return null;
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {users.map((u) => {
        const isSelf = u.id === selfId;
        return (
          <Tooltip key={u.id}>
            <Tooltip.Trigger>
              <span
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium leading-none border bg-surface"
                style={{ borderColor: u.color, color: u.color }}
              >
                <span
                  className="size-1.5 rounded-full"
                  style={{ backgroundColor: u.color }}
                />
                <span className="capitalize">{u.name}</span>
                {isSelf && <span className="text-muted">· 你</span>}
              </span>
            </Tooltip.Trigger>
            <Tooltip.Content>
              {u.name}
              {isSelf && " · 你"}
            </Tooltip.Content>
          </Tooltip>
        );
      })}
      <span className="text-[11px] text-muted ml-1">{users.length} 在线</span>
    </div>
  );
}
