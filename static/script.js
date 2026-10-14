'use strict';
/* ---------- Главный экран: глобус, человек, экран с лицом, прожекторы ---------- */
const CAM_Z = 5.4, GLOBE_R = 1.25, GLOBE_Y = -1.4, rad = (d) => (d * Math.PI) / 180;

// привязывает CSS-сцену (экран, лучи, человек) к проекции глобуса
function stageLayout(yNow) {
  const st = $('.stage'), W = innerWidth, H = innerHeight, f = H / 2 / (CAM_Z * Math.tan(rad(22.5)));
  const gx = W / 2 + (W / H > 1.1 ? 1.35 : 0) * f, gy = H / 2 - GLOBE_Y * f;
  [['--gx', gx], ['--gy', gy], ['--gr', GLOBE_R * f], ['--T', gy - GLOBE_R * f], ['--ty', H / 2 - (yNow + GLOBE_R) * f]]
    .forEach(([k, v]) => st.style.setProperty(k, v + 'px'));
}

// процедурная текстура на value-noise, бесшовная по горизонтали
function noiseTex(w, h, seed, paint) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const g = c.getContext('2d'), img = g.createImageData(w, h);
  const hash = (x, y) => { const s = Math.sin(x * 127.1 + y * 311.7 + seed) * 43758.5453; return s - Math.floor(s); };
  const vn = (x, y) => {
    const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
    const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
    return (hash(xi, yi) * (1 - u) + hash(xi + 1, yi) * u) * (1 - v) + (hash(xi, yi + 1) * (1 - u) + hash(xi + 1, yi + 1) * u) * v;
  };
  const fbm = (x, y) => { let a = 0.5, s = 0, f = 1; for (let i = 0; i < 5; i++) { s += a * vn(x * f, y * f); a *= 0.5; f *= 2; } return s; };
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const X = (x / w) * 6, Y = (y / h) * 3, k = x / w;
    const n = fbm(X, Y) * (1 - k) + fbm(X - 6, Y) * k, o = paint(n, y / h), i = (y * w + x) * 4;
    img.data[i] = o[0]; img.data[i + 1] = o[1]; img.data[i + 2] = o[2]; img.data[i + 3] = o[3];
  }
  g.putImageData(img, 0, 0);
  return new THREE.CanvasTexture(c);
}

// пыль, плывущая в луче прожектора
function initDust() {
  const cv = $('.dust'), g = cv.getContext('2d'), st = cv.parentNode;
  if (!g) return;
  const P = Array.from({ length: 110 }, () => ({ x: Math.random(), y: Math.random(), r: Math.random() * 1.8 + 0.7, s: Math.random() * 0.0004 + 0.00012, p: Math.random() * 6.28 }));
  const fit = () => { cv.width = innerWidth; cv.height = innerHeight; };
  fit(); addEventListener('resize', fit);
  const num = (k, d) => parseFloat(st.style.getPropertyValue(k)) || d;
  const draw = (now) => {
    if (st.style.opacity === '0') { requestAnimationFrame(draw); return; }
    g.clearRect(0, 0, cv.width, cv.height);
    const gx = num('--gx', cv.width / 2), gr = num('--gr', 200), T = num('--T', cv.height * 0.5);
    g.fillStyle = '#d6e6ff';
    P.forEach((q) => {
      q.y = (q.y + q.s) % 1;
      const half = gr * (0.12 + 0.78 * q.y), x = gx + (q.x * 2 - 1) * half + Math.sin(now / 1800 + q.p) * 6;
      g.globalAlpha = 0.3 + 0.6 * Math.pow(Math.sin(now / 650 + q.p), 2);
      g.beginPath(); g.arc(x, q.y * T, q.r, 0, 6.283); g.fill();
    });
    requestAnimationFrame(draw);
  };
  requestAnimationFrame(draw);
}

