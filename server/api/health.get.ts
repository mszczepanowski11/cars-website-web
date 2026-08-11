import { defineEventHandler } from 'h3'

// CTO audit finding: neither railway.json wired a healthcheckPath, so Railway couldn't gate
// traffic cutover on the app actually being ready to serve requests. This is a lightweight,
// unauthenticated liveness check (no DB/backend-API dependency - the frontend itself has no
// database) for Railway's deploy healthcheck to poll.
export default defineEventHandler(() => ({ status: 'ok' }))
