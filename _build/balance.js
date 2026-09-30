const fs = require('fs');
const p = process.argv[2];
let s = fs.readFileSync(p, 'utf8');
const isCss = /\.css$/i.test(p);
s = s.replace(/\/\*[\s\S]*?\*\//g, '')
     .replace(/'(?:\\.|[^'\\])*'/g, "'@'")
     .replace(/"(?:\\.|[^"\\])*"/g, '"@"')
     .replace(/`(?:\\.|[^`\\])*`/g, '`@`');
// '//' so e comentario em JS; em CSS pode aparecer dentro de data URI (http://...)
if (!isCss) {
  s = s.replace(/\/\/.*$/gm, '');
}
let d = 0, line = 1, neg = [];
for (const c of s) {
  if (c === '\n') { line++; continue; }
  if (c === '{') d++;
  if (c === '}') { d--; if (d < 0) neg.push(line); }
}
console.log('depth final =', d);
console.log('fecha-negativo linhas =', neg.slice(0, 5).join(', ') || 'nenhuma');
