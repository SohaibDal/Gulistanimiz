# Gulistanimiz v0.1–v0.2 MVP Backlog (Epics, Stories, Tasks)

This document defines the GitHub issue hierarchy and Excel-importable backlog for the Gulistanimiz MVP.

## 1. Issue Types, Labels, Milestones

**Issue types (via labels):**
- `epic`
- `story`
- `task`
- `bug`

**Area labels:**
- `area:reading`
- `area:content`
- `area:i18n`
- `area:design`
- `area:notifications`

**Phase / milestone labels:**
- Milestones: `v0.1 MVP`, `v0.2 polish`
- Label: `phase-2` (for anything after v0.2)

**Hierarchy convention:**
- **Epic** issue: high-level theme; description includes checklist of child **stories**. Labels: `epic`, one `area:*`.
- **Story** issue: user-facing slice, written as “As a … I want … so that …”. Labels: `story`, one `area:*`. Body lists acceptance criteria and references to concrete files. Each story lists child **tasks** in a checklist.
- **Task** issue: implementable in a single PR. Labels: `task`, one `area:*`. Task body links back to its parent story via “Blocked by” or GitHub issue link.

**Linking pattern:**
- Epics:
  - Use a checklist of stories, e.g. `- [ ] #12 Reading modes for poems`.
- Stories:
  - “Parent epic: #10” in the description.
  - Checklist of tasks, e.g. `- [ ] #23 Add readingMode preference to storage`.
- Tasks:
  - “Parent story: #12” and optional “Blocks: #34”.

When importing from Excel, use the ID columns described below and then manually wire issue links once issues are created.

---

## 2. Excel Template Mapping

Use one row per GitHub issue (epic, story or task).

**Recommended columns (align to existing template columns where possible):**
- `ID` – local identifier (e.g. `E1`, `S1.2`, `T1.2.a`).
- `Title` – issue title.
- `Type` – one of `epic`, `story`, `task`, `bug`.
- `Area` – one of `area:reading`, `area:content`, `area:i18n`, `area:design`, `area:notifications`.
- `Parent ID` – for stories, the epic’s `ID`; for tasks, the story’s `ID`.
- `Description` – short description including the user story (for stories) and key implementation notes.
- `Acceptance Criteria` – bullet list of verifiable outcomes.
- `Milestone` – `v0.1 MVP`, `v0.2 polish`, or empty when using `phase-2`.
- `Labels` – comma-separated list (`epic,area:reading`, `task,area:content`, `phase-2`, etc.).
- `Phase` – `v0.1`, `v0.2`, or `phase-2` (can be redundant with milestone/label but helps filtering).
- `GitHub Issue URL` – filled after creating issues.

Each Excel row → one GitHub issue. `Parent ID` mirrors the epic → story → task hierarchy.

---

## 3. Epics, Stories and Tasks

Below, each epic is assigned an ID (`E*`), stories are `S*.*` and tasks are `T*.*.*`. Milestones are indicated for every item.

### Epic E1 – Reading Experience (area:reading, Milestone: v0.1 MVP)

Mobile-first poem reader with swipeable cards and simple navigation.

**Epic labels:** `epic`, `area:reading`  
**Milestone:** `v0.1 MVP`

#### Story S1.1 – Swipeable poem card reader

**User story:**  
As a reader, I want to swipe horizontally through full-screen poem cards so that I can quickly browse poems in a focused, distraction-free way.

**Key files/modules:**
- `app/(tabs)/poem.tsx`
- `lib/poems.ts`
- `lib/random-poem.ts`
- `lib/saved-poems.ts`
- `components/ScreenWrapper.tsx`
- `components/themed-text.tsx`

**Acceptance criteria:**
- Swiping left/right navigates between poems on a full-screen card.
- Each card shows a single poem at a time with title, poet and body.
- The current poem persists while navigating away and back to the poem tab within a session.
- Empty/loading state handled gracefully if poem data is unavailable.

**Milestone:** `v0.1 MVP`

Tasks:
- **T1.1.a – Define poem card layout**  
  - Type: `task`, `area:reading`  
  - Files: `app/(tabs)/poem.tsx`, `components/ScreenWrapper.tsx`, `components/themed-text.tsx`  
  - Acceptance: Poem card layout uses consistent typography and spacing and renders correctly in portrait mode.

