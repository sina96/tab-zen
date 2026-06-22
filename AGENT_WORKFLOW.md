# Tab-Zen Agent Workflow

This repository is designed to be developed by Codex using `/goal`.

## Startup Command

```text
/goal Execute AGENT_WORKFLOW.md until all tasks in AGENT_TASKS.md are completed.
```

## Token Usage Tracking

Before starting the goal, run:

/usage

After all stages are complete, run:

/usage

Record:
- start token usage
- end token usage
- estimated difference
- number of PRs merged
- average tokens per merged PR

---

# Project Principles

Tab-Zen is an open-source Chrome Extension that helps users achieve tab zen by:

- reducing tab clutter
- monitoring tab counts
- detecting duplicate tabs
- organizing tabs
- surfacing memory pressure
- encouraging healthy browsing habits

The project should remain:

- simple
- open source
- privacy friendly
- local-first
- telemetry-free

---

# Environment Requirements

The repository contains:

```text
.env.example
.gitignore
```

The developer will provide a local `.env`.

Example:

```env
GITHUB_TOKEN=github_pat_xxxxx
GH_TOKEN=github_pat_xxxxx
```

The real `.env` must never be committed.

Agents must never:

- print secrets
- commit secrets
- expose secrets in issues
- expose secrets in PRs
- expose secrets in logs
- expose secrets in screenshots

---

# Stage 0 Requirement

Before any implementation work:

1. Load environment variables.
2. Verify GitHub authentication.
3. Verify repository access.
4. Verify branch creation.
5. Verify PR creation.
6. Verify issue creation.

Required commands:

```bash
gh auth status
gh repo view
```

If any step fails:

- apply label `agent:blocked`
- explain the problem
- stop

---

# Agent Roles

## Dispatcher

Responsibilities:

- read AGENT_TASKS.md
- find next incomplete task
- dispatch work

Dispatcher must not:

- implement code
- review code
- merge code

---

## Builder

Responsibilities:

- implement one task
- create branch
- commit changes
- open PR
- respond to review feedback

Builder must not:

- approve PRs
- merge PRs
- start next task

---

## Reviewer

Responsibilities:

- review PRs
- verify scope
- verify correctness
- verify maintainability
- verify documentation

Reviewer must not:

- push commits
- merge PRs

---

## Merge Agent

Responsibilities:

- verify merge requirements
- merge approved PRs
- dispatch next task

Merge Agent must not:

- implement features

---

# Required Merge Gates

A PR may only be merged when:

- CI passes
- build passes
- lint passes
- typecheck passes
- CodeRabbit comments are resolved
- reviewer approval exists
- no unresolved review requests remain
- branch is up-to-date

---

# Workflow Loop

```text
Dispatcher
    ↓
Builder
    ↓
Open PR
    ↓
Reviewer
    ↓
CodeRabbit
    ↓
Builder fixes comments
    ↓
Reviewer
    ↓
Approved
    ↓
Merge Agent
    ↓
Dispatcher
```

Repeat until all tasks are complete.

---

# Labels

```text
agent:todo
agent:building
agent:pr-opened
agent:reviewing
agent:changes-requested
agent:fixing
agent:approved
agent:merge-ready
agent:merged
agent:blocked
```

---

# Stop Conditions

Stop if:

- all tasks are complete
- permissions are missing
- CI is unavailable
- GitHub access fails
- merge permissions fail
- a product decision is required

When stopping:

- add label `agent:blocked`
- explain why
- wait for human input
