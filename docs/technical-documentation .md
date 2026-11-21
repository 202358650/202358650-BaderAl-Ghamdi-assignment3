# Technical Documentation – Assignment 3

**Project:** Developer Portfolio (builds on Assignments 1 and 2)
**Stack:** HTML5, CSS3, vanilla JavaScript.


---

## 1. Overview

A single-page portfolio with three tabs (About, Projects, Contact). New in Assignment 3:

- Project cards are rendered from a JavaScript data array, with search, category filter, level filter and sorting
- A live external API (daily quote) with error handling
- Persisted state (theme and project filters)
- A validated contact form (demo only, nothing is sent)
- A visit timer
- Performance and accessibility improvements

## 2. File Structure

```
├── index.html            page structure, no project markup
├── css/styles.css        theming variables, layout, components
├── js/script.js          all behaviour (12 numbered sections)
├── assets/images/        compressed .webp project images
└── docs/                 ai-usage-report.md, technical-documentation.md
```

## 3. Changes from Assignment 2

### 3.1 `index.html`

| Change | Detail |
|---|---|
| Script loading | `<script>` at end of `<body>` → `<script src defer>` in `<head>` |
| Theme init | Inline IIFE in `<head>` reads `localStorage.theme` (falling back to `prefers-color-scheme`) and sets `data-theme="dark"` on `<html>` before first paint, which prevents a white flash |
| Projects | Static card markup removed → empty `#projects-grid`, rendered by JS |
| New controls | Category chips (`data-category`), `#level-select`, `#sort-select`, `#level-message`, `#results-count`, `#reset-filters` |
| Quote | `<figure class="quote-box">` with `<blockquote aria-live="polite">` and a retry button |
| Form | `novalidate`; per-field error `<p>` linked via `aria-describedby`; `maxlength="500"` + character counter |
| Navigation | CTA buttons use `data-target` with their own `.btn` classes (no longer `.tab-btn`) |
| Footer | Timer `<span id="visit-timer">` |
| SEO | `<meta name="description">` added |

### 3.2 `css/styles.css`

| Change | Detail |
|---|---|
| Theming | Hard-coded colors and duplicated `body.dark-mode` selectors → CSS custom properties on `:root`, overridden in `:root[data-theme="dark"]` |
| Layout | `box-sizing: border-box` reset; `grid-template-columns: repeat(auto-fill, minmax(260px, 1fr))` |
| Responsive | Real `@media (max-width: 600px)` block (A2 documentation mentioned one that did not exist) |
| Form states | Red border via the `[aria-invalid="true"]` attribute selector |
| Accessibility | `:focus-visible` outline; `@media (prefers-reduced-motion: reduce)` |
| New components | `.chip`, `.quote-box`, `.card-placeholder` (gradient + initials), `.btn` variants |
| Fonts | System font stack, no web-font download |

### 3.3 `js/script.js`

| Section | Technical detail |
|---|---|
| 0. Helpers | `storage` wrapper (JSON + try/catch around `localStorage`); `createEl()` using `textContent` (avoids XSS); `formatDate()` with `timeZone: "UTC"` so month labels do not shift by timezone |
| 1. Tabs | Hash routing (`#/tab`) with a `hashchange` listener; click handlers only set the hash, and `hashchange` switches the tab (single code path); whitelist `TABS` with fallback to `about`; the `/` prefix stops the browser's anchor scroll |
| 2. Theme | Toggles the `data-theme` attribute; persists the plain string to `localStorage`. It deliberately does not use the JSON `storage` helper because the `<head>` script reads the raw value |
| 3. Projects data | `PROJECTS` array (title, description, category, level, `YYYY-MM` date, tags, optional image + size); `LEVEL_MESSAGES`; saved filters validated against the allowed categories, levels and sort options, falling back to defaults |
| 4. DOM references | Elements fetched once at start-up |
| 5. Filter and sort | `getVisibleProjects()`: filter by category → level → search text (title, description, tags) → `slice().sort()` with `localeCompare` (the original array is never mutated). `saveFilters()` persists category, level and sort (search is temporary and excluded) |
| 6. Cards | `createProjectCard()` builds each card with `createEl`; image with `width`/`height`, `loading="lazy"`, `decoding="async"`, or a placeholder with initials when there is no image |
| 7. Render | `renderProjects()` builds cards into a `DocumentFragment` and swaps them in with `replaceChildren()`; updates the level message, results count, empty state, reset button visibility and active chip; syncs the select values to state |
| 8. Events | Each control updates the `filters` state, saves it (except search) and calls `renderProjects()` |
| 9. Quote API | See 4.1 |
| 10. Contact form | See 4.3 |
| 11. Timer | `setInterval` every second; elapsed time from `Date.now() - startTime` (no accumulated drift); `mm:ss`, switching to `h:mm:ss` after an hour |
| 12. Init | `showTab(getTabFromHash())`, `updateThemeButton()`, `renderProjects()`, `loadQuote()` |

