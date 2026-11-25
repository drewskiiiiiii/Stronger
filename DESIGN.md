# UI conventions

Keep new screens consistent with these sizes (Tailwind classes in `src/app.jsx`; colours always come from the `th-*` theme tokens).

| Element | Rule |
|---|---|
| Touch targets | At least 44px high/wide. |
| Primary call to action | `min-h-[48px]`, `rounded-xl`, `text-sm font-black`, solid accent, normal case. |
| Standard button | `min-h-[44px]`, `px-4`, `rounded-xl`, `text-xs font-bold`; secondary = `bg-th-elevated border border-th-line`. |
| Chip / tab / toggle | Same as a standard button; the selected one is solid accent (normal case). |
| Icon button | `min-w-[44px] min-h-[44px]`, `rounded-xl`. |
| Destructive | Red `#F43F5E` text + border (solid red only inside the confirm dialog). |
| Card | `bg-th-card border border-th-line rounded-xl p-4`; compact list rows `p-3`; empty states `p-5` dashed. |
| Input / select | `min-h-[44px]`, `rounded-xl`, `px-3`, inherit the 16px base size (prevents iOS zoom). |
| Exercise names | Active workout card `text-xl font-black` (with an accent "Exercise n of N" caption); program detail rows `text-base font-black`; history `text-sm font-bold`. |
| Headings | Page title `h2 text-lg font-black` (sentence case); card title `h3 text-sm font-black`. Small eyebrow labels may stay uppercase. |
| Text scale | 10px captions, 11px small, `text-xs` (12px) controls/body, `text-sm` (14px) titles. No 9/12/13px. |

`node scripts/normalize-ui.js` re-applies the button/card/input sizing rules to `src/app.jsx` (safe to re-run).

## Fitbod-style look (default theme "Fitbod Black")
- Palette: true-black background, `#1C1C1E` cards, near-invisible borders (`th-line` is barely lighter than the card), one bright blue accent.
- Shapes (tailwind.config.js): `rounded-xl` = 1rem (cards, inputs), `rounded-2xl` = 1.25rem; `src/input.css` turns every `min-h-[44px]` / `min-h-[48px]` button into a pill.
- Font: system SF stack first, Inter as fallback.
- Devices still on the old default (Stealth Ember) are moved to Fitbod Black once; every theme stays selectable in Settings.
