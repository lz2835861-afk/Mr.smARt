import { toast } from "sonner";

/**
 * 让来源链接交给浏览器原生 target="_blank" 打开。
 *
 * 之前的实现是 event.preventDefault() + window.open("about:blank") 再跳转。
 * 问题在于 window.open 会被浏览器当作“弹窗”，可能被拦截器阻止，
 * 导致用户点击后“完全没有反应”。而原生 <a target="_blank"> 属于用户主动
 * 导航，不会被弹窗拦截器阻止，是最可靠的方式（在 iframe 内只要 sandbox
 * 带 allow-popups 也同样有效，本项目门户已配置）。
 *
 * 因此这里只在链接非法时阻止默认行为并提示；合法链接不拦截，交给原生打开。
 */
export function openExternalSource(event: { preventDefault(): void }, url: string): void {
  let valid = false;
  try {
    const parsed = new URL(url);
    valid = parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    valid = false;
  }

  if (!valid) {
    event.preventDefault();
    toast.error("来源链接格式无效");
  }
  // 合法链接：不调用 preventDefault，由 <a target="_blank" rel="noopener noreferrer"> 原生打开。
}
