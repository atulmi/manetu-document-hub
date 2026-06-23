# AI Document Hub

A React/TypeScript dashboard that demonstrates **AI agent orchestration** via the [Model Context Protocol (MCP)](https://modelcontextprotocol.io/), secured by the [Manetu Policy Engine (MPE)](https://manetu.github.io/policyengine). Every AI tool call is gated by fine-grained, role-based access control — and every policy decision is visible in a real-time audit log.

## What This Demonstrates

Most AI agent demos ignore security. This project puts it front and center:

- An AI agent (Claude) answers natural-language questions by reading documents from a sensitivity-tiered corpus
- Every document read and tool invocation is evaluated by the Manetu Policy Engine **before** execution
- A **role switcher** lets you instantly see what different users can access — a viewer can only read public docs, while a developer has full access
- A **live audit log** streams every allow/deny decision as it happens
- A **security demo toggle** lets you disable policy enforcement to show what happens without it

## Architecture

```
 User (Browser)
      |
      v
┌─────────────────────────────────────────────────────────┐
│  React Frontend (Vite + MUI + Zustand)                  │
│                                                         │
│  ┌──────────────┐ ┌──────────────┐ ┌─────────────────┐  │
│  │ Document     │ │ Agent Task   │ │ Audit Log       │  │
│  │ Library      │ │ Panel        │ │ Panel           │  │
│  │ (left)       │ │ (center)     │ │ (right)         │  │
│  └──────────────┘ └──────────────┘ └─────────────────┘  │
└────────────────────────┬────────────────────────────────┘
                         │ fetch /api/*
                         v
┌─────────────────────────────────────────────────────────┐
│  Express Backend Proxy (Node.js)                        │
│                                                         │
│  POST /api/agent/run  ──> Claude API + MCP tools        │
│  GET  /api/tools      ──> MCP tool list (filtered)      │
│  GET  /api/audit/stream ──> SSE audit events            │
│                                                         │
│  Every tool call passes through:                        │
│    ┌─────────────────────────────┐                      │
│    │  Manetu Policy Engine (MPE) │                      │
│    │  evaluate(role, MRN, op)    │                      │
│    │  → allow / deny             │                      │
│    └─────────────────────────────┘                      │
└─────────────────────────────────────────────────────────┘
                         │
                         v
┌─────────────────────────────────────────────────────────┐
│  MCP Filesystem Server                                  │
│  Tools: list-directory, read-file, search-files         │
│  Corpus: 15 docs across public/internal/confidential    │
└─────────────────────────────────────────────────────────┘
```

## Roles and Access

| Role | Public Docs | Internal Docs | Confidential Docs |
|------|:-----------:|:-------------:|:-----------------:|
| Viewer | Read | Denied | Denied |
| Developer | Read | Read | Read |
| Data Analyst | Read | Read | Denied |
| Auditor | Read | Read | Read (read-only) |
| Admin | Full | Full | Full |

## Quick Start

### Prerequisites

- Node.js 20+
- Docker (for MPE — optional, not yet required for frontend dev)

### Install and Run

```bash
git clone <repo-url>
cd manetu-ui-project
npm install

# Frontend only
npm run dev              # http://localhost:5173

# Frontend + backend
npm run dev:all          # Vite on :5173 + Express on :3001

# Backend only
npm run server:dev       # http://localhost:3001
```

### Environment Variables

Copy `.env.example` and fill in your keys:

```bash
cp .env.example .env
```

| Variable | Description |
|----------|-------------|
| `ANTHROPIC_API_KEY` | Claude API key (server-side only) |
| `MPE_BASE_URL` | Manetu Policy Engine URL (default: `http://localhost:8181`) |
| `MCP_DOCS_PATH` | Path to document corpus (default: `./docs-corpus`) |
| `PORT` | Backend server port (default: `3001`) |

## Document Corpus

15 realistic fake company documents in `docs-corpus/`:

| Tier | Count | Examples |
|------|-------|---------|
| **Public** | 5 | Company overview, product announcement, engineering blog, security FAQ, job postings |
| **Internal** | 5 | Team wiki, 2026 roadmap, incident postmortem, hiring pipeline, AI strategy draft |
| **Confidential** | 5 | Q3 financials, board update, M&A analysis, compensation bands, security audit |

Each document has YAML frontmatter with `title`, `sensitivity`, `category`, `author`, `date`, and `excerpt`.

## Testing

```bash
# Unit tests (Vitest + React Testing Library)
npm test                 # watch mode
npm run test:coverage    # single run with coverage

# E2E tests (Cypress)
npm run build && npm run preview   # start the preview server first
npm run cypress:open                # interactive mode
npm run cypress:run                 # headless (CI)
```

## Project Structure

```
src/
  components/
    dashboard/       App shell, header, panels, role switcher
    agent/           Agent task panel, step trace (planned)
    audit/           Audit log panel (planned)
    docs/            Document library browser (planned)
  hooks/             Custom React hooks
  lib/
    api.ts           Typed fetch wrapper (auto-attaches x-role header)
    store.ts         Zustand store (role, security, theme, agent state)
    theme.ts         MUI theme (dark/light mode)
  types/
    index.ts         All domain types (single source of truth)
  pages/
    Dashboard.tsx    Main page layout
  test/
    setup.ts         Vitest setup (jest-dom matchers, ResizeObserver mock)
    server.ts        MSW server for API mocking
server/
  index.ts           Express entry point
  routes/
    agent.ts         POST /api/agent/run (stub)
    tools.ts         GET /api/tools (stub)
    audit.ts         GET /api/audit/stream (stub)
  middleware/
    roleExtract.ts   x-role header validation
cypress/
  e2e/               E2E test specs
  fixtures/          Mock API responses
  support/           Custom commands (switchRole, toggleSecurity, etc.)
docs-corpus/
  public/            5 public documents
  internal/          5 internal documents
  confidential/      5 confidential documents
```

## CI/CD

GitHub Actions pipeline (`.github/workflows/ci.yml`) runs on every push to `main` and all PRs:

1. **Lint** — `eslint --max-warnings 0`
2. **Typecheck** — `tsc --noEmit` (frontend + server)
3. **Unit tests** — `vitest run --coverage`
4. **Build** — `vite build`
5. **Cypress E2E** — headless Chrome against `vite preview`

No API keys or Docker required in CI — Cypress tests use `cy.intercept()` to mock all backend calls.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript, MUI v7, Zustand |
| Backend | Express 5, Node.js 20 |
| AI | Claude (Anthropic SDK), Model Context Protocol |
| Policy Engine | Manetu Policy Engine (OPA-based) |
| Testing | Vitest, React Testing Library, MSW, Cypress |
| Build | Vite 7 |
| CI | GitHub Actions |

## Status

### Completed
- Project scaffolding and directory structure
- TypeScript domain types (single source of truth)
- MUI + Zustand setup with dark/light theme toggle
- Express backend with stubbed routes and role middleware
- Vitest + React Testing Library + MSW configuration
- Cypress E2E configuration with fixtures and custom commands
- Sample document corpus (15 docs across 3 sensitivity tiers)
- GitHub Actions CI pipeline (5-stage: lint, typecheck, test, build, e2e)
- Three-panel resizable layout (Document Library / Agent Task / Audit Log)
- Role switcher with color-coded roles and toast notifications
- Typed API fetch wrapper with automatic `x-role` header

### Planned
- Security demo toggle (on/off in header)
- Docker + MPE policy domain setup
- MPE client library and MCP filesystem client
- Claude agent orchestration loop
- Backend route implementations (tools, agent/run, audit/stream)
- Document library browser with sensitivity badges
- Agent task panel with step trace cards
- Live audit log panel with allow/deny streaming
- Full Cypress E2E test suites