- **T1.1.b – Implement swipe navigation between poems**  
  - Type: `task`, `area:reading`  
  - Files: `app/(tabs)/poem.tsx`, `lib/poems.ts`, `lib/random-poem.ts`  
  - Acceptance: Swiping left/right changes the poem; no visual glitches when reaching the start/end of the poem list.

- **T1.1.c – Add loading/empty/error states to reader**  
  - Type: `task`, `area:reading`  
  - Files: `app/(tabs)/poem.tsx`  
  - Acceptance: Reader shows a friendly message when poems fail to load or list is empty.

#### Story S1.2 – Global reading modes (translation vs Persian vs bilingual)

**User story:**  
As a reader, I want to choose whether I see only translations, Persian-only, or Persian plus translation so that I can read in the language combination that suits me.

**Key files/modules:**
- `app/settings.tsx`
- `app/(tabs)/poem.tsx`
- `lib/storage.ts`
- `lib/poems.ts`

**Acceptance criteria:**
- Settings screen offers three reading modes: Translation only, Persian only, Persian + translation.
- Selected mode is persisted on device and applied to all poems.
- Poem screen respects the global reading mode.

**Milestone:** `v0.1 MVP`

Tasks:
- **T1.2.a – Add readingMode preference to storage**  
  - Files: `lib/storage.ts`, `app/settings.tsx`  
  - Acceptance: Preference is stored and retrieved as `translationOnly | persianOnly | bilingual`.

- **T1.2.b – Update poem card rendering to respect readingMode**  
  - Files: `app/(tabs)/poem.tsx`, `lib/poems.ts`  
  - Acceptance: Changing mode in settings immediately updates poem display when returning to the poem screen.

#### Story S1.3 – Session-only per-poem mode override

**User story:**  
As a reader, I want to temporarily change the reading mode for the current poem so that I can inspect the original text or translation without changing my global preference.

**Key files/modules:**
- `app/(tabs)/poem.tsx`
- `lib/poems.ts`

**Acceptance criteria:**
- On the poem screen, a simple toggle or menu lets the user cycle between available modes for that poem.
- Override applies only while on the poem screen and resets when the user leaves the screen.
- Global setting in `app/settings.tsx` is not changed.

**Milestone:** `v0.2 polish`

Tasks:
- **T1.3.a – Add in-screen reading mode override UI**  
  - Files: `app/(tabs)/poem.tsx`  
  - Acceptance: Control to change the current poem’s display mode is visible and tappable.

- **T1.3.b – Implement non-persistent override logic**  
  - Files: `app/(tabs)/poem.tsx`  
  - Acceptance: Override only persists while the component is mounted and falls back to global mode after leaving the screen.

---

### Epic E2 – Content & Schema (area:content, Milestone: v0.1 MVP)

Well-structured, versioned poem content stored locally in JSON with stable `poem_id`.

**Epic labels:** `epic`, `area:content`  
**Milestone:** `v0.1 MVP`

#### Story S2.1 – Define poem JSON schema with stable IDs

**User story:**  
As a maintainer, I want a documented poem JSON schema with stable IDs and versioning so that we can safely evolve the content over time.

**Key files/modules:**
- `data/poems.json`
- `data/poets.json`
- `lib/poems.ts`
- `scripts/` (new validator script)
- `README.md` or `planning/` docs

**Acceptance criteria:**
- Poem schema includes fields for `poem_id`, source language, translations (Turkish, English), poet reference, and optional themes/tags.
- `poem_id` is stable and unique across all poems.
- A short markdown document describes the schema and versioning approach.

**Milestone:** `v0.1 MVP`

Tasks:
- **T2.1.a – Document poem JSON schema**  
  - Files: `planning/content-schema.md` (new), `README.md`  
  - Acceptance: Document explains each field and includes an example poem object.

- **T2.1.b – Align existing poems.json to schema**  
  - Files: `data/poems.json`  
  - Acceptance: All entries in `data/poems.json` include `poem_id` and conform to the documented schema.

#### Story S2.2 – Add simple schema validation tooling

