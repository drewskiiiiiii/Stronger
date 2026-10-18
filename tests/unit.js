// Parser unit tests using synthetic data (no copyrighted program files are needed).
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { parseProgramPdf, parseSpreadsheetProgram } = require('../pdf-import.js');
const { writeFixtures } = require('./helpers');

let passed = 0, failed = 0;
const test = (name, fn) => { try { fn(); passed++; console.log('PASS', name); } catch (e) { failed++; console.log('FAIL', name, '-', e.message); } };

// Build pdf.js-style text items for one synthetic table page.
function tablePage(n, heading, rows) {
    const items = [];
    const put = (str, x, y, w = str.length * 5, rot = false) => items.push({ str, x, y, w, rot });
    put(heading, 700, 585, 72);
    let y = 559;
    put('DAY ONE #1', 60, y, 40); put('Warm-up sets', 147, y, 57); put('SETS', 225, y, 18); put('REPS', 253, y, 19); put('RPE/%1RM', 280, y, 42);
    put('1', 347, y, 3); put('2', 394, y, 5); put('3', 442, y, 5); put('NOTES', 588, y, 24); put('LSRPE', 737, y, 24);
    rows.forEach(r => { y -= 20; put(r.name, 60, y, 60); put(String(r.warm), 174, y, 4); put(String(r.sets), 232, y, 4); put(r.reps, 255, y, 14); put(r.rpe, 299, y, 4); put(r.notes, 510, y, 150); });
    return { n, items };
}

test('PDF table rows are parsed into sets, reps, intensity and notes', () => {
    const pages = [tablePage(1, 'WEEK 1: DAY 1', [
        { name: 'TEST SQUAT', warm: 2, sets: 3, reps: '6-8', rpe: '7', notes: 'Brace hard' },
        { name: 'TEST PRESS', warm: 1, sets: 2, reps: '10', rpe: '50%', notes: 'Slow' }])];
    const { programs } = parseProgramPdf(pages, { fileName: 'x.pdf', sha256: 'abc' });
    assert.strictEqual(programs.length, 1);
    const ex = programs[0].weeks[0].days[0].exercises;
    assert.strictEqual(ex.length, 2);
    assert.deepStrictEqual([ex[0].name, ex[0].warmupSets, ex[0].workingSets, ex[0].reps, ex[0].intensity.raw, ex[0].intensity.type, ex[0].notes], ['TEST SQUAT', 2, 3, '6-8', '7', 'RPE', 'Brace hard']);
    assert.strictEqual(ex[1].intensity.type, '%1RM');
});

test('PDF: unreadable cells are flagged, never invented', () => {
    const pages = [tablePage(1, 'WEEK 1: DAY 1', [{ name: 'TEST ROW', warm: 1, sets: 'x', reps: '??', rpe: '', notes: '' }])];
    const { programs } = parseProgramPdf(pages, { fileName: 'x.pdf' });
    const e = programs[0].weeks[0].days[0].exercises[0];
    assert.strictEqual(e.workingSets, null);
    assert(e.flags.length >= 2, 'expected flags');
    assert(programs[0].flags.length >= 2);
});

test('PDF: duplicated (overprinted) text is ignored', () => {
    const page = tablePage(1, 'WEEK 1: DAY 1', [{ name: 'TEST SQUAT', warm: 1, sets: 3, reps: '8', rpe: '7', notes: 'n' }]);
    page.items = page.items.concat(page.items.map(i => ({ ...i })));
    const { programs } = parseProgramPdf([page], { fileName: 'x.pdf' });
    const e = programs[0].weeks[0].days[0].exercises[0];
    assert.strictEqual(e.workingSets, 3);
});

test('PDF: no tables means nothing is imported', () => {
    const r = parseProgramPdf([{ n: 1, items: [{ str: 'hello', x: 10, y: 10, w: 20, rot: false }] }], { fileName: 'x.pdf' });
    assert.strictEqual(r.programs.length, 0);
    assert(r.flags.length === 1);
});

test('Spreadsheet: weeks, days, rest, RPE, substitutions and techniques', () => {
    const XLSX = require('xlsx');
    const files = writeFixtures();
    const wb = XLSX.readFile(files.alpha);
    const sheets = wb.SheetNames.map(name => ({ name, rows: XLSX.utils.sheet_to_json(wb.Sheets[name], { header: 1, raw: false, defval: '' }), links: {} }));
    const { programs } = parseSpreadsheetProgram(sheets, { fileName: 'alpha.xlsx', sha256: 'h' });
    assert.strictEqual(programs.length, 1);
    const p = programs[0];
    assert.strictEqual(p.name, 'Test Program Alpha');
    assert.strictEqual(p.weeks.length, 2);
    assert.strictEqual(p.metadata.daysPerWeek, 3);
    assert.deepStrictEqual(p.weeks[0].pattern, ['Upper', 'Lower', 'Rest', 'Push', 'Rest']);
    const bench = p.weeks[0].days[0].exercises[0];
    assert.strictEqual(bench.rest.minSeconds, 180); assert.strictEqual(bench.rest.maxSeconds, 300);
    assert.strictEqual(bench.intensity.type, 'RPE');
    assert.deepStrictEqual(bench.sourceSubstitutions, ['Test DB Press', 'DB Press']);
    assert.strictEqual(p.weeks[0].days[2].exercises[0].technique, 'Two Drop Sets (~25% per)');
});

test('Spreadsheet: a sheet without a workout table imports nothing', () => {
    const r = parseSpreadsheetProgram([{ name: 'Notes', rows: [['just text']], links: {} }], { fileName: 'n.xlsx' });
    assert.strictEqual(r.programs.length, 0);
});

// Optional checks against your own program files: put PDFs/XLSX in tests/fixtures/ (git-ignored).
const fx = path.join(__dirname, 'fixtures');
if (fs.existsSync(fx)) {
    const xlsxFiles = fs.readdirSync(fx).filter(f => f.endsWith('.xlsx'));
    xlsxFiles.forEach(f => test(`Your file ${f} imports with no high-severity flags`, () => {
        const XLSX = require('xlsx');
        const wb = XLSX.readFile(path.join(fx, f));
        const sheets = wb.SheetNames.map(name => ({ name, rows: XLSX.utils.sheet_to_json(wb.Sheets[name], { header: 1, raw: false, defval: '' }), links: {} }));
        const { programs } = parseSpreadsheetProgram(sheets, { fileName: f });
        assert(programs.length >= 1, 'no program found');
        programs.forEach(p => assert(!p.flags.some(x => x.severity === 'high'), 'high-severity flag in ' + p.name));
    }));
}

console.log(`\nunit: ${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
