# Contributing

Thanks for helping improve Tab-Zen.

## Principles

- Keep the extension local-first.
- Do not add telemetry, analytics, trackers, or remote logging.
- Keep permissions minimal and explain any permission changes in the pull request.
- Preserve Manifest V3 compatibility.
- Keep changes scoped to one purpose.

## Setup

```bash
pnpm install
pnpm run build
pnpm run lint
pnpm run typecheck
```

## Pull Requests

Before opening a pull request:

- Run `pnpm run build`.
- Run `pnpm run lint`.
- Run `pnpm run typecheck`.
- Confirm `.env` and generated build output are not committed.
- Describe privacy or permission impact.

## Issues

Please include:

- Browser and Chrome version
- Extension version or commit
- Steps to reproduce
- Expected behavior
- Actual behavior

Avoid sharing private browsing data in issues. Redact URLs, titles, screenshots, and tab names when needed.
