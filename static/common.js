'use strict';
const $ = (s, r = document) => r.querySelector(s);
// Выгрузка для GitHub Pages: сервера нет, данные лежат в /data/*.json (window.STATIC_SITE ставит сборка)
const jsonCache = {};
const loadJson = (u) => (jsonCache[u] = jsonCache[u] || fetch(u).then((r) => { if (!r.ok) throw new Error(u + ' ' + r.status); return r.json(); }));
async function staticSearch(q) {
  if (q.length < 2) return [];
  const [disc, quotes, facts] = await Promise.all([loadJson('/data/discography.json'), loadJson('/data/quotes.json'), loadJson('/data/timeline.json')]);
  const hit = (...xs) => xs.some((x) => (x || '').toLowerCase().includes(q)), out = [];
  disc.forEach((a) => { if (hit(a.title, a.blurb)) out.push({ t: 'album', id: a.id, title: a.title, sub: String(a.year) }); });
  disc.forEach((a) => a.tracks.forEach((t) => { if (hit(t.title)) out.push({ t: 'track', id: a.id, tid: t.id, title: t.title, sub: a.title }); }));
  quotes.forEach((x) => { if (hit(x.text, x.context)) out.push({ t: 'quote', title: x.text.slice(0, 90), sub: x.context || '' }); });
  facts.forEach((x) => { if (hit(x.title, x.body)) out.push({ t: 'fact', title: x.title, sub: String(x.year) }); });
  return out.slice(0, 30);
}
async function staticApi(u) {
  const [path, qs] = u.split('?'), q = new URLSearchParams(qs || '');
  let m;
  if (path === '/api/quote') {
    const pool = (await loadJson('/data/quotes.json')).filter((x) => x.id !== +q.get('exclude'));
    return pool.length ? pool[Math.floor(Math.random() * pool.length)] : {};
  }
  if (path === '/api/search') return staticSearch((q.get('q') || '').trim().toLowerCase());
  if ((m = path.match(/^\/api\/(album|tracks)\/(\d+)$/))) return loadJson('/data/' + m[1] + '-' + m[2] + '.json');
  if ((m = path.match(/^\/api\/(albums|discography|samples|timeline|stats)$/))) return loadJson('/data/' + m[1] + '.json');
  throw new Error('нет данных для ' + u);
}
const api = (u) => (window.STATIC_SITE ? staticApi(u) : fetch(u).then((r) => { if (!r.ok) throw new Error(u + ' ' + r.status); return r.json(); }));
const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; };
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const ERA_COLOR = { soul: '#d9b36b', pop: '#ff4fd8', autotune: '#4fd8ff', max: '#ffd24f', industrial: '#ff3b30', gospel: '#7bffb0' };
const fmt = (s) => Math.floor(s / 60) + ':' + String(Math.floor(s % 60)).padStart(2, '0');

