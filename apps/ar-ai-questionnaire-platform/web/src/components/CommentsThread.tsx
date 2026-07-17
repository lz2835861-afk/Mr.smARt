import { useState } from "react";
import { Button, TextArea, TextField } from "@heroui/react";
import { Icon } from "@iconify/react";
import type { Comment } from "../hooks/useComments";

interface Props {
  comments: Comment[];
  onAdd: (body: string) => void;
  onToggleResolved: (id: number, resolved: boolean) => void;
}

function timeAgo(iso: string): string {
  const d = new Date(iso).getTime();
  const s = Math.floor((Date.now() - d) / 1000);
  if (s < 60) return "刚刚";
  if (s < 3600) return `${Math.floor(s / 60)} 分钟前`;
  if (s < 86400) return `${Math.floor(s / 3600)} 小时前`;
  return new Date(iso).toLocaleDateString();
}

export function CommentsThread({ comments, onAdd, onToggleResolved }: Props) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const open_count = comments.filter((c) => !c.resolved).length;

  const submit = () => {
    if (!draft.trim()) return;
    onAdd(draft);
    setDraft("");
  };

  return (
    <div className="mt-1">
      <Button variant="ghost" size="sm" onPress={() => setOpen((v) => !v)}>
        <Icon icon="gravity-ui:comment" className="size-3.5" />
        评论
        {comments.length > 0 && (
          <span className="ml-1 inline-flex items-center rounded-full bg-default-200 px-1.5 text-[10px] font-semibold tabular-nums">
            {open_count > 0 ? open_count : comments.length}
          </span>
        )}
        <Icon
          icon={open ? "gravity-ui:chevron-up" : "gravity-ui:chevron-down"}
          className="size-3"
        />
      </Button>

      {open && (
        <div className="mt-1.5 rounded-lg border border-border bg-surface-secondary/30 p-2.5 space-y-2.5">
          {comments.length === 0 && (
            <div className="text-[12px] text-muted">还没有评论。第一个来留言 👇</div>
          )}
          {comments.map((c) => (
            <div key={c.id} className={`text-[12px] ${c.resolved ? "opacity-50" : ""}`}>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-foreground">{c.author_name ?? "匿名"}</span>
                <span className="text-[10px] text-muted">{timeAgo(c.created_at)}</span>
                <button
                  type="button"
                  onClick={() => onToggleResolved(c.id, !c.resolved)}
                  className="ml-auto text-[10px] text-muted hover:text-foreground cursor-[var(--cursor-interactive)]"
                >
                  {c.resolved ? "重新打开" : "标记已解决"}
                </button>
              </div>
              <div className={`mt-0.5 whitespace-pre-wrap text-foreground/90 ${c.resolved ? "line-through" : ""}`}>
                {c.body}
              </div>
            </div>
          ))}

          <div className="flex items-end gap-1.5">
            <TextField value={draft} onChange={setDraft} variant="secondary" className="flex-1">
              <TextArea
                rows={1}
                placeholder="留言 / @ 提个问题…"
                className="w-full text-[12px] leading-[1.5]"
              />
            </TextField>
            <Button variant="primary" size="sm" isDisabled={!draft.trim()} onPress={submit}>
              发送
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
