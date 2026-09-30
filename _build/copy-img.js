const fs = require('fs');
const path = require('path');

const SRC = 'C:/Users/ZYNOX/.cline/data/workspaces/chat/fanzine-landing/imagens';
const OUT = 'C:/Users/ZYNOX/.cline/data/workspaces/chat/fanzine-landing/assets/img';

if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

const map = {
  'hero-roger.jpg': 'maxresdefault (21).jpg',
  'colagem-tesoura.jpg': 'maxresdefault (3).jpg',
  'zines-espalhados.jpg': 'maxresdefault (1).jpg',
  'encaderna-sanfona.jpg': 'maxresdefault (7).jpg',
  'encaderna-xerox.jpg': 'maxresdefault (9).jpg',
  'roger-antidoto.jpg': 'maxresdefault (12).jpg',
  'oficina-materiais.jpg': 'maxresdefault (16).jpg',
  'mural-zines.jpg': 'maxresdefault (27).jpg',
  'clube-fanzine.jpg': 'maxresdefault (30).jpg',
  'recortes-coloridos.jpg': 'maxresdefault (33).jpg',
  'roger-nao-contam.jpg': 'maxresdefault (42).jpg',
  'capas-editoriais.jpg': 'maxresdefault (45).jpg',
  'manifesto-rua.jpg': 'maxresdefault (48).jpg',
  'mesa-tipos.jpg': 'maxresdefault (51).jpg',
  'zine-silencio.jpg': 'maxresdefault (58).jpg',
  'roger-o-que-e.jpg': 'maxresdefault (65).jpg',
  'zine-caos-social.jpg': 'maxresdefault (70).jpg',
  'evento-palco.jpg': 'maxresdefault (75).jpg'
};

let n = 0;
for (const [dest, src] of Object.entries(map)) {
  const s = path.join(SRC, src);
  if (!fs.existsSync(s)) { console.log('FALTOU: ' + src); continue; }
  fs.copyFileSync(s, path.join(OUT, dest));
  n++;
}
console.log('copiadas ' + n);
