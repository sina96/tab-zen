const BADGE_BACKGROUND = "#2563eb";

const updateTabCountBadge = async (): Promise<void> => {
  const tabs = await chrome.tabs.query({});
  const tabCount = tabs.length;

  await chrome.action.setBadgeText({
    text: tabCount > 0 ? String(tabCount) : ""
  });
  await chrome.action.setBadgeBackgroundColor({ color: BADGE_BACKGROUND });
};

chrome.runtime.onInstalled.addListener(() => {
  void updateTabCountBadge();
});

chrome.runtime.onStartup.addListener(() => {
  void updateTabCountBadge();
});

chrome.tabs.onCreated.addListener(() => {
  void updateTabCountBadge();
});

chrome.tabs.onRemoved.addListener(() => {
  void updateTabCountBadge();
});

chrome.tabs.onAttached.addListener(() => {
  void updateTabCountBadge();
});

chrome.tabs.onDetached.addListener(() => {
  void updateTabCountBadge();
});

chrome.windows.onCreated.addListener(() => {
  void updateTabCountBadge();
});

chrome.windows.onRemoved.addListener(() => {
  void updateTabCountBadge();
});
