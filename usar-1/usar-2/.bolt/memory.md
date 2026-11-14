# Project memory

## Product intent & audience

- Korvil App OS: an educational platform/operating system UI.
- Primary context: "Projeto Transformação" (transformation project) with a student-facing system.
- Two user types handled differently:
  - **Students**: log in with email + ID, see their own cronograma (schedule/timeline).
  - **ktp0 / korvil.tp@gmail.com**: admin/teacher role; sees a list of all students.
- Named student accounts confirmed working: mag1, angel11, naty37, fabi15.
- Known gap: edna23 has no registered email in the database; cannot log in until added.
- Inactive students are blocked from login.

## Brand personality & voice

- UI labels in Portuguese (e.g., "Minha conta", "Acessar ID", "Sair").
- Identity is "Korvil" with a "K-AI" floating assistant and K-prefixed modules.

## Visual design & UX direction

- Dark UI theme with a cleaner palette; Inter font; rounded cards; standardized buttons/fields; organized modals.
- Floating interactive K-AI assistant present.
- Top-right corner: profile icon button (replaces "Acessar ID" button after login).
  - First click → student cronograma.
  - Second click (while on cronograma) → mini menu with email, ID, "Minha conta", "Sair".
  - For ktp0: mini menu also includes "Acessar ID" button → goes straight to student list without re-entering ID.
- GitHub integration surfaced as a module.
- Structured folder system for modules: Kalma, Kafortunado, KTP, Sistemak.
- Vite + React stack; Tailwind CSS, lucide-react icons, `@/` path alias to `src/`.
- Avoid extra UI/icon packages beyond the stack defaults.
- Projeto Transformação presentation page (shown when clicking K-TP → Projeto Transformação): redesigned for readability; all texts, fields, plans, schedules, and "Acessar projeto" popup preserved.

## Decisions, constraints & rationale

- Login requires email + ID; account persists on the device so the system opens logged in without re-prompting.
- "Acessar ID" popup asks for email and ID (not just ID as before).
- After successful login, the "Acessar ID" button is removed from the main screen and replaced by the profile icon.
- ktp0 is the admin account (email korvil.tp@gmail.com, ID ktp0); its profile mini menu includes an "Acessar ID" shortcut to the full student list.
- Identity check endpoint is live and public; used to validate login.
- **Login flow changed**: on login, student is directed to the Projeto Transformação system home page (not cronograma). Cronograma opens only when the profile icon is clicked. Logging out closes the cronograma.
- Full visual redesign applied across all Projeto Transformação system screens: home, cronograma, ficha, weight panel, profile/edit-data/photo modal. All content/data preserved.
- Build passes; syntax verified. Temp scratch files removed.

## Open questions & assumptions

- edna23 email still missing — needed to enable that login.
- Assume per-device persistence is the intended session model (no shared cross-device auth inferred yet).
- Visual polish / layout confirmation still pending user review on mobile (assistant cannot preview in browser).