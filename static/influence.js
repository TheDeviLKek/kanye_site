'use strict';
// k: c = центр, a = альбом, p = артист; a = угол (°), f = доля радиуса эллипса
const N = [
  { id: 'k', t: 'Kanye West', k: 'c', a: 0, f: 0 },
  { id: 'cd', t: 'The College Dropout', s: '2004', k: 'a', a: 180, f: 0.5 },
  { id: '808', t: '808s & Heartbreak', s: '2008', k: 'a', a: -35, f: 0.5 },
  { id: 'mb', t: 'MBDTF', s: '2010', k: 'a', a: 128, f: 0.5 },
  { id: 'ye', t: 'Yeezus', s: '2013', k: 'a', a: -105, f: 0.5 },
  { id: 'tp', t: 'The Life of Pablo', s: '2016', k: 'a', a: 92, f: 0.5 },
  { id: 'jz', t: 'Jay-Z', k: 'p', a: 38, f: 0.64 },
  { id: 'ts', t: 'Travis Scott', k: 'p', a: -128, f: 1 },
  { id: 'dp', t: 'Daft Punk', k: 'p', a: -82, f: 1 },
  { id: 'kc', t: 'Kid Cudi', k: 'p', a: -58, f: 1 },
  { id: 'fu', t: 'Future', k: 'p', a: -36, f: 1 },
  { id: 'dr', t: 'Drake', k: 'p', a: -12, f: 1 },
  { id: 'wk', t: 'The Weeknd', k: 'p', a: 11, f: 1 },
  { id: 'ch', t: 'Chance the Rapper', k: 'p', a: 116, f: 1 },
  { id: 'bi', t: 'Bon Iver', k: 'p', a: 152, f: 1 },
  { id: 'jb', t: 'Just Blaze', k: 'p', a: 204, f: 1 },
  { id: 'nm', t: 'Nicki Minaj', k: 'p', a: 168, f: 1 },
  { id: 'pt', t: 'Pusha T', k: 'p', a: 136, f: 1 },
  { id: 'fo', t: 'Frank Ocean', k: 'p', a: 96, f: 1 },
  { id: 'ri', t: 'Rihanna', k: 'p', a: 78, f: 1 },
  { id: 'kl', t: 'Kendrick Lamar', k: 'p', a: 60, f: 1 },
];
// от, к, вид (k = альбом/центр, s = прямая связь, d = влияние), трек, пояснение
const L = [
  ['k', 'cd', 'k', 'Jesus Walks', 'Дебют, с которого соул-сэмплы на повышенном питче стали звуком эпохи.'],
  ['k', '808', 'k', 'Love Lockdown', 'Драм-машина 808 и автотюн вместо привычных хип-хоп-битов.'],
  ['k', 'mb', 'k', 'Runaway', 'Максимализм: оркестровая подача и почти девять минут исповеди.'],
  ['k', 'ye', 'k', 'Black Skinhead', 'Индастриал и агрессия: альбом без сингла и без обложки.'],
  ['k', 'tp', 'k', 'Ultralight Beam', 'Госпел-хор и гости; альбом, который менялся после выхода.'],
  ['k', 'jz', 'k', 'Ni**as in Paris', 'Совместный альбом Watch the Throne; Kanye также продюсировал ранние хиты Jay-Z.'],
  ['808', 'kc', 's', 'Welcome to Heartbreak', 'Kid Cudi поёт на треке; эмоциональный тон 808s стал мостом к его мелодичному хип-хопу.'],
  ['ye', 'dp', 's', 'On Sight', 'Daft Punk спродюсировали «On Sight», «Black Skinhead» и «I Am a God».'],
  ['mb', 'bi', 's', 'Lost in the World', 'Сэмпл «Woods» Bon Iver; Justin Vernon также поёт на «Monster».'],
  ['tp', 'ch', 's', 'Ultralight Beam', 'Куплет Chance the Rapper стал одним из главных моментов альбома.'],
  ['cd', 'jb', 's', 'Never Let Me Down', 'Продюсер Just Blaze работал над треком вместе с Kanye.'],
  ['mb', 'nm', 's', 'Monster', 'Куплет Nicki Minaj на «Monster» стал одним из главных моментов альбома.'],
  ['mb', 'pt', 's', 'Runaway', 'Pusha T читает куплет на «Runaway».'],
  ['tp', 'fo', 's', "Frank's Track", 'Трек записан с вокалом Frank Ocean.'],
  ['tp', 'ri', 's', 'Famous', 'Rihanna поёт припев «Famous».'],
  ['tp', 'kl', 's', 'No More Parties in LA', 'Kendrick Lamar читает на «No More Parties in LA».'],
  ['cd', 'ch', 'd', 'Jesus Walks', 'Chance не раз называл Kanye и его ранние альбомы источником вдохновения.'],
  ['808', 'dr', 'd', 'Heartless', 'Критики связывают поющий рэп Drake с наследием 808s.'],
  ['808', 'fu', 'd', 'Love Lockdown', 'Мелодичный автотюн в трэпе часто возводят к 808s.'],
  ['808', 'wk', 'd', 'Hurricane (Donda)', 'Совместный трек на Donda; тёмный R&B The Weeknd перекликается с 808s.'],
  ['ye', 'ts', 'd', 'Praise God (Donda)', 'Совместный трек на Donda; тёмная электроника Yeezus близка Travis Scott.'],
];
// год появления узла = год трека, через который проходит связь
const NY = { k: 2004, cd: 2004, 808: 2008, mb: 2010, ye: 2013, tp: 2016, jz: 2011, ts: 2021, dp: 2013, kc: 2008, fu: 2008, dr: 2008, wk: 2021, ch: 2016, bi: 2010, jb: 2004, nm: 2010, pt: 2010, fo: 2016, ri: 2016, kl: 2016 };
const map = $('#map'), svg = $('#lines'), info = $('#info'), by = {};
const NS = 'http://www.w3.org/2000/svg', rad = (d) => (d * Math.PI) / 180;
let flows = [], start = performance.now();
const root = document.documentElement.style;
addEventListener('pointermove', (e) => { root.setProperty('--mx', e.clientX + 'px'); root.setProperty('--my', e.clientY + 'px'); });
const place = (ln, a, b) => { ln.setAttribute('x1', a.x); ln.setAttribute('y1', a.y); ln.setAttribute('x2', b.x); ln.setAttribute('y2', b.y); };
const move = (n) => { n.el.style.left = n.x + 'px'; n.el.style.top = n.y + 'px'; };

