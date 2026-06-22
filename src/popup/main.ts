import "./styles.css";

const app = document.querySelector<HTMLDivElement>("#app");

if (!app) {
  throw new Error("Popup root element was not found.");
}

type DomainStat = {
  domain: string;
  count: number;
};

type DashboardStats = {
  tabCount: number;
  windowCount: number;
  topDomains: DomainStat[];
  memory: MemoryStats;
  duplicateGroups: DuplicateGroup[];
};

type DuplicateGroup = {
  label: string;
  domain: string;
  tabs: chrome.tabs.Tab[];
  removableTabs: chrome.tabs.Tab[];
};

type MemoryState = "healthy" | "warm" | "spicy" | "critical";

type MemoryStats = {
  state: MemoryState;
  usedPercent: number;
  availableGb: number;
  totalGb: number;
};

const MAX_TOP_DOMAINS = 5;
const BYTES_PER_GB = 1024 ** 3;

const escapeHtml = (value: string): string =>
  value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "\"": "&quot;",
      "'": "&#39;"
    };

    return entities[character] ?? character;
  });

const formatDomain = (url?: string): string => {
  if (!url) {
    return "Internal pages";
  }

  try {
    const parsedUrl = new URL(url);

    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      return `${parsedUrl.protocol.replace(":", "")} pages`;
    }

    return parsedUrl.hostname.replace(/^www\./, "");
  } catch {
    return "Unknown";
  }
};

const countDomains = (tabs: chrome.tabs.Tab[]): DomainStat[] => {
  const domainCounts = new Map<string, number>();

  for (const tab of tabs) {
    const domain = formatDomain(tab.url);
    domainCounts.set(domain, (domainCounts.get(domain) ?? 0) + 1);
  }

  return [...domainCounts.entries()]
    .map(([domain, count]) => ({ domain, count }))
    .sort((first, second) => second.count - first.count || first.domain.localeCompare(second.domain))
    .slice(0, MAX_TOP_DOMAINS);
};

const normalizeTabUrl = (url?: string): string | null => {
  if (!url) {
    return null;
  }

  try {
    const parsedUrl = new URL(url);

    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      return null;
    }

    parsedUrl.hash = "";

    return parsedUrl.toString();
  } catch {
    return null;
  }
};

const getTabLabel = (tab: chrome.tabs.Tab): string => tab.title?.trim() || formatDomain(tab.url);

const findDuplicateGroups = (tabs: chrome.tabs.Tab[]): DuplicateGroup[] => {
  const groupedTabs = new Map<string, chrome.tabs.Tab[]>();

  for (const tab of tabs) {
    const normalizedUrl = normalizeTabUrl(tab.url);

    if (!normalizedUrl) {
      continue;
    }

    groupedTabs.set(normalizedUrl, [...(groupedTabs.get(normalizedUrl) ?? []), tab]);
  }

  return [...groupedTabs.entries()]
    .map(([, duplicateTabs]) => {
      const sortedTabs = [...duplicateTabs].sort((first, second) => Number(first.id ?? 0) - Number(second.id ?? 0));
      const pinnedTabs = sortedTabs.filter((tab) => tab.pinned);
      const unpinnedTabs = sortedTabs.filter((tab) => !tab.pinned);
      const tabsToKeep = pinnedTabs.length > 0 ? pinnedTabs : unpinnedTabs.slice(0, 1);
      const removableTabs = sortedTabs.filter((tab) => !tab.pinned && !tabsToKeep.includes(tab));
      const firstTab = sortedTabs[0];

      return {
        label: getTabLabel(firstTab),
        domain: formatDomain(firstTab.url),
        tabs: sortedTabs,
        removableTabs
      };
    })
    .filter((group) => group.tabs.length > 1)
    .sort((first, second) => second.removableTabs.length - first.removableTabs.length || first.label.localeCompare(second.label));
};

const calculateMemoryState = (usedPercent: number): MemoryState => {
  if (usedPercent >= 90) {
    return "critical";
  }

  if (usedPercent >= 75) {
    return "spicy";
  }

  if (usedPercent >= 60) {
    return "warm";
  }

  return "healthy";
};

const formatGb = (bytes: number): number => Number((bytes / BYTES_PER_GB).toFixed(1));

const loadMemoryStats = async (): Promise<MemoryStats> => {
  const memory = await chrome.system.memory.getInfo();
  const usedBytes = memory.capacity - memory.availableCapacity;
  const usedPercent = Math.round((usedBytes / memory.capacity) * 100);

  return {
    state: calculateMemoryState(usedPercent),
    usedPercent,
    availableGb: formatGb(memory.availableCapacity),
    totalGb: formatGb(memory.capacity)
  };
};

const loadStats = async (): Promise<DashboardStats> => {
  const [tabs, windows, memory] = await Promise.all([
    chrome.tabs.query({}),
    chrome.windows.getAll(),
    loadMemoryStats()
  ]);

  return {
    tabCount: tabs.length,
    windowCount: windows.length,
    topDomains: countDomains(tabs),
    memory,
    duplicateGroups: findDuplicateGroups(tabs)
  };
};

const renderLoading = (): void => {
  app.innerHTML = `
    <main class="shell" aria-busy="true">
      <p class="eyebrow">Tab-Zen</p>
      <h1>Reading tabs...</h1>
      <p class="summary">Preparing your local dashboard.</p>
    </main>
  `;
};

