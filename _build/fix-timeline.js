const fs = require('fs');
const p = 'C:/Users/ZYNOX/.cline/data/workspaces/chat/fanzine-landing/_build/html/06-historia.html';
let s = fs.readFileSync(p, 'utf8');

const good = '        <p class="tl-text">Com a m' + String.fromCharCode(225) + 'quina copiadora barata, multiplicar sai do controle das editoras. Contracultura, cartazes de guerra e discuss' + String.fromCharCode(245) + 'es de rua deixam de depender de circuitos tradicionais e passam a falar direto com quem l' + String.fromCharCode(234) + '.</p>';

const lines = s.split(/\r?\n/);
const idx = lines.findIndex(l => l.indexOf('copiadora barata') !== -1);
if (idx === -1) { console.log('linha nao encontrada'); process.exit(1); }
lines[idx] = good;
fs.writeFileSync(p, lines.join('\n'), 'utf8');
console.log('linha ' + (idx + 1) + ' corrigida:');
console.log(lines[idx]);
