'use strict';
// Галерея: просмотр фото на весь экран (клик, ← →, Esc)
(() => {
  const figs = [...document.querySelectorAll('.ph')];
  if (!figs.length) return;
  const lb = document.createElement('div'); lb.className = 'lb'; lb.hidden = true;
  lb.innerHTML = '<button class="lb-x" type="button" aria-label="Закрыть">✕</button><button class="lb-p" type="button" aria-label="Назад">‹</button><img alt=""><button class="lb-n" type="button" aria-label="Вперёд">›</button><p></p>';
  document.body.append(lb);
  const img = lb.querySelector('img'), cap = lb.querySelector('p');
  let i = 0;
  const show = (k) => {
    i = (k + figs.length) % figs.length;
    const src = figs[i].querySelector('img');
    img.src = src.src; img.alt = src.alt; cap.textContent = figs[i].querySelector('figcaption').innerText;
  };
  const open = (k) => { show(k); lb.hidden = false; document.body.style.overflow = 'hidden'; };
  const close = () => { lb.hidden = true; document.body.style.overflow = ''; };
  figs.forEach((f, k) => f.addEventListener('click', () => open(k)));
  lb.querySelector('.lb-x').addEventListener('click', close);
  lb.querySelector('.lb-p').addEventListener('click', () => show(i - 1));
  lb.querySelector('.lb-n').addEventListener('click', () => show(i + 1));
  lb.addEventListener('pointerdown', (e) => { if (e.target === lb) close(); });
  addEventListener('keydown', (e) => {
    if (lb.hidden) return;
    if (e.key === 'Escape') close(); else if (e.key === 'ArrowLeft') show(i - 1); else if (e.key === 'ArrowRight') show(i + 1);
  });
})();