function initSphere() {
  const cv = $('#sphere'), st = $('.stage');
  stageLayout(GLOBE_Y);
  const fade = () => {
    const o = Math.max(0, 1 - (scrollY / innerHeight) * 2.2);
    st.style.opacity = o; st.style.visibility = o < 0.01 ? 'hidden' : 'visible'; st.classList.toggle('idle', o < 0.01);  // скрытую сцену не рисуем и не анимируем
  };
  addEventListener('scroll', fade, { passive: true }); fade();
  addEventListener('pointermove', (e) => { st.style.setProperty('--mx', ((e.clientX / innerWidth) * 2 - 1).toFixed(3)); st.style.setProperty('--my', ((e.clientY / innerHeight) * 2 - 1).toFixed(3)); });
  if (!window.THREE) { cv.style.display = 'none'; addEventListener('resize', () => stageLayout(GLOBE_Y)); return; }
  const renderer = new THREE.WebGLRenderer({ canvas: cv, alpha: true, antialias: true });
  const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  cam.position.z = CAM_Z;
  const world = new THREE.Group(), orb = new THREE.Group();
  scene.add(world); world.add(orb);

  // Земля: океан, материки, полярные шапки, поверх слой облаков
  const earth = new THREE.Mesh(new THREE.SphereGeometry(GLOBE_R, 64, 48), new THREE.MeshPhongMaterial({
    map: noiseTex(512, 256, 3, (n, v) => (v < 0.07 || v > 0.93 ? [236, 242, 248, 255]
      : n > 0.54 ? [70 + n * 90, 105 + n * 70, 62 + n * 30, 255] : [10 + n * 40, 40 + n * 90, 110 + n * 120, 255])),
    shininess: 16, specular: 0x335577 }));
  const clouds = new THREE.Mesh(new THREE.SphereGeometry(GLOBE_R * 1.012, 48, 36), new THREE.MeshPhongMaterial({
    map: noiseTex(256, 128, 11, (n) => [255, 255, 255, Math.min(255, Math.max(0, (n - 0.5) * 820))]),
    transparent: true, depthWrite: false }));
  orb.add(earth, clouds);

  // свет: общий, «солнце» сбоку и луч прожектора над макушкой
  scene.add(new THREE.AmbientLight(0x5b7096, 1.0));
  const sun = new THREE.DirectionalLight(0xd8e8ff, 1.3); sun.position.set(-3, 2, 4); scene.add(sun);
  const top = new THREE.PointLight(0xa8ccff, 2.2); top.position.set(0, GLOBE_R + 0.9, 1.4); world.add(top);

  // облако частиц вокруг глобуса (цвет меняется при скролле)
  const N = 2200, base = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) {
    const u = Math.random() * 2 - 1, t = Math.random() * Math.PI * 2, r = Math.sqrt(1 - u * u), s = GLOBE_R * (1.1 + Math.random() * 0.9);
    base.set([r * Math.cos(t) * s, u * s, r * Math.sin(t) * s], i * 3);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(base, 3));
  const mat = new THREE.PointsMaterial({ size: 0.018, color: 0x7b6cff, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending, depthWrite: false });
  const pts = new THREE.Points(geo, mat);
  world.add(pts);

  const palette = ['#7b6cff', '#d9b36b', '#ff4fd8', '#4fd8ff', '#ffd24f', '#ff3b30', '#7bffb0', '#e8e8e2'].map((c) => new THREE.Color(c));
  const tmp = new THREE.Color();
  let mx = 0, sy = 0, pulse = 0, settled = false;
  addEventListener('pointermove', (e) => { mx = (e.clientX / innerWidth) * 2 - 1; st.style.setProperty('--mx', mx.toFixed(3)); });
  addEventListener('pointerdown', () => { pulse = 1; });
  addEventListener('scroll', () => { sy = scrollY / innerHeight; }, { passive: true });
  const size = () => {
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setSize(cv.clientWidth, cv.clientHeight, false);
    cam.aspect = cv.clientWidth / cv.clientHeight; cam.updateProjectionMatrix();
    world.position.x = cam.aspect > 1.1 ? 1.35 : 0;
    stageLayout(world.position.y);
  };
  world.position.y = reduce ? GLOBE_Y : GLOBE_Y - 2.4;
  size(); addEventListener('resize', size);

  const t0 = performance.now();
  const loop = (now) => {
    if (sy > 1.4) { requestAnimationFrame(loop); return; }   // далеко от начала страницы глобус не рисуем
    const k = reduce ? 1 : Math.min(1, (now - t0) / 2600), e = 1 - Math.pow(1 - k, 3);
    world.position.y = GLOBE_Y - 2.4 * (1 - e);       // глобус поднимается, человек едет на нём
    if (!settled) { stageLayout(world.position.y); settled = k >= 1; }
    pulse *= 0.94;
    if (typeof Player !== 'undefined' && Player.playing) pulse = Math.max(pulse, 0.4 + 0.4 * Math.max(0, Math.sin(now / 230)));
    if (!reduce) { orb.rotation.y += 0.0016 + mx * 0.002; clouds.rotation.y += 0.0007; pts.rotation.y -= 0.0008; }
    const kk = Math.min(sy * 1.6, palette.length - 1.001), a = Math.floor(kk);
    mat.color.copy(tmp.copy(palette[a]).lerp(palette[a + 1], kk - a));
    mat.size = 0.018 + pulse * 0.02;
    top.intensity = 2.2 + Math.sin(now / 900) * 0.25 + pulse * 1.5;
    world.scale.setScalar(1 + Math.min(sy, 3) * 0.3);
    cv.style.opacity = Math.max(0, 1 - sy * 0.9);
    st.style.opacity = Math.max(0, 1 - sy * 2.2);
    renderer.render(scene, cam);
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
}

