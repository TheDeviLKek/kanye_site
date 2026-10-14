'use strict';
// Избранное: ♥ у каждого трека и счётчик в шапке (данные хранятся в браузере)
const Fav = {
  ids() { try { return JSON.parse(localStorage.getItem('kq-fav')) || []; } catch (e) { return []; } },
  has(id) { return this.ids().includes(+id); },
  set(list) {
    try { localStorage.setItem('kq-fav', JSON.stringify([...new Set(list.map(Number))])); } catch (e) { /* хранилище недоступно */ }
    document.dispatchEvent(new Event('favchange'));
  },
  toggle(id) { id = +id; this.set(this.has(id) ? this.ids().filter((x) => x !== id) : [...this.ids(), id]); },
};
(() => {
  const paint = () => {
    document.querySelectorAll('.heart').forEach((h) => { const on = Fav.has(h.dataset.fid); h.classList.toggle('on', on); h.setAttribute('aria-pressed', on); });
    const c = document.querySelector('.fav-link b'), n = String(Fav.ids().length);
    if (c && c.textContent !== n) c.textContent = n;
  };
  const enhance = () => document.querySelectorAll('.tracks li').forEach((li) => {
    const btn = li.querySelector('button[data-id]');
    if (!btn || li.querySelector('.heart')) return;
    const h = document.createElement('button');
    h.type = 'button'; h.className = 'heart'; h.dataset.fid = btn.dataset.id; h.textContent = '♥'; h.title = 'В избранное'; h.setAttribute('aria-label', 'В избранное');
    h.addEventListener('click', (e) => { e.stopPropagation(); Fav.toggle(h.dataset.fid); });
    li.append(h);
  });
  const nav = document.querySelector('.top nav');
  if (nav) { const a = document.createElement('a'); a.className = 'kbtn fav-link'; a.href = '/favorites'; a.title = 'Избранное'; a.innerHTML = '♥ <b>0</b>'; nav.append(a); }
  document.addEventListener('favchange', paint);
  new MutationObserver(() => { enhance(); paint(); }).observe(document.body, { childList: true, subtree: true });
  enhance(); paint();
})();