const renderError = (): void => {
  app.innerHTML = `
    <main class="shell" role="alert">
      <p class="eyebrow">Tab-Zen</p>
      <h1>Dashboard unavailable</h1>
      <p class="summary">Chrome did not return tab statistics. Try reopening the popup.</p>
    </main>
  `;
};

const renderDomains = (domains: DomainStat[]): string => {
  if (domains.length === 0) {
    return `
      <p class="empty-state">No open tabs yet.</p>
    `;
  }

  return `
    <ol class="domain-list">
      ${domains
        .map(
          (domain) => `
            <li>
              <span>${escapeHtml(domain.domain)}</span>
              <strong>${domain.count}</strong>
            </li>
          `
        )
        .join("")}
    </ol>
  `;
};

const getDuplicateSummary = (groups: DuplicateGroup[]): { duplicateCount: number; removableCount: number } => ({
  duplicateCount: groups.reduce((total, group) => total + group.tabs.length - 1, 0),
  removableCount: groups.reduce((total, group) => total + group.removableTabs.length, 0)
});

const renderDuplicateGroups = (groups: DuplicateGroup[]): string => {
  if (groups.length === 0) {
    return `
      <p class="empty-state">No duplicate tabs found.</p>
    `;
  }

  return `
    <ul class="duplicate-list">
      ${groups
        .map(
          (group) => `
            <li>
              <div>
                <span>${escapeHtml(group.label)}</span>
                <small>${escapeHtml(group.domain)} · ${group.tabs.length} copies</small>
              </div>
              <strong>${group.removableTabs.length}</strong>
            </li>
          `
        )
        .join("")}
    </ul>
  `;
};

const cleanupDuplicateTabs = async (groups: DuplicateGroup[]): Promise<void> => {
  const removableUrls = new Set(
    groups
      .flatMap((group) => group.removableTabs)
      .map((tab) => normalizeTabUrl(tab.url))
      .filter((url): url is string => typeof url === "string")
  );

  if (removableUrls.size === 0) {
    return;
  }

  const currentTabs = await chrome.tabs.query({});
  const currentDuplicateGroups = findDuplicateGroups(currentTabs);
  const currentTabIds = currentDuplicateGroups
    .flatMap((group) => group.removableTabs)
    .filter((tab) => {
      const normalizedUrl = normalizeTabUrl(tab.url);

      return normalizedUrl ? removableUrls.has(normalizedUrl) : false;
    })
    .map((tab) => tab.id)
    .filter((tabId): tabId is number => typeof tabId === "number");

  if (currentTabIds.length === 0) {
    await initializeDashboard();
    return;
  }

  const confirmed = window.confirm(
    `Close ${currentTabIds.length} duplicate unpinned tab${currentTabIds.length === 1 ? "" : "s"}?`
  );

  if (!confirmed) {
    return;
  }

  await chrome.tabs.remove(currentTabIds);
  await initializeDashboard();
};

const renderDashboard = (stats: DashboardStats): void => {
  const duplicateSummary = getDuplicateSummary(stats.duplicateGroups);

  app.innerHTML = `
    <main class="dashboard" aria-labelledby="title">
      <header class="header">
        <p class="eyebrow">Tab-Zen</p>
        <h1 id="title">Dashboard</h1>
      </header>

      <section class="metric-grid" aria-label="Browsing totals">
        <article class="metric">
          <span>Total tabs</span>
          <strong>${stats.tabCount}</strong>
        </article>
        <article class="metric">
          <span>Windows</span>
          <strong>${stats.windowCount}</strong>
        </article>
      </section>

      <section class="memory memory-${stats.memory.state}" aria-labelledby="memory-title">
        <div>
          <h2 id="memory-title">Memory pressure</h2>
          <p>${stats.memory.usedPercent}% used</p>
        </div>
        <strong>${stats.memory.state}</strong>
        <span>${stats.memory.availableGb} GB free of ${stats.memory.totalGb} GB</span>
      </section>

      <section class="domains" aria-labelledby="domains-title">
        <div class="section-heading">
          <h2 id="domains-title">Top domains</h2>
          <span>${stats.topDomains.length}</span>
        </div>
        ${renderDomains(stats.topDomains)}
      </section>

      <section class="cleanup" aria-labelledby="cleanup-title">
        <div class="section-heading">
          <h2 id="cleanup-title">Duplicate cleanup</h2>
          <span>${duplicateSummary.duplicateCount}</span>
        </div>
        <p class="cleanup-summary">
          ${duplicateSummary.removableCount} unpinned duplicate ${duplicateSummary.removableCount === 1 ? "tab" : "tabs"} can be closed safely.
        </p>
        ${renderDuplicateGroups(stats.duplicateGroups)}
        <button id="cleanup-duplicates" type="button" ${duplicateSummary.removableCount === 0 ? "disabled" : ""}>
          Close duplicates
        </button>
      </section>
    </main>
  `;

  document.querySelector<HTMLButtonElement>("#cleanup-duplicates")?.addEventListener("click", () => {
    void cleanupDuplicateTabs(stats.duplicateGroups);
  });
};

const initializeDashboard = async (): Promise<void> => {
  renderLoading();

  try {
    renderDashboard(await loadStats());
  } catch {
    renderError();
  }
};

void initializeDashboard();
