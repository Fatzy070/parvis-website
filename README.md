# Parvis frontend

React 19, Vite 7, React Router, and TanStack Query. See the workspace [setup guide](../README.md) and [engineering report](../docs/ENGINEERING_REPORT.md).

Use Node 22.12+. Run `npm ci`, then `npm run dev`. The default `/api` proxy targets localhost:3000. Configure missing values using `.env.example` without overwriting an existing `.env`.

Validation: `npm run lint`, `npm run build`, `npm test`. Browser integration setup is documented in the workspace README. No runtime demo or fallback data is included.
