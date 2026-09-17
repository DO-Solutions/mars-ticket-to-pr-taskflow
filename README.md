# TaskFlow API

A deliberately small task-tracking service. It exists to be **worked on by an AI
agent**: it is the target repository for the MARS "ticket → pull request" demo.
The agent clones this repo, fixes the ticket it was handed, and opens a PR.

See [`DO-Solutions/mars-ticket-to-pr-console`](https://github.com/DO-Solutions/mars-ticket-to-pr-console)
for the demo application and the full setup.

## Running it

```bash
npm install
npm start          # listens on :3000
npm test           # 6 passing, 4 skipped — this is the expected baseline
```

## API

| Method | Path | Notes |
|---|---|---|
| `GET` | `/health` | liveness |
| `GET` | `/tasks` | supports `?status=` and `?sort=dueDate` |
| `GET` | `/tasks/:id` | 404 when unknown |
| `POST` | `/tasks` | body: `{ title, status?, dueDate? }` |

## The seeded backlog

Four known issues are present on `main`, each mapping to a ticket on the demo
board. Three have a regression test already written and marked `it.skip(...)`;
the agent's job is to un-skip it and make it pass.

| Ticket | Type | Issue |
|---|---|---|
| TF-101 | Bug | `GET /tasks?status=done` ignores the filter and returns everything |
| TF-102 | Bug | `?sort=dueDate` puts tasks with no due date first instead of last |
| TF-103 | Feature | no `?limit` / `?offset` pagination (no test written — the agent writes it) |
| TF-104 | Chore | `POST /tasks` accepts a missing or blank `title` instead of returning 400 |

`npm test` is green on `main` by design, so a PR that fixes a ticket produces a
visible, meaningful diff. Restore this state at any time with
`./scripts/reseed.sh`.

Contribution rules live in [`AGENTS.md`](AGENTS.md) — the review agent judges
pull requests against that file.
