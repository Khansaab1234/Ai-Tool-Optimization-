# ASET TRONICS — AI CNC Programming & Tool Optimization

AI-powered manufacturing platform for tool / CNC manufacturing companies. It helps plan
machining operations, calculate cutting parameters, optimize tools, generate CNC
programs, and manage production (PPC).

Built with **Next.js** (frontend) + **Express.js** (backend) in a simple monorepo.

![stack](https://img.shields.io/badge/stack-Next.js%20%2B%20Express-2563eb) ![license](https://img.shields.io/badge/license-MIT-green)

## Features

- **Dashboard** — cycle time, tool cost, machining cost, efficiency, machine utilization.
- **Cutting Calculator** — Milling / Turning / Drilling: spindle speed (N), feed rate (Vf),
  MRR, power, torque — using real machining formulas.
- **Tool Optimization** — recommends better tools and improved feeds/speeds and estimates
  time & cost savings.
- **CNC Programming** — auto-generates a G-code (ISO) program from an operations plan.
- **Operations Plan** — sequence of operations with machine, time, and totals.
- **Tool Library** — searchable catalog of cutting tools.
- **PPC Planner** — production plan summary with status and progress.
- **AI Assistant** — rule-based assistant answering machining / optimization questions.
- **Reports** — summarized project KPIs.

> Data is stored in a lightweight JSON file store (no database install needed). The
> service layer is modular, so swapping in MongoDB / PostgreSQL later is straightforward.

## Project structure

```
aset-tronics/
├── backend/        # Express.js REST API + machining engine + JSON store
│   └── src/
│       ├── routes/     # API endpoints
│       ├── services/   # machining formulas, optimizer, cnc generator, store
│       └── data/       # seed + persisted db.json
└── frontend/       # Next.js (App Router) dashboard UI
    ├── app/            # pages
    ├── components/     # UI components
    └── lib/            # API client
```

## Quick start

You need **Node.js 18+**.

### 1. Backend (API on http://localhost:4000)

```bash
cd backend
npm install
npm run dev
```

### 2. Frontend (UI on http://localhost:3000)

Open a **second terminal**:

```bash
cd frontend
npm install
npm run dev
```

Now open http://localhost:3000

> The frontend reads the API base URL from `NEXT_PUBLIC_API_URL`
> (defaults to `http://localhost:4000`). To change it, create `frontend/.env.local`.

## API overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET  | `/api/health` | health check |
| GET  | `/api/dashboard` | dashboard KPIs |
| GET / POST | `/api/projects` | list / create projects |
| GET  | `/api/tools` | tool library |
| GET  | `/api/operations` | operations plan |
| POST | `/api/calculator/milling` | milling calculation |
| POST | `/api/calculator/turning` | turning calculation |
| POST | `/api/calculator/drilling` | drilling calculation |
| POST | `/api/optimize` | tool / strategy optimization |
| POST | `/api/cnc/generate` | generate G-code program |
| GET  | `/api/ppc` | production plan |
| POST | `/api/assistant` | ask the assistant |

## License

MIT © ASET TRONICS
