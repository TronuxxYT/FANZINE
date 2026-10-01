const { execFileSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const chrome = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const dir = path.resolve(__dirname, '..');
const url = 'file:///' + path.join(dir, 'index.html').replace(/\\/g, '/');

const sizes = [
  [1920, 1080],
  [1440, 900],
  [1024, 768],
  [768, 1024],
  [390, 844],
  [360, 740]
];

sizes.forEach(function (s) {
  const out = path.join(dir, 'shot-' + s[0] + '.png');
  try {
    if (fs.existsSync(out)) fs.unlinkSync(out);
    execFileSync(chrome, [
      '--headless=new',
      '--disable-gpu',
      '--no-sandbox',
      '--hide-scrollbars',
      '--user-data-dir=' + path.join(dir, '..', '_chrome-profile'),
      '--window-size=' + s[0] + ',' + s[1],
      '--virtual-time-budget=6000',
      '--screenshot=' + out,
      url
    ], { timeout: 40000, stdio: 'ignore' });
    console.log(s[0] + 'x' + s[1] + ' ->', fs.existsSync(out) ? fs.statSync(out).size + ' bytes' : 'FALHOU');
  } catch (e) {
    console.log(s[0] + 'x' + s[1] + ' -> ERRO');
  }
});