**User story:**  
As a maintainer, I want a basic script to validate the poems JSON against the schema so that content errors are caught early.

**Key files/modules:**
- `scripts/validate-poems.ts` (new)
- `data/poems.json`
- `lib/poems.ts`

**Acceptance criteria:**
- Running the validation script reports invalid poem entries (missing IDs, missing required fields).
- Script is documented in `README.md`.

**Milestone:** `v0.2 polish`

Tasks:
- **T2.2.a – Implement validate-poems script**  
  - Files: `scripts/validate-poems.ts`  
  - Acceptance: Script reads `data/poems.json` and logs schema issues; no external network access.

- **T2.2.b – Document validation usage**  
  - Files: `README.md`  
  - Acceptance: README includes a short section on how to run the validator via `npm` script.

#### Story S2.3 – Categorize poems (themes/poets) for browsing

**User story:**  
As a reader, I want poems grouped into categories (e.g., by poet or theme) so that I can browse in a more structured way.

**Key files/modules:**
- `data/poems.json`
- `data/poets.json`
- `app/(tabs)/genres.tsx`
- `app/(tabs)/writers.tsx`
- `lib/poems.ts`

**Acceptance criteria:**
- Poems are tagged with at least one category (e.g. poet or theme ID).
- Genres and writers screens use the new schema for listing and filtering poems.

**Milestone:** `v0.2 polish`

Tasks:
- **T2.3.a – Extend schema with themes/categories**  
  - Files: `planning/content-schema.md`, `data/poems.json`  
  - Acceptance: Schema doc and JSON data reflect category fields.

- **T2.3.b – Update genres tab to use categories**  
  - Files: `app/(tabs)/genres.tsx`, `lib/poems.ts`  
  - Acceptance: Genres screen lists categories and navigates to filtered poems.

- **T2.3.c – Update writers tab to use new poet references**  
  - Files: `app/(tabs)/writers.tsx`, `data/poets.json`, `lib/poems.ts`  
  - Acceptance: Writers screen maps correctly from poets to their poems using `poem_id`/poet references.

---

### Epic E3 – Localization & Language Modes (area:i18n, Milestone: v0.1 MVP)

Global app localization (Turkish, Persian, English) and correct RTL handling for Persian.

**Epic labels:** `epic`, `area:i18n`  
**Milestone:** `v0.1 MVP`

#### Story S3.1 – Base i18n setup with three UI languages

**User story:**  
As a user, I want the app UI to be available in Turkish, Persian and English so that I can navigate in my preferred language.

**Key files/modules:**
- `app/_layout.tsx`
- `app/(tabs)/index.tsx`
- `app/settings.tsx`
- `components/themed-text.tsx`
- `lib/storage.ts`
- `constants/` (new `i18n.ts` or locales files)

**Acceptance criteria:**
- Turkish is selected by default (or device locale mapping to the closest supported language) on first launch.
- User can change UI language in Settings.
- Strings for static UI text are pulled from a central i18n resource file, not hard-coded.

**Milestone:** `v0.1 MVP`

Tasks:
- **T3.1.a – Create i18n resources and language context**  
  - Files: `constants/i18n.ts` (or `constants/locales/*.ts`), `app/_layout.tsx`  
  - Acceptance: App provides a context/hook for accessing localized strings.

- **T3.1.b – Add language selector to settings and persist choice**  
  - Files: `app/settings.tsx`, `lib/storage.ts`  
  - Acceptance: Changing language updates visible UI strings after navigating back to main screens.

- **T3.1.c – Localize core screens**  
  - Files: `app/(tabs)/index.tsx`, `app/(tabs)/poem.tsx`, `app/(tabs)/my-gulistan.tsx`, `app/(tabs)/genres.tsx`, `app/(tabs)/writers.tsx`, `app/settings.tsx`  
  - Acceptance: Navigation labels and key headings use i18n resources.

#### Story S3.2 – Correct RTL and mixed-direction support

**User story:**  
As a Persian reader, I want the Persian text and UI elements to follow right-to-left conventions so that reading feels natural.

**Key files/modules:**
- `app/_layout.tsx`
- `app/(tabs)/poem.tsx`
- `components/themed-text.tsx`
- `constants/theme.ts`

