const fs = require('fs');
const path = require('path');

const S = (id, body, vb) =>
  `<symbol id="${id}" viewBox="${vb || '0 0 24 24'}">${body}</symbol>`;

const icons = [
  S('i-spray',
    '<rect x="7" y="8.5" width="9" height="11" rx="1.6" stroke="currentColor" stroke-width="1.6" fill="none"/>' +
    '<path d="M9 8.5V6h4v2.5M9.5 4.2h3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" fill="none"/>' +
    '<path d="M18 6.5h2M18 9.5h2M18 12.5h2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" fill="none"/>'),

  S('i-halftone',
    [6, 12, 18].flatMap(x => [6, 12, 18].map(y =>
      `<circle cx="${x}" cy="${y}" r="1.6" fill="currentColor"/>`)).join('')),

  S('i-arrow', '<path d="M4 12h15M13 6l6 6-6 6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" fill="none"/>'),
  S('i-arrow-left', '<path d="M20 12H5M11 18l-6-6 6-6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" fill="none"/>'),
  S('i-arrow-up', '<path d="M12 20V5M6 11l6-6 6 6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" fill="none"/>'),
  S('i-chevron', '<path d="M8 5l7 7-7 7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" fill="none"/>'),
  S('i-close', '<path d="M6 6l12 12M18 6 6 18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" fill="none"/>'),
  S('i-menu', '<path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" fill="none"/>'),
  S('i-check', '<path d="m4.5 12.5 5 5 10-11" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>'),
  S('i-quote', '<path d="M9.5 5.5c-3.4 1.6-5.2 4.2-5.2 7.8V18.5h5.4v-5.4H7.2c.1-2 1-3.4 2.9-4.3zM20 5.5c-3.4 1.6-5.2 4.2-5.2 7.8V18.5h5.4v-5.4h-2.5c.1-2 1-3.4 2.9-4.3z" fill="currentColor"/>'),
  S('i-mail', '<rect x="3" y="5.5" width="18" height="13" rx="3" stroke="currentColor" stroke-width="1.6" fill="none"/><path d="m4.6 8.2 6.3 4.3a2 2 0 0 0 2.2 0l6.3-4.3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" fill="none"/>'),
  S('i-pin', '<path d="M12 21c4-4.3 6-7.4 6-10a6 6 0 1 0-12 0c0 2.6 2 5.7 6 10z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" fill="none"/><circle cx="12" cy="11" r="2.2" stroke="currentColor" stroke-width="1.6" fill="none"/>'),
  S('i-clock', '<circle cx="12" cy="12" r="8.2" stroke="currentColor" stroke-width="1.6" fill="none"/><path d="M12 7.4V12l3.2 2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" fill="none"/>'),
  S('i-users', '<circle cx="9.4" cy="9" r="3.3" stroke="currentColor" stroke-width="1.6" fill="none"/><path d="M3.8 19c0-3 2.6-5 5.6-5s5.6 2 5.6 5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" fill="none"/><path d="M15.6 6.3a3 3 0 0 1 0 5.6M17 14.6c2.2.5 3.6 2.2 3.6 4.4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" fill="none"/>'),
  S('i-spark', '<path d="M12 3.5 13.9 10 20.5 12l-6.6 2L12 20.5 10.1 14 3.5 12l6.6-2z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" fill="none"/>'),
  S('i-expand', '<path d="M9 4.5H4.5V9M15 4.5h4.5V9M9 19.5H4.5V15M15 19.5h4.5V15" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" fill="none"/>'),
  S('i-star', '<path d="m12 4 2.4 5.2 5.6.7-4.1 3.9 1 5.6L12 16.7l-4.9 2.7 1-5.6L4 9.9l5.6-.7z" fill="currentColor"/>'),
  S('i-instagram', '<rect x="3.5" y="3.5" width="17" height="17" rx="5" stroke="currentColor" stroke-width="1.6" fill="none"/><circle cx="12" cy="12" r="3.8" stroke="currentColor" stroke-width="1.6" fill="none"/><circle cx="16.9" cy="7.2" r="1.1" fill="currentColor"/>'),
  S('i-youtube', '<rect x="2.5" y="5.5" width="19" height="13" rx="4" stroke="currentColor" stroke-width="1.6" fill="none"/><path d="m10.4 9.4 5 2.6-5 2.6z" fill="currentColor"/>'),
  S('i-github', '<path d="M15 20.5v-2.7c0-.9-.3-1.5-.7-1.9 2.3-.3 4.4-1.2 4.4-5a3.9 3.9 0 0 0-1.1-2.7 3.6 3.6 0 0 0-.1-2.7s-.9-.3-3 1.1a10.4 10.4 0 0 0-5.4 0C7 5.2 6.1 5.5 6.1 5.5a3.6 3.6 0 0 0-.1 2.7A3.9 3.9 0 0 0 4.9 11c0 3.7 2.1 4.6 4.4 5-.3.3-.6.8-.7 1.5-1.3.6-2.9.2-3.6-1.2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>'),
  S('i-linkedin', '<rect x="3.5" y="3.5" width="17" height="17" rx="4" stroke="currentColor" stroke-width="1.5" fill="none"/><path d="M8 10.4V16.5M8 7.8v.1M11.6 16.5v-3.4a2.1 2.1 0 0 1 4.2 0v3.4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" fill="none"/>'),
  S('i-whatsapp', '<path d="M20 11.6a8 8 0 0 1-11.8 7l-4.2 1.2 1.2-4.1A8 8 0 1 1 20 11.6z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" fill="none"/><path d="M9.2 8.6c-.4 2 .7 3.6 2.6 4.5 1.1.5 2 .4 2.5-.3l-1.4-1-1 .5c-.7-.4-1.2-1-1.5-1.7l.6-.8-1-1.4z" fill="currentColor"/>'),
  S('i-crown', '<path d="M3 8l4 3 5-6 5 6 4-3-2 10H5L3 8z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" fill="none"/>'),
  S('i-search', '<circle cx="11" cy="11" r="6.4" stroke="currentColor" stroke-width="1.7" fill="none"/><path d="m16 16 4.4 4.4" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" fill="none"/>'),
  S('i-play', '<path d="M7 4.5 19 12 7 19.5z" fill="currentColor"/>'),

  S('i-bulb',
    '<path d="M12 3.5a5.5 5.5 0 0 0-3.2 10c.5.4.8 1 .8 1.6h4.8c0-.6.3-1.2.8-1.6A5.5 5.5 0 0 0 12 3.5z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" fill="none"/>' +
    '<path d="M9.8 18h4.4M10.6 20.3h2.8" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" fill="none"/>'),

  S('i-book',
    '<path d="M4.5 5.2h4.2A3.3 3.3 0 0 1 12 8.5a3.3 3.3 0 0 1 3.3-3.3h4.2v12.6h-4.2A3.3 3.3 0 0 0 12 21a3.3 3.3 0 0 0-3.3-3.2H4.5z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" fill="none"/>' +
    '<path d="M12 8.5V21" stroke="currentColor" stroke-width="1.5" fill="none"/>'),

  S('i-layers',
    '<path d="m12 4 8 4-8 4-8-4z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" fill="none"/>' +
    '<path d="m4.5 12.5 7.5 3.8 7.5-3.8" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" fill="none"/>' +
    '<path d="m4.5 16.5 7.5 3.8 7.5-3.8" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" fill="none"/>')
];

/* O sprite abre em 01-head.html e fecha aqui, no fim do bloco de simbolos. */
const CLOSE = '</defs>\n</svg>\n';

const target = path.resolve(__dirname, 'html', '02-icons.html');
fs.writeFileSync(target, icons.join('\n') + '\n' + CLOSE, 'utf8');
console.log('icones gerados:', icons.length);
