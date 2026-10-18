// Runs all tests: node tests/run.js  (or npm test)
const { spawnSync } = require('child_process');
const path = require('path');
let code = 0;
for (const f of ['unit.js', 'e2e.js']) {
    console.log(`\n=== ${f} ===`);
    const r = spawnSync(process.execPath, [path.join(__dirname, f)], { stdio: 'inherit', env: process.env });
    if (r.status !== 0) code = 1;
}
process.exit(code);