**Acceptance criteria:**
- When Persian is selected as UI language, appropriate RTL layout flags are applied where needed.
- Poem body in Persian is right-aligned and uses correct text direction.
- Mixed Persian/Latin text does not render with broken ordering.

**Milestone:** `v0.2 polish`

Tasks:
- **T3.2.a – Apply RTL layout handling at app root**  
  - Files: `app/_layout.tsx`  
  - Acceptance: When Persian is active, layout direction is RTL where supported.

- **T3.2.b – Ensure poem text components support RTL**  
  - Files: `app/(tabs)/poem.tsx`, `components/themed-text.tsx`  
  - Acceptance: Persian poem text is right-aligned and readable, with no clipping.

#### Story S3.3 – Persian-friendly font setup

**User story:**  
As a Persian reader, I want a legible bundled Persian font so that poems look beautiful and are easy to read.

**Key files/modules:**
- `app/_layout.tsx`
- `constants/theme.ts`
- `lib/theme.ts`
- `lib/theme-context.tsx`
- Font assets (to be added in `assets/fonts/`)

**Acceptance criteria:**
- A bundled Persian-friendly font (e.g., Vazirmatn or similar) is loaded and used for Persian scripts.
- Font loading does not noticeably block app startup beyond a simple splash/loading state.

**Milestone:** `v0.2 polish`

Tasks:
- **T3.3.a – Add and load bundled Persian font**  
  - Files: `app/_layout.tsx`, `constants/theme.ts`, `assets/fonts/*`  
  - Acceptance: Font is registered and can be referenced from styles.

- **T3.3.b – Apply font to Persian poem text and key UI elements**  
  - Files: `app/(tabs)/poem.tsx`, `components/themed-text.tsx`, `lib/theme.ts`  
  - Acceptance: Persian poem text uses the new font while Latin scripts remain readable.

---

### Epic E4 – Design System & Theming (area:design, Milestone: v0.1 MVP)

Consistent visual language: palette, typography scale, card style and basic accessibility.

**Epic labels:** `epic`, `area:design`  
**Milestone:** `v0.1 MVP`

#### Story S4.1 – Define visual design foundations

**User story:**  
As a designer/developer, I want a defined color palette, typography scale and spacing rules so that the app looks cohesive.

**Key files/modules:**
- `constants/theme.ts`
- `lib/theme.ts`
- `lib/theme-context.tsx`
- `components/themed-text.tsx`
- `components/themed-view.tsx`

**Acceptance criteria:**
- A primary and secondary color palette is defined, including background and surface colors.
- Typography roles are defined (e.g., title, subtitle, body, caption) and mapped to font sizes/weights.
- Components use theme tokens instead of inline colors.

**Milestone:** `v0.1 MVP`

Tasks:
- **T4.1.a – Update theme constants with palette and type scale**  
  - Files: `constants/theme.ts`, `lib/theme.ts`  
  - Acceptance: Theme exposes named tokens for colors and text styles.

- **T4.1.b – Apply theme tokens to base components**  
  - Files: `components/themed-text.tsx`, `components/themed-view.tsx`, `components/ui/*`  
  - Acceptance: Base components no longer hard-code colors where a theme token exists.

#### Story S4.2 – Card design for poems and lists

**User story:**  
As a reader, I want poem cards and list items to look polished and readable so that the app feels delightful to use.

**Key files/modules:**
- `app/(tabs)/poem.tsx`
- `app/(tabs)/my-gulistan.tsx`
- `app/(tabs)/genres.tsx`
- `app/(tabs)/writers.tsx`
- `components/ScreenWrapper.tsx`

**Acceptance criteria:**
- Poem cards use consistent elevation, padding, border radius and background colors.
- List items in genres/writers/my-gulistan follow the same design language.

**Milestone:** `v0.2 polish`

Tasks:
- **T4.2.a – Define poem card component styles**  
  - Files: `app/(tabs)/poem.tsx`, `components/ScreenWrapper.tsx`, `constants/theme.ts`  
  - Acceptance: Poem cards visually match the design system and work in light/dark mode.

