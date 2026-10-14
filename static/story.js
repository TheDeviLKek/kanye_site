'use strict';
const TYPES = { life: 'Жизнь', music: 'Музыка', drama: 'Споры' };
(async () => {
  const [events, albums] = await Promise.all([fetch('/static/story.json').then((r) => r.json()), api('/api/albums')]);
  const byTitle = new Map(albums.map((a) => [a.title, a.id])), box = $('#story'), chips = $('#sf'), cards = [], heads = [];
  let last = null, cur = 'all';
  events.forEach((e) => {
    const dec = e.y < 2000 ? 0 : Math.floor(e.y / 10) * 10;
    if (dec !== last) { last = dec; const h = el('h2', 'dec', dec ? dec + '-е' : 'До 2000-х'); h.dataset.dec = dec; box.append(h); heads.push(h); }
    const c = el('article', 'ev ' + e.t), top = el('div', 'ev-top');
    c.dataset.t = e.t; c.dataset.dec = dec;
    top.append(el('b', 'ev-y', e.y), el('span', 'ev-d', e.d || ''), el('em', 'ev-tag', TYPES[e.t]));
    c.append(top, el('h3', '', e.h), el('p', '', e.p));
    if (e.album && byTitle.has(e.album)) { const a = el('a', 'more', 'Страница альбома →'); a.href = '/album/' + byTitle.get(e.album); c.append(a); }
    box.append(c); cards.push(c);
  });
  const apply = () => {
    cards.forEach((c) => { c.hidden = cur !== 'all' && c.dataset.t !== cur; });
    heads.forEach((h) => { h.hidden = !cards.some((c) => c.dataset.dec === h.dataset.dec && !c.hidden); });
  };
  [['all', 'Всё'], ['life', 'Жизнь'], ['music', 'Музыка'], ['drama', 'Споры']].forEach(([k, l], i) => {
    const b = el('button', 'chip', l); b.type = 'button'; b.setAttribute('aria-pressed', i === 0);
    b.addEventListener('click', () => { cur = k; chips.querySelectorAll('.chip').forEach((x) => x.setAttribute('aria-pressed', x === b)); apply(); });
    chips.append(b);
  });
})().catch(() => { $('#story').textContent = 'Не удалось загрузить историю. Проверьте, что сервер запущен.'; });
