'use strict';
const rnd = (a) => a[Math.floor(Math.random() * a.length)];
const shuffle = (a) => a.map((x) => [Math.random(), x]).sort((p, q) => p[0] - q[0]).map((p) => p[1]);
const store = {
  get: (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v === null ? d : v; } catch (e) { return d; } },
  set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* хранилище недоступно */ } },
};
const MODES = [['album', 'Угадай альбом', 'Из какого альбома трек?'], ['year', 'Угадай год', 'Когда вышел альбом?'], ['sample', 'Найди оригинал', 'Чей сэмпл лежит в основе трека?']];
const BADGES = { perfect: 'Идеальный раунд', streak: 'Серия из 5', sample: 'Знаток сэмплов' };
const root = $('#quiz'), GEN = {};
let albums = [], samples = [];

function confetti() {
  const c = el('canvas', 'cf'), g = c.getContext('2d'); c.width = innerWidth; c.height = innerHeight; document.body.append(c);
  const P = Array.from({ length: 150 }, () => ({ x: Math.random() * c.width, y: -20 - Math.random() * c.height * 0.5, vx: (Math.random() - 0.5) * 3, vy: 2 + Math.random() * 4, s: 5 + Math.random() * 7, r: Math.random() * 6, h: Math.random() * 360 }));
  const t0 = performance.now();
  (function f(now) {
    g.clearRect(0, 0, c.width, c.height);
    P.forEach((p) => { p.x += p.vx; p.y += p.vy; p.r += 0.12; g.save(); g.translate(p.x, p.y); g.rotate(p.r); g.fillStyle = 'hsl(' + p.h + ',90%,60%)'; g.fillRect(-p.s / 2, -p.s / 3, p.s, p.s * 0.6); g.restore(); });
    if (now - t0 < 3500) requestAnimationFrame(f); else c.remove();
  })(t0);
}

function menu() {
  root.classList.remove('res'); root.replaceChildren();
  const g = el('div', 'modes');
  MODES.forEach(([id, t, s]) => {
    const b = el('button', 'mode'); b.type = 'button';
    b.append(el('b', '', t), el('span', '', s), el('small', 'muted', 'Рекорд: ' + store.get('kq-best-' + id, 0)));
    b.addEventListener('click', () => play(id)); g.append(b);
  });
  root.append(g);
  const got = store.get('kq-badges', []);
  if (got.length) { const w = el('div', 'badges'); got.forEach((k) => w.append(el('span', 'badge', '★ ' + BADGES[k]))); root.append(w); }
}

