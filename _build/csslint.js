/* csslint.js — encontra anomalias estruturais em arquivos CSS.
   Detecta: (1) seletor que abre { mas nunca recebe declarações e é seguido
   por outro seletor (bloco truncado); (2) declarações órfãs fora de bloco;
   (3) depth final diferente de 0. */
const fs = require('fs');
const path = require('path');

function lint(file) {
  let src = fs.readFileSync(file, 'utf8');
  // remove comentarios e strings preservando quebras de linha
  src = src.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '))
           .replace(/"(?:\\.|[^"\\])*"/g, (m) => m.replace(/[^\n]/g, ' '))
           .replace(/'(?:\\.|[^'\\])*'/g, (m) => m.replace(/[^\n]/g, ' '));

  const lines = src.split('\n');
  const issues = [];
  let depth = 0;
  let state = 'top';          // 'top' = lendo seletor, 'block' = lendo decls
  let blockStartLine = 0;
  let declBuf = '';           // buffer da declaração atual
  let blockHasContent = false;
  const atRuleDepth = new Set();

  function lineOf(i) { return i + 1; }

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const ln = lineOf(i);
    for (let j = 0; j < raw.length; j++) {
      const c = raw[j];
      if (state === 'top') {
        if (c === '{') {
          depth++;
          if (declBuf.trim().startsWith('@')) {
            state = 'top';   // at-rule contem regras
            atRuleDepth.add(depth);
          } else {
            state = 'block';
          }
          blockStartLine = ln;
          declBuf = '';
          blockHasContent = false;
        } else if (c === '}') {
          depth--;
          if (depth < 0) issues.push(ln + ': } sobrando fora de bloco (depth=' + depth + ')');
        } else if (c === ';') {
          issues.push(ln + ': ; no nivel de seletor (bloco anterior nao fechado?)');
        } else {
          declBuf += c;
        }
      } else { // block
        if (c === '{') {
          issues.push(blockStartLine + '-' + ln + ': seletor dentro de bloco "' + declBuf.trim().slice(0, 60) + '" -> bloco de linha ' + blockStartLine + ' nao foi fechado');
          depth++;
          blockStartLine = ln;
          declBuf = '';
          blockHasContent = false;
        } else if (c === '}') {
          if (!blockHasContent && !declBuf.trim()) {
            issues.push(ln + ': bloco VAZIO aberto na linha ' + blockStartLine + ' (corpo perdido)');
          }
          depth--;
          state = 'top';
          declBuf = '';
        } else if (c === ';') {
          if (declBuf.trim()) blockHasContent = true;
          declBuf = '';
        } else {
          declBuf += c;
        }
      }
    }
    if (state === 'block') declBuf += '\n';
  }
  if (state === 'block') issues.push('EOF: bloco aberto desde a linha ' + blockStartLine);
  if (depth !== 0) issues.push('depth final = ' + depth);
  return issues;
}

const targets = process.argv.slice(2);
let total = 0;
targets.forEach(function (t) {
  const files = fs.statSync(t).isDirectory()
    ? fs.readdirSync(t).filter((f) => f.endsWith('.css')).map((f) => path.join(t, f))
    : [t];
  files.forEach(function (f) {
    const issues = lint(f);
    if (issues.length) {
      console.log('=== ' + path.basename(f));
      issues.forEach((s) => console.log('  ' + s));
      total += issues.length;
    }
  });
});
console.log(total === 0 ? 'CSS OK' : ('ANOMALIAS: ' + total));
process.exit(total === 0 ? 0 : 1);
