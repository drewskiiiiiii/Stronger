/* STRONGER program importer.
 * Pure parsing (parseProgramPdf) is separate from the browser glue (importPdfFile) so it can be tested in Node.
 * Input pages: [{ n, items: [{ str, x, y, w, rot }] }] (pdf.js text items, PDF coordinate space, y grows upward).
 * Nothing is guessed: unreadable or ambiguous cells are stored verbatim/null and recorded in `flags`.
 */
(function (root) {
    const SCHEMA_VERSION = 1;
    const PARSER_VERSION = 2;
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
    function parseTables(page, flags, tableNotes) {
        const items = page.items.filter(i => !i.rot && i.str.trim());
        const headers = [];
        for (const line of groupLines(items, 3)) {
            const by = (re) => line.items.find(i => re.test(i.str.trim()));
            const sets = by(/^SETS$/i), reps = by(/^REPS$/i), rpe = by(/^RPE/i), warm = by(/^Warm-up/i), rest = by(/^REST$/i);
            if (sets && reps && rpe) {
                const label = line.items.find(i => i !== warm && i.x < (warm ? warm.x : sets.x) - 10);
                const logCols = line.items.filter(i => /^[123]$/.test(i.str.trim()) && i.x > Math.max(rpe.x + rpe.w, rest ? rest.x + rest.w : 0));
                headers.push({
                    y: line.y,
                    label: label ? label.str.trim() : null,
                    cWarm: warm ? warm.x + warm.w / 2 : null,
                    cSets: sets.x + sets.w / 2,
                    cReps: reps.x + reps.w / 2,
                    cRpe: rpe.x + rpe.w / 2,
                    cRest: rest ? rest.x + rest.w / 2 : null,
                    notesFrom: logCols.length ? Math.min(...logCols.map(i => i.x)) - 5 : Math.max(rpe.x + rpe.w, rest ? rest.x + rest.w : 0) + 40,
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
            let prev = null, prevY = 0;
            for (const line of groupLines(body, 3)) {
                const name = line.items.filter(i => i.x + i.w / 2 < (h.cWarm || h.cSets) - 25);
                const notes = line.items.filter(i => i.x >= h.notesFrom);
                const nums = line.items.filter(i => !name.includes(i) && !notes.includes(i));
                const near = (c) => nums.filter(i => Math.abs(i.x + i.w / 2 - c) < 18).map(i => i.str.trim()).join(' ');
                const cell = {
                    warm: h.cWarm ? near(h.cWarm) : '', sets: near(h.cSets), reps: near(h.cReps), rpe: near(h.cRpe), rest: h.cRest ? near(h.cRest) : ''
                };
                const full = lineText(line);
                if (/^\*?\s*NOTE:|^TOTAL TRAINING TIME/i.test(full)) { // footnotes under a table are not exercises
                    if (/REST TIMES ARE GIVEN IN MINUTES/i.test(full)) tableNotes.push(full);
                    continue;
                }
                const nameStr = name.map(i => i.str).join(' ').replace(/\s+/g, ' ').trim();
                const notesStr = notes.map(i => i.str).join(' ').replace(/\s+/g, ' ').trim();
                const used = [cell.warm, cell.sets, cell.reps, cell.rpe, cell.rest].join(' ').trim().split(/\s+/).filter(Boolean).length;
                if (!nameStr && prev && used === 0 && notesStr) { prev.notes += ' ' + notesStr; continue; } // wrapped note
                if (!nameStr && prev && used > 0 && !notesStr) { // wrapped cell text, e.g. reps "RPE" / "ONLY"
                    for (const k of ['warm', 'sets', 'reps', 'rpe', 'rest']) if (cell[k]) prev[k] = (prev[k] + ' ' + cell[k]).trim();
                    continue;
                }
                if (nameStr && prev && used === 0 && prevY - line.y <= 14) { // wrapped exercise name (and maybe notes) directly under its row
                    prev.name += ' ' + nameStr; if (notesStr) prev.notes += ' ' + notesStr; continue;
                }
                if (!nameStr && !notesStr && used === 0) continue;
                const row = { name: nameStr, ...cell, notes: notesStr, rowFlags: [] };
                if (!nameStr) row.rowFlags.push('Exercise name missing or unreadable');
                if (nums.some(i => ![cell.warm, cell.sets, cell.reps, cell.rpe, cell.rest].join(' ').includes(i.str.trim())))
                    row.rowFlags.push('Some table cells could not be assigned to a column');
                rows.push(row); prev = row; prevY = line.y;
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
        else if (!/^\d+(-\d+)?(\s*SEC)?$/i.test(r.reps)) flags.push(`Reps are not a number or range; kept exactly as written in the source ("${r.reps}")`);
        let intensity = null;
        if (r.rpe) {
            if (/^\d+(-\d+)?%$/.test(r.rpe)) intensity = { raw: r.rpe, type: '%1RM' };
            else if (/^\d+(\.\d+)?(-\d+(\.\d+)?)?$/.test(r.rpe)) intensity = { raw: r.rpe, type: 'RPE' };
            else { intensity = { raw: r.rpe, type: 'unknown' }; flags.push(`Intensity not recognized ("${r.rpe}")`); }
        } else flags.push('Intensity (RPE/%1RM) missing');
        let rest = null;
        if (r.rest) {
            const m = r.rest.match(/^(\d+(?:\.\d+)?)(?:\s*-\s*(\d+(?:\.\d+)?))?\s*MIN/i);
            rest = m ? { raw: r.rest, minSeconds: Math.round(parseFloat(m[1]) * 60), maxSeconds: Math.round(parseFloat(m[2] || m[1]) * 60) } : { raw: r.rest, minSeconds: null, maxSeconds: null };
            if (!m) flags.push(`Rest not recognized ("${r.rest}"); shown as written`);
        }
        return {
            order, name: r.name, warmupSets: warm, workingSets: sets, reps: r.reps || null,
            intensity, rest, restSeconds: null, notes: r.notes.trim(), page, flags
        };
    }

    const FOOTER_RE = /JEFF NIPPARD.*PROGRAM\s*\d*$/i;
    const DAYS = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
    const labelKey = (s) => norm(s.replace(/&/g, ' and '));

    // Entries are either "• Name: value" bullets or "NAME: value" paragraphs that may wrap over several lines.
    function parseListPage(lines) {
        const body = lines.filter(l => !FOOTER_RE.test(l));
        if (body.some(l => l.includes('•'))) {
            return body.join(' ').split('•').map(x => x.trim()).filter(Boolean).map(x => {
                const k = x.indexOf(':');
                return k < 0 ? null : { name: x.slice(0, k).trim(), value: x.slice(k + 1).trim(), format: 'list' };
            }).filter(Boolean);
        }
        const entries = [];
        for (const l of body) {
            const m = l.match(/^([A-Z][A-Z0-9 \/&\-.'’()]*?):(?:\s+(.*))?$/);
            if (m) entries.push({ name: m[1].trim(), value: (m[2] || '').trim(), format: 'text' });
            else if (entries.length) entries[entries.length - 1].value = (entries[entries.length - 1].value + ' ' + l).trim();
        }
        return entries;
    }
    const looksLikeEntries = (lines) => lines.length && (/^•/.test(lines[0]) || /^[A-Z][A-Z0-9 \/&\-.'’()]*:(\s|$)/.test(lines[0]));

    function parseSchedules(sectionPages) {
        const out = [];
        for (const lines of sectionPages) {
            let cur = null;
            for (const l of lines) {
                const h = l.match(/^(.+ROUTINE):$/i);
                if (h) { cur = { routine: h[1], days: [] }; out.push(cur); continue; }
                const d = cur && l.match(/^(MONDAY|TUESDAY|WEDNESDAY|THURSDAY|FRIDAY|SATURDAY|SUNDAY):\s*(.+)$/i);
                if (d) { if (!/^REST$/i.test(d[2].trim())) cur.days.push({ weekday: DAYS.indexOf(d[1].toUpperCase()), label: d[2].trim() }); }
                else if (cur && !/^\*/.test(l)) cur = null;
            }
        }
        return out.filter(r => r.days.length);
    }

    function dedupeItems(items) {
        const seen = new Set();
        return items.filter(i => { const k = `${i.str}|${Math.round(i.x)}|${Math.round(i.y)}`; if (seen.has(k)) return false; seen.add(k); return true; });
    }

    function parseProgramPdf(rawPages, meta) {
        const pages = rawPages.map(p => ({ ...p, items: dedupeItems(p.items) })); // some PDFs overprint text twice

        const flags = [];
        const tableNotes = [];
        const shared = { sections: [], substitutions: [], videos: [], scheduleLines: [] };
        const variants = []; // { title, weeks: Map, phases: Map }
        let current = null;
        let docTitle = null;
        let listMode = null;
        let front = true, back = false;

        for (const page of pages) {
            const rawLines = pageText(page);
            const footer = rawLines.map(l => l.match(/JEFF NIPPARD.S?\s*-?\s*(.+?\bPROGRAM)\s*\d*$/i)).find(Boolean);
            if (footer && !docTitle && !/^[A-Z]+\s*-/.test(footer[1])) docTitle = footer[1].replace(/\s+/g, ' ').replace(/^.*-\s*/, '');
            const lines = rawLines.filter(l => !FOOTER_RE.test(l));
            const joined = lines.join(' ');

            // Variant divider page, e.g. "PUSH/PULL/LEGS | PROGRAM | WEEK | 1" or "FULL BODY PROGRAM | PROGRAM | WEEK | 1"
            const di = lines.findIndex(l => /^PROGRAM$/i.test(l));
            if (page.items.length < 8 && di > 0 && /W\s?E\s?E\s?K/i.test(joined)) {
                front = false;
                const title = lines[di - 1].replace(/\s*PROGRAM$/i, '').trim();
                if (!current || current.title !== title) {
                    current = { title, weeks: new Map(), phases: new Map(), pages: [] };
                    variants.push(current);
                }
                current.pages.push(page.n);
                continue;
            }

            const tables = parseTables(page, flags, tableNotes);
            if (tables.length) {
                front = false; listMode = null;
                if (!current) { current = { title: null, weeks: new Map(), phases: new Map(), pages: [] }; variants.push(current); }
                current.pages.push(page.n);
                const wk = joined.match(/WEEK\s*(\d+)\s*:\s*DAYS?\s*(\d+)(?:\s*-\s*(\d+))?/i);
                if (!wk) { flags.push({ page: page.n, severity: 'high', msg: 'Exercise tables found but week/day heading could not be read; these tables were not assigned to a day' }); continue; }
                const week = parseInt(wk[1], 10), d1 = parseInt(wk[2], 10), d2 = wk[3] ? parseInt(wk[3], 10) : d1;
                const phase = lines.find(l => /^\d+\s*WEEK\s+[A-Z ]+$/i.test(l));
                if (phase) current.phases.set(week, phase);
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

            const head = lines[0] || '';
            if (/^EXERCISE SUB\w+TIONS|^SUBSTITUTION/i.test(head)) { listMode = 'subs'; shared.substitutions.push(...parseListPage(lines.slice(1))); shared.sections.push({ page: page.n, lines: lines.filter(l => !looksLikeEntries([l]) || /^EXERCISE/.test(l)).slice(0, 12) }); continue; }
            if (/^EXERCISE VIDEOS/i.test(head)) { listMode = 'videos'; shared.videos.push(...parseListPage(lines.slice(1))); continue; }
            if (listMode && looksLikeEntries(lines)) { (listMode === 'subs' ? shared.substitutions : shared.videos).push(...parseListPage(lines)); continue; }
            listMode = null;

            if (/^[A-Z ]*ROUTINE:$/i.test(head) || lines.some(l => /^MONDAY:/i.test(l))) shared.scheduleLines.push(lines);
            if (front) {
                if (/^(ABOUT THIS PROGRAM|PROGRAM EXPLAINED|KEY TERMS|WARM)/i.test(head)) front = false; else continue;
            }
            if (/^(REFERENCES|COMMENTS FROM JEFF|DISCLAIMER)/i.test(head)) back = true;
            if (back || !lines.length || /^good luck/i.test(head)) continue;
            shared.sections.push({ page: page.n, lines });
        }

        const subs = shared.substitutions, vids = new Map(shared.videos.map(v => [norm(v.name), v.value.replace(/\s+/g, '')]));
        const allNames = new Set();
        variants.forEach(v => v.weeks.forEach(days => days.forEach(d => d.exercises.forEach(e => allNames.add(norm(e.name))))));
        const guidanceFor = (name) => {
            const n = norm(name);
            const exact = subs.filter(x => norm(x.name) === n);
            if (exact.length) return { items: exact, linked: 'exact' };
            const part = subs.filter(x => { const k = norm(x.name); return k && (n.includes(k) || k.includes(n)); });
            return { items: part, linked: part.length ? 'partial' : null };
        };
        const schedules = parseSchedules(shared.scheduleLines);
        const restNote = tableNotes.find(t => /MINUTES/i.test(t)) || null;
        const baseTitle = docTitle ? titleCase(docTitle) : (meta.fileName || 'Imported Program').replace(/\.pdf$/i, '');

        const programs = variants.map(v => {
            const weekNums = [...v.weeks.keys()].sort((a, b) => a - b);
            const weeks = weekNums.map(w => ({ week: w, phase: v.phases.get(w) || null, days: v.weeks.get(w).sort((a, b) => a.day - b.day) }));
            const dayCounts = weeks.map(w => w.days.length);
            const daysPerWeek = Math.max(0, ...weeks.flatMap(w => w.days.map(d => d.day)));
            const pFlags = flags.filter(f => v.pages.includes(f.page));
            if (new Set(dayCounts).size > 1) pFlags.push({ severity: 'medium', msg: `Weeks do not all have the same number of days (${dayCounts.join(', ')})` });
            if (weeks.length && weeks[weeks.length - 1].week !== weeks.length) pFlags.push({ severity: 'medium', msg: 'Week numbers are not consecutive; some weeks may be missing from the import' });
            const partial = new Set();
            weeks.forEach(w => w.days.forEach(d => d.exercises.forEach(e => {
                const g = guidanceFor(e.name);
                if (g.items.length) { e.sourceGuidance = g.items.map(x => ({ name: x.name, text: x.value, format: x.format })); e.guidanceLink = g.linked; if (g.linked === 'partial') partial.add(e.name); }
                const list = g.items.filter(x => x.format === 'list');
                if (list.length) e.sourceSubstitutions = list[0].value.split(/,\s*|\s+or\s+/).map(x => x.trim()).filter(Boolean);
                const vid = vids.get(norm(e.name)); if (vid) e.videoUrl = vid;
                e.flags.forEach(m => pFlags.push({ page: e.page, severity: 'medium', msg: `${d.label} (week ${w.week}), ${e.name || 'row ' + e.order}: ${m}` }));
            })));
            if (partial.size) pFlags.push({ severity: 'low', msg: `Substitution guidance for ${partial.size} exercise(s) was linked by partial name match (e.g. ${[...partial].slice(0, 4).join(', ')}). Read the wording before relying on it.` });
            const unmatchedSubs = subs.filter(x => !allNames.has(norm(x.name)) && !guidanceNames(allNames, x.name));
            if (unmatchedSubs.length) pFlags.push({ severity: 'low', msg: `Substitution entries not linked to any exercise: ${unmatchedSubs.map(x => x.name).join(', ')}` });
            const unmatchedVids = shared.videos.filter(x => !allNames.has(norm(x.name)));
            if (unmatchedVids.length) pFlags.push({ severity: 'low', msg: `${unmatchedVids.length} video link(s) not matched to an exercise by exact name (e.g. ${unmatchedVids.slice(0, 3).map(x => x.name).join(', ')})` });
            // Weekday layout stated in the PDF, matched by the day labels of week 1.
            let suggested = null;
            const w1 = weeks[0] ? weeks[0].days.map(d => labelKey(d.label)) : [];
            for (const sc of schedules) {
                const keys = sc.days.map(d => labelKey(d.label));
                if (keys.length === w1.length && keys.every((k, i) => k === w1[i])) suggested = { weekdays: sc.days.map(d => d.weekday), text: sc.days.map(d => `${d.weekday >= 0 ? DAYS[d.weekday].slice(0, 3) : '?'}: ${d.label}`).join(', ') };
            }
            const title = v.title ? `${baseTitle} — ${titleCase(v.title)}` : baseTitle;
            return {
                schemaVersion: SCHEMA_VERSION,
                parserVersion: PARSER_VERSION,
                id: `prog-${slug(title)}`,
                name: title,
                source: { fileName: meta.fileName || null, sha256: meta.sha256 || null, pages: v.pages, importedAt: new Date().toISOString(), pageCount: pages.length },
                metadata: {
                    split: v.title ? titleCase(v.title) : null,
                    totalWeeks: weeks.length || null,
                    daysPerWeek: daysPerWeek || null,
                    suggestedWeekdays: suggested ? suggested.weekdays : null,
                    suggestedSchedule: suggested ? suggested.text : null,
                    restNote,
                    level: null, focus: null, equipment: null // not stated in a machine-readable form in the source
                },
                instructions: shared.sections,
                weeks,
                substitutionsFromSource: subs,
                status: 'not_started',
                flags: pFlags,
                importStatus: pFlags.some(f => f.severity === 'high') ? 'needs_review' : (pFlags.length ? 'imported_with_notes' : 'imported')
            };
        });
        if (!programs.length) flags.push({ severity: 'high', msg: 'No workout tables were recognized in this PDF; nothing was imported' });
        return { programs, flags: programs.length ? [] : flags };
    }
    const guidanceNames = (allNames, name) => { const k = norm(name); return [...allNames].some(n => n.includes(k) || k.includes(n)); };

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

    const api = { parseProgramPdf, importPdfFile, SCHEMA_VERSION, PARSER_VERSION };
    if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.StrongerImport = api;
})(typeof window !== 'undefined' ? window : globalThis);
