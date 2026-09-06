# House of Jazzu — Canonical Nia Runtime

## Canonical Application

This directory is the sole active Nia development/runtime tree.

- Application: Nia Capital OS
- Version: 1.0.0
- Node entrypoint: `server-watson.js`
- Package start command: `npm start`
- Primary executive interface: `/executive-v2.html`
- API prefix: `/api`

## Runtime Boundary

ONLY `server-watson.js` is the canonical application server.

The following are historical/reference entrypoints and must not be used
as the canonical runtime:

- `server-backup.js`
- `server-basic.js`
- `api/server.js`
- `NIA-execution-preunlock-20260905-223518/server-watson.js`

## Governance

- Autonomous execution: DISABLED
- Human approval: REQUIRED
- Direct execution endpoint: DISABLED
- External grant submission: NOT performed by Nia
- Portal submission: HUMAN ACTION REQUIRED
- Production: NOT touched by canonical development

## Deployment Rule

All future application changes are made in this directory first.

Recovery and historical trees remain preserved separately.
