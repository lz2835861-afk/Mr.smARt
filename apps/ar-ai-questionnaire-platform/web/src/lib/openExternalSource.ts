import { toast } from "sonner";

/**
 * Open a source link from either the standalone app or the portal iframe.
 * Opening a blank tab synchronously keeps the call inside the user's click,
 * which avoids popup blockers that reject a later/nested navigation.
 */
export function openExternalSource(url: string): void {
  let href: string;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
      throw new Error("unsupported protocol");
    }
    href = parsed.href;
  } catch {
    toast.error("来源链接格式无效");
    return;
  }

  const tab = window.open("about:blank", "_blank");
  if (tab) {
    tab.opener = null;
    tab.location.replace(href);
    return;
  }

  void navigator.clipboard?.writeText(href).catch(() => {});
  toast.message("浏览器阻止了新窗口，来源链接已复制，请粘贴到地址栏打开");
}
