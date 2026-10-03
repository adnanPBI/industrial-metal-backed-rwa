# ReserveChain hosted contest demo

Run with Node 22+:

```bash
node server.mjs
```

The server has no third-party runtime dependency. It serves the responsive site and provides `/api/health`, `/api/assets`, `/api/waitlist`, email verification and optional token-protected admin audit/waitlist APIs.

Data is stored as JSON Lines under `data/` for the contest demonstration only. Production persistence is the WordPress/custom-table implementation or the later isolated platform services described in `../docs/ARCHITECTURE.md`.
