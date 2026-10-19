# UI conventions

Keep new screens consistent with these sizes (Tailwind classes in `src/app.jsx`; colours always come from the `th-*` theme tokens).

| Element | Rule |
|---|---|
| Touch targets | At least 44px high/wide. |
| Primary call to action | `min-h-[48px]`, `rounded-xl`, `text-sm font-black`, solid accent (shown uppercase). |
| Standard button | `min-h-[44px]`, `px-4`, `rounded-xl`, `text-xs font-bold`; secondary = `bg-th-elevated border border-th-line`. |
| Chip / tab / toggle | Same as a standard button; the selected one is solid accent (normal case). |
| Icon button | `min-w-[44px] min-h-[44px]`, `rounded-xl`. |
| Destructive | Red `#F43F5E` text + border (solid red only inside the confirm dialog). |
| Card | `bg-th-card border border-th-line rounded-xl p-4`; compact list rows `p-3`; empty states `p-5` dashed. |
| Input / select | `min-h-[44px]`, `rounded-xl`, `px-3`, inherit the 16px base size (prevents iOS zoom). |
| Exercise names | Active workout card `text-xl font-black` (with an accent "Exercise n of N" caption); program detail rows `text-base font-black`; history `text-sm font-bold`. |
| Headings | Page title `h2 text-lg font-black` (uppercase); card title `h3 text-sm font-black`. |
| Text scale | 10px captions, 11px small, `text-xs` (12px) controls/body, `text-sm` (14px) titles. No 9/12/13px. |

`node scripts/normalize-ui.js` re-applies the button/card/input sizing rules to `src/app.jsx` (safe to re-run).
