const fs = require('fs');
const path = require('path');
const DIR = 'C:/Users/ZYNOX/.cline/data/workspaces/chat/fanzine-landing/_build/html';
const p = path.join(DIR, '09-formatos.html');
const CJK = /[\u3000-\u9FFF\uFF00-\uFFEF\uAC00-\uD7AF]/;
const lines = fs.readFileSync(p, 'utf8').split(/\r?\n/);

const GOOD = {
  16: '          bastante para ser entregue em mao, barato o bastante para',
  47: '          referencias, estudos de cor, erros e versoes descartadas.'
};

let n = 0;
lines.forEach(function (l, i) {
  if (CJK.test(l) && GOOD[i + 1]) { lines[i] = GOOD[i + 1]; n++; }
});

fs.writeFileSync(p, lines.join('\n'), 'utf8');
console.log('corrigidas: ' + n);
