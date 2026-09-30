const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const PROJECT = path.resolve(ROOT, '..');

function readParts(dir, filter) {
  return fs.readdirSync(dir)
    .filter(function (f) { return filter.test(f); })
    .sort()
    .map(function (f) { return fs.readFileSync(path.join(dir, f), 'utf8'); });
}

function ensureDir(p) { if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true }); }

function banner(title) {
  return '\n/* ============================================================\n   ' +
    title + '\n   ============================================================ */\n\n';
}

/* --- CSS ------------------------------------------------------ */
const cssDir = path.join(ROOT, 'css');
const cssOut = path.join(PROJECT, 'css', 'style.css');
ensureDir(path.join(PROJECT, 'css'));
const css = banner('FANZINE — Underground Editorial System · CSS compilado') +
  readParts(cssDir, /\.css$/).join('\n');
fs.writeFileSync(cssOut, css, 'utf8');

/* --- JS ------------------------------------------------------- */
const jsDir = path.join(ROOT, 'js');
const jsOut = path.join(PROJECT, 'js', 'script.js');
ensureDir(path.join(PROJECT, 'js'));
const js = readParts(jsDir, /\.js$/).filter(function (f) { return f !== 'script.js'; }).join('\n');
fs.writeFileSync(jsOut, js, 'utf8');

/* --- HTML ----------------------------------------------------- */
const htmlDir = path.join(ROOT, 'html');
const htmlOut = path.join(PROJECT, 'index.html');
const html = readParts(htmlDir, /\.html$/).join('\n');
fs.writeFileSync(htmlOut, html, 'utf8');

console.log('css  ->', cssOut, (css.length / 1024).toFixed(1) + ' KB');
console.log('js   ->', jsOut, (js.length / 1024).toFixed(1) + ' KB');
console.log('html ->', htmlOut, (html.length / 1024).toFixed(1) + ' KB');
