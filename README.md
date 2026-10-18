# STRONGER

A static strength-training web app (React, Tailwind) for iPhone Safari. Import your own program PDFs or spreadsheets, follow them exactly as written, and log every set.

## Use it
Open the site (GitHub Pages) and, on iPhone, **Share → Add to Home Screen**. The app works offline after the first load. All data is stored in the browser on that device only (no cloud sync): use **Settings → Export backup** regularly.

## Develop
```
npm install
npm run build      # compiles src/app.jsx -> app.js, Tailwind -> styles.css, copies vendor libs, writes sw.js
npm run serve      # http://localhost:8080
npm test           # parser unit tests + phone-sized end-to-end tests (synthetic programs)
```
Edit `src/app.jsx` / `src/input.css` / `pdf-import.js`, then run `npm run build` and commit the generated files (the site is served as-is).

Optional: drop your own program files in `tests/fixtures/` (git-ignored) and `npm test` will also check that spreadsheets import without high-severity flags.

## Files
- `src/app.jsx` – the app (compiled to `app.js`)
- `pdf-import.js` – PDF and spreadsheet importers (pure parsing + browser glue)
- `vendor/` – bundled libraries (React, pdf.js, SheetJS) so nothing loads from a CDN
- `sw.js`, `manifest.webmanifest`, `icons/` – offline + home-screen install
