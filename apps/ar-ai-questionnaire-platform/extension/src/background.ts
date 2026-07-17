/**
 * MV3 service worker. The toolbar action has no popup; clicking it tells the
 * active docs.qq.com tab's content script to toggle the provenance panel.
 */

chrome.action.onClicked.addListener((tab) => {
  if (tab.id == null) return;
  chrome.tabs.sendMessage(tab.id, { type: "TOGGLE_PANEL" }).catch(() => {
    // No content script on this page (not docs.qq.com) — ignore.
  });
});
