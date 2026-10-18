/* STRONGER program importer.
 * Pure parsing (parseProgramPdf) is separate from the browser glue (importPdfFile) so it can be tested in Node.
 * Input pages: [{ n, items: [{ str, x, y, w, rot }] }] (pdf.js text items, PDF coordinate space, y grows upward).
 * Nothing is guessed: unreadable or ambiguous cells are stored verbatim/null and recorded in `flags`.
 */
(function (root) {
    const SCHEMA_VERSION = 1;
    const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
    const slug = (s) => norm(s).replace(/ /g, '-');
    const titleCase = (s) => s.toLowerCase().replace(/(^|[\s/])([a-z])/g, (m, a, b) => a + b.toUpperCase());

    function groupLines(items, tol) {
        const sorted = [...items].sort((a, b) => b.y - a.y || a.x - b.x);
        const lines = [];
        for (const it of sorted) {
            const last = lines[lines.length - 1];
            if (last && Math.abs(last.y - it.y) <= tol) last.items.push(it);
            else lines.push({ y: it.y, items: [it] });
        }
        lines.forEach(l => l.items.sort((a, b) => a.x - b.x));
        return lines;
    }
    const lineText = (l) => l.items.map(i => i.str).join(' ').replace(/\s+/g, ' ').trim();
    const pageText = (page) => groupLines(page.items.filter(i => !i.rot), 3).map(lineText);

    // Parse one page's exercise tables (header row contains SETS, REPS and RPE/%1RM columns).
    function parseTables(page, flags) {
        const items = page.items.filter(i => !i.rot && i.str.trim());
        const headers = [];
        for (const line of groupLines(items, 3)) {
            const by = (re) => line.items.find(i => re.test(i.str.trim()));
            const sets = by(/^SETS$/i), reps = by(/^REPS$/i), rpe = by(/^RPE/i), warm = by(/^Warm-up/i);
            if (sets && reps && rpe) {
                const label = line.items.find(i => i !== warm && i.x < (warm ? warm.x : sets.x) - 10);
                const logCols = line.items.filter(i => /^[123]$/.test(i.str.trim()) && i.x > rpe.x + rpe.w);
                headers.push({
                    y: line.y,
                    label: label ? label.str.trim() : null,
                    cWarm: warm ? warm.x + warm.w / 2 : null,
                    cSets: sets.x + sets.w / 2,
                    cReps: reps.x + reps.w / 2,
                    cRpe: rpe.x + rpe.w / 2,
                    notesFrom: logCols.length ? Math.min(...logCols.map(i => i.x)) - 5 : rpe.x + rpe.w + 40,
                    hasWarmCol: !!warm
                });
            }
        }
        const tables = [];
        headers.forEach((h, idx) => {
            const nextY = idx + 1 < headers.length ? headers[idx + 1].y : -Infinity;
            // Rows lie below this header and above the next table's header.
            const body = items.filter(i => i.y < h.y - 3 && i.y > nextY + 3 && i.y < h.y);
            const rows = [];
            let prev = null;
            for (const line of groupLines(body, 3)) {
                const name = line.items.filter(i => i.x + i.w / 2 < (h.cWarm || h.cSets) - 25);
                const notes = line.items.filter(i => i.x >= h.notesFrom);
                const nums = line.items.filter(i => !name.includes(i) && !notes.includes(i));
                const near = (c) => nums.filter(i => Math.abs(i.x + i.w / 2 - c) < 18).map(i => i.str.trim()).join(' ');
                const cell = {
                    warm: h.cWarm ? near(h.cWarm) : '', sets: near(h.cSets), reps: near(h.cReps), rpe: near(h.cRpe)
                };
                const nameStr = name.map(i => i.str).join(' ').replace(/\s+/g, ' ').trim();
                const notesStr = notes.map(i => i.str).join(' ').replace(/\s+/g, ' ').trim();
                const used = [cell.warm, cell.sets, cell.reps, cell.rpe].join(' ').trim().split(/\s+/).filter(Boolean).length;
                if (!nameStr && prev && used === 0 && notesStr) { prev.notes += ' ' + notesStr; continue; } // wrapped note
                if (!nameStr && prev && used > 0 && !notesStr) { // wrapped cell text, e.g. reps "RPE" / "ONLY"
                    for (const k of ['warm', 'sets', 'reps', 'rpe']) if (cell[k]) prev[k] = (prev[k] + ' ' + cell[k]).trim();
                    continue;
                }
                if (nameStr && prev && used === 0 && !notesStr && (prev.name.match(/\(/g) || []).length > (prev.name.match(/\)/g) || []).length) {
                    prev.name += ' ' + nameStr; continue; // wrapped name inside an open parenthesis
                }
                if (!nameStr && !notesStr && used === 0) continue;
                const row = { name: nameStr, ...cell, notes: notesStr, rowFlags: [] };
                if (!nameStr) row.rowFlags.push('Exercise name missing or unreadable');
                if (nums.some(i => ![cell.warm, cell.sets, cell.reps, cell.rpe].join(' ').includes(i.str.trim())))
                    row.rowFlags.push('Some table cells could not be assigned to a column');
                rows.push(row); prev = row;
            }
            tables.push({ label: h.label, y: h.y, hasWarmCol: h.hasWarmCol, rows });
        });
        return tables;
    }

    function convertRow(r, order, page) {
        const flags = [...r.rowFlags];
        const int = (v) => (/^\d+$/.test(v) ? parseInt(v, 10) : null);
        const sets = int(r.sets);
        if (sets === null) flags.push(`Working sets unreadable ("${r.sets}")`);
        const warm = r.warm === '' ? null : int(r.warm);
        if (r.warm !== '' && warm === null) flags.push(`Warm-up sets unreadable ("${r.warm}")`);
        if (!r.reps) flags.push('Reps missing');
        else if (!/^\d+(-\d+)?$/.test(r.reps)) flags.push(`Reps are not a number or range; kept exactly as written in the source ("${r.reps}")`);
        let intensity = null;
        if (r.rpe) {
            if (/^\d+(-\d+)?%$/.test(r.rpe)) intensity = { raw: r.rpe, type: '%1RM' };
            else if (/^\d+(\.\d+)?(-\d+(\.\d+)?)?$/.test(r.rpe)) intensity = { raw: r.rpe, type: 'RPE' };
            else { intensity = { raw: r.rpe, type: 'unknown' }; flags.push(`Intensity not recognized ("${r.rpe}")`); }
        } else flags.push('Intensity (RPE/%1RM) missing');
        return {
            order, name: r.name, warmupSets: warm, workingSets: sets, reps: r.reps || null,
            intensity, restSeconds: null, notes: r.notes.trim(), page, flags
        };
    }

    function parseListPage(lines, header) {
        // "• Name: value, value" entries, which may wrap onto following lines.
        const text = lines.filter(l => !l.startsWith(header) && !/COMEBACK PROGRAM\s+\d+$/.test(l) && !/PROGRAM\s+\d+$/.test(l)).join(' ');
        return text.split('•').map(s => s.trim()).filter(Boolean).map(s => {
            const k = s.indexOf(':');
            return k < 0 ? null : { name: s.slice(0, k).trim(), value: s.slice(k + 1).trim() };
        }).filter(Boolean);
    }

    function parseProgramPdf(pages, meta) {
        const flags = [];
        const shared = { sections: [], substitutions: [], videos: [] };
        const variants = []; // { title, weeks: Map }
        let current = null;
        let docTitle = null;

        for (const page of pages) {
            const lines = pageText(page);
            const joined = lines.join(' ');
            const footer = lines.map(l => l.match(/JEFF NIPPARD.S\s*-\s*(.+?\bPROGRAM)\s*\d*$/i)).find(Boolean);
            if (footer && !docTitle) docTitle = footer[1].replace(/\s+/g, ' ');

            // Variant divider page, e.g. "PUSH/PULL/LEGS | PROGRAM | W E E K | 1"
            const di = lines.findIndex(l => /^PROGRAM$/i.test(l));
            if (page.items.length < 8 && di > 0 && /W\s?E\s?E\s?K/i.test(joined)) {
                const title = lines[di - 1];
                if (!current || current.title !== title) {
                    current = { title, weeks: new Map(), pages: [] };
                    variants.push(current);
                }
                current.pages.push(page.n);
                continue;
            }

            const tables = parseTables(page, flags);
            if (tables.length) {
                if (!current) { current = { title: null, weeks: new Map(), pages: [] }; variants.push(current); }
                current.pages.push(page.n);
                const wk = joined.match(/WEEK\s*(\d+)\s*:\s*DAYS?\s*(\d+)(?:\s*-\s*(\d+))?/i);
                if (!wk) { flags.push({ page: page.n, severity: 'high', msg: 'Exercise tables found but week/day heading could not be read; these tables were not assigned to a day' }); continue; }
                const week = parseInt(wk[1], 10), d1 = parseInt(wk[2], 10), d2 = wk[3] ? parseInt(wk[3], 10) : d1;
                if (d2 - d1 + 1 !== tables.length)
                    flags.push({ page: page.n, severity: 'high', msg: `Heading says days ${d1}-${d2} but ${tables.length} tables were found; day assignment is uncertain` });
                // Cross-check with the rotated "DAY n" side labels when present.
                const sideDays = page.items.filter(i => i.rot && /^DAY\s*\d+$/i.test(i.str.trim())).sort((a, b) => b.y - a.y).map(i => parseInt(i.str.replace(/\D/g, ''), 10));
                tables.forEach((t, i) => {
                    const day = d1 + i;
                    if (sideDays.length === tables.length && sideDays[i] !== day)
                        flags.push({ page: page.n, severity: 'high', msg: `Table "${t.label}" is labelled day ${sideDays[i]} on the page but heading order implies day ${day}` });
                    const exercises = t.rows.map((r, k) => convertRow(r, k + 1, page.n));
                    if (!exercises.length) flags.push({ page: page.n, severity: 'high', msg: `Table "${t.label}" had no readable exercise rows` });
                    if (!current.weeks.has(week)) current.weeks.set(week, []);
                    current.weeks.get(week).push({ day, label: t.label, page: page.n, exercises });
                });
                continue;
            }

            if (/^SUBSTITUTION|^EXERCISE SUB/i.test(lines[0] || '') || /EXERCISE SUB\w+TIONS/i.test(lines[0] || '')) { shared.substitutions.push(...parseListPage(lines, lines[0])); continue; }
            if (/^EXERCISE VIDEOS/i.test(lines[0] || '')) { shared.videos.push(...parseListPage(lines, lines[0])); continue; }
            if (/^•/.test(lines[0] || '') && shared.substitutions.length && !shared.videos.length) { shared.substitutions.push(...parseListPage(lines, '')); continue; }
            if (/^•/.test(lines[0] || '') && shared.videos.length) { shared.videos.push(...parseListPage(lines, '')); continue; }
            if (lines.length && !/^(DISCLAIMER|ABOUT|TABLE OF CONTENTS)/i.test(lines[0]) && !/^good luck/i.test(lines[0]))
                shared.sections.push({ page: page.n, lines: lines.filter(l => !/COMEBACK PROGRAM\s+\d+$/.test(l)) });
        }

        const subs = new Map(shared.substitutions.map(s => [norm(s.name), s]));
        const vids = new Map(shared.videos.map(s => [norm(s.name), s.value]));
        const baseTitle = docTitle ? titleCase(docTitle).replace(/^Jeff Nippard.s\s*-?\s*/i, '') : (meta.fileName || 'Imported Program').replace(/\.pdf$/i, '');

        const allNames = new Set();
        variants.forEach(v => v.weeks.forEach(days => days.forEach(d => d.exercises.forEach(e => allNames.add(norm(e.name))))));
        const programs = variants.map(v => {
            const weekNums = [...v.weeks.keys()].sort((a, b) => a - b);
            const weeks = weekNums.map(w => ({ week: w, days: v.weeks.get(w).sort((a, b) => a.day - b.day) }));
            const dayCounts = weeks.map(w => w.days.length);
            const daysPerWeek = Math.max(0, ...weeks.flatMap(w => w.days.map(d => d.day)));
            const pFlags = flags.filter(f => v.pages.includes(f.page));
            if (new Set(dayCounts).size > 1) pFlags.push({ severity: 'medium', msg: `Weeks do not all have the same number of days (${dayCounts.join(', ')})` });
            const names = new Set();
            weeks.forEach(w => w.days.forEach(d => d.exercises.forEach(e => {
                names.add(norm(e.name));
                const s = subs.get(norm(e.name)); if (s) e.sourceSubstitutions = s.value.split(/,\s*|\s+or\s+/).map(x => x.trim()).filter(Boolean);
                const vid = vids.get(norm(e.name)); if (vid) e.videoUrl = vid;
                e.flags.forEach(m => pFlags.push({ page: e.page, severity: 'medium', msg: `${d.label} (week ${w.week}), ${e.name || 'row ' + e.order}: ${m}` }));
            })));
            shared.substitutions.filter(s => !allNames.has(norm(s.name))).forEach(s =>
                pFlags.push({ severity: 'low', msg: `Source substitution list entry "${s.name}" does not match any exercise name in this PDF (spelling differs or exercise absent)` }));
            const title = v.title ? `${baseTitle} — ${titleCase(v.title)}` : baseTitle;
            return {
                schemaVersion: SCHEMA_VERSION,
                id: `prog-${slug(title)}`,
                name: title,
                source: { fileName: meta.fileName || null, sha256: meta.sha256 || null, pages: v.pages, importedAt: new Date().toISOString(), pageCount: pages.length },
                metadata: {
                    split: v.title ? titleCase(v.title) : null,
                    totalWeeks: weeks.length || null,
                    daysPerWeek: daysPerWeek || null,
                    level: null, focus: null, equipment: null // not stated in a machine-readable form in the source
                },
                instructions: shared.sections,
                weeks,
                substitutionsFromSource: shared.substitutions,
                status: 'not_started',
                flags: pFlags,
                importStatus: pFlags.some(f => f.severity === 'high') ? 'needs_review' : (pFlags.length ? 'imported_with_notes' : 'imported')
            };
        });
        if (!programs.length) flags.push({ severity: 'high', msg: 'No workout tables were recognized in this PDF; nothing was imported' });
        return { programs, flags: programs.length ? [] : flags };
    }

    // ---- Browser glue ----
    const PDFJS_BASE = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/';
    let pdfjsReady = null;
    function loadPdfJs() {
        if (root.pdfjsLib) return Promise.resolve(root.pdfjsLib);
        if (!pdfjsReady) pdfjsReady = new Promise((res, rej) => {
            const s = document.createElement('script');
            s.src = PDFJS_BASE + 'pdf.min.js';
            s.onload = async () => {
                try { // Cross-origin workers are blocked, so wrap the worker source in a same-origin blob.
                    const code = await (await fetch(PDFJS_BASE + 'pdf.worker.min.js')).text();
                    root.pdfjsLib.GlobalWorkerOptions.workerSrc = URL.createObjectURL(new Blob([code], { type: 'application/javascript' }));
                } catch (e) { root.pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_BASE + 'pdf.worker.min.js'; }
                res(root.pdfjsLib);
            };
            s.onerror = () => rej(new Error('Could not load the PDF reader library (needs an internet connection).'));
            document.head.appendChild(s);
        });
        return pdfjsReady;
    }
    async function sha256Hex(buf) {
        const d = await crypto.subtle.digest('SHA-256', buf);
        return [...new Uint8Array(d)].map(b => b.toString(16).padStart(2, '0')).join('');
    }
    function toItems(textContent) {
        return textContent.items.filter(i => i.str && i.str.trim()).map(i => ({
            str: i.str, x: i.transform[4], y: i.transform[5], w: i.width, rot: Math.abs(i.transform[1]) > 0.1 || Math.abs(i.transform[2]) > 0.1
        }));
    }
    async function importPdfFile(file) {
        const lib = await loadPdfJs();
        const buf = await file.arrayBuffer();
        const sha256 = await sha256Hex(buf);
        const doc = await lib.getDocument({ data: new Uint8Array(buf.slice(0)) }).promise;
        const pages = [];
        for (let n = 1; n <= doc.numPages; n++) {
            const pg = await doc.getPage(n);
            pages.push({ n, items: toItems(await pg.getTextContent()) });
        }
        if (!pages.some(p => p.items.length)) throw new Error('This PDF has no extractable text (it may be scanned images). OCR is not supported.');
        return parseProgramPdf(pages, { fileName: file.name, sha256 });
    }

    const api = { parseProgramPdf, importPdfFile, SCHEMA_VERSION };
    if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.StrongerImport = api;
})(typeof window !== 'undefined' ? window : globalThis);
