'use strict';
// Общие эффекты: полоса прокрутки, курсор-кольцо, появление блоков, наклон и подсветка карточек
(() => {
  const fine = matchMedia('(hover:hover) and (pointer:fine)').matches, calm = matchMedia('(prefers-reduced-motion:reduce)').matches;
  const mk = (cls) => { const n = document.createElement('i'); n.className = cls; document.body.append(n); return n; };

  const bar = mk('prog');
  const sp = () => {
    document.body.classList.toggle('scrolled', scrollY > 24);
    document.documentElement.style.setProperty('--sy', Math.min(1.2, scrollY / innerHeight).toFixed(3)); bar.style.transform = 'scaleX(' + scrollY / Math.max(1, document.documentElement.scrollHeight - innerHeight) + ')'; };
  addEventListener('scroll', sp, { passive: true }); addEventListener('resize', sp); sp();


  // цвет страницы подстраивается под раздел, в котором вы находитесь
  const accs = document.querySelectorAll('.block[data-accent]');
  if (accs.length) {
    const ia = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) document.body.style.setProperty('--a', e.target.dataset.accent); }), { rootMargin: '-45% 0px -45% 0px' });
    accs.forEach((s) => ia.observe(s));
  }

  const sel = '.block>h2,.block .grid>*,.stat,.gal>*,.ev,.dec,.quote-block blockquote,.quote-block .ghost,.cc,.marq,.wm';
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: 0.12 });
  const tag = (root) => root.querySelectorAll && root.querySelectorAll(sel).forEach((n) => {
    if (n.dataset.rv) return;
    n.dataset.rv = 1; n.classList.add('rv'); n.style.setProperty('--i', [...n.parentNode.children].indexOf(n) % 8); io.observe(n);
  });
  tag(document);
  new MutationObserver((ms) => ms.forEach((m) => m.addedNodes.forEach((n) => n.nodeType === 1 && (n.matches(sel) ? tag(n.parentNode) : tag(n))))).observe(document.body, { childList: true, subtree: true });

  if (fine && !calm) {
    const T = '.card,.sample,.cc,.cover:not(.mini)';
    document.addEventListener('pointermove', (e) => {
      const c = e.target.closest && e.target.closest(T); if (!c) return;
      const r = c.getBoundingClientRect(), px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
      c.style.setProperty('--px', px * 100 + '%'); c.style.setProperty('--py', py * 100 + '%');
      c.style.setProperty('--rx', ((0.5 - py) * 7).toFixed(2) + 'deg'); c.style.setProperty('--ry', ((px - 0.5) * 9).toFixed(2) + 'deg');
    });
    document.addEventListener('pointerout', (e) => {
      const c = e.target.closest && e.target.closest(T);
      if (c && !c.contains(e.relatedTarget)) { c.style.setProperty('--rx', '0deg'); c.style.setProperty('--ry', '0deg'); }
    });
  }
})();

// Поиск по сайту: Ctrl+K (⌘K)
(() => {
  const ov = document.createElement('div'); ov.className = 'sx'; ov.hidden = true;
  ov.innerHTML = '<div class="sx-box"><input type="search" placeholder="Альбом, трек, цитата, факт…" aria-label="Поиск"><ul></ul><small>↑↓ выбор · Enter открыть · Esc закрыть</small></div>';
  document.body.append(ov);
  const inp = ov.querySelector('input'), ul = ov.querySelector('ul'), NAME = { album: 'Альбом', track: 'Трек', quote: 'Цитата', fact: 'Факт' };
  let items = [], cur = 0, tm;
  const go = (r) => { location.href = r.t === 'album' ? '/album/' + r.id : r.t === 'track' ? '/album/' + r.id + '#t' + r.tid : r.t === 'quote' ? '/#quote' : '/#timeline'; };
  const paint = () => ul.replaceChildren(...items.map((r, i) => {
    const li = document.createElement('li'); li.className = i === cur ? 'on' : ''; li.innerHTML = '<b></b><span></span><i></i>';
    li.children[0].textContent = r.title; li.children[1].textContent = r.sub; li.children[2].textContent = NAME[r.t];
    li.addEventListener('click', () => go(r)); return li;
  }));
  const run = async () => {
    const q = inp.value.trim();
    items = q.length < 2 ? [] : await api('/api/search?q=' + encodeURIComponent(q)); cur = 0; paint();
  };
  const open = (v) => { ov.hidden = !v; if (v) { inp.value = ''; items = []; paint(); inp.focus(); } };
  addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); open(ov.hidden); return; }
    if (ov.hidden) return;
    if (e.key === 'Escape') open(false);
    else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); cur = Math.max(0, Math.min(items.length - 1, cur + (e.key === 'ArrowDown' ? 1 : -1))); paint(); }
    else if (e.key === 'Enter' && items[cur]) go(items[cur]);
  });
  inp.addEventListener('input', () => { clearTimeout(tm); tm = setTimeout(run, 150); });
  ov.addEventListener('pointerdown', (e) => { if (e.target === ov) open(false); });
  const nav = document.querySelector('.top nav');
  if (nav) { const b = document.createElement('button'); b.className = 'kbtn'; b.type = 'button'; b.innerHTML = 'Поиск <kbd>Ctrl K</kbd>'; b.addEventListener('click', () => open(true)); nav.append(b); }
})();