## 4. Feature Details

### 4.1 External API: Quote of the Day

- Endpoint: `https://dummyjson.com/quotes/random` (public, no key)
- `async/await` `fetch` with an `AbortController` (8 second timeout)
- Failure handling: network error, timeout, non-OK status (`response.ok`) and unexpected JSON shape (missing `quote` or `author`) all fall into one `catch`, which shows a friendly message and a "Try again" button
- Caching: the quote is stored in `localStorage` keyed by `toDateString()`, so the API is called at most once per day per browser. The cached object is type-checked before use

### 4.2 State management

| State | Where | Notes |
|---|---|---|
| Theme | `localStorage.theme` (raw string) | Applied before first paint by the `<head>` script |
| Project filters | `localStorage.projectFilters` (JSON) | Category, level and sort; validated on load; search excluded |
| Quote of the day | `localStorage.quoteOfTheDay` (JSON) | Reused for the rest of the day |
| Current tab | URL hash | Shareable and survives refresh |

All storage access is wrapped in try/catch, so the site still works when storage is blocked (e.g. private browsing).

### 4.3 Contact form validation

- Rule map `fieldRules` (field id → function returning an error string, empty if valid)
- Name: required, minimum 2 characters
- Email: required, must match `/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/`
- Message: required, minimum 20 characters, maximum 500 (live counter)
- Validation runs on `blur`, then live on `input` once a field is invalid, and on all fields at submit; focus moves to the first invalid field
- Errors are shown in `<p>` elements linked with `aria-describedby`; invalid fields get `aria-invalid="true"`
- On success the button is disabled briefly, then a message states plainly that this is a demo: the message passed validation but was **not sent**

### 4.4 Complex logic summary

Filter + sort pipeline, level-dependent messages, multi-rule form validation and the visit timer (assignment section 3).

## 5. Performance

Optimisations applied:

- Images converted to `.webp` and sized to their display size; explicit `width`/`height` on images prevents layout shift; `loading="lazy"` and `decoding="async"`
- No external fonts, libraries or frameworks; one CSS and one JS file
- `defer` script loading; theme script is a tiny inline IIFE
- Single DOM update per render (`DocumentFragment` + `replaceChildren`)
- API response cached daily
- A2 leftovers removed (duplicate dark-mode rules, unused selectors)

Lighthouse results (Chrome DevTools, local server, 2026-11-21, device mode: **[FILL: Mobile or Desktop]**):

| Category | Score |
|---|---|
| Performance | 100 |
| Accessibility | 100 |
| Best Practices | 100 |
| SEO | 100 |

Note: Lighthouse audits the page as loaded, so it mainly checks the default About tab. Scores on the deployed site may differ slightly.

## 6. Accessibility

`lang` attribute, labelled controls, `aria-live` regions for the quote, results count and form feedback, `aria-describedby`/`aria-invalid` on form fields, visible `:focus-visible` outline, reduced-motion support, decorative placeholder marked `aria-hidden`, `alt` text on images, colors defined for light and dark themes. Lighthouse Accessibility score: 100.

## 7. Compatibility

Uses `replaceChildren`, optional chaining, object spread and CSS custom properties, so it targets current evergreen browsers (no Internet Explorer support).

| Browser | Result |
|---|---|
| Chrome (desktop) | [FILL] |
| Safari (macOS) | [FILL] |
| Firefox | [FILL] |
| Mobile width (≤ 600px) | [FILL] |

## 8. Known Limitations

- The contact form is a front-end demo; it does not send messages
- The quote depends on a third-party API (`dummyjson.com`); when it is down, the user sees the error message and can retry
- Project data is hard-coded in `script.js` (no backend or JSON file)
- Image filenames are case-sensitive on GitHub Pages; keep them identical to the paths in `PROJECTS`

## 9. Setup

No build step. Open `index.html` in a browser, or serve the folder (`python3 -m http.server`) and open `http://localhost:8000`. The quote needs an internet connection.