/* ---------- Альбомы и фильтр ---------- */
const FILTERS = [['all', 'Все'], ['soul', 'Соул-сэмплинг'], ['pop', 'Электро-поп'], ['autotune', 'Автотюн'], ['max', 'Максимализм'], ['industrial', 'Индастриал'], ['gospel', 'Госпел']];
let albums = [];
async function loadAlbums() {
  albums = await api('/api/albums');
  const mq = $('#marq'); if (mq) for (let k = 0; k < 2; k++) albums.forEach((a) => mq.append(el('span', '', a.title)));
  const fb = $('#filters'), grid = $('#album-grid');
  FILTERS.forEach(([era, label], i) => {
    const b = el('button', 'chip', label); b.type = 'button'; b.setAttribute('aria-pressed', i === 0);
    b.addEventListener('click', () => {
      fb.querySelectorAll('.chip').forEach((c) => c.setAttribute('aria-pressed', c === b));
      grid.querySelectorAll('.card').forEach((c) => c.classList.toggle('hide', era !== 'all' && c.dataset.era !== era));
    });
    fb.append(b);
  });
  albums.forEach((a) => {
    const c = el('button', 'card'); c.type = 'button'; c.dataset.era = a.era; c.dataset.id = a.id; c.style.setProperty('--c', a.color);
    c.setAttribute('aria-expanded', 'false');
    const top = el('div', 'cover mini'), art = el('div', 'art'), body = el('div'); art.append(el('b', '', a.year)); top.append(el('div', 'disc'), art); body.append(el('h3', '', a.title), el('p', '', a.blurb));
    c.append(top, body);
    c.addEventListener('click', () => openAlbum(a, c));
    grid.append(c);
  });
}
async function openAlbum(a, card) {
  document.querySelectorAll('.card').forEach((c) => c.setAttribute('aria-expanded', c === card));
  const panel = $('#panel');
  panel.style.setProperty('--c', a.color);
  $('#panel-title').textContent = a.title + ' (' + a.year + ')';
  $('#panel-blurb').textContent = a.blurb;
  const list = $('#tracks'); list.innerHTML = '';
  Player.stop(); Player.tr = null; $('#pl-title').textContent = 'Выберите трек';
  try {
    const tracks = await api('/api/tracks/' + a.id);
    tracks.forEach((t) => {
      const li = el('li'), b = el('button'); b.type = 'button'; b.dataset.id = t.id;
      b.append(el('span', 'n', t.track_no), el('span', '', t.title));
      b.addEventListener('click', () => Player.load(t, a.era));
      li.append(b); list.append(li);
    });
  } catch (e) { list.append(el('li', 'muted', 'Не удалось загрузить треки. Проверьте, что сервер запущен.')); }
  panel.hidden = false;
  panel.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
}
$('#panel-close').addEventListener('click', () => {
  Player.stop(); $('#panel').hidden = true;
  document.querySelectorAll('.card').forEach((c) => c.setAttribute('aria-expanded', 'false'));
});

