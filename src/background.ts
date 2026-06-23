import { loadSettings, type InterventionLevel, type TabZenSettings } from "./settings";

const BADGE_BACKGROUND = "#2563eb";
const LAST_INTERVENTION_KEY = "lastInterventionAt";
const HOUR_MS = 60 * 60 * 1000;

type LastIntervention = {
  level: InterventionLevel;
  timestamp: number;
};

const INTERVENTION_RANK: Record<InterventionLevel, number> = {
  reminder: 1,
  warning: 2,
  intervention: 3
};

let interventionCheck: Promise<void> | null = null;

const updateTabCountBadge = async (): Promise<void> => {
  const tabs = await chrome.tabs.query({});
  const tabCount = tabs.length;

  await chrome.action.setBadgeText({
    text: tabCount > 0 ? String(tabCount) : ""
  });
  await chrome.action.setBadgeBackgroundColor({ color: BADGE_BACKGROUND });
};

export const getInterventionLevel = (tabCount: number, settings: TabZenSettings): InterventionLevel | null => {
  if (tabCount >= settings.interventionThreshold) {
    return "intervention";
  }

  if (tabCount >= settings.warningThreshold) {
    return "warning";
  }

  if (tabCount >= settings.reminderThreshold) {
    return "reminder";
  }

  return null;
};

export const shouldRespectCooldown = (
  level: InterventionLevel,
  lastIntervention: LastIntervention | null,
  now: number,
  cooldownHours: number
): boolean => {
  if (!lastIntervention) {
    return false;
  }

  const isEscalation = INTERVENTION_RANK[level] > INTERVENTION_RANK[lastIntervention.level];

  return !isEscalation && now - lastIntervention.timestamp < cooldownHours * HOUR_MS;
};

const getLastIntervention = async (): Promise<LastIntervention | null> => {
  const stored = await chrome.storage.local.get(LAST_INTERVENTION_KEY);
  const value = stored[LAST_INTERVENTION_KEY];

  if (
    typeof value === "object" &&
    value !== null &&
    "level" in value &&
    "timestamp" in value &&
    typeof value.timestamp === "number" &&
    typeof value.level === "string" &&
    ["reminder", "warning", "intervention"].includes(value.level)
  ) {
    return value as LastIntervention;
  }

  return null;
};

const setLastIntervention = async (lastIntervention: LastIntervention): Promise<void> => {
  await chrome.storage.local.set({ [LAST_INTERVENTION_KEY]: lastIntervention });
};

const hasOpenIntervention = async (): Promise<boolean> => {
  const interventionUrl = chrome.runtime.getURL("intervention.html");
  const tabs = await chrome.tabs.query({});

  return tabs.some((tab) => tab.url?.startsWith(interventionUrl));
};

const maybeOpenIntervention = async (): Promise<void> => {
  const [tabs, settings] = await Promise.all([chrome.tabs.query({}), loadSettings()]);
  const level = settings.interventionEnabled ? getInterventionLevel(tabs.length, settings) : null;

  if (!level || (await hasOpenIntervention())) {
    return;
  }

  const now = Date.now();
  const lastIntervention = await getLastIntervention();
  if (shouldRespectCooldown(level, lastIntervention, now, settings.cooldownHours)) {
    return;
  }

  await setLastIntervention({ level, timestamp: now });
  await chrome.tabs.create({
    active: true,
    url: `${chrome.runtime.getURL("intervention.html")}?level=${level}&tabs=${tabs.length}`
  });
};

const scheduleInterventionCheck = (): void => {
  if (interventionCheck) {
    return;
  }

  interventionCheck = maybeOpenIntervention().finally(() => {
    interventionCheck = null;
  });
};

const refreshExtensionState = (): void => {
  void updateTabCountBadge();
  scheduleInterventionCheck();
};

chrome.runtime.onInstalled.addListener(() => {
  refreshExtensionState();
});

chrome.runtime.onStartup.addListener(() => {
  refreshExtensionState();
});

chrome.tabs.onCreated.addListener(() => {
  refreshExtensionState();
});

chrome.tabs.onRemoved.addListener(() => {
  refreshExtensionState();
});

chrome.tabs.onAttached.addListener(() => {
  refreshExtensionState();
});

chrome.tabs.onDetached.addListener(() => {
  refreshExtensionState();
});

chrome.windows.onCreated.addListener(() => {
  refreshExtensionState();
});

chrome.windows.onRemoved.addListener(() => {
  refreshExtensionState();
});
