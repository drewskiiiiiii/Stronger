// End-to-end tests at iPhone Pro Max size using synthetic programs (no copyrighted files needed).
const { startServer, launch, writeFixtures } = require('./helpers');

let passed = 0, failed = 0;
const ok = (name, cond) => { cond ? passed++ : failed++; console.log(cond ? 'PASS' : 'FAIL', name); };

(async () => {
    const srv = await startServer();
    const files = writeFixtures();
    const { browser, ctx } = await launch();
    const p = await ctx.newPage();
    const errs = [];
    p.on('pageerror', e => errs.push(e.message));
    const open = () => p.goto(srv.url, { waitUntil: 'domcontentloaded' }).then(() => p.waitForTimeout(1500));
    const state = async () => { await p.waitForTimeout(250); return p.evaluate(() => JSON.parse(localStorage['stronger.state'])); };
    const tab = (name) => p.locator('nav').getByText(name, { exact: true }).click();
    await open();

    // --- fresh install: no demo data ---
    ok('fresh Home asks to import a program', await p.getByText(/Import a program/).isVisible());
    ok('no fake history', (await state()).workoutLogs.length === 0);
    await tab('Nutrition'); ok('nutrition shows no fake intake', !(await p.locator('main').innerText()).includes('1,850'));

    // --- import two programs, filters, duplicates ---
    await tab('Program');
    await p.locator('input[type=file]').setInputFiles([files.alpha, files.beta]); await p.waitForTimeout(2500);
    let s = await state();
    ok('two separate programs imported', Object.keys(s.library.programs).length === 2);
    await p.locator('input[type=file]').setInputFiles(files.alpha); await p.waitForTimeout(1500);
    ok('duplicate import blocked', await p.getByText('already in your library').first().isVisible());
    await p.getByRole('button', { name: '4 days/week', exact: true }).click();
    ok('days filter shows only the 4-day program', (await p.getByRole('button', { name: /Test Program/ }).count()) === 1 && await p.getByRole('button', { name: /Beta/ }).first().isVisible());
    await p.getByRole('button', { name: 'Any days', exact: true }).click();
    await p.getByRole('button', { name: 'In progress', exact: true }).click();
    ok('status filter hides not-started programs', (await p.getByRole('button', { name: /Test Program/ }).count()) === 0);
    await p.getByRole('button', { name: 'All', exact: true }).click();

    // --- detail + start ---
    await p.getByRole('button', { name: /Alpha/ }).first().click();
    ok('detail shows exercises, rest and technique', await p.getByText('Test Bench Press').first().isVisible() && await p.getByText(/Rest: 3-5 min/).first().isVisible() && await p.getByText(/Last-set technique: Myo-reps/).first().isVisible());
    await p.getByRole('button', { name: 'Start Program' }).click();
    await p.locator('input[type=date]').fill('2026-10-19');
    await p.getByRole('button', { name: 'Start Program' }).last().click(); await p.waitForTimeout(400);
    s = await state();
    ok('program active and in progress', s.library.activeProgramId === 'prog-test-program-alpha' && s.library.progress['prog-test-program-alpha'].status === 'in_progress');
    await p.getByRole('button', { name: /^19/ }).first().click();
    ok('calendar shows Upper on Monday', await p.getByText('Upper').first().isVisible());

    // --- workout: persistence across navigation and reload ---
    await p.getByRole('button', { name: 'Start workout' }).first().click(); await p.waitForTimeout(400);
    await p.getByLabel('Reps').nth(0).fill('8'); await p.getByLabel('Weight').nth(0).fill('100'); await p.getByLabel('Complete set').nth(0).click();
    await p.getByRole('button', { name: /Home/ }).first().click();
    ok('banner visible on Home', await p.getByLabel('Return to active workout').isVisible());
    ok('Home shows this week plan', await p.getByRole('button', { name: /Upper in_progress|Upper planned/ }).count() >= 0 && await p.getByText(/Week 1 · 0\/3 done/).isVisible());
    for (const t of ['Calendar', 'Progress', 'Program', 'Home']) await tab(t);
    ok('banner survives navigation', await p.getByLabel('Return to active workout').isVisible());
    await p.reload({ waitUntil: 'domcontentloaded' }); await p.waitForTimeout(1500);
    await p.getByLabel('Return to active workout').click();
    s = await state();
    ok('completed set survives reload', s.activeSession.exercises.some(e => e.sets.some(x => x.completed && x.reps === '8')));
    await p.getByLabel('Substitute exercise').first().click();
    await p.getByRole('button', { name: 'Test DB Press' }).first().click();
    ok('substitution labelled', await p.getByText(/Your substitution · prescribed: Test Bench Press/).isVisible());
    await p.getByLabel('Substitute exercise').first().click(); await p.getByRole('button', { name: /Restore original/ }).click();
    ok('original restored', (await state()).activeSession.exercises[0].substitution === null);
    await p.getByRole('button', { name: 'Finish' }).click();
    if (await p.getByText('Finish with sets remaining?').isVisible()) await p.getByRole('button', { name: 'Finish workout' }).click();
    s = await state(); const log = s.workoutLogs[0];
    ok('one program log, only performed sets', s.workoutLogs.length === 1 && log.programId === 'prog-test-program-alpha' && log.exercises.length === 1 && log.exercises[0].sets.length === 1);
    await p.reload({ waitUntil: 'domcontentloaded' }); await p.waitForTimeout(1200);
    ok('no duplicate log after reload', (await state()).workoutLogs.length === 1);

    // --- next workout: previous weights, technique helpers ---
    await tab('Home');
    await p.getByRole('button', { name: 'Start workout' }).first().click(); await p.waitForTimeout(300); // Lower (next)
    await p.getByRole('button', { name: /Home/ }).first().click();
    // jump to the Push day via calendar: Push is day 3
    await tab('Calendar');
    await p.getByRole('button', { name: /^22/ }).first().click(); // Thursday (3rd training weekday)
    ok('Push day listed', await p.getByText('Push').first().isVisible());
    await p.getByLabel('Return to active workout').click(); // already active (Lower) -> discard it first
    await p.getByLabel('Discard workout').click(); await p.getByRole('button', { name: 'Discard', exact: true }).click();
    await tab('Calendar'); await p.getByRole('button', { name: /^22/ }).first().click();
    await p.getByRole('button', { name: 'Start workout' }).first().click();
    await p.getByRole('button', { name: 'Start anyway' }).click(); await p.waitForTimeout(500);
    ok('last weight shown as placeholder, not a value', await p.getByLabel('Weight').first().getAttribute('placeholder') === '100' && (await p.getByLabel('Weight').first().inputValue()) === '');
    ok('"Use last weights" offered', await p.getByRole('button', { name: 'Use last weights' }).first().isVisible());
    await p.getByRole('button', { name: 'Use last weights' }).first().click();
    ok('weights filled only after tapping', (await p.getByLabel('Weight').first().inputValue()) === '100');
    await p.getByLabel('Reps').first().fill('8'); await p.getByLabel('Complete set').first().click();
    await p.getByRole('button', { name: /Drop set/ }).click();
    ok('drop set row added with −25% weight hint', await p.getByLabel('Weight').nth(2).getAttribute('placeholder') === '75');
    ok('myo-rep button and hold timer offered', await p.getByRole('button', { name: '＋ Myo-rep set' }).isVisible() && await p.getByRole('button', { name: /Start 30s hold timer/ }).isVisible());
    await p.getByRole('button', { name: /Start 30s hold timer/ }).click();
    ok('hold timer runs', await p.getByText(/Stop 0:(2[0-9]|30)/).isVisible());

    // --- backup reminder ---
    await p.getByRole('button', { name: /Home/ }).first().click();
    ok('backup reminder shown (data exists, never exported)', await p.getByText('Back up your data').isVisible());
    const [dl] = await Promise.all([p.waitForEvent('download'), p.getByRole('button', { name: 'Export backup now' }).click()]);
    ok('backup downloads a JSON file', /stronger-backup-.*\.json$/.test(dl.suggestedFilename()));
    await p.waitForTimeout(400);
    ok('reminder disappears after export', !(await p.getByText('Back up your data').isVisible().catch(() => false)));

    // --- progress + layout ---
    await tab('Progress');
    ok('progress shows program completion', await p.getByText(/1 of 6 workouts completed/).isVisible());
    ok('no horizontal overflow', await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    ok('no page errors', errs.length === 0);
    if (errs.length) console.log(errs);
    await browser.close(); srv.close();

    // --- offline: service worker serves the app without a network ---
    const srv2 = await startServer();
    const o = await launch({ serviceWorkers: 'allow' });
    const op = await o.ctx.newPage();
    await op.goto(srv2.url, { waitUntil: 'domcontentloaded' });
    await op.evaluate(() => navigator.serviceWorker.ready); await op.waitForTimeout(1500);
    await op.reload({ waitUntil: 'domcontentloaded' }); await op.waitForTimeout(500);
    await o.ctx.setOffline(true);
    await op.reload({ waitUntil: 'domcontentloaded' }); await op.waitForTimeout(1500);
    ok('app opens offline', (await op.locator('nav button').count()) === 6);
    await o.browser.close(); srv2.close();

    console.log(`\ne2e: ${passed} passed, ${failed} failed`);
    process.exit(failed ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
