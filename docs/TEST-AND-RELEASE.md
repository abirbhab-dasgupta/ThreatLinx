# ThreatLinx — Verification and release checklist

This document distinguishes source checks performed during delivery from integration tests that **must be run** in a credentialed environment. It is not evidence that the entire production stack has passed end-to-end testing.

## Live verification — 9 November 2026 (Asia/Calcutta)

Tested the running application at http://localhost:3000 against the configured Neon database and Inngest workers. No separate public deployment URL was supplied. The checks below supersede the historical source-only results further down this file.

### Follow-up: moderator, reports, registry and Campaign DNA

- Tested the existing verified moderator and investigator accounts. Moderator routes and APIs work; investigator and signed-out requests cannot read moderator evidence or publication status.
- Added moderator-only technical evidence inspection for the reporter's exact URL and completed scan. It shows real findings and provider states without requiring access to the reporter's private investigation route.
- Fixed scan serialization to project documented public fields rather than spreading database rows. Added a regression test to prevent account identifiers and unrelated database fields entering evidence responses.
- Review decisions are now final. Same-decision retries return success without changing reviewed_at; conflicting decisions return 409. The database update also checks pending status to prevent concurrent overwrites.
- A completed independent reputation, TLS, security or browser check is required; URL heuristics alone cannot approve or publish a report.
- New neutral QA report c86ec4ce-87ea-477a-b1b9-55ac59286473 was blocked from publication while pending, then approved after its matching scan completed. Rejection of neutral QA report cc954ffb-3a48-43a6-90ea-3e6884f36e0a blocked its publication and excluded it from the verified feed. The investigator can still see its rejected status in their submissions.
- Repeated publication of the original confirmed proof returned the actual transaction and created no new write. The real snapshot matched the chain; changing a local copy changed its digest.
- Publication retries reuse prepared evidence, preserve submitted transaction hashes, deduplicate queued dispatches and return explicit queue failures. The worker rechecks review eligibility and snapshot hash before writing.
- Moderation now loads saved publication states and polls queued/publishing records. Browser testing observed the new report automatically transition from waiting for confirmation to registered, with a working proof link. Failed registration exposes a retry action.
- Following explicit owner approval, published the new QA report on Base Sepolia: https://sepolia.basescan.org/tx/0x397b6bbb717c65edc4908660d9262c7e43fff7f635e52db4766ec544c3af435a . Its public verification returned a matching local and on-chain digest. The Proof Registry Verify Digest button visibly reported a match.
- Campaign DNA matched the investigator's own message cases with reviewed reports while keeping those private message IDs out of moderator campaign results. Duplicate links from one case do not manufacture a cluster. Queries now select recent submissions deterministically; campaign members link to their underlying message or reviewed community report.
- The campaign report deep link resolved to its exact Community Reports anchor. Expanded moderator evidence had no page overflow at 390 px.
- Browser screenshot: screenshots/proof-registry-retest.jpg. Repeatable API coverage: scripts/test-report-workflows.mjs. That script creates two labelled neutral reports and does not send a new blockchain transaction.
- Final checks: 18 unit tests, 3 local contract tests, typecheck, lint and production build passed. Existing environment values and authentication configuration were preserved.
- Real provider-outage and failed-transaction recovery were not deliberately induced in the shared live environment; these paths received source review, not an outage experiment. No source parsing is counted as end-to-end evidence.

### Follow-up: Message Intelligence and homepage routing

- Retested SMS, email, social and other inputs through the running APIs and Inngest. All four completed with genuine Gemini explanations, correct redaction, expected classifications and matching history entries.
- Linked cases completed their website scans. Message-only cases created no linked scans; private-IP links were rejected.
- Short text, text above 6000 characters and invalid source types returned 400; signed-out message creation returned 401.
- Signed-in requests to /, /sign-in and /sign-up returned redirects to /dashboard. Signed-out / remained the public landing page. Browser navigation to / also visibly reached /dashboard.
- Browser inspection confirmed the SMS result, redacted OTP, language indicators, AI observations, precautions and completed linked website evidence.
- Repeatable test: scripts/test-message-intelligence.mjs, using the existing QA credential environment variables.
- Screenshot: screenshots/message-intelligence-test.jpg.

### Executed quality gates

- TypeScript: passed with a clean non-incremental check.
- ESLint: passed, zero errors and zero warnings.
- Unit tests: 18 passed, including Safe Browsing decoding, malformed responses, OTP redaction, independent review gating, immutable decisions, campaign deduplication and serializer privacy.
- Production Next.js build: passed.
- Hardhat: compiled successfully; 3 contract tests passed, covering immutable registration, invalid commitments and unauthorized publication.
- Database check: connected to Neon; all expected auth, product, message and commitment tables exist. No migrations or resets were required.

### Live journeys and access controls

