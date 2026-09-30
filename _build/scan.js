const fs = require('fs');
const path = require('path');

const roots = process.argv.slice(2);
const bad = /[\u3000-\u9FFF\uFF00-\uFFEF\uAC00-\uD7AF]/;

let found = 0;
for (const root of roots) {
  const walk = (dir) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) { walk(p); continue; }
      if (!/\.(html|css|js|md|json)$/i.test(e.name)) continue;
      const lines = fs.readFileSync(p, 'utf8').split(/\r?\n/);
      lines.forEach((l, i) => {
        if (bad.test(l)) {
          found++;
          console.log(p + ':' + (i + 1) + '  ' + l.trim().slice(0, 130));
        }
      });
    }
  };
  walk(root);
}
console.log(found === 0 ? 'OK: nenhum caractere CJK/corrompido encontrado' : 'TOTAL: ' + found + ' linhas suspeitas');
