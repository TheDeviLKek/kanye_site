'use strict';
// «Скачать картинку»: текущая цитата → PNG 1080×1350 для соцсетей
(() => {
  const btn = $('#quote-btn');
  if (!btn) return;
  const save = document.createElement('button');
  save.className = 'ghost big'; save.type = 'button'; save.textContent = 'Скачать картинку'; save.style.marginLeft = '.8rem';
  btn.after(save);
  const wrap = (g, text, w) => {
    const out = []; let line = '';
    text.split(' ').forEach((word) => { const t = line ? line + ' ' + word : word; if (g.measureText(t).width > w && line) { out.push(line); line = word; } else line = t; });
    out.push(line); return out;
  };
  save.addEventListener('click', async () => {
    const text = $('#quote-text').textContent, ctx = $('#quote-ctx').textContent;
    await (document.fonts ? document.fonts.load('800 60px Syne').catch(() => {}) : null);
    const c = document.createElement('canvas'); c.width = 1080; c.height = 1350;
    const g = c.getContext('2d'), fam = 'Syne, ' + getComputedStyle(document.body).fontFamily;
    const bg = g.createLinearGradient(0, 0, 1080, 1350); bg.addColorStop(0, '#0b0a1a'); bg.addColorStop(1, '#000'); g.fillStyle = bg; g.fillRect(0, 0, 1080, 1350);
    const img = new Image(); img.src = '/static/img/p2.jpg'; await img.decode().catch(() => {});
    if (img.naturalWidth) {  // портрет с мягкими краями
      const o = document.createElement('canvas'); o.width = o.height = 760; const og = o.getContext('2d');
      og.drawImage(img, 0, 0, 760, 760); og.globalCompositeOperation = 'destination-in';
      const m = og.createRadialGradient(380, 380, 110, 380, 380, 380); m.addColorStop(0, '#000'); m.addColorStop(1, 'rgba(0,0,0,0)');
      og.fillStyle = m; og.fillRect(0, 0, 760, 760);
      g.globalAlpha = 0.42; g.drawImage(o, 200, 600); g.globalAlpha = 1;
    }
    const glow = g.createRadialGradient(540, 760, 40, 540, 760, 760); glow.addColorStop(0, 'rgba(123,108,255,.3)'); glow.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = glow; g.fillRect(0, 0, 1080, 1350);
    g.textBaseline = 'top'; g.fillStyle = 'rgba(123,108,255,.35)'; g.font = '800 340px ' + fam; g.fillText('“', 70, 20);
    const size = text.length > 160 ? 52 : text.length > 90 ? 64 : 78;
    g.fillStyle = '#ecece6'; g.font = '800 ' + size + 'px ' + fam;
    const lines = wrap(g, text, 880); lines.forEach((l, i) => g.fillText(l, 100, 300 + i * size * 1.2));
    let y = 300 + lines.length * size * 1.2 + 36;
    g.fillStyle = '#9d92ff'; g.font = '600 30px ' + fam; wrap(g, ctx, 880).forEach((l, i) => g.fillText(l, 100, y + i * 40));
    g.fillStyle = '#ecece6'; g.font = '800 44px ' + fam; g.fillText('Эра Ye', 100, 1210);
    g.fillStyle = '#8a8a92'; g.font = '500 26px ' + fam; g.fillText(location.host, 100, 1268);
    const a = document.createElement('a'); a.download = 'era-ye-quote.png'; a.href = c.toDataURL('image/png'); a.click();
  });
})();
