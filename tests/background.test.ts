import { beforeEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_SETTINGS } from "../src/settings";

const addListener = vi.fn();

beforeEach(() => {
  vi.resetModules();
  addListener.mockReset();
  vi.stubGlobal("chrome", {
    action: {
      setBadgeBackgroundColor: vi.fn(),
      setBadgeText: vi.fn()
    },
    runtime: {
      getURL: vi.fn((path: string) => `chrome-extension://tab-zen/${path}`),
      onInstalled: { addListener },
      onStartup: { addListener }
    },
    storage: {
      local: {
        get: vi.fn(),
        set: vi.fn()
      }
    },
    tabs: {
      create: vi.fn(),
      query: vi.fn(),
      onAttached: { addListener },
      onCreated: { addListener },
      onDetached: { addListener },
      onRemoved: { addListener }
    },
    windows: {
      onCreated: { addListener },
      onRemoved: { addListener }
    }
  });
});

describe("background intervention decisions", () => {
  it("maps tab counts to configured intervention levels", async () => {
    const { getInterventionLevel } = await import("../src/background");

    expect(getInterventionLevel(19, DEFAULT_SETTINGS)).toBeNull();
    expect(getInterventionLevel(20, DEFAULT_SETTINGS)).toBe("reminder");
    expect(getInterventionLevel(50, DEFAULT_SETTINGS)).toBe("warning");
    expect(getInterventionLevel(100, DEFAULT_SETTINGS)).toBe("intervention");
  });

  it("respects cooldown for repeated or lower-priority interventions", async () => {
    const { shouldRespectCooldown } = await import("../src/background");
    const now = Date.UTC(2026, 5, 23, 12);
    const twoHoursAgo = now - 2 * 60 * 60 * 1000;

    expect(
      shouldRespectCooldown("warning", { level: "warning", timestamp: twoHoursAgo }, now, 24)
    ).toBe(true);
    expect(
      shouldRespectCooldown("reminder", { level: "warning", timestamp: twoHoursAgo }, now, 24)
    ).toBe(true);
  });

  it("allows escalation during cooldown and repeats after cooldown expires", async () => {
    const { shouldRespectCooldown } = await import("../src/background");
    const now = Date.UTC(2026, 5, 23, 12);
    const twoHoursAgo = now - 2 * 60 * 60 * 1000;
    const twoDaysAgo = now - 48 * 60 * 60 * 1000;

    expect(
      shouldRespectCooldown("intervention", { level: "warning", timestamp: twoHoursAgo }, now, 24)
    ).toBe(false);
    expect(
      shouldRespectCooldown("warning", { level: "warning", timestamp: twoDaysAgo }, now, 24)
    ).toBe(false);
  });
});