function play(mode) {
  const qs = [], seen = new Set();
  for (let k = 0; k < 120 && qs.length < 10; k++) { const x = GEN[mode](); if (!seen.has(x.q)) { seen.add(x.q); qs.push(x); } }
  let i = 0, score = 0, streak = 0, top = 0, ok = 0, timer, locked = false;
  const finish = () => {
    const best = Math.max(score, store.get('kq-best-' + mode, 0)); store.set('kq-best-' + mode, best);
    const earned = [ok === qs.length && 'perfect', top >= 5 && 'streak', mode === 'sample' && ok >= 7 && 'sample'].filter(Boolean);
    store.set('kq-badges', [...new Set([...store.get('kq-badges', []), ...earned])]);
    const rank = ok === qs.length ? 'Бог студии' : ok >= 8 ? 'Продюсер' : ok >= 5 ? 'Выпускник' : 'Студент';
    root.replaceChildren(); root.classList.add('res');
    const w = el('div', 'badges'); earned.forEach((k) => w.append(el('span', 'badge', '★ ' + BADGES[k])));
    const row = el('div', 'row'), again = el('button', 'btn', 'Сыграть ещё'), other = el('button', 'btn alt', 'Другой режим'), share = el('button', 'btn alt', 'Поделиться');
    [again, other, share].forEach((b) => { b.type = 'button'; row.append(b); });
    again.addEventListener('click', () => play(mode)); other.addEventListener('click', menu);
    share.addEventListener('click', async () => {
      const text = 'Я набрал ' + score + ' очков (' + ok + '/' + qs.length + ') в викторине «' + MODES.find((m) => m[0] === mode)[1] + '» на сайте «Эра Ye»: ' + location.href;
      try { await navigator.clipboard.writeText(text); share.textContent = 'Скопировано ✓'; } catch (e) { share.textContent = text; }
    });
    root.append(el('p', 'kicker', rank), el('div', 'big-n', score), el('p', 'qs', ok + ' из ' + qs.length + ' верно · лучший счёт: ' + best), w, row);
    if (ok >= qs.length * 0.8) confetti();
  };
  const answer = (choice) => {
    if (locked) return; locked = true; clearTimeout(timer);
    const x = qs[i], good = choice === x.a;
    root.querySelectorAll('.opt').forEach((b) => { b.disabled = true; const v = b.lastChild.textContent; if (v === x.a) b.classList.add('good'); else if (v === choice) b.classList.add('bad'); });
    const bar = root.querySelector('.qbar i'); if (bar) bar.style.animationPlayState = 'paused';
    if (good) { ok++; streak++; top = Math.max(top, streak); score += 10 + Math.min(streak, 5) * 2; } else streak = 0;
    setTimeout(() => { i++; i < qs.length ? ask() : finish(); }, 1300);
  };
  const ask = () => {
    locked = false; const x = qs[i];
    root.classList.remove('res'); root.replaceChildren(); document.body.style.setProperty('--a', x.c);
    const hud = el('div', 'qhud'), bar = el('div', 'qbar'), opts = el('div', 'opts');
    hud.append(el('span', '', (i + 1) + ' / ' + qs.length), el('span', '', 'Серия ' + streak + ' · ' + score + ' очков')); bar.append(el('i'));
    x.opts.forEach((o, k) => {
      const b = el('button', 'opt'); b.type = 'button'; b.append(el('kbd', '', k + 1), el('span', '', o));
      b.addEventListener('click', () => answer(o)); opts.append(b);
    });
    root.append(hud, bar, el('h2', 'qq', x.q), el('p', 'qs', x.sub), opts);
    timer = setTimeout(() => answer(null), 15000);
  };
  ask();
}

addEventListener('keydown', (e) => {
  const n = +e.key;
  if (n >= 1 && n <= 4) { const b = root.querySelectorAll('.opt:not(:disabled)')[n - 1]; if (b) b.click(); }
});

(async () => {
  albums = await api('/api/discography'); samples = await api('/api/samples');
  const songs = albums.flatMap((al) => al.tracks.filter((t) => t.title.length > 3 && !/skit|intro|chant|interlude/i.test(t.title)).map((t) => ({ t: t.title, al })));
  GEN.album = () => { const s = rnd(songs), wrong = shuffle(albums.filter((x) => x.id !== s.al.id)).slice(0, 3); return { q: '«' + s.t + '»', sub: 'Из какого альбома этот трек?', opts: shuffle([s.al, ...wrong]).map((x) => x.title), a: s.al.title, c: s.al.color }; };
  GEN.year = () => { const al = rnd(albums), wrong = shuffle([...new Set(albums.map((x) => x.year).filter((y) => y !== al.year))]).slice(0, 3); return { q: al.title, sub: 'В каком году вышел альбом?', opts: shuffle([al.year, ...wrong]).map(String), a: String(al.year), c: al.color }; };
  GEN.sample = () => { const s = rnd(samples), wrong = shuffle([...new Set(samples.map((x) => x.original_artist).filter((x) => x !== s.original_artist))]).slice(0, 3); return { q: '«' + s.kanye_track + '»', sub: 'Чей оригинал лежит в основе этого трека?', opts: shuffle([s.original_artist, ...wrong]), a: s.original_artist, c: '#7b6cff' }; };
  menu();
})().catch(() => { root.textContent = 'Не удалось загрузить данные. Проверьте, что сервер запущен.'; });
