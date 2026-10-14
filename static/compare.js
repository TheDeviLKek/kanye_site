'use strict';
const ERA = { soul: 'Соул-сэмплинг', pop: 'Электро-поп', autotune: 'Автотюн', max: 'Максимализм', industrial: 'Индастриал', gospel: 'Госпел' };
const yrs = (n) => (n % 10 === 1 && n % 100 !== 11 ? 'год' : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 12 || n % 100 > 14) ? 'года' : 'лет');
(async () => {
  const list = await api('/api/albums'), qs = new URLSearchParams(location.search), sa = $('#sa'), sb = $('#sb');
  [sa, sb].forEach((s) => list.forEach((a) => { const o = el('option', '', a.year + ' · ' + a.title); o.value = a.id; s.append(o); }));
  sa.value = qs.get('a') || list[0].id; sb.value = qs.get('b') || list[list.length - 2].id;
  const side = (box, a, max) => {
    box.style.setProperty('--c', a.color); box.dataset.era = a.era; box.replaceChildren();
    const art = el('div', 'art'), cover = el('div', 'cover'), rows = el('dl', 'cmp'), meter = el('div', 'meter'), bar = el('i');
    art.append(el('b', '', a.year), el('span', '', a.title)); cover.append(el('div', 'disc'), art);
    const add = (k, v) => rows.append(el('dt', '', k), el('dd', '', v));
    add('Год', a.year); add('Треков', a.tracks.length); add('Звук', ERA[a.era] || a.era);
    (a.notes || []).forEach((n) => add(n.label, n.text));
    bar.style.width = '0%'; meter.append(bar); setTimeout(() => { bar.style.width = (a.tracks.length / max) * 100 + '%'; }, 60);
    box.append(cover, el('h2', '', a.title), rows, meter);
  };
  const draw = async () => {
    const [a, b] = await Promise.all([api('/api/album/' + sa.value), api('/api/album/' + sb.value)]);
    const max = Math.max(a.tracks.length, b.tracks.length), d = Math.abs(a.year - b.year);
    side($('#ca'), a, max); side($('#cb'), b, max);
    $('#vs').textContent = (d ? 'Между ними ' + d + ' ' + yrs(d) : 'Вышли в один год') + ' · разница в количестве треков: ' + Math.abs(a.tracks.length - b.tracks.length);
    document.body.style.setProperty('--a', a.color);
    history.replaceState(null, '', '?a=' + a.id + '&b=' + b.id);
  };
  sa.addEventListener('change', draw); sb.addEventListener('change', draw); draw();
})().catch(() => { $('#vs').textContent = 'Не удалось загрузить альбомы. Проверьте, что сервер запущен.'; });
