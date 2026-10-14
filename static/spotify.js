'use strict';
// Spotify: у треков со ссылкой звук идёт из встроенного плеера Spotify, у остальных остаётся демо или mp3
(() => {
  if (typeof Player === 'undefined') return;
  const local = Player.load.bind(Player);
  let ctrl = null, pending = null, loading = false, box = null;
  const uri = (t) => 'spotify:track:' + t.spotify_id;
  const dock = () => document.querySelector('.player');

  const ensureBox = () => {
    if (box) return box;
    box = document.createElement('div'); box.className = 'sp-box'; box.hidden = true;
    box.innerHTML = '<div class="sp-head"><span>Spotify</span><button type="button" class="sp-x" aria-label="Вернуться к демо">✕</button></div><div class="sp-host"><div id="sp-embed"></div></div><small class="muted">Без входа в Spotify играет отрывок 30 секунд; полный трек доступен после входа в Spotify в браузере на компьютере.</small>';
    dock().append(box);
    box.querySelector('.sp-x').addEventListener('click', hide);
    return box;
  };
  const plainFrame = (t) => {   // запасной вариант, если скрипт Spotify не загрузился
    const host = box.querySelector('.sp-host'), f = document.createElement('iframe');
    f.src = 'https://open.spotify.com/embed/track/' + t.spotify_id + '?theme=0'; f.width = '100%'; f.height = 80; f.loading = 'lazy';
    f.allow = 'autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture';
    host.replaceChildren(f);
  };
  function show(t) {
    ensureBox(); dock().classList.add('sp-on'); box.hidden = false;
    Player.stop(); Player.tr = t; $('#pl-title').textContent = t.title; Player.paint(0);
    if (ctrl) { ctrl.loadUri(uri(t)); ctrl.play(); return; }
    pending = t;
    if (loading) return;
    loading = true;
    window.onSpotifyIframeApiReady = (api) => {
      const host = box.querySelector('#sp-embed');
      if (!host) return;
      api.createController(host, { uri: uri(pending), width: '100%', height: 80 }, (c) => {
        ctrl = c;
        c.addListener('ready', () => c.play());
        c.addListener('playback_update', (e) => { Player.playing = !!(e.data && !e.data.isPaused); });
      });
    };
    const s = document.createElement('script'); s.src = 'https://open.spotify.com/embed/iframe-api/v1'; s.async = true;
    s.onerror = () => plainFrame(pending); document.body.append(s);
    setTimeout(() => { if (!ctrl && box.querySelector('#sp-embed') && !box.querySelector('iframe')) plainFrame(pending); }, 6000);
  }
  function hide() {
    if (!box) return;
    dock().classList.remove('sp-on'); box.hidden = true;
    if (ctrl) ctrl.pause();
    Player.playing = false; Player.tr = null; $('#pl-title').textContent = 'Выберите трек'; Player.paint(0);
  }
  Player.load = function (tr, era) {
    if (tr.spotify_id) { show(tr); return; }
    if (box && !box.hidden) hide();
    local(tr, era);
  };
})();