- **T4.2.b – Harmonize list item styles across tabs**  
  - Files: `app/(tabs)/my-gulistan.tsx`, `app/(tabs)/genres.tsx`, `app/(tabs)/writers.tsx`  
  - Acceptance: All list items share consistent padding, typography and background.

#### Story S4.3 – Basic accessibility (font scaling, contrast)

**User story:**  
As a visually impaired user, I want the app to respect system font scaling and maintain good contrast so that it is comfortable to read.

**Key files/modules:**
- `components/themed-text.tsx`
- `constants/theme.ts`
- `lib/theme.ts`

**Acceptance criteria:**
- Text respects system dynamic type settings where possible.
- Palette choices meet basic contrast guidelines for text vs background.

**Milestone:** `v0.2 polish`

Tasks:
- **T4.3.a – Ensure themed text respects dynamic font sizes**  
  - Files: `components/themed-text.tsx`  
  - Acceptance: Text components opt in to system font scaling where appropriate.

- **T4.3.b – Review and adjust theme colors for contrast**  
  - Files: `constants/theme.ts`  
  - Acceptance: Primary text on background surfaces meets reasonable contrast standards.

---

### Epic E5 – Favorites & Local State (area:reading, Milestone: v0.1 MVP)

Device-local favorites and simple state persistence without accounts.

**Epic labels:** `epic`, `area:reading`  
**Milestone:** `v0.1 MVP`

#### Story S5.1 – Save poems as favorites locally

**User story:**  
As a reader, I want to mark poems as favorites so that I can easily find them again later.

**Key files/modules:**
- `app/(tabs)/poem.tsx`
- `app/(tabs)/my-gulistan.tsx`
- `lib/saved-poems.ts`
- `lib/storage.ts`

**Acceptance criteria:**
- User can favorite/unfavorite a poem from the poem screen.
- Favorites persist on device between app launches.
- `My Gulistan` tab lists only favorited poems using local storage.

**Milestone:** `v0.1 MVP`

Tasks:
- **T5.1.a – Ensure saved-poems helper uses stable poem_id**  
  - Files: `lib/saved-poems.ts`, `lib/poems.ts`  
  - Acceptance: Favorites are keyed by `poem_id` rather than array index.

- **T5.1.b – Wire favorite toggle on poem screen**  
  - Files: `app/(tabs)/poem.tsx`, `lib/saved-poems.ts`  
  - Acceptance: Tapping favorite icon updates local storage and UI state.

- **T5.1.c – Use favorites list in My Gulistan tab**  
  - Files: `app/(tabs)/my-gulistan.tsx`, `lib/saved-poems.ts`  
  - Acceptance: My Gulistan lists all favorited poems with correct titles and poets.

#### Story S5.2 – Restore last-read poem on launch

**User story:**  
As a reader, I want the app to remember the last poem I was reading so that I can quickly continue where I left off.

**Key files/modules:**
- `app/(tabs)/poem.tsx`
- `lib/storage.ts`
- `lib/poems.ts`

**Acceptance criteria:**
- When the app is relaunched, the poem tab shows the last-read poem if it still exists in the dataset.

**Milestone:** `v0.2 polish`

Tasks:
- **T5.2.a – Store last-read poem ID in storage**  
  - Files: `app/(tabs)/poem.tsx`, `lib/storage.ts`  
  - Acceptance: Poem ID is saved whenever the visible poem changes.

- **T5.2.b – Load last-read poem on poem screen mount**  
  - Files: `app/(tabs)/poem.tsx`, `lib/poems.ts`  
  - Acceptance: If the stored poem exists, it is selected as the initial poem.

---

### Epic E6 – Notifications (Daily Reminder) (area:notifications, Milestone: v0.2 polish)

Simple daily reminder to read a poem, using local notifications only.

**Epic labels:** `epic`, `area:notifications`  
**Milestone:** `v0.2 polish`

#### Story S6.1 – Schedule/cancel daily reminder notification

**User story:**  
As a reader, I want to opt into a daily reminder notification so that I remember to read a poem each day.

**Key files/modules:**
- `lib/notifications.ts`
- `app/settings.tsx`
- `app/(tabs)/index.tsx`

