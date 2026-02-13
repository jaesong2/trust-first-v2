# 7-Day Ship Plan (Trust-First V2)

Goal: move from static prototype to a production-ready app foundation with reliable data and a realistic iOS path.

## Day 1 — Backend foundation (Supabase project + schema)
- Create Supabase project and store secrets safely.
- Run `db/001_schema.sql` and `db/002_seed_data.sql`.
- Verify row counts for ingredient / alias / recipe / recipe_ingredient.
- Define environments (`local`, `prod`) and key handling strategy.

**Done when**: database and seed data are reproducible from SQL files.

## Day 2 — App data layer migration
- Add `js/supabaseClient.js` (URL + anon key from environment).
- Convert read paths in `TFData` to Supabase reads for:
  - ingredients,
  - aliases,
  - recipes + recipe_ingredient + recipe_step.
- Keep deterministic matching logic local for now (client-side) for easier parity testing.

**Done when**: app UI reads real data from Supabase and no longer depends on hardcoded recipe arrays for display.

## Day 3 — Auth + user pantry sync
- Enable Supabase Auth: Email + Apple provider.
- Add minimal login/logout screen and session restore.
- Move pantry persistence from localStorage into `pantry_item` per user.
- Keep localStorage as offline cache fallback only.

**Done when**: user can sign in and pantry syncs across two devices/browsers.

## Day 4 — Data quality and trust guardrails
- Add content QA checklist for each recipe:
  - source URL,
  - verified status,
  - ingredient-unit consistency,
  - max core ingredient count,
  - clear step language.
- Add admin SQL queries to flag bad data:
  - missing steps,
  - missing image_url,
  - duplicate aliases,
  - invalid core_ingredient_ids composition.

**Done when**: every published recipe has traceable provenance and validation checks pass.

## Day 5 — Content pack (real information correctness)
- Create launch shortlist (e.g., 50 recipes).
- Define single unit policy by ingredient class (e.g., proteins in g, sauces in tbsp).
- Upload recipe images to Supabase Storage bucket `recipe-images`.
- Fill `image_url`, `source_type`, `source_url`, and `qa_status='published'` only after review.

**Done when**: first high-confidence launch set is complete and internally verified.

## Day 6 — UX polish for app behavior
- Add Cooking Mode:
  - step-focused layout,
  - wake lock on supported browsers,
  - next/prev step controls.
- Add subtle completion interaction (confetti/haptic abstraction).
- Add app icon and splash assets prepared for Capacitor.

**Done when**: cooking flow works comfortably in real kitchen conditions.

## Day 7 — Release readiness (iOS prep + store package)
- Initialize Capacitor and add iOS platform.
- Prepare Apple metadata:
  - app description,
  - privacy policy URL,
  - support URL,
  - screenshot checklist.
- Run end-to-end QA script and create launch/no-launch decision log.

**Done when**: build is technically packageable and App Store submission artifacts are ready.

---

## Information correctness policy (must keep)
1. No recipe is marked `published` without a traceable source.
2. Units must be normalized before matching logic can trust quantity.
3. Alias additions require one human review pass to avoid bad search mappings.
4. Any trust-risk bug (false high-confidence match) is P0.