/* ---------- Таймлайн влияния ---------- */
async function loadTimeline() {
  const facts = await api('/api/timeline'), ol = $('#timeline-list');
  const io = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && e.target.classList.add('in')), { threshold: 0.4 });
  facts.forEach((f) => {
    const li = el('li', 'tl'); li.style.setProperty('--c', ERA_COLOR[f.era] || '#7b6cff');
    const b = el('button'); b.type = 'button'; b.setAttribute('aria-expanded', 'false');
    b.append(el('span', 'yr', f.year), el('span', 'tt', f.title));
    const p = el('p', '', f.body);
    b.addEventListener('click', () => { const o = li.classList.toggle('open'); b.setAttribute('aria-expanded', o); });
    li.append(b, p); ol.append(li); io.observe(li);
  });
  const upd = () => {
    const r = ol.getBoundingClientRect();
    ol.style.setProperty('--p', Math.min(1, Math.max(0, (innerHeight * 0.6 - r.top) / r.height)));
  };
  addEventListener('scroll', upd, { passive: true }); upd();
}

/* ---------- Sample Finder (до / после) ---------- */
async function loadSamples() {
  const data = await api('/api/samples'), grid = $('#sample-grid');
  data.forEach((s) => {
    const card = el('article', 'sample'); card.dataset.state = 'before';
    const seg = el('div', 'seg');
    const mk = (label, state) => {
      const b = el('button', '', label); b.type = 'button'; b.setAttribute('aria-pressed', state === 'before');
      b.addEventListener('click', () => { card.dataset.state = state; seg.querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', x === b)); });
      return b;
    };
    seg.append(mk('Оригинал', 'before'), mk('У Канье', 'after'));
    const before = el('div', 'face before'), after = el('div', 'face after');
    before.append(el('div', 'yr', s.original_year), el('h3', '', s.original_title), el('p', '', s.original_artist));
    after.append(el('div', 'yr', s.kanye_year), el('h3', '', s.kanye_track), el('p', '', s.transformation));
    card.append(seg, before, after); grid.append(card);
  });
}

/* ---------- Счётчики ---------- */
async function loadStats() {
  const data = await api('/api/stats'), wrap = $('#stat-grid');
  const io = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return;
    io.unobserve(e.target);
    const n = e.target.querySelector('b'), end = +n.dataset.v, suf = n.dataset.s, t0 = performance.now();
    (function step(now) {
      const k = reduce ? 1 : Math.min(1, (now - t0) / 1600), v = Math.round(end * (1 - Math.pow(1 - k, 3)));
      n.textContent = v;
      if (suf) { const sm = document.createElement('small'); sm.textContent = suf; n.append(sm); }
      if (k < 1) requestAnimationFrame(step);
    })(t0);
  }), { threshold: 0.5 });
  data.forEach((s) => {
    const d = el('div', 'stat'), b = el('b', '', '0'); b.dataset.v = s.value; b.dataset.s = s.suffix;
    d.append(b, el('span', '', s.label)); wrap.append(d); io.observe(d);
  });
}

/* ---------- Генератор цитат ---------- */
let lastQuote = -1;
async function newQuote() {
  const bq = $('#quote-text').closest('blockquote');
  bq.classList.add('swap');
  try {
    const q = await api('/api/quote?exclude=' + lastQuote);
    await new Promise((r) => setTimeout(r, 300));
    lastQuote = q.id;
    $('#quote-text').textContent = q.kind === 'quote' ? '«' + q.text + '»' : q.text;
    $('#quote-ctx').textContent = q.context;
  } catch (e) { $('#quote-text').textContent = 'Не удалось получить цитату. Проверьте, что сервер запущен.'; }
  bq.classList.remove('swap');
}
$('#quote-btn').addEventListener('click', newQuote);

/* ---------- Старт ---------- */
initDust();
initSphere();
initPlayer();
[loadAlbums, loadTimeline, loadSamples, loadStats, newQuote].forEach((fn) => fn().catch((e) => console.error(e)));
