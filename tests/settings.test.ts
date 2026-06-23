import { describe, expect, it } from "vitest";
import { DEFAULT_SETTINGS, validateSettings } from "../src/settings";

describe("validateSettings", () => {
  it("accepts the default settings", () => {
    expect(validateSettings(DEFAULT_SETTINGS)).toEqual([]);
  });

  it("requires ordered intervention thresholds", () => {
    expect(
      validateSettings({
        ...DEFAULT_SETTINGS,
        reminderThreshold: 10,
        warningThreshold: 10,
        interventionThreshold: 20
      })
    ).toContain("Warning threshold must be higher than reminder threshold.");

    expect(
      validateSettings({
        ...DEFAULT_SETTINGS,
        reminderThreshold: 10,
        warningThreshold: 20,
        interventionThreshold: 20
      })
    ).toContain("Intervention threshold must be higher than warning threshold.");
  });

  it("bounds cooldowns to one week", () => {
    expect(validateSettings({ ...DEFAULT_SETTINGS, cooldownHours: 0 })).toContain(
      "Cooldown must be between 1 and 168 hours."
    );
    expect(validateSettings({ ...DEFAULT_SETTINGS, cooldownHours: 169 })).toContain(
      "Cooldown must be between 1 and 168 hours."
    );
  });
});
