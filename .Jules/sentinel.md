## 2024-05-23 - [Hardcoded CSRF Secret Removal]
**Vulnerability:** Found a hardcoded fallback string `'asset3d-csrf-secret'` for `CSRF_SECRET` environment variable in `server/src/modules/security/tokens/csrfToken.js`.
**Learning:** Fallback secrets in code are dangerous because they can be easily discovered by attackers if the source is leaked or open-sourced, allowing them to forge tokens if the deployment environment misses the variable. It also encourages lax ops practices where secrets are not properly configured.
**Prevention:** Strictly enforce the presence of security-critical environment variables and fail fast if they are missing. This forces the deployment process to handle secrets correctly.
