# Who unfollowed me?!

Privacy-first SPA that compares your Instagram followers vs following locally in the browser. No uploads, no servers.

## Quick start

```
npm install
npm run start        # dev server (Vite)
npm run build        # production build
npm run preview      # preview build
npm run test         # unit tests (Vitest)
```

## How to get your Instagram data (JSON)
1) Instagram app/site → Settings → **Your Activity** → **Download Your Information**.
2) Choose **Request Download** → format **JSON** → submit.
3) Download the **.zip** you receive.
4) Extract and locate `followers_1.json` and `following.json` (multiple follower files like `followers_2.json` are supported).
5) In the app, drop those JSON files (or the zip) into the uploader. All processing stays in your browser.

## What the app does
- Parses Instagram exports (followers/following JSON or the zip) entirely client-side.
- Computes three lists: **Don’t Follow Back**, **Fans**, **Mutuals** using a canonical key (user id if present, otherwise lower-cased username) with deduping.
- Search, sort, recent-follow filter, copy usernames, and export CSV/JSON for any tab.
- Optional bulk-unfollow list (username-only text) — no automation or API calls.
- Responsive, keyboard-accessible UI with ARIA roles on tabs and lists.

## Sample JSON structure supported

```
{
  "relationships_followers": [
    {
      "string_list_data": [
        {
          "value": "alice",
          "href": "https://www.instagram.com/alice/",
          "timestamp": 1700000000,
          "id": "100"
        }
      ]
    }
  ]
}
```

Other common shapes with `username`, `id`, `string_list_data`, or top-level arrays of usernames are handled; unknown/unsupported files surface a clear warning.

## Privacy & security
- Files never leave your browser; there are **no network calls** for uploaded data.
- Close the tab to clear everything from memory.
- Avatar fetching is disabled by default; if enabled later it will only fetch public image URLs.
- Exports (CSV/JSON) are generated client-side for download.

## Project structure
- `src/pages/App.tsx` — main page and layout
- `src/components` — uploader, instructions, tabs, lists
- `src/hooks` — `useFileProcessor` (uploads/parsing), `useSearch` (search/sort/filter)
- `src/lib` — parsers, comparator, zip extraction, exporters, types
- `src/tests` — Vitest unit tests for comparator and parsers

## Testing
- `npm run test` executes Vitest unit tests.
- Acceptance checks to try manually:
  - Upload correct `followers_1.json` + `following.json` → counts populate and each tab shows entries.
  - Upload same data with usernames in different casing → deduping still matches correctly.
  - Upload a ZIP containing those JSON files → auto-detected and parsed.
  - Export CSV → headers `username,full_name,user_id,relationship,followed_date` present.
  - Confirm devtools shows no network requests for the uploaded JSON.

## Developer notes
- Built with Vite + React 19 + TypeScript.
- ZIP extraction: `fflate` (client-side).
- UI styling is custom CSS (no external CDN). Adjust tokens in `src/App.css` / `src/index.css`.
- Keep processing local-only. Do **not** integrate Instagram APIs or automate unfollows.

## Placeholder media
- Add your own screenshots or demo GIF in `public/` and reference them here. Current UI includes a placeholder block in the instructions card.