function hint() {
  info.replaceChildren(el('h3', '', 'Выберите узел'), el('p', 'muted', 'Нажмите на альбом или артиста: здесь появится трек, через который проходит связь.'));
}

function select(id) {
  const n = by[id];
  info.style.animation = 'none'; void info.offsetWidth; info.style.animation = '';
  map.querySelectorAll('.nd').forEach((b) => b.classList.toggle('sel', b.dataset.id === id));
  svg.querySelectorAll('.ln').forEach((ln) => ln.classList.toggle('on', ln.dataset.f === id || ln.dataset.t === id));
  info.replaceChildren(el('h3', '', n.t));
  L.filter((l) => l[0] === id || l[1] === id).forEach((l) => {
    const other = by[l[0] === id ? l[1] : l[0]], row = el('div', 'via');
    const go = el('a', 'go', '▶ ' + l[3] + ' ↗');
    go.href = 'https://www.youtube.com/results?search_query=' + encodeURIComponent('Kanye West ' + l[3]);
    go.target = '_blank'; go.rel = 'noopener';
    row.append(el('b', '', id === 'k' ? other.t : 'Связь: ' + other.t), el('p', 'muted', l[4]), go);
    info.append(row);
  });
}

function drag(b, n) {
  let sx, sy, ox, oy, moved = false;
  b.addEventListener('pointerenter', () => focus(n.id)); b.addEventListener('pointerleave', () => focus(null));
  b.addEventListener('pointerdown', (e) => { b.setPointerCapture(e.pointerId); sx = e.clientX; sy = e.clientY; ox = n.x; oy = n.y; moved = false; b.classList.add('grab'); });
  b.addEventListener('pointermove', (e) => {
    if (!b.hasPointerCapture(e.pointerId)) return;
    const dx = e.clientX - sx, dy = e.clientY - sy;
    if (!moved && Math.abs(dx) + Math.abs(dy) < 5) return;
    moved = true;
    n.x = Math.max(32, Math.min(map.clientWidth - 32, ox + dx));
    n.y = Math.max(32, Math.min(map.clientHeight - 32, oy + dy));
    move(n);
    svg.querySelectorAll('.ln').forEach((ln) => {
      if (ln.dataset.f !== n.id && ln.dataset.t !== n.id) return;
      ln.style.animation = 'none'; if (!ln.classList.contains('d')) ln.style.strokeDasharray = 'none';
      place(ln, by[ln.dataset.f], by[ln.dataset.t]);
    });
  });
  b.addEventListener('pointerup', () => { b.classList.remove('grab'); if (!moved) select(n.id); });
  b.addEventListener('pointercancel', () => b.classList.remove('grab'));
}

