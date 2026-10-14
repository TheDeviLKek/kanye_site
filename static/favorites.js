'use strict';
(async () => {
  const data = await api('/api/discography'), box = $('#fav-list'), qs = new URLSearchParams(location.search);
  const shared = (qs.get('ids') || '').split(',').map(Number).filter(Boolean), ids = () => (shared.length ? shared : Fav.ids());
  const byId = new Map(); data.forEach((a) => a.tracks.forEach((t) => byId.set(t.id, 1)));
  const render = () => {
    box.replaceChildren();
    const list = ids().filter((id) => byId.has(id));
    $('#fav-count').textContent = list.length ? list.length + ' треков' + (shared.length ? ' в общем плейлисте' : '') : '';
    $('#fav-tools').hidden = !list.length;
    if (!list.length) { box.append(el('p', 'muted', 'Пока пусто. Нажмите ♥ рядом с любым треком на страницах альбомов.')); return; }
    data.forEach((a) => {
      const mine = a.tracks.filter((t) => list.includes(t.id)); if (!mine.length) return;
      const s = el('section', 'alb in'), h = el('header'), lk = el('a', 'more', 'Страница альбома →'), ol = el('ol', 'tracks');
      s.style.setProperty('--c', a.color); s.dataset.era = a.era; lk.href = '/album/' + a.id;
      h.append(el('h2', '', a.title), el('small', 'muted', a.year + ' · ' + mine.length + ' из ' + a.tracks.length), lk);
      mine.forEach((t) => {
        const li = el('li'), b = el('button'), eq = el('i', 'eq'); b.type = 'button'; b.dataset.id = t.id; eq.append(el('b'), el('b'), el('b'));
        b.append(el('span', 'n', String(t.track_no).padStart(2, '0')), el('span', '', t.title), eq); b.addEventListener('click', () => Player.load(t, a.era)); li.append(b); ol.append(li);
      });
      s.append(h, ol); box.append(s);
    });
  };
  if (shared.length) { const keep = $('#fav-keep'); keep.hidden = false; keep.addEventListener('click', () => { Fav.set([...Fav.ids(), ...shared]); location.href = '/favorites'; }); }
  $('#fav-share').addEventListener('click', async (e) => {
    const url = location.origin + '/favorites?ids=' + ids().join(',');
    try { await navigator.clipboard.writeText(url); e.target.textContent = 'Ссылка скопирована ✓'; } catch (err) { e.target.textContent = url; }
  });
  $('#fav-clear').addEventListener('click', () => { if (!shared.length && confirm('Очистить избранное?')) Fav.set([]); });
  document.addEventListener('favchange', () => { if (!shared.length) render(); });
  render(); initPlayer();
})().catch(() => { $('#fav-list').textContent = 'Не удалось загрузить дискографию. Проверьте, что сервер запущен.'; });
