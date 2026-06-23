export type InterventionLevel = "reminder" | "warning" | "intervention";

export type TabZenSettings = {
  interventionEnabled: boolean;
  reminderThreshold: number;
  warningThreshold: number;
  interventionThreshold: number;
  cooldownHours: number;
};

export const SETTINGS_KEY = "tabZenSettings";

export const DEFAULT_SETTINGS: TabZenSettings = {
  interventionEnabled: true,
  reminderThreshold: 20,
  warningThreshold: 50,
  interventionThreshold: 100,
  cooldownHours: 24
};

export const validateSettings = (settings: TabZenSettings): string[] => {
  const errors: string[] = [];

  if (!Number.isInteger(settings.reminderThreshold) || settings.reminderThreshold < 1) {
    errors.push("Reminder threshold must be at least 1.");
  }

  if (!Number.isInteger(settings.warningThreshold) || settings.warningThreshold <= settings.reminderThreshold) {
    errors.push("Warning threshold must be higher than reminder threshold.");
  }

  if (!Number.isInteger(settings.interventionThreshold) || settings.interventionThreshold <= settings.warningThreshold) {
    errors.push("Intervention threshold must be higher than warning threshold.");
  }

  if (!Number.isInteger(settings.cooldownHours) || settings.cooldownHours < 1 || settings.cooldownHours > 168) {
    errors.push("Cooldown must be between 1 and 168 hours.");
  }

  return errors;
};

const toInteger = (value: unknown, fallback: number): number => {
  const parsed = Number(value);

  return Number.isInteger(parsed) ? parsed : fallback;
};

const normalizeSettings = (value: unknown): TabZenSettings => {
  const stored = typeof value === "object" && value !== null ? (value as Partial<TabZenSettings>) : {};
  const settings: TabZenSettings = {
    interventionEnabled:
      typeof stored.interventionEnabled === "boolean"
        ? stored.interventionEnabled
        : DEFAULT_SETTINGS.interventionEnabled,
    reminderThreshold: toInteger(stored.reminderThreshold, DEFAULT_SETTINGS.reminderThreshold),
    warningThreshold: toInteger(stored.warningThreshold, DEFAULT_SETTINGS.warningThreshold),
    interventionThreshold: toInteger(stored.interventionThreshold, DEFAULT_SETTINGS.interventionThreshold),
    cooldownHours: toInteger(stored.cooldownHours, DEFAULT_SETTINGS.cooldownHours)
  };

  return validateSettings(settings).length === 0 ? settings : DEFAULT_SETTINGS;
};

export const loadSettings = async (): Promise<TabZenSettings> => {
  const stored = await chrome.storage.local.get(SETTINGS_KEY);

  return normalizeSettings(stored[SETTINGS_KEY]);
};

export const saveSettings = async (settings: TabZenSettings): Promise<void> => {
  const errors = validateSettings(settings);

  if (errors.length > 0) {
    throw new Error(errors.join(" "));
  }

  await chrome.storage.local.set({ [SETTINGS_KEY]: settings });
};
