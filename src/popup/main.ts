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
};

const MAX_TOP_DOMAINS = 5;

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

const loadStats = async (): Promise<DashboardStats> => {
  const [tabs, windows] = await Promise.all([
    chrome.tabs.query({}),
    chrome.windows.getAll()
  ]);

  return {
    tabCount: tabs.length,
    windowCount: windows.length,
    topDomains: countDomains(tabs)
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

const renderDashboard = (stats: DashboardStats): void => {
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

      <section class="domains" aria-labelledby="domains-title">
        <div class="section-heading">
          <h2 id="domains-title">Top domains</h2>
          <span>${stats.topDomains.length}</span>
        </div>
        ${renderDomains(stats.topDomains)}
      </section>
    </main>
  `;
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
