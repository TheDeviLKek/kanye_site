'use strict';
/* ---------- Плеер: файл (preview_url) или синтез Web Audio ---------- */
const ERA = {
  soul: { w: 'triangle', r: [1, 1.25, 1.5, 2], f: 2200, bpm: 96 },
  pop: { w: 'sawtooth', r: [1, 1.25, 1.5], f: 1800, bpm: 128 },
  autotune: { w: 'sine', r: [1, 1.2, 1.5], f: 1200, bpm: 78 },
  max: { w: 'sawtooth', r: [1, 1.2, 1.5, 1.8], f: 2600, bpm: 88 },
  industrial: { w: 'square', r: [1, 1.06, 1.5], f: 700, bpm: 110 },
  gospel: { w: 'sine', r: [1, 1.2, 1.5, 2], f: 3000, bpm: 72 },
};
const Player = {
  audio: new Audio(), ctx: null, voices: [], tr: null, era: 'soul', useFile: false, t0: 0, dur: 30, playing: false,
  load(tr, era) {
    this.stop(); this.tr = tr; this.era = era; this.useFile = !!tr.preview_url;
    if (this.useFile) { this.audio.src = tr.preview_url; this.audio.load(); }
    $('#pl-title').textContent = tr.title;
    this.paint(); this.play();
  },
  length() { return this.useFile ? (this.audio.duration || this.dur) : this.dur; },
  elapsed() { return this.useFile ? this.audio.currentTime : (this.ctx ? this.ctx.currentTime - this.t0 : 0); },
  synth() {
    const c = this.ctx, e = ERA[this.era], root = this.tr.note;
    this.t0 = c.currentTime;
    const out = c.createGain(), lp = c.createBiquadFilter(), lfo = c.createOscillator(), lg = c.createGain();
    lp.type = 'lowpass'; lp.frequency.value = e.f; out.gain.value = 0.12;
    lfo.frequency.value = (e.bpm / 60) * 2; lg.gain.value = 0.06;
    lfo.connect(lg); lg.connect(out.gain); lp.connect(out); out.connect(c.destination);
    const vs = [lfo];
    e.r.forEach((r, i) => { const o = c.createOscillator(); o.type = e.w; o.frequency.value = root * r; o.detune.value = i * 4; o.connect(lp); vs.push(o); });
    vs.forEach((v) => v.start());
    this.voices = vs;
  },
  play() {
    if (!this.tr) return;
    if (this.useFile) { this.audio.play().catch(() => {}); }
    else {
      if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      if (!this.voices.length) this.synth();
      this.ctx.resume();
    }
    this.playing = true; this.paint(); this.tick();
  },
  pause() {
    if (this.useFile) this.audio.pause(); else if (this.ctx) this.ctx.suspend();
    this.playing = false; this.paint();
  },
  stop() {
    this.audio.pause();
    this.voices.forEach((v) => { try { v.stop(); } catch (e) { /* уже остановлен */ } });
    this.voices = [];
    if (this.ctx) this.ctx.suspend();
    this.playing = false; this.paint(0);
  },
  seek(p) {
    if (!this.tr) return;
    if (this.useFile) this.audio.currentTime = p * this.length();
    else if (this.ctx) this.t0 = this.ctx.currentTime - p * this.dur;
  },
  paint(p) {
    const btn = $('#pl-btn');
    btn.dataset.state = this.playing ? 'playing' : 'paused';
    btn.setAttribute('aria-label', this.playing ? 'Пауза' : 'Играть');
    const len = this.length(), cur = p === 0 ? 0 : Math.min(this.elapsed(), len), frac = len ? cur / len : 0;
    const bar = $('#pl-bar');
    bar.value = Math.round(frac * 1000); bar.style.setProperty('--p', frac * 100 + '%');
    $('#pl-time').textContent = fmt(cur) + ' / ' + fmt(len);
    document.querySelectorAll('.tracks button').forEach((b) => b.setAttribute('aria-current', this.tr && +b.dataset.id === this.tr.id ? 'true' : 'false'));
  },
  tick() {
    if (!this.playing) return;
    if (this.elapsed() >= this.length()) { this.stop(); return; }
    this.paint();
    requestAnimationFrame(() => this.tick());
  },
};
function initPlayer() {
  $('#pl-btn').addEventListener('click', () => (Player.playing ? Player.pause() : Player.play()));
  $('#pl-bar').addEventListener('input', (e) => { Player.seek(e.target.value / 1000); Player.paint(); });
  Player.audio.addEventListener('ended', () => Player.stop());
  Player.paint(0);
}

