# Security Policy

## Reporting a Vulnerability
Please **do not** open public issues for security problems.
Instead, contact the maintainers privately with:
- Steps to reproduce
- Impacted pages/components
- Any suggested mitigations

## Practices
- Only read `NEXT_PUBLIC_*` values on the client (see `src/config/config.ts`).
- Never log access tokens or PII to the browser console.
- Validate external inputs (URL params, query) before use.
- Keep dependencies updated; CI should fail on critical vulns.

## Headers & Origin
- Use strict CORS on the backend.
- Prefer `https` in production.

## Secret Handling
- Do not commit `.env*` files.
- All client-side keys must be **public** (`NEXT_PUBLIC_*`). Server secrets belong in the backend.