// Порядок появления: Kanye, затем линии к альбомам и Jay-Z, затем кружки, затем линии к артистам и их кружки
function build(anim = true) {
  map.classList.toggle('still', !anim);
  const r = map.getBoundingClientRect(), vis = Math.min(r.bottom, innerHeight) - Math.max(r.top, 0);
  map.classList.toggle('wait', anim && vis < r.height * 0.3);
  map.querySelectorAll('.nd').forEach((x) => x.remove());
  svg.replaceChildren(); flows = []; start = performance.now();
  const W = map.clientWidth, H = map.clientHeight, rx = W / 2 - 60, ry = H / 2 - 55;
  N.forEach((n) => { by[n.id] = n; n.d = null; n.x = W / 2 + Math.cos(rad(n.a)) * rx * n.f; n.y = H / 2 + Math.sin(rad(n.a)) * ry * n.f; });
  by.k.d = 0.2;
  let i1 = 0, i2 = 0;
  L.forEach(([from, to, kind]) => {
    const a = by[from], b = by[to], ld = from === 'k' ? 1.1 + i1++ * 0.22 : 3.6 + i2++ * 0.3;
    if (b.d === null) b.d = ld + (kind === 'd' ? 0.5 : 0.75);
    const ln = document.createElementNS(NS, 'line');
    ln.setAttribute('class', 'ln ' + kind); ln.dataset.f = from; ln.dataset.t = to;
    ln.style.setProperty('--len', Math.hypot(b.x - a.x, b.y - a.y));
    ln.style.animationDelay = ld + 's';
    ln.addEventListener('animationend', () => { if (kind !== 'd') ln.style.strokeDasharray = 'none'; });
    place(ln, a, b); svg.append(ln);
    const c = document.createElementNS(NS, 'circle'); c.setAttribute('class', 'flow ' + kind); c.setAttribute('r', kind === 'd' ? 2 : 3);
    svg.append(c); flows.push({ c, ln, f: from, t: to, at: anim ? (ld + 0.9) * 1000 : 0 });
  });
  N.forEach((n) => {
    const b = el('button', 'nd ' + n.k); b.type = 'button'; b.dataset.id = n.id; b.style.animationDelay = n.d + 's'; b.style.setProperty('--fd', (4 + Math.random() * 3).toFixed(1) + 's');
    b.append(el('span', '', n.t)); if (n.s) b.append(el('small', '', n.s));
    n.el = b; move(n); drag(b, n); map.append(b);
  });
  atYear(+$('#yr').value);
}

let lastW = map.clientWidth;
new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting && map.classList.contains('wait')) { map.classList.remove('wait'); start = performance.now(); } }), { threshold: 0.3 }).observe(map);
addEventListener('resize', () => { if (Math.abs(map.clientWidth - lastW) > 40) { lastW = map.clientWidth; build(false); hint(); } });
$('#replay').addEventListener('click', () => { hint(); build(true); });
hint(); build(true);

// подсветка связей при наведении: остальное затухает
function focus(id) {
  const rel = new Set([id]);
  svg.querySelectorAll('.ln').forEach((ln) => {
    const hit = !!id && (ln.dataset.f === id || ln.dataset.t === id);
    if (hit) { rel.add(ln.dataset.f); rel.add(ln.dataset.t); }
    ln.classList.toggle('dim', !!id && !hit); ln.classList.toggle('hot', hit);
  });
  map.querySelectorAll('.nd').forEach((b) => b.classList.toggle('dim', !!id && !rel.has(b.dataset.id)));
}

// «энергия» бежит по линиям от родителя к потомку
(function tick(now) {
  flows.forEach((f, i) => {
    const a = by[f.f], b = by[f.t], k = ((now - start) / 2200 + i * 0.173) % 1;
    const show = !map.classList.contains('wait') && now - start > f.at && !f.ln.classList.contains('dim') && !f.ln.classList.contains('off');
    f.c.setAttribute('cx', a.x + (b.x - a.x) * k); f.c.setAttribute('cy', a.y + (b.y - a.y) * k);
    f.c.style.opacity = show ? Math.max(0, 1 - Math.abs(k - 0.5) * 1.6) : 0;
  });
  requestAnimationFrame(tick);
})(performance.now());

// «машина времени»: узлы появляются в год трека, через который проходит связь
function atYear(y) {
  $('#yr-out').textContent = y;
  const fresh = N.filter((n) => NY[n.id] === y && n.id !== 'k').map((n) => n.t);
  $('#yr-note').textContent = fresh.length ? 'Появляются: ' + fresh.join(', ') : '';
  map.querySelectorAll('.nd').forEach((b) => b.classList.toggle('off', NY[b.dataset.id] > y));
  svg.querySelectorAll('.ln').forEach((ln) => ln.classList.toggle('off', NY[ln.dataset.f] > y || NY[ln.dataset.t] > y));
}
let ticker;
$('#yr').addEventListener('input', (e) => { clearInterval(ticker); atYear(+e.target.value); });
$('#play-time').addEventListener('click', () => {
  const r = $('#yr'); clearInterval(ticker); r.value = r.min; atYear(+r.value);
  ticker = setInterval(() => { if (+r.value >= +r.max) return clearInterval(ticker); r.value = +r.value + 1; atYear(+r.value); }, 650);
});
