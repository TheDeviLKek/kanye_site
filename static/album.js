'use strict';
const aid = +location.pathname.split('/').filter(Boolean).pop();
(async () => {
  const [a, all] = await Promise.all([api('/api/album/' + aid), api('/api/albums')]);
  document.title = a.title + ' — Эра Ye';
  document.body.style.setProperty('--a', a.color);
  const root = $('#ap'); root.style.setProperty('--c', a.color); root.dataset.era = a.era;
  const art = el('div', 'art'), cover = el('div', 'cover'), left = el('div', 'ap-left'), right = el('div');
  art.append(el('b', '', a.year), el('span', '', a.title)); cover.append(el('div', 'disc'), art); left.append(cover);
  const notes = el('div', 'notes');
  (a.notes || []).forEach((n) => { const c = el('div', 'note'); c.append(el('small', '', n.label), el('p', '', n.text)); notes.append(c); });
  const ol = el('ol', 'tracks');
  a.tracks.forEach((t) => {
    const li = el('li'), b = el('button'), eq = el('i', 'eq'); li.id = 't' + t.id; b.type = 'button'; b.dataset.id = t.id;
    eq.append(el('b'), el('b'), el('b'));
    b.append(el('span', 'n', String(t.track_no).padStart(2, '0')), el('span', '', t.title));
    if (t.spotify_id) b.append(el('em', 'mp3 sp', 'Spotify')); else if (t.preview_url) b.append(el('em', 'mp3', 'mp3'));
    b.append(eq); b.addEventListener('click', () => Player.load(t, a.era)); li.append(b); ol.append(li);
  });
  const sp = a.spotify_id ? el('a', 'btn alt', 'Открыть альбом в Spotify ↗') : null;
  if (sp) { sp.href = 'https://open.spotify.com/album/' + a.spotify_id; sp.target = '_blank'; sp.rel = 'noopener'; }
  let emb = null;   // у альбома есть ссылка Spotify: показываем встроенный плеер альбома
  if (a.spotify_id) {
    emb = document.createElement('iframe'); emb.className = 'sp-album'; emb.loading = 'lazy'; emb.title = 'Spotify: ' + a.title;
    emb.src = 'https://open.spotify.com/embed/album/' + a.spotify_id + '?theme=0';
    emb.allow = 'autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture';
  }
  right.append(el('p', 'kicker', a.year + ' · ' + a.tracks.length + ' треков'), el('h1', 'shine', a.title), el('p', 'lead2', a.blurb), ...(sp ? [sp] : []), notes, ...(emb ? [emb] : []), ol);
  root.append(left, right);
  const i = all.findIndex((x) => x.id === a.id), pn = $('#pn');
  [all[i - 1], all[i + 1]].forEach((x, k) => { const l = el('a', '', x ? (k ? x.title + ' →' : '← ' + x.title) : ''); if (x) l.href = '/album/' + x.id; pn.append(l); });
  const focusHash = () => {
    const m = location.hash.match(/^#t(\d+)$/), b = m && document.querySelector('#t' + m[1] + ' button');
    if (b) { b.scrollIntoView({ block: 'center', behavior: 'smooth' }); b.classList.add('flash'); setTimeout(() => b.classList.remove('flash'), 2200); }
  };
  addEventListener('hashchange', focusHash); focusHash();
  initPlayer();
})().catch(() => { $('#ap').textContent = 'Альбом не найден или сервер не запущен.'; });
