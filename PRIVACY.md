# Privacy Statement

Tab-Zen is designed to be local-first and telemetry-free.

## What Tab-Zen Reads

Tab-Zen uses Chrome extension APIs to read:

- Open tabs and windows
- Tab URLs and titles for local dashboard statistics and duplicate detection
- System memory information for local memory pressure status
- Local extension settings and cooldown timestamps

## What Tab-Zen Stores

Tab-Zen stores only local extension state in `chrome.storage.local`:

- Intervention thresholds
- Cooldown settings
- Whether interventions are enabled
- Last intervention timestamp and level

## What Tab-Zen Sends

Tab-Zen does not send browsing data anywhere.

The extension does not include telemetry, analytics, remote logging, advertising scripts, or external service calls.

## Permissions

Tab-Zen requests:

- `tabs` to count tabs, show domains, detect duplicates, and close confirmed duplicate tabs
- `system.memory` to show memory pressure status
- `storage` to persist local settings and cooldown state

## Data Removal

Uninstalling the extension removes its local extension storage. Users can also clear extension data through Chrome settings.
