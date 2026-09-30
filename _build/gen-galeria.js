const fs = require('fs');
const path = require('path');

const items = [
  ['roger-o-que-e.jpg',   'O que n&#227;o te contam',  'Autor segurando fanzine diante de painel colado'],
  ['mural-zines.jpg',     'Mural de zines',         'Mural com colagem de fanzines em preto e branco'],
  ['encaderna-sanfona.jpg','Sanfona de papel',       'Livrinho de papel em sanfona apoiado na mesa'],
  ['colagem-tesoura.jpg', 'Recorte e cola',         'Tesoura sobre recortes e colagem de paginas'],
  ['capas-editoriais.jpg','Capas autorais',         'Tres capas de fanzine diferentes sobre a mesa'],
  ['zine-silencio.jpg',   'Zine de bolso',          'Fanzine de bolso aberto sendo segurado a mao'],
  ['manifesto-rua.jpg',   'Manifesto na rua',       'Faixa de cartaz colada em predio de cidade'],
  ['mesa-tipos.jpg',      'Variedade de formatos',  'Mesa com diferentes formatos de fanzine'],
  ['roger-antidoto.jpg',  'Caderno e zine',         'Autor segurando zine e caderno costurado'],
  ['oficina-materiais.jpg','Oficina',               'Materiais de encadernacao sobre a mesa'],
  ['evento-palco.jpg',    'Cena ao vivo',           'Entrevista em programa de TV aberta'],
  ['recortes-coloridos.jpg','Colagem colorida',     'Paginas de fanzine recortadas e coloridas']
];

const figures = items.map(function (it) {
  return [
    '      <figure class="gal-item" data-lightbox data-title="' + it[1] + '" tabindex="0" role="button" data-reveal="zoom">',
    '        <img src="assets/img/' + it[0] + '" alt="' + it[2] + '" loading="lazy" decoding="async">',
    '        <figcaption class="gal-cap">',
    '          <span class="gal-cap-txt">' + it[1] + '</span>',
    '          <span class="gal-cap-ico"><svg aria-hidden="true"><use href="#i-expand"></use></svg></span>',
    '        </figcaption>',
    '      </figure>'
  ].join('\n');
}).join('\n');

const html = [
  '',
  '<!-- ==================== GALERIA ==================== -->',
  '<section class="sec paper grain" id="galeria" aria-labelledby="gal-title">',
  '  <div class="wrap">',
  '    <div class="sec-head" data-reveal="up">',
  '      <span class="eyebrow">Arquivo visual</span>',
  '      <h2 class="sec-title sec-title--wide" id="gal-title">Galeria</h2>',
  '      <p class="lead sec-sub">',
  '        Capa, xerox, colagem, sanfona, cartaz e rua. Um recorte do que passa pela mesa',
  '        e pela parede. Clique para ampliar.',
  '      </p>',
  '      <div class="hairline mt-2"></div>',
  '    </div>',
  '',
  '    <div class="gallery-grid" data-stagger>',
  figures,
  '    </div>',
  '  </div>',
  '</section>'
].join('\n');

const out = path.resolve(__dirname, 'html', '14-galeria.html');
fs.writeFileSync(out, html, 'utf8');
console.log('galeria gerada com ' + items.length + ' itens');
