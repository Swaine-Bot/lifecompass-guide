## Reality check

You asked for "implement all of the above." Honestly: this is ~8–12 weeks of work across DB schema, edge functions, security infra, UX rewrites, file generation, voice, and a demo mode. Trying to do it in one pass produces placeholders — which you explicitly forbade. So I'm going to ship it in **5 sequenced phases**, each one fully production-grade before moving to the next. You approve this plan and I begin Phase 1 immediately in the next turn.

No Discovery API credentials → all insurer surfaces use **Demo Mode** (clearly labelled, real consent layer underneath, ready to swap to live OAuth the day credentials arrive).

---

## Phase 1 — Foundation: Consent, Insurer Onboarding Shell, Settings, Global UI Hardening  *(ship next)*

**Database (1 migration)**
- `consent_records` — append-only ledger: user_id, purpose, granted, version, ip_hash, ua_hash, granted_at, revoked_at. Right-to-erasure friendly.
- `insurer_connections` — provider enum (discovery/momentum/profmed/bonitas/other), status (demo/pending/connected/revoked), connected_at, revoked_at, scopes jsonb.
- `insurer_sharing_prefs` — 12 granular boolean toggles per user (wellness, activity, nutrition, sleep, rewards, wearable, insights, personalized rewards, AI recs, anon analytics, research, sponsor recs).
- `audit_log` — immutable, append-only, RLS read-self + admin. Logged via SECURITY DEFINER `log_audit_event()`.
- `data_export_requests`, `data_erasure_requests` — POPIA/GDPR rights workflow.
- All tables: GRANTs + RLS + `security_invoker=on` views where needed.

**Onboarding**
- New step: "Are you a medical aid member?" → 6 options. If Discovery → second step with benefits + explicit consent copy + accept/decline. Writes to `consent_records` + `insurer_connections` (status='demo').

**Settings → new "Insurer & Wellness" panel**
- Connected providers list with status pill.
- 12 sharing toggles, each writes to `insurer_sharing_prefs` AND `consent_records`.
- "Disable all insurer integrations" kill switch → revokes connections, flips all toggles off, writes audit event.
- POPIA/GDPR rights section: "Export my data" + "Delete my account" buttons → request rows + edge function trigger.

**Global UI Hardening (project-wide sweep)**
- `index.css`: enforce `html,body{overflow-x:hidden;max-width:100vw}`, `*{min-width:0}` on flex children via utility class, `.h-screen-safe` standardized to `100dvh`.
- Audit `AppLayout`, all pages: `min-w-0` on flex children, `overflow-x-hidden` on scroll containers, `overscroll-behavior:contain`.
- Fix sticky bottom-nav jitter on keyboard open (already partial — extend to all input pages).
- Replace remaining `h-screen` with `h-dvh`.
- Add `<ErrorBoundary>` around route outlets.

**Edge function**
- `compliance-export` — produces signed-URL JSON+CSV bundle of user's data. Rate-limited 1/day.
- `compliance-erase` — soft-delete + 30-day hard-delete queue. Writes audit.

---

## Phase 2 — Share / Vault / Feed UX Overhaul

- Vault detail view: full insight, edit, share, export, "Generate share card" CTA. Zero truncation anywhere.
- Feed card reactions split: ❤️ Like, 💡 Save insight, 💬 Comment, 🎯 Add as goal — each independently selectable with its own count.
- "Report post" label next to flag icon.
- Share card 4K already shipped; add per-platform export presets (FB 1200×630, IG 1080×1350, LI 1200×627, Story 1080×1920, WhatsApp 1080×1080) with Strava overlay.
- Goals page: separate "Goals" and "Micro-Moves" tabs; goal milestone tick → XP via existing `award_pillar_xp`; per-goal estimated completion; custom micro-move CRUD; mentor-generated action plan button (existing edge function).

## Phase 3 — Mentor Upgrade + File Generation + Voice

- Fact-check pass in `mentor-chat`: second LLM call as verifier with confidence score; appends "⚠ uncertain" footer when <0.7.
- Strip life-phase auto-mention from system prompt unless directly relevant.
- File generation: PDF (pdf-lib in edge fn), DOCX (docx skill), XLSX, PPTX, CSV. Mentor function-calls `generate_document` tool; signed URL returned to chat.
- Voice in/out via Web Speech + existing voice mentor; transcript save-to-Vault + share + download .txt.

## Phase 4 — Wearable Sync + Rewards Engine + Partner Zone

- Extend existing `wearable-sync` to Apple Health / Google Fit / Garmin / Fitbit / Strava / Samsung. Each provider needs its own OAuth app you register — I'll scaffold per-provider modules with clear "Add credentials" boxes.
- `rewards_engine`: rules table (event_type, multiplier, pillar, max_per_day) + evaluator edge fn fired on habit/goal/sleep/activity events.
- Partner Zone: extend `partners` + `partner_assets`; partner-facing aggregate-only RPC `get_partner_aggregate_analytics(min_cohort=5)`.

## Phase 5 — Demo Mode + Audit Dashboard + Hardening Pass

- `demo_mode` flag in profile. When on: insurer connections render as "Connected (Demo)", simulated step/sleep stream, mock reward ledger, sample Vitality dashboard. Clearly labelled banner. Real consent gates still enforced.
- Admin audit dashboard reading `audit_log`.
- Final pass: lint, typecheck, lighthouse mobile audit, RLS linter, fix everything surfaced.

---

## Things I cannot do (need you to act)

1. **Discovery / Vitality live API** — needs signed partner agreement + sandbox credentials. Phase 1–5 ship with Demo Mode; flip a flag when you have credentials.
2. **Wearable OAuth apps** — each provider requires you to register a developer app and provide client_id/secret. I'll scaffold the slots; you populate via secrets.
3. **HIPAA BAA** — HIPAA is US-only and requires a Business Associate Agreement with infra provider. For SA + Discovery, **POPIA is the governing framework**; GDPR covers EU users. I'll build to POPIA+GDPR (HIPAA-adjacent practices: encryption, audit, minimum-necessary). True HIPAA certification is a legal/contractual process outside code.
4. **AES-256 field-level encryption + KMS** — backend already does at-rest encryption at infra layer. App-level field encryption needs a KMS choice (AWS KMS / GCP KMS / Vault). I'll flag the columns; you decide KMS and I wire it in Phase 5.

---

## What I'll ship in the very next turn (Phase 1)

1. One migration: 5 tables + RLS + GRANTs + audit function.
2. New onboarding step component + insurer settings panel.
3. Two edge functions: `compliance-export`, `compliance-erase`.
4. Global CSS hardening + AppLayout audit + ErrorBoundary.
5. Insurer service layer (`src/services/insurer/`) wired to consent ledger.

Approve and I start building Phase 1 immediately.