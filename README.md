# Tab-Zen

Tab-Zen is a local-first Chrome Extension for calmer tab management. It helps users see tab pressure, spot duplicate tabs, and receive lightweight interventions when browsing gets crowded.

## Features

- MV3 Chrome Extension foundation built with Vite and TypeScript
- Live tab count badge
- Popup dashboard with tab totals, window totals, top domains, memory pressure, and duplicate cleanup
- Safe duplicate cleanup that protects pinned tabs and asks for confirmation
- Playful intervention page with local cooldowns
- Options page for thresholds, cooldown, and intervention enablement
- Privacy-friendly by design: no telemetry, no analytics, no remote services

## Development

Install dependencies:

```bash
pnpm install
```

Run local checks:

```bash
pnpm run build
pnpm run lint
pnpm run typecheck
```

Build output is written to `dist/`. Load that folder in Chrome at `chrome://extensions` with Developer Mode enabled.

## Project Status

Tab-Zen is early-stage open source software. The current implementation is intentionally local and simple, with all browser data read through Chrome extension APIs and processed on device.

## Privacy

Tab-Zen does not collect, transmit, sell, or analyze browsing data outside the browser. See [PRIVACY.md](PRIVACY.md) for the full privacy statement.

## Contributing

Contributions are welcome. Please read [CONTRIBUTING.md](CONTRIBUTING.md) before opening issues or pull requests.

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE).