**Acceptance criteria:**
- User can enable/disable a daily reminder in Settings.
- Choosing a time schedules a local notification on iOS/Android (no effect on Web).
- Cancelling the reminder stops future notifications.

**Milestone:** `v0.2 polish`

Tasks:
- **T6.1.a – Implement platform-safe notification scheduling helper**  
  - Files: `lib/notifications.ts`  
  - Acceptance: Function schedules/cancels notifications, no crashes on unsupported platforms.

- **T6.1.b – Add daily reminder controls to settings**  
  - Files: `app/settings.tsx`, `lib/notifications.ts`  
  - Acceptance: Settings screen allows toggling and time selection; state reflects actual schedule.

#### Story S6.2 – Reminder UX and copy

**User story:**  
As a reader, I want friendly reminder text so that the notification feels encouraging, not spammy.

**Key files/modules:**
- `lib/notifications.ts`
- `constants/i18n.ts`

**Acceptance criteria:**
- Reminder notification title/body text is localized into Turkish, Persian and English.
- Copy matches the app tone and can be updated centrally.

**Milestone:** `v0.2 polish`

Tasks:
- **T6.2.a – Localize reminder notification strings**  
  - Files: `constants/i18n.ts`, `lib/notifications.ts`  
  - Acceptance: Notification text is sourced from i18n resources.

---

### Epic E7 – Auth & Sync (Phase 2) (area:reading/content, Phase-2)

Future Supabase-based authentication and sync for favorites and settings. Not part of v0.1/v0.2.

**Epic labels:** `epic`, `area:reading`, `phase-2`  
**Milestone:** *(none; use label `phase-2` instead)*

#### Story S7.1 – Email/password auth via Supabase

**User story:**  
As a user, I want to sign in with email/password so that my favorites and settings can sync across devices.

**Key files/modules:**
- `app/auth.tsx`
- `lib/auth.ts`
- `lib/supabase.ts`
- `lib/session.ts`

**Acceptance criteria:**
- User can sign up, sign in and sign out using Supabase-backed email/password.
- Auth state is reflected in the UI (e.g., user avatar or name shown when signed in).

**Phase:** `phase-2`

Tasks:
- **T7.1.a – Review and harden existing Supabase wiring**  
  - Files: `lib/supabase.ts`, `lib/auth.ts`, `lib/session.ts`  
  - Acceptance: Supabase client is configured via environment variables and does not leak secrets.

- **T7.1.b – Polish auth screen flows**  
  - Files: `app/auth.tsx`  
  - Acceptance: Auth screen supports basic validation and clear error messages.

#### Story S7.2 – Cloud sync for favorites and settings

**User story:**  
As a signed-in user, I want my favorites and settings to sync across devices so that I can continue reading anywhere.

**Key files/modules:**
- `lib/saved-poems.ts`
- `lib/storage.ts`
- `lib/supabase.ts`
- `app/(tabs)/my-gulistan.tsx`

**Acceptance criteria:**
- Favorites and core reading/settings preferences are synced to Supabase when signed in.
- Local-only behavior remains when signed out.

**Phase:** `phase-2`

Tasks:
- **T7.2.a – Design sync model for favorites and settings**  
  - Files: `planning/sync-model.md` (new)  
  - Acceptance: Document describes tables and conflict resolution strategy.

- **T7.2.b – Implement sync hooks for favorites and settings**  
  - Files: `lib/saved-poems.ts`, `lib/storage.ts`, `lib/supabase.ts`  
  - Acceptance: On sign-in, data is pulled from server; changes are pushed while online.

---

## 4. Risks and Notes

- **RTL and mixed-direction text:** Ensure careful testing of Persian text rendering with numbers and Latin words.
- **Local JSON schema changes:** Updating `data/poems.json` schema will require coordinated changes in `lib/poems.ts` and any components reading from it.
- **Notifications:** Behavior differs across iOS, Android and Web; the implementation must guard against unsupported APIs.
- **Out-of-scope:** Social features, comments, audio, AI-generated content, monetization, widgets, detailed streaks/stats are intentionally excluded from v0.1/v0.2.

This file is the canonical source for setting up GitHub issues and populating the Excel template for Task GUL-1.