- Supplied investigator account: sign-in, server-rendered workspace routes, authenticated API reads, sign-out and session invalidation passed.
- A separate generated QA account was created to test signup, minimum password validation and cross-account scan/message access (404). Signed-out workspace navigation redirects to sign-in; private API reads return 401.
- Invalid record IDs return 400. Private/local URLs, non-HTTP targets and sensitive authentication paths are rejected. Cross-origin mutation returns 403. Short message validation passed.
- Non-moderator review and publication requests return 403.
- Standard website investigation completed. An extended example.com investigation completed every provider: URL rules, Google Safe Browsing, TLS, Mozilla Observatory and a private urlscan.io scan. Result: low risk, indicator score 0, high evidence confidence, separate HTTP posture F. This is not a safety guarantee.
- Safe Browsing independently returned a no-match result for example.com and a known-threat result for Google's official phishing test URL. Binary responses are now decoded instead of being parsed as JSON.
- Direct TLS checks passed for example.com and correctly reported invalid certificates for expired.badssl.com and wrong.host.badssl.com. OS DNS resolution is used, all resolved addresses must remain public, and the connection is pinned to a validated address.
- Synthetic SMS, email and social cases completed with linked website investigations. Newly submitted whitespace-delimited OTP values are redacted before storage and AI analysis. Exact-domain Campaign DNA correlation passed.
- Gemini's configured gemini-2.5-flash returned 404. The provider-recommended Flash model and latest alias timed out during diagnostics. The current gemini-3.5-flash-lite model succeeded; both explanation paths now use a configurable fallback only for model-not-found responses. Real message and website explanation generation passed. A final Other-source, message-only case completed through Inngest with genuine AI output and OTP redaction. Failed AI calls are time-bounded and explicitly labelled as AI unavailable. Existing .env.local was not changed.
- One clearly labelled, neutral example.com QA report was submitted. It makes no allegation and is categorized other.
- At the owner's explicit approval, abdasgupta@gmail.com was created using the supplied QA password and provisioned as the allowlisted verified moderator. This was administrative provisioning; no verification email was sent. Existing users were not modified.
- Moderator login, moderation page, technical-evidence review, testnet publication, public verification and moderator logout passed.

### Testnet proof

- Report: 0804df71-0ccd-4dac-b3e2-c66c51914d1f
- Contract: 0x81c28ab694d98Fc34538c3d0260CD21cde0acB77
- Chain: Base Sepolia, 84532
- Transaction: https://sepolia.basescan.org/tx/0x43786dee9430735106bbaf5b0724164f0d89807ada1a4741aca9cc9a4d08798f
- Public app path: /proof/0804df71-0ccd-4dac-b3e2-c66c51914d1f
- Recomputed, database and on-chain digests matched. The public page visibly reported EVIDENCE INTEGRITY VERIFIED.
- Current screenshot: screenshots/verified-proof.jpg

### Browser interaction checks

- Evidence graph rendering, zoom, certificate-chain tab, provider tab and JSON evidence download passed.
- Investigation search and completed filter passed. Corrected flagged filtering to include high-risk and confirmed-malicious verdicts; corrected result heading to show all current verdict categories.
- Mobile menu open, Escape dismissal and body-scroll restoration passed.
- Investigation detail and public proof had no page overflow at 320, 390, 768 and 1440 px. Fixed history-table overflow; dashboard recheck at 390 px passed. Graph node styles now override the library's white default nodes.
- Message page now opens message intake by default. Failed cases explicitly show interrupted status. Report confirmation reflects actual queue dispatch outcome; failed linked jobs no longer remain queued indefinitely.

### Limits and follow-up

- Google OAuth was rendered but not authenticated with a separate Google identity. Outbound verification email delivery is not configured or tested.
- Clipboard write was exercised but could not be independently confirmed through the embedded browser clipboard API.
- Browser evidence covers the named workflows and widths, not every device, accessibility combination or provider outage. Older stored reports retain their original provider failures and explanation text; they were not rewritten.
- npm audit reports 25 transitive dependency findings (13 high, 12 moderate), largely involving older Zod copies in Hardhat/Inngest and development tooling. Automated suggested fixes include incompatible downgrades. No forced downgrade or major schema-library override was applied.
- QA accounts and labelled QA records were retained; no user data was deleted. The approved neutral test commitment is public and immutable.

### Repeatable diagnostics

- scripts/check-integrations.ts: read-only live provider and registry checks, plus synthetic Gemini generation.
- scripts/test-live.mjs: use THREATLINX_TEST_EMAIL and THREATLINX_TEST_PASSWORD environment variables; creates labelled QA data and exercises investigator workflows.
- scripts/test-auth-boundaries.mjs: creates a generated QA account and tests ownership/session boundaries.
- scripts/test-moderation.mjs: requires an existing verified moderator and a labelled QA report. Obtain explicit authorization before executing its review/publication steps; it never grants privileges.

