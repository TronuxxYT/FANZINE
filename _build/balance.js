const fs = require('fs');
const p = process.argv[2];
let s = fs.readFileSync(p, 'utf8');
s = s.replace(/\/\*[\s\S]*?\*\//g, '')
     .replace(/\/\/.*$/gm, '')
     .replace(/'(?:\\.|[^'\\])*'/g, "'@'")
     .replace(/"(?:\\.|[^"\\])*"/g, '"@"')
     .replace(/`(?:\\.|[^`\\])*`/g, '`@`');
let d = 0, line = 1, neg = [];
for (const c of s) {
  if (c === '\n') { line++; continue; }
  if (c === '{') d++;
  if (c === '}') { d--; if (d < 0) neg.push(line); }
}
console.log('depth final =', d);
console.log('fecha-negativo linhas =', neg.slice(0, 5).join(', ') || 'nenhuma');
