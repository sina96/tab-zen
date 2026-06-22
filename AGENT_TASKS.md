# Tab-Zen

Achieve tab enlightenment.

Tab-Zen helps users reduce browser clutter through visibility, cleanup tools, and playful interventions.

---

# Stage 0 - Environment Validation

Goal:

Verify the automation environment.

Tasks:

- verify `.env`
- verify GitHub authentication
- verify issue creation
- verify branch creation
- verify push access
- verify PR creation
- verify label management

Acceptance Criteria:

- GitHub automation works end-to-end

PR Title:

```text
Stage 0: Validate automation environment
```

---

# Stage 1 - Extension Scaffold

Goal:

Create a minimal Chrome Extension MV3 foundation.

Tasks:

- manifest.json
- TypeScript
- Vite
- background service worker
- popup entrypoint
- build scripts
- lint scripts
- typecheck scripts

Acceptance Criteria:

- extension loads in Chrome
- build succeeds
- lint succeeds
- typecheck succeeds

PR Title:

```text
Stage 1: Create Tab-Zen scaffold
```

---

# Stage 2 - Tab Counter

Goal:

Display tab count in extension badge.

Tasks:

- count tabs
- update badge
- refresh on tab events

Acceptance Criteria:

- badge updates automatically

PR Title:

```text
Stage 2: Add tab counter badge
```

---

# Stage 3 - Dashboard

Goal:

Display useful browsing statistics.

Tasks:

- total tabs
- total windows
- top domains
- empty states
- error states

Acceptance Criteria:

- popup displays live statistics

PR Title:

```text
Stage 3: Add dashboard
```

---

# Stage 4 - Memory Awareness

Goal:

Display system memory status.

Tasks:

- memory permission
- memory information
- memory status calculation

States:

```text
healthy
warm
spicy
critical
```

Acceptance Criteria:

- memory status visible

PR Title:

```text
Stage 4: Add memory awareness
```

---

# Stage 5 - Zen Intervention

Goal:

Provide playful intervention when tab usage becomes excessive.

Tasks:

- intervention page
- local assets
- cooldown logic
- dismiss support

Default thresholds:

```text
20 tabs = reminder
50 tabs = warning
100 tabs = intervention
```

Acceptance Criteria:

- intervention appears correctly
- cooldown prevents spam

PR Title:

```text
Stage 5: Add Zen intervention
```

---

# Stage 6 - Cleanup Tools

Goal:

Help users reduce clutter.

Tasks:

- duplicate tab detection
- duplicate tab cleanup
- optional domain grouping
- confirmation dialogs
- protect pinned tabs

Acceptance Criteria:

- duplicate cleanup works safely

PR Title:

```text
Stage 6: Add cleanup tools
```

---

# Stage 7 - Settings

Goal:

Allow user customization.

Tasks:

- options page
- thresholds
- cooldown settings
- enable/disable intervention
- validation

Acceptance Criteria:

- settings persist

PR Title:

```text
Stage 7: Add settings
```

---

# Stage 8 - Open Source Release

Goal:

Prepare repository for public release.

Tasks:

- README
- LICENSE
- CONTRIBUTING
- issue templates
- PR template
- screenshots
- privacy statement

Acceptance Criteria:

- repository ready for public contributors

PR Title:

```text
Stage 8: Open-source release preparation
```
