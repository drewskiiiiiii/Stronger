// Shared test helpers: static file server, browser launch, synthetic spreadsheet programs.
const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

const root = path.join(__dirname, '..');
const types = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.png': 'image/png', '.webmanifest': 'application/manifest+json', '.json': 'application/json' };

function startServer() {
    return new Promise(resolve => {
        const srv = http.createServer((req, res) => {
            let f = path.join(root, decodeURIComponent(req.url.split('?')[0]));
            if (f.endsWith(path.sep)) f = path.join(f, 'index.html');
            fs.readFile(f, (err, data) => {
                if (err) { res.statusCode = 404; return res.end(); }
                res.setHeader('Content-Type', types[path.extname(f)] || 'application/octet-stream');
                res.end(data);
            });
        }).listen(0, () => resolve({ url: `http://localhost:${srv.address().port}/index.html`, close: () => { if (srv.closeAllConnections) srv.closeAllConnections(); srv.close(); } }));
    });
}

function loadPlaywright() {
    for (const m of ['playwright', '/opt/node22/lib/node_modules/playwright']) { try { return require(m); } catch (e) { /* try next */ } }
    throw new Error('playwright is not installed (npm install)');
}

async function launch({ serviceWorkers = 'block' } = {}) {
    const { chromium } = loadPlaywright();
    const exe = ['/opt/pw-browsers/chromium'].find(p => fs.existsSync(p));
    const browser = await chromium.launch(exe ? { executablePath: exe } : {});
    const ctx = await browser.newContext({ viewport: { width: 430, height: 932 }, hasTouch: true, isMobile: true, serviceWorkers, acceptDownloads: true });
    await ctx.route(/googleapis|gstatic|unsplash/, r => r.fulfill({ status: 204, body: '' })); // keep tests independent of the internet
    return { browser, ctx };
}

// ---- Synthetic spreadsheet programs (same layout as the author spreadsheets, but made-up exercises) ----
function makeProgramSheet(XLSX, { title, sheetName, days, weeks }) {
    const exMeta = {};
    days.forEach(d => d.exercises.forEach(e => { if (e.video) exMeta[e.name] = e; }));
    const header = ['', '', 'Exercise', 'Last-Set Intensity Technique', 'Warm-up Sets', 'Working Sets', 'Reps', 'Tracking Load and Reps', '', '', '', 'Early Set RPE', 'Last Set RPE', 'Rest', 'Substitution Option 1', 'Substitution Option 2', 'Notes'];
    const rows = [['', title], ['', 'Copyright (synthetic test fixture)'], ['', 'IMPORTANT PROGRAM NOTES\n\n● Synthetic notes for tests.'], [''], ['', 'Foundation Block']];
    for (let w = 1; w <= weeks; w++) {
        const h = header.slice(); h[1] = `Week ${w}`;
        rows.push(h, ['', '', '', '', '', '', '', 'Set 1', 'Set 2', 'Set 3', 'Set 4']);
        days.forEach((d, i) => {
            d.exercises.forEach((e, k) => rows.push(['', k === 0 ? d.label : '', e.name, e.technique || 'N/A', e.warm || '1-2', e.sets || '2', e.reps || '6-8', '', '', '', '', '~7', '~8', e.rest || '2-3 min', e.sub1 || 'Machine Press', e.sub2 || 'DB Press', e.notes || 'Synthetic note.']));
            if (i === 1) rows.push(['', '', '', '', '', '', '', '', '', 'Rest Day']);
        });
        rows.push(['', '', '', '', '', '', '', '', '', 'Rest Day']);
    }
    const ws = XLSX.utils.aoa_to_sheet(rows);
    // video hyperlinks on exercise names (col C) and substitution options (cols O, P), like the author spreadsheets
    rows.forEach((r, i) => {
        const put = (c, url) => { const a = XLSX.utils.encode_cell({ r: i, c }); if (ws[a] && url) ws[a].l = { Target: url }; };
        const ex = exMeta[r[2]];
        if (ex) { put(2, ex.video); put(14, ex.sub1Video); }
    });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    return wb;
}

function writeFixtures() {
    const XLSX = require('xlsx');
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'stronger-fixtures-'));
    const a = makeProgramSheet(XLSX, { title: 'Test Program Alpha', sheetName: 'Alpha Program', weeks: 2, days: [
        { label: 'Upper', exercises: [{ name: 'Test Bench Press', sets: '2', reps: '6-8', rest: '3-5 min', sub1: 'Test DB Press', video: 'https://youtu.be/BENCHVID', sub1Video: 'https://youtu.be/DBPRESSVID' }, { name: 'Test Row', warm: '2' }] },
        { label: 'Lower', exercises: [{ name: 'Test Squat' }, { name: 'Test Leg Curl' }] },
        { label: 'Push', exercises: [
            { name: 'Test Bench Press', technique: 'Two Drop Sets (~25% per)' },
            { name: 'Test Curl', technique: 'Myo-reps' },
            { name: 'Test Plank', technique: 'Weighted Static Hold (30 sec)' }] }
    ] });
    const b = makeProgramSheet(XLSX, { title: 'Test Program Beta', sheetName: 'Beta Program', weeks: 2, days: [
        { label: 'Day A', exercises: [{ name: 'Beta Press' }] }, { label: 'Day B', exercises: [{ name: 'Beta Pull' }] },
        { label: 'Day C', exercises: [{ name: 'Beta Legs' }] }, { label: 'Day D', exercises: [{ name: 'Beta Core' }] }
    ] });
    const files = { alpha: path.join(dir, 'alpha.xlsx'), beta: path.join(dir, 'beta.xlsx') };
    XLSX.writeFile(a, files.alpha); XLSX.writeFile(b, files.beta);
    return files;
}

module.exports = { root, startServer, launch, writeFixtures };
