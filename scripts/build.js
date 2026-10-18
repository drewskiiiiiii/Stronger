// Builds the static site: compiles JSX, generates Tailwind CSS and copies vendored libraries.
// Usage: npm run build
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const run = (cmd) => execSync(cmd, { cwd: root, stdio: 'inherit' });

run('npx babel src/app.jsx --out-file app.js');
run('npx tailwindcss -c tailwind.config.js -i src/input.css -o styles.css --minify');

fs.mkdirSync(path.join(root, 'vendor'), { recursive: true });
const copy = (from, to) => fs.copyFileSync(path.join(root, 'node_modules', from), path.join(root, 'vendor', to));
copy('react/umd/react.production.min.js', 'react.production.min.js');
copy('react-dom/umd/react-dom.production.min.js', 'react-dom.production.min.js');
copy('pdfjs-dist/build/pdf.min.js', 'pdf.min.js');
copy('pdfjs-dist/build/pdf.worker.min.js', 'pdf.worker.min.js');
copy('xlsx/dist/xlsx.full.min.js', 'xlsx.full.min.js');

// Cache version for the service worker = hash of everything it caches, so updates reach installed copies.
const crypto = require('crypto');
const files = ['index.html', 'app.js', 'styles.css', 'pdf-import.js', 'manifest.webmanifest'];
const h = crypto.createHash('sha1');
files.forEach(f => h.update(fs.readFileSync(path.join(root, f))));
const sw = fs.readFileSync(path.join(root, 'src/sw.template.js'), 'utf8').replace('__BUILD_ID__', h.digest('hex').slice(0, 10));
fs.writeFileSync(path.join(root, 'sw.js'), sw);
console.log('Build complete.');
