const BADGE_BACKGROUND = "#2563eb";
const INTERVENTION_COOLDOWN_MS = 24 * 60 * 60 * 1000;
const LAST_INTERVENTION_KEY = "lastInterventionAt";

type InterventionLevel = "reminder" | "warning" | "intervention";

type LastIntervention = {
  level: InterventionLevel;
  timestamp: number;
};

const INTERVENTION_THRESHOLDS: Record<InterventionLevel, number> = {
  reminder: 20,
  warning: 50,
  intervention: 100
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

const getInterventionLevel = (tabCount: number): InterventionLevel | null => {
  if (tabCount >= INTERVENTION_THRESHOLDS.intervention) {
    return "intervention";
  }

  if (tabCount >= INTERVENTION_THRESHOLDS.warning) {
    return "warning";
  }

  if (tabCount >= INTERVENTION_THRESHOLDS.reminder) {
    return "reminder";
  }

  return null;
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
    value.level in INTERVENTION_THRESHOLDS
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
  const tabs = await chrome.tabs.query({});
  const level = getInterventionLevel(tabs.length);

  if (!level || (await hasOpenIntervention())) {
    return;
  }

  const now = Date.now();
  const lastIntervention = await getLastIntervention();
  const isEscalation =
    lastIntervention && INTERVENTION_RANK[level] > INTERVENTION_RANK[lastIntervention.level];

  if (lastIntervention && !isEscalation && now - lastIntervention.timestamp < INTERVENTION_COOLDOWN_MS) {
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
