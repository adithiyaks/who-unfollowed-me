## Plan: Build “Who unfollowed me?!”

Create a privacy-first React+TS SPA in Vite that parses Instagram exports locally, computes Don’t Follow Back/Fans/Mutuals with search/sort/export, and ships with tests, README, and accessibility-focused UI.

### Steps
1. Define data models and comparator logic in `src/lib/comparator.ts` and parsers/zip extractor in `src/lib/parsers/*.ts` and `src/lib/zip-extract.ts` with unit tests in `src/tests/*`.
2. Build state/hooks (`useFileProcessor`, `useSearch`) and context store under `src/hooks/` to manage uploads, parsing progress, and filtered results.
3. Implement UI layout and components (`components/Uploader`, `ParserProgress`, `ResultsTabs`, `ListItem`, `Filters`, `ExportControls`) with responsive styles in `src/styles/` and ARIA/keyboard support.
4. Wire main page in `src/pages/App.tsx` to host landing copy, privacy badge, instructions, upload pane, results tabs, bulk actions, copy/CSV export, and optional avatar opt-in.
5. Update `README.md` with usage/build steps, Instagram export instructions, sample JSON snippets, privacy note, and add npm scripts (`start`, tests).

### Further Considerations
1. Accept optional Web Worker for large files now or later? Option A: inline parsing first; Option B: worker.
