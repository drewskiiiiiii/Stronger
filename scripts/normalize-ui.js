// One-off UI normaliser used to apply the size/format conventions (see DESIGN.md). Run: node scripts/normalize-ui.js
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const fs = require('fs');
const file = 'src/app.jsx';
const src = fs.readFileSync(file, 'utf8');
const ast = parser.parse(src, { plugins: ['jsx'] });

const edits = [];
function literals(n, out = []) {
    if (!n) return out;
    if (n.type === 'StringLiteral') out.push({ start: n.start + 1, end: n.end - 1 });
    else if (n.type === 'TemplateLiteral') n.quasis.forEach(q => out.push({ start: q.start, end: q.end }));
    else if (n.type === 'JSXExpressionContainer') literals(n.expression, out);
    else if (n.type === 'ConditionalExpression') { literals(n.consequent, out); literals(n.alternate, out); }
    else if (n.type === 'LogicalExpression') literals(n.right, out);
    return out;
}
const SPECIAL_BUTTON_LINES = new Set(); // filled below (cells, rows, swatches that keep their own shape)
const keepShape = (cls) => /aria-hidden|w-11 h-11 rounded-full|min-h-\[52px\]|min-h-\[56px\]|min-h-\[46px\]|flex-col py-1 px-3/.test(cls) || /text-left border rounded-2xl p-4|text-left bg-th-card border/.test(cls);

traverse(ast, {
    JSXOpeningElement(path) {
        const name = path.node.name.name;
        const attrs = path.node.attributes;
        const cn = attrs.find(x => x.name && x.name.name === 'className');
        if (!cn) return;
        const lits = literals(cn.value);
        const whole = lits.map(l => src.slice(l.start, l.end)).join(' ');
        const isClickable = name === 'button' || (attrs.some(x => x.name && x.name.name === 'onClick') && name !== 'input');
        const apply = (fn) => lits.forEach(l => { const o = src.slice(l.start, l.end); const n = fn(o); if (n !== o) edits.push({ start: l.start, end: l.end, text: n }); });

        if (isClickable && !keepShape(whole)) {
            apply(t => t
                .replace(/min-h-\[(?:32|36|40)px\]/g, 'min-h-[44px]')
                .replace(/(?<![\w-])text-\[(?:9|10|11)px\](?![\w-])/g, 'text-xs')
                .replace(/(?<![\w-])font-semibold(?![\w-])/g, 'font-bold')
                .replace(/(?<![\w-])rounded-(?:lg|full)(?![\w-])/g, 'rounded-xl')
                .replace(/(?<![\w-])px-(?:3|3\.5|5)(?![\w-])/g, 'px-4')
                .replace(/(?<![\w-])w-8 h-8(?![\w-])/g, 'w-11 h-11')
                .replace(/(?<![\w-])px-4 py-2(?![\w-])/g, 'px-4 min-h-[44px]'));
        }
        if (name === 'div' && /(^|\s)bg-th-card(\s|$)/.test(whole) && /border/.test(whole)) {
            const dashed = /border-dashed/.test(whole);
            apply(t => t
                .replace(/(?<![\w-])rounded-2xl(?![\w-])/g, 'rounded-xl')
                .replace(/(?<![\w-])p-(?:5|6)(?![\w-])/g, dashed ? 'p-5' : 'p-4')
                .replace(/(?<![\w-])p-3\.5(?![\w-])/g, 'p-4'));
        }
        if (name === 'input' || name === 'select') {
            apply(t => t
                .replace(/(?<![\w-])h-11(?![\w-])/g, 'min-h-[44px]')
                .replace(/(?<![\w-])rounded-lg(?![\w-])/g, 'rounded-xl')
                .replace(/(?<![\w-])text-xs(?![\w-])/g, '')); // inherit 16px so iOS does not zoom on focus
        }
        // global text-size outliers
        apply(t => t
            .replace(/(?<![\w-])text-\[9px\](?![\w-])/g, 'text-[10px]')
            .replace(/(?<![\w-])text-\[12px\](?![\w-])/g, 'text-xs')
            .replace(/(?<![\w-])text-\[13px\](?![\w-])/g, 'text-sm'));
    }
});
// de-duplicate overlapping edits (same literal edited twice): merge by applying sequentially on the final text
const byLit = new Map();
edits.forEach(e => { const k = e.start + ':' + e.end; byLit.set(k, e); });
// Re-run transforms cumulatively per literal: simplest is to iterate until stable.
let out = src;
[...byLit.values()].sort((a, b) => b.start - a.start).forEach(e => { out = out.slice(0, e.start) + e.text + out.slice(e.end); });
fs.writeFileSync(file, out);
console.log(`${byLit.size} class strings updated`);
