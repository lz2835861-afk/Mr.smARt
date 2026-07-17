import { useState, type ReactNode } from "react";
import { Button, Card, Label, TextField } from "@heroui/react";
import { toast } from "sonner";
import { useAuth } from "../hooks/useAuth";
import { isRemoteEnabled } from "../lib/supabase";

interface Props {
  children: (auth: ReturnType<typeof useAuth>) => ReactNode;
}

/** Wraps the app: show login screen if signed out + remote configured. */
export function AuthGate({ children }: Props) {
  const auth = useAuth();
  const [name, setName] = useState("");
  const [signing, setSigning] = useState(false);

  // Local-only mode: bypass auth entirely
  if (auth.status === "remote-disabled") return <>{children(auth)}</>;

  if (auth.status === "loading") {
    return (
      <div className="grid place-items-center min-h-screen text-muted text-sm">
        加载中…
      </div>
    );
  }

  if (auth.status === "signed-in") return <>{children(auth)}</>;

  // signed-out: render login UI
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSigning(true);
    const res = await auth.signInWithName(name);
    setSigning(false);
    if (res.ok) {
      toast.success(`欢迎，${name.trim().toLowerCase()}`);
    } else {
      toast.error(res.error ?? "登录失败");
    }
  };

  return (
    <div className="grid place-items-center min-h-screen p-6 bg-background">
      <Card className="w-full max-w-sm">
        <Card.Header>
          <Card.Title>AR 问卷协作台</Card.Title>
          <Card.Description>
            Tencent Cloud · Analyst Questionnaire Workspace
          </Card.Description>
        </Card.Header>
        <form onSubmit={handleSubmit}>
          <Card.Content className="space-y-5">
            <TextField value={name} onChange={setName} type="text">
              <Label className="text-sm font-medium">名字</Label>
              <input
                type="text"
                placeholder="meen / april / lindsay / lux / kevin"
                autoFocus
                autoComplete="off"
                spellCheck={false}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm placeholder:text-muted focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
              />
            </TextField>
            <Button
              type="submit"
              variant="primary"
              size="md"
              fullWidth
              isPending={signing}
            >
              进入工作台
            </Button>
          </Card.Content>
          <Card.Footer>
            {isRemoteEnabled ? (
              <p className="text-xs text-muted text-center w-full">
                所有改动实时同步给团队在线成员
              </p>
            ) : (
              <p className="text-xs text-warning text-center w-full">
                未检测到 Supabase 配置，登录不会生效
              </p>
            )}
          </Card.Footer>
        </form>
      </Card>
    </div>
  );
}
