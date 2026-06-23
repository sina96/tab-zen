import { DEFAULT_SETTINGS, loadSettings, saveSettings, validateSettings, type TabZenSettings } from "../settings";
import "./styles.css";

const root = document.querySelector<HTMLDivElement>("#options");

if (!root) {
  throw new Error("Options root element was not found.");
}

const renderStatus = (message: string, tone: "success" | "error"): void => {
  const status = document.querySelector<HTMLParagraphElement>("#status");

  if (!status) {
    return;
  }

  status.textContent = message;
  status.dataset.tone = tone;
};

const readForm = (): TabZenSettings => {
  const form = document.querySelector<HTMLFormElement>("#settings-form");
  const formData = new FormData(form ?? undefined);

  return {
    interventionEnabled: formData.get("interventionEnabled") === "on",
    reminderThreshold: Number(formData.get("reminderThreshold")),
    warningThreshold: Number(formData.get("warningThreshold")),
    interventionThreshold: Number(formData.get("interventionThreshold")),
    cooldownHours: Number(formData.get("cooldownHours"))
  };
};

const fillForm = (settings: TabZenSettings): void => {
  const enabled = document.querySelector<HTMLInputElement>("#interventionEnabled");
  const reminder = document.querySelector<HTMLInputElement>("#reminderThreshold");
  const warning = document.querySelector<HTMLInputElement>("#warningThreshold");
  const intervention = document.querySelector<HTMLInputElement>("#interventionThreshold");
  const cooldown = document.querySelector<HTMLInputElement>("#cooldownHours");

  if (enabled) {
    enabled.checked = settings.interventionEnabled;
  }

  if (reminder) {
    reminder.value = String(settings.reminderThreshold);
  }

  if (warning) {
    warning.value = String(settings.warningThreshold);
  }

  if (intervention) {
    intervention.value = String(settings.interventionThreshold);
  }

  if (cooldown) {
    cooldown.value = String(settings.cooldownHours);
  }
};

const renderOptions = (settings: TabZenSettings): void => {
  root.innerHTML = `
    <section class="options" aria-labelledby="title">
      <header>
        <p class="eyebrow">Tab-Zen</p>
        <h1 id="title">Settings</h1>
      </header>

      <form id="settings-form">
        <label class="toggle">
          <input id="interventionEnabled" name="interventionEnabled" type="checkbox" />
          <span>Enable Zen intervention</span>
        </label>

        <div class="field-grid">
          <label>
            <span>Reminder tabs</span>
            <input id="reminderThreshold" name="reminderThreshold" type="number" min="1" step="1" required />
          </label>
          <label>
            <span>Warning tabs</span>
            <input id="warningThreshold" name="warningThreshold" type="number" min="2" step="1" required />
          </label>
          <label>
            <span>Intervention tabs</span>
            <input id="interventionThreshold" name="interventionThreshold" type="number" min="3" step="1" required />
          </label>
          <label>
            <span>Cooldown hours</span>
            <input id="cooldownHours" name="cooldownHours" type="number" min="1" max="168" step="1" required />
          </label>
        </div>

        <div class="actions">
          <button type="submit">Save</button>
          <button id="reset" type="button">Reset</button>
        </div>
        <p id="status" aria-live="polite"></p>
      </form>
    </section>
  `;

  fillForm(settings);

  document.querySelector<HTMLFormElement>("#settings-form")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const nextSettings = readForm();
    const errors = validateSettings(nextSettings);

    if (errors.length > 0) {
      renderStatus(errors.join(" "), "error");
      return;
    }

    void saveSettings(nextSettings)
      .then(() => {
        renderStatus("Settings saved.", "success");
      })
      .catch(() => {
        renderStatus("Settings could not be saved.", "error");
      });
  });

  document.querySelector<HTMLButtonElement>("#reset")?.addEventListener("click", () => {
    fillForm(DEFAULT_SETTINGS);
    renderStatus("Defaults restored. Save to persist.", "success");
  });
};

const initializeOptions = async (): Promise<void> => {
  renderOptions(await loadSettings());
};

void initializeOptions();