## Historical source-only checks (8 November 2026)

- TypeScript/TSX/JavaScript: 112 source and test files parsed successfully using the TypeScript parser; no syntax errors.
- Project import graph: project-relative and `@/` imports resolved against project files; no missing local imports detected.
- CSS: Next.js global and product styles parsed successfully using PostCSS.
- Logic smoke checks: 12 offline assertions passed covering message redaction, URL extraction, heuristic classification, exact-domain correlation, canonical report serialization and tamper detection. **The third-party `tldts` and `viem` functions were stubbed**, so these are not verified cryptographic or complete dependency tests.
- Responsive layout smoke: actual workspace CSS applied to representative HTML in Chromium at widths 320, 390, 768, 1024 and 1440 px. No horizontal overflow was detected and the desktop sidebar did not overlap content. This was **not** a full rendered Next.js build.
- Sensitive-value safeguards: public blockchain snapshot excludes message content and user identifiers; moderator access is gated; public report feed does not disclose users' original descriptions.

## Checks not completed in the earlier source-only environment

- `npm install`, `npm run typecheck`, `npm test`, `npm run lint`, `npm run build`. External npm registry connectivity was unavailable.
- Better Auth signup/login, Neon schema migration, or signed-in Next.js rendering with a live database.
- Live Google Safe Browsing, Gemini, Mozilla Observatory, urlscan.io and Inngest calls.
- Hardhat contract compilation, Node-runner tests, Base Sepolia contract deployment, transaction publication and on-chain verification.
- Actual 320–1440 px interaction testing of the built Next.js application.

**Do not claim these unrun checks passed when presenting the project to judges.**

## Exact local validation order

1. Use Node.js **22.13+** and run `npm install`.
2. Fill `.env.local` from `.env.example`. Never commit real credentials or a blockchain private key.
3. Existing Neon database: run `npm run db:check`; then `npm run db:migrate:intelligence`. Fresh Neon database: `npm run db:migrate:auth`, then `npm run db:migrate:product`, then `npm run db:migrate:intelligence`.
4. Run `npm run typecheck`, `npm test`, `npm run lint`, `npm run build` and fix all failures before deployment.
5. Run `npm run contracts:compile` and `npm run contracts:test`. Deploy testnet contract only after local tests pass.
6. Start `npm run dev` and the Inngest development server (`npx inngest-cli@latest dev -u http://localhost:3000/api/inngest`).
7. Verify Better Auth email/password sign-up, Google OAuth if configured, session access boundaries, and logout.
8. Test URL analysis for a public site, a hostname-lookalike synthetic example and a blocked local-IP target. Provider errors must say unavailable/inconclusive.
9. Test message submission with an invented bank/KYC/OTP message (no real secrets), check redaction, linked case and Gemini fallback.
10. Test a reviewed report, issue a real Base Sepolia transaction, save its contract address/transaction hash, and verify an unchanged snapshot versus an edited snapshot.
11. Confirm responsive app and all routes on actual devices or browser emulation, including authentication, loading/error states and mobile navigation.

## Three safe demonstration scenarios

**Scenario A: Website impersonation** — Submit a wholly synthetic example like `https://paypa1-verification.example` for URL parsing rules in offline tests. Since `.example` is intentionally non-resolving and the live scanner rejects reserved names, demonstrate the detection rule via tests/fixtures, not a made-up live scan. For a live scanner demonstration use a public, permitted site and report genuine observations only.

**Scenario B: Scam message** — Paste fictional text: `URGENT: Your bank account will be suspended today. Verify your KYC and share your OTP at https://example.com/help`. The demo should show account-restriction, pressure and authentication-secret indicators, plus a separately assessable public URL. `example.com` is not a phishing site; message classification is contextual and must not accuse it of fraud.

**Scenario C: Evidence integrity** — Submit an actual publicly safe test report about a permitted domain, collect at least one completed technical check, verify it as an admin, and register its reviewed digest on Base Sepolia. Verify the same snapshot returns a match. Change one byte of a *local copy* and recompute the hash; the result must differ. Publish and display the transaction hash only after it exists on chain.

## Acceptance criteria against HackMatrix

- Modules 1, 2, 5: source-attributed URL, TLS and passive website evidence present.
- Module 3: pasted message, indicators, optional Gemini explanation and linked scan(s).
- Module 4: exact-domain correlation between the user's cases and verified reports, explicitly not attacker attribution.
- Module 6: role-limited registry writes, saved report digest/version, public read and independent check.
- Five verdict categories and confidence, unknown/unavailable checks visibly disclosed.
- Public deployment, repository, contract address, transaction evidence and executed test report must be filled in **after actual integration verification**.
