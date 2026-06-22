import "./styles.css";

const root = document.querySelector<HTMLDivElement>("#intervention");

if (!root) {
  throw new Error("Intervention root element was not found.");
}

type InterventionLevel = "reminder" | "warning" | "intervention";

type InterventionCopy = {
  eyebrow: string;
  title: string;
  summary: string;
};

const COPY_BY_LEVEL: Record<InterventionLevel, InterventionCopy> = {
  reminder: {
    eyebrow: "Gentle reminder",
    title: "Twenty tabs is a good moment to breathe.",
    summary: "Close the finished ones now and your future self gets a quieter browser."
  },
  warning: {
    eyebrow: "Tab warning",
    title: "Fifty tabs is a crowded room.",
    summary: "Pick a few conversations to keep, then let the rest leave gracefully."
  },
  intervention: {
    eyebrow: "Zen intervention",
    title: "A hundred tabs is a lot of weather.",
    summary: "Pause for a moment, close what no longer needs you, and let the browser breathe."
  }
};

const getLevel = (): InterventionLevel => {
  const level = new URLSearchParams(window.location.search).get("level");

  if (level === "reminder" || level === "warning" || level === "intervention") {
    return level;
  }

  return "intervention";
};

const dismissIntervention = async (): Promise<void> => {
  const tab = await chrome.tabs.getCurrent();

  if (tab?.id) {
    await chrome.tabs.remove(tab.id);
  }
};

const level = getLevel();
const copy = COPY_BY_LEVEL[level];

root.innerHTML = `
  <section class="intervention intervention-${level}" aria-labelledby="title">
    <img src="/assets/zen-mark.svg" width="112" height="112" alt="" />
    <p class="eyebrow">${copy.eyebrow}</p>
    <h1 id="title">${copy.title}</h1>
    <p class="summary">
      ${copy.summary}
    </p>
    <button id="dismiss" type="button">Return to tabs</button>
  </section>
`;

document.querySelector<HTMLButtonElement>("#dismiss")?.addEventListener("click", () => {
  void dismissIntervention();
});
