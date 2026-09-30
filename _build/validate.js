const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');

let fail = 0;
function ok(msg) { console.log('OK   ' + msg); }
function bad(msg) { fail++; console.log('FAIL ' + msg); }

/* 1. Ancoras x ids */
const ids = new Set();
var reId = /id="([^"]+)"/g, m;
while ((m = reId.exec(html))) ids.add(m[1]);

const anchors = new Set();
var reA = /href="#([^"]+)"/g;
while ((m = reA.exec(html))) anchors.add(m[1]);

anchors.forEach(function (a) {
  if (ids.has(a)) ok('ancora #' + a);
  else bad('ancora sem alvo: #' + a);
});

/* 2. Requisitos do JS */
['lightbox', 'contato-form', 'year', 'site-nav', 'topo'].forEach(function (id) {
  ids.has(id) ? ok('id #' + id) : bad('id faltando: #' + id);
});
[['.lightbox-figure img', /class="lightbox-figure"/],
 ['.lightbox-cap-title', /lightbox-cap-title/],
 ['.lightbox-cap-count', /lightbox-cap-count/],
 ['.lb-close', /lb-close/],
 ['.lb-prev', /lb-prev/],
 ['.lb-next', /lb-next/],
 ['.form-status', /form-status/],
 ['.to-top', /class="to-top"/]].forEach(function (p) {
  p[1].test(html) ? ok(p[0]) : bad(p[0] + ' ausente');
});

/* 3. Imagens referenciadas existem */
const imgs = new Set();
var reSrc = /src="(assets\/[^"]+)"/g;
while ((m = reSrc.exec(html))) imgs.add(m[1]);
imgs.forEach(function (src) {
  fs.existsSync(path.join(ROOT, src)) ? ok('img ' + src) : bad('img inexistente: ' + src);
});

/* 4. Contagens */
console.log('---');
console.log('sections =', (html.match(/<section/g) || []).length);
console.log('data-reveal =', (html.match(/data-reveal/g) || []).length);
console.log('data-lightbox =', (html.match(/data-lightbox/g) || []).length);
console.log('imagens unicas =', imgs.size);
console.log('anchors =', anchors.size, '/ ids =', ids.size);

/* 5. Tags basicas */
['<main', '</main>', '</body>', '</html>', 'js/script.js', 'css/style.css'].forEach(function (t) {
  html.indexOf(t) !== -1 ? ok('contem ' + t) : bad('falta ' + t);
});

console.log('---');
console.log(fail === 0 ? 'TUDO OK' : ('FALHAS: ' + fail));
process.exit(fail === 0 ? 0 : 1);
