'use strict';
const FIL = [['all', 'Все'], ['soul', 'Соул'], ['pop', 'Электро-поп'], ['autotune', 'Автотюн'], ['max', 'Максимализм'], ['industrial', 'Индастриал'], ['gospel', 'Госпел']];
const root = document.documentElement.style;
addEventListener('pointermove', (e) => { root.setProperty('--mx', e.clientX + 'px'); root.setProperty('--my', e.clientY + 'px'); });
const countUp = (node, to) => {
  const t0 = performance.now();
  (function step(now) { const k = Math.min(1, (now - t0) / 1400); node.textContent = Math.round(to * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(step); })(t0);
};
(async () => {
  const data = await api('/api/discography'), list = $('#list'), fb = $('#filters'), q = $('#q');
  let era = 'all';
  const total = data.reduce((n, a) => n + a.tracks.length, 0);
  $('#count').textContent = 'Клик по треку запускает демо-отрывок. Прокручивайте: цвет страницы подстраивается под альбом.';
  [data.length, total, data[data.length - 1].year - data[0].year].forEach((v, i) => countUp(document.querySelectorAll('.stats2 b')[i], v));
  const secs = data.map((a) => {
    const s = el('section', 'alb'); s.dataset.era = a.era; s.style.setProperty('--c', a.color);
    const cover = el('div', 'cover'), art = el('div', 'art');
    art.append(el('b', '', a.year), el('span', '', a.title));
    cover.append(el('div', 'disc'), art);
    const h = el('header'), lk = el('a', 'more', 'Страница альбома →'); lk.href = '/album/' + a.id;
    cover.style.cursor = 'pointer'; cover.addEventListener('click', () => { location.href = '/album/' + a.id; });
    h.append(cover, el('h2', '', a.title), el('p', 'muted', a.blurb), el('small', 'muted', a.tracks.length + ' треков'), lk);
    const ol = el('ol', 'tracks');
    a.tracks.forEach((t) => {
      const li = el('li'), b = el('button'), eq = el('i', 'eq'); b.type = 'button'; b.dataset.id = t.id;
      eq.append(el('b'), el('b'), el('b'));
      b.append(el('span', 'n', String(t.track_no).padStart(2, '0')), el('span', '', t.title), eq);
      b.addEventListener('click', () => Player.load(t, a.era));
      li.append(b); ol.append(li);
    });
    s.append(h, ol); list.append(s); return s;
  });
  // рельса с годами справа: быстрый переход и подсветка текущего альбома
  const rail = el('nav', 'rail'); document.body.append(rail);
  const dots = data.map((a, i) => {
    const b = el('button', '', a.year); b.type = 'button'; b.title = a.title;
    b.addEventListener('click', () => secs[i].scrollIntoView({ behavior: 'smooth', block: 'start' }));
    rail.append(b); return b;
  });
  const rev = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && e.target.classList.add('in')), { threshold: 0.12 });
  const acc = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return;
    document.body.style.setProperty('--a', e.target.style.getPropertyValue('--c'));
    const i = secs.indexOf(e.target); dots.forEach((d, j) => d.classList.toggle('on', i === j));
  }), { rootMargin: '-45% 0px -45% 0px' });
  secs.forEach((s) => { rev.observe(s); acc.observe(s); });
  const apply = () => {
    const v = q.value.trim().toLowerCase();
    secs.forEach((s) => {
      let hit = 0;
      s.querySelectorAll('li').forEach((li) => { const ok = !v || li.textContent.toLowerCase().includes(v); li.hidden = !ok; hit += ok; });
      s.hidden = !hit || (era !== 'all' && s.dataset.era !== era);
    });
  };
  FIL.forEach(([e, l], i) => {
    const b = el('button', 'chip', l); b.type = 'button'; b.setAttribute('aria-pressed', i === 0);
    b.addEventListener('click', () => { era = e; fb.querySelectorAll('.chip').forEach((c) => c.setAttribute('aria-pressed', c === b)); apply(); });
    fb.append(b);
  });
  q.addEventListener('input', apply);
  initPlayer();
})().catch(() => { $('#count').textContent = 'Не удалось загрузить дискографию. Проверьте, что сервер запущен.'; });
