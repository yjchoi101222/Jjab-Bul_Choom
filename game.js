/**
 * 얼음과 불의 춤 (A Dance of Fire and Ice) - Web Edition
 *
 * 게임 메커니즘 (나무위키 / 원작 기준)
 *  - 두 행성(불/얼음) 중 하나가 타일 위에 고정(축)되고, 다른 하나가 그 주위를 공전한다.
 *  - 공전 속도: 1박자 = 180°. 타일 사이 꺾인 각도만큼 시간이 걸린다. (기본 시계방향, 소용돌이 타일에서 반전)
 *  - 판정: 행성과 타일의 "각도" 기준 (완벽 ±30°, 빠름/느림 ±45°, 조금 빠름/느림 ±60°),
 *          고BPM에서는 최소 ms 범위(32.5 / 48.75 / 65ms)가 보장된다.
 *  - 판정 범위보다 일찍 누르면 "너무 빠름!!" — 죽지 않고 타일도 넘어가지 않는다.
 *    "너무 빠름!!"이 쌓이면 과부하 게이지가 차고, 가득 차면 "과부하!"로 사망한다.
 *    과부하 게이지는 레벨 기본 BPM 기준으로 시간에 따라 서서히 줄어든다. 진행도 95% 이후에는 과부하가 일어나지 않는다.
 *  - 판정 범위를 지나칠 때까지 누르지 않으면 "놓침!"으로 사망한다.
 *  - 모든 타일의 목표 시각은 레벨에서 고정 계산되며, 플레이어 입력에 의해 절대 바뀌지 않는다.
 *  - 미드스핀 타일은 입력 없이 자동으로 지나간다.
 *
 * 조작
 *  - 키보드의 모든 키 = 판정 입력 (단축키 없음). 브라우저용 F5/F11/F12, Ctrl/Alt/⌘ 조합만 제외.
 *  - 그 외 모든 기능은 마우스 버튼으로 조작한다.
 */
(function () {
  'use strict';

  // =====================================================================
  // 0. DOM
  // =====================================================================
  const $ = (id) => document.getElementById(id);
  const canvas = $('game-canvas');
  const ctx = canvas.getContext('2d');

  const el = {
    levelTitle: $('level-title'),
    levelMeta: $('level-meta'),
    bpm: $('bpm-display'),
    progress: $('progress-display'),
    accuracy: $('accuracy-display'),
    overload: $('overload-display'),
    kps: $('kps-display'),
    progressContainer: $('progress-bar-container'),
    progressFill: $('progress-bar-fill'),
    overlay: $('center-overlay'),
    overlayTitle: $('overlay-title'),
    overlaySubtitle: $('overlay-subtitle'),
    fileInput: $('file-input'),
    keyVisualizer: $('key-visualizer'),
    kvLabel: $('kv-label'),
    kvPills: $('kv-pills'),
    jipperDragHandle: $('jipper-drag-handle'),
    btnJipperLock: $('btn-jipper-lock'),
    btnJipperPos: $('btn-jipper-pos'),
    btnJipperVis: $('btn-jipper-vis'),
    btnJipperConfig: $('btn-jipper-config'),
    jipperKpsVal: $('jipper-kps-val'),
    jipperKpsMax: $('jipper-kps-max'),
    jipperTotalVal: $('jipper-total-val'),
    jipperRebindHint: $('jipper-rebind-hint'),
    btnSettings: $('btn-settings'),
    settingsModal: $('settings-modal'),
    btnCloseSettings: $('btn-close-settings'),
    settingsPageIndicator: $('settings-page-indicator'),
    tabPageGameplay: $('tab-page-gameplay'),
    settingsPageGameplay: $('settings-page-gameplay'),
    btnSettingsPrev: $('btn-settings-prev'),
    btnSettingsNext: $('btn-settings-next'),
    stageDropdown: $('stage-select-dropdown'),
    optImported: $('optgroup-imported'),
    stageSelector: $('stage-selector'),
    importedStages: $('imported-stages-container'),
    customStageBtn: $('custom-stage-btn'),
    editorPanel: $('editor-panel'),
    editorBpm: $('editor-bpm'),
    zoomVal: $('zoom-val'),
    offsetVal: $('offset-val'),
    speedVal: $('speed-val'),
    btnOpenFile: $('btn-open-file'),
    btnFullscreen: $('btn-fullscreen'),
    btnStart: $('btn-start-restart'),
    btnStop: $('btn-stop'),
    btnAutoplay: $('btn-autoplay'),
    btnNoFail: $('btn-no-fail'),
    btnHitsound: $('btn-hitsound'),
    btnVfx: $('btn-vfx'),
    btnKeyLimit: $('btn-key-limit'),
    btnEditor: $('btn-editor'),
    keyLimitPanel: $('key-limit-panel'),
    btnCloseKeyLimit: $('btn-close-key-limit'),
    btnToggleKeyLimit: $('btn-toggle-key-limit'),
    klCountBadge: $('kl-count-badge'),
    klChipList: $('kl-chip-list'),
    klKeyboardGrid: $('kl-keyboard-grid'),
    btnDoneKeyLimit: $('btn-done-key-limit'),
    btnZoomDown: $('btn-zoom-down'),
    btnZoomUp: $('btn-zoom-up'),
    btnOffsetDown: $('btn-offset-down'),
    btnOffsetUp: $('btn-offset-up'),
    btnSpeedDown: $('btn-speed-down'),
    btnSpeedUp: $('btn-speed-up'),
    btnOverlayStart: $('btn-overlay-start'),
    btnPracticeFail: $('btn-practice-fail'),
    btnOverlayOpen: $('btn-overlay-open'),
    overlayKeyHints: $('overlay-key-hints'),
    resultPanel: $('result-panel'),
    resultRank: $('result-rank-badge'),
    resultSongTitle: $('result-song-title'),
    resultSongMeta: $('result-song-meta'),
    resultTags: $('result-tags'),
    resAcc: $('res-acc'),
    resStdAcc: $('res-std-acc'),
    resProgress: $('res-progress'),
    resTiles: $('res-tiles'),
    resCombo: $('res-combo'),
    resComboBadge: $('res-combo-badge'),
    resOffset: $('res-offset'),
    resUr: $('res-ur'),
    resKps: $('res-kps'),
    resTime: $('res-time'),
    resSyncTip: $('res-sync-tip'),
    resultJudgments: $('result-judgments'),
    resultChart: $('result-chart'),
    btnCloseEditor: $('btn-close-editor'),
    btnUndoTile: $('btn-undo-tile'),
    btnClearEditor: $('btn-clear-editor'),
    btnPlayCustom: $('btn-play-custom')
  };

  function on(node, type, fn, opts) {
    if (node) node.addEventListener(type, fn, opts);
  }

  // =====================================================================
  // 1. UTILS & CONSTANTS
  // =====================================================================
  const mod = (a, n) => ((a % n) + n) % n;
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  const deg2rad = (d) => (d * Math.PI) / 180;

  // 판정 (보통 난이도): 각도 기준 + 고BPM(680+ BPM 등)에서도 넉넉한 최소 ms 보장
  const JUDGE = {
    pure: { deg: 30, ms: 0.055 },     // 완벽!
    perfect: { deg: 45, ms: 0.085 },  // 빠름 / 느림 (E/L Perfect)
    counted: { deg: 60, ms: 0.120 }   // 조금 빠름! / 조금 느림! (이 범위 밖 = 너무 빠름!! / 놓침!)
  };
  const OVERLOAD_MAX = 4;          // 과부하 게이지 최대치
  const OVERLOAD_DECAY_BEATS = 2;  // 기본 BPM 기준 2박자마다 1칸씩 감소
  const OVERLOAD_SAFE_PROGRESS = 0.95;

  const JUDGE_INFO = {
    perfect: { text: '완벽!', color: '#5dff6a', acc: 100 },
    ep: { text: '빠름', color: '#c8ff5a', acc: 75 },
    lp: { text: '느림', color: '#c8ff5a', acc: 75 },
    early: { text: '조금 빠름!', color: '#ffb340', acc: 40 },
    late: { text: '조금 느림!', color: '#ffb340', acc: 40 },
    tooEarly: { text: '너무 빠름!!', color: '#ff5050', acc: 20 },
    miss: { text: '놓침!', color: '#ff3b3b', acc: 0 },
    auto: { text: '완벽!', color: '#5dff6a', acc: 100 }
  };

  function windowsFor(bpm) {
    const beat = 60 / bpm;
    const a2t = (deg) => (deg / 180) * beat;
    return {
      pure: Math.max(a2t(JUDGE.pure.deg), JUDGE.pure.ms),
      perfect: Math.max(a2t(JUDGE.perfect.deg), JUDGE.perfect.ms),
      counted: Math.max(a2t(JUDGE.counted.deg), JUDGE.counted.ms)
    };
  }

  function hexColor(v, fallback) {
    if (v === undefined || v === null) return fallback;
    const s = String(v).replace('#', '').trim();
    if (/^[0-9a-fA-F]{6}/.test(s)) return '#' + s.slice(0, 6);
    return fallback;
  }

  const rgbCache = new Map();
  function hexToRgb(hex) {
    const key = hex || '#70bdff';
    let hit = rgbCache.get(key);
    if (hit) return hit;
    const s = String(key).replace('#', '');
    if (s.length >= 6) {
      const r = parseInt(s.slice(0, 2), 16) || 0;
      const g = parseInt(s.slice(2, 4), 16) || 0;
      const b = parseInt(s.slice(4, 6), 16) || 0;
      hit = [r, g, b];
    } else {
      hit = [112, 189, 255];
    }
    if (rgbCache.size > 512) rgbCache.clear();
    rgbCache.set(key, hit);
    return hit;
  }

  function lerpHexColor(c1, c2, t) {
    const k = clamp(t, 0, 1);
    if (k <= 0.002) return c1;
    if (k >= 0.998) return c2;
    const a = hexToRgb(c1);
    const b = hexToRgb(c2);
    const r = Math.round(a[0] + (b[0] - a[0]) * k);
    const g = Math.round(a[1] + (b[1] - a[1]) * k);
    const bl = Math.round(a[2] + (b[2] - a[2]) * k);
    return `rgb(${r},${g},${bl})`;
  }

  function hexLuma(hex) {
    if (!hex) return 1;
    const [r, g, b] = hexToRgb(hex);
    return clamp((0.299 * r + 0.587 * g + 0.114 * b) / 255, 0, 1);
  }

  // ADOFAI 타일 참조 [offset, "ThisTile" | "Start" | "End"] 해석
  function resolveTileRef(ref, eventFloor, n) {
    if (Array.isArray(ref)) {
      const off = Number(ref[0]) || 0;
      const anchor = String(ref[1] || 'ThisTile');
      if (anchor === 'Start' || anchor === 'StartTile') return clamp(off, 0, n - 1);
      if (anchor === 'End' || anchor === 'EndTile') return clamp((n - 1) + off, 0, n - 1);
      return clamp(eventFloor + off, 0, n - 1);
    }
    const num = Number(ref);
    if (Number.isFinite(num)) return clamp(eventFloor + num, 0, n - 1);
    return clamp(eventFloor, 0, n - 1);
  }

  function stripRichText(str) {
    if (!str || typeof str !== 'string') return '';
    return str.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  }

  // =====================================================================
  // 2. SOUND (Web Audio 합성음)
  // =====================================================================
  const snd = { ctx: null, master: null };

  function ensureAudio() {
    try {
      if (!snd.ctx) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return;
        snd.ctx = new AC({ latencyHint: 'interactive' });
        snd.master = snd.ctx.createGain();
        snd.master.gain.value = 0.55;
        snd.master.connect(snd.ctx.destination);
      }
      if (snd.ctx.state === 'suspended') snd.ctx.resume();
    } catch (e) {
      snd.ctx = null;
    }
  }

  function tone(delay, freq, dur, type, vol, freqEnd) {
    if (!snd.ctx) return;
    try {
      const t = snd.ctx.currentTime + Math.max(0, delay);
      const osc = snd.ctx.createOscillator();
      const g = snd.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, t);
      if (freqEnd) osc.frequency.exponentialRampToValueAtTime(freqEnd, t + dur);
      g.gain.setValueAtTime(vol, t);
      g.gain.exponentialRampToValueAtTime(0.0008, t + dur);
      osc.connect(g);
      g.connect(snd.master);
      osc.start(t);
      osc.stop(t + dur + 0.02);
    } catch (e) { /* ignore */ }
  }

  const sfx = {
    lastHitAt: 0,
    hit() {
      let delay = 0;
      let pitchBoost = 1;
      if (snd.ctx) {
        const now = snd.ctx.currentTime;
        // 동타(동시 입력) 시 타격음이 한 샘플에 겹쳐 뭉개지지 않고 '타-닥!'으로 또렷이 들리도록 미세 간격 보정
        if (now < this.lastHitAt + 0.014) {
          delay = Math.min(0.042, this.lastHitAt + 0.014 - now);
          pitchBoost = 1.08;
        }
        this.lastHitAt = now + delay;
      }
      tone(delay, 180 * pitchBoost, 0.09, 'sine', 0.9, 45);
      tone(delay, 2400 * pitchBoost, 0.025, 'square', 0.06);
    },
    tick(delay, accent) { tone(delay, accent ? 1320 : 990, 0.07, 'triangle', 0.35); },
    note(delay, idx, scale) {
      const f = scale[idx % scale.length];
      tone(delay, f, 0.22, 'triangle', 0.22);
      tone(delay, f / 2, 0.18, 'sine', 0.16);
    },
    tooEarly() { tone(0, 220, 0.07, 'sawtooth', 0.18, 140); },
    fail() { tone(0, 200, 0.4, 'sawtooth', 0.32, 50); },
    clear() { [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(i * 0.09, f, 0.45, 'triangle', 0.28)); }
  };

  const SCALES = [
    [523.25, 587.33, 659.25, 783.99, 880.0, 783.99, 659.25, 587.33, 523.25, 659.25, 783.99, 1046.5, 880.0, 783.99, 659.25, 523.25],
    [440.0, 523.25, 659.25, 587.33, 493.88, 587.33, 783.99, 659.25, 880.0, 783.99, 659.25, 523.25, 587.33, 659.25, 523.25, 440.0],
    [493.88, 587.33, 659.25, 739.99, 783.99, 987.77, 880.0, 783.99, 659.25, 739.99, 880.0, 987.77, 1174.66, 987.77, 783.99, 659.25],
    [659.25, 783.99, 987.77, 1174.66, 1318.51, 1174.66, 987.77, 783.99, 587.33, 739.99, 880.0, 1174.66, 987.77, 880.0, 739.99, 659.25]
  ];

  // 외부 음악 (HTMLAudioElement)
  const bgm = { audio: null, url: null };

  function prepareBgm(url, volume, rate) {
    if (!url) {
      if (bgm.audio) bgm.audio.pause();
      return null;
    }
    if (!bgm.audio || bgm.url !== url) {
      if (bgm.audio) bgm.audio.pause();
      const a = new Audio();
      a.preload = 'auto';
      a.src = /^(blob:|data:)/.test(url) ? url : encodeURI(url);
      bgm.audio = a;
      bgm.url = url;
    }
    const a = bgm.audio;
    a.pause();
    try { a.currentTime = 0; } catch (e) { /* not loaded yet */ }
    a.preservesPitch = false;
    a.mozPreservesPitch = false;
    a.webkitPreservesPitch = false;
    a.playbackRate = rate;
    a.volume = clamp(volume, 0, 1);
    return a;
  }

  function stopBgm() {
    if (bgm.audio) bgm.audio.pause();
  }

  // =====================================================================
  // 3. .ADOFAI PARSER
  // =====================================================================
  const PATH_ABS = {
    R: 0, p: 15, J: 30, E: 45, T: 60, o: 75, U: 90, q: 105, G: 120, Q: 135, H: 150, W: 165,
    L: 180, x: 195, N: 210, Z: 225, F: 240, V: 255, D: 270, Y: 285, B: 300, C: 315, M: 330, A: 345
  };
  // 상대 각도 문자 (다각형 내각): 다음 방향 = 이전 방향 + 180 - 내각
  const PATH_REL = { '5': 108, '6': 252, '7': 900 / 7, '8': 360 - 900 / 7, t: 60, h: 120, j: 240, y: 300 };

  function pathToAngles(path) {
    const out = [];
    let last = 0;
    for (const ch of path) {
      if (ch === '!') {
        out.push(999);
      } else if (ch in PATH_ABS) {
        last = PATH_ABS[ch];
        out.push(last);
      } else if (ch in PATH_REL) {
        last = mod(last + 180 - PATH_REL[ch], 360);
        out.push(last);
      }
    }
    return out;
  }

  function parseAdofaiJson(rawText) {
    let text = String(rawText).replace(/^\uFEFF/, '');
    const tryParse = (s) => JSON.parse(s.replace(/,(\s*[}\]])/g, '$1'));
    try {
      return tryParse(text);
    } catch (e1) {
      // 따옴표 안의 줄바꿈/탭 이스케이프 + 객체 사이 누락된 쉼표 보정
      let out = '';
      let inStr = false;
      let esc = false;
      for (let i = 0; i < text.length; i++) {
        const ch = text[i];
        if (inStr) {
          if (esc) { esc = false; out += ch; }
          else if (ch === '\\') { esc = true; out += ch; }
          else if (ch === '"') { inStr = false; out += ch; }
          else if (ch === '\n') out += '\\n';
          else if (ch === '\r') { /* skip */ }
          else if (ch === '\t') out += '\\t';
          else out += ch;
        } else {
          if (ch === '"') inStr = true;
          out += ch;
        }
      }
      out = out.replace(/\}(\s*)\{/g, '},$1{');
      return tryParse(out);
    }
  }

  function newEvent() {
    return { twirl: 0, speed: [], pause: 0, color: null, colorStyle: null, zoom: null, shift: null };
  }

  function getEvent(map, floor) {
    if (!map.has(floor)) map.set(floor, newEvent());
    return map.get(floor);
  }

  function parseTrackColorStyle(obj, fallbackColor) {
    const c1 = hexColor(obj.trackColor, fallbackColor || '#70bdff');
    return {
      type: String(obj.trackColorType || 'Single'),
      color: c1,
      secColor: hexColor(obj.secondaryTrackColor, '#ffffff'),
      animDur: Math.max(0.05, Number(obj.trackColorAnimDuration) || 2),
      pulse: String(obj.trackColorPulse || 'None'),
      pulseLen: Math.max(1, Number(obj.trackPulseLength) || 10),
      style: String(obj.trackStyle || 'Standard')
    };
  }

  function defFromAdofai(data) {
    const s = data.settings || {};
    let angles;
    if (Array.isArray(data.angleData)) {
      angles = data.angleData.map((v) => {
        const n = Number(v);
        return n === 999 ? 999 : mod(Number.isFinite(n) ? n : 0, 360);
      });
    } else {
      angles = pathToAngles(String(data.pathData || 'RRRRRRRR'));
    }
    if (angles.length === 0) angles = [0, 0, 0, 0];

    const baseTrackColor = hexColor(s.trackColor, '#70bdff');
    const events = new Map();
    const camEvents = [];
    const flashEvents = [];
    const shakeEvents = [];
    const moveTrackEvents = [];
    const animTrackEvents = [];
    const recolorEvents = [];
    const filterEvents = [];
    const bgEvents = [];
    const actions = Array.isArray(data.actions) ? data.actions : [];
    for (const a of actions) {
      const f = Number(a.floor);
      if (!Number.isFinite(f) || f < 0 || f > angles.length) continue;
      if (a.active === false || a.active === 'Disabled') continue;
      switch (a.eventType) {
        case 'Twirl':
          getEvent(events, f).twirl++;
          break;
        case 'SetSpeed': {
          const type = a.speedType || 'Bpm';
          if (type === 'Multiplier') {
            const m = Number(a.bpmMultiplier);
            if (m > 0) getEvent(events, f).speed.push({ mult: m });
          } else {
            const b = Number(a.beatsPerMinute);
            if (b > 0) getEvent(events, f).speed.push({ bpm: b });
          }
          break;
        }
        case 'Pause':
          getEvent(events, f).pause += Math.max(0, Number(a.duration) || 0);
          break;
        case 'Hold':
          getEvent(events, f).pause += Math.max(0, Number(a.duration) || 0) * 2;
          break;
        case 'ColorTrack': {
          const ev = getEvent(events, f);
          const cs = parseTrackColorStyle(a, baseTrackColor);
          ev.color = cs.color;
          ev.colorStyle = cs;
          break;
        }
        case 'RecolorTrack': {
          recolorEvents.push({
            floor: f,
            startTile: a.startTile,
            endTile: a.endTile,
            duration: 0,
            colorStyle: parseTrackColorStyle(a, baseTrackColor),
            angleOffset: Number(a.angleOffset) || 0
          });
          break;
        }
        case 'MoveCamera': {
          if (a.zoom !== undefined && Number(a.zoom) > 0) getEvent(events, f).zoom = Number(a.zoom);
          camEvents.push({
            floor: f,
            duration: Math.max(0, Number(a.duration) || 0),
            relativeTo: a.relativeTo ? String(a.relativeTo) : null,
            position: Array.isArray(a.position)
              ? [
                  a.position[0] !== null && a.position[0] !== undefined ? Number(a.position[0]) || 0 : null,
                  a.position[1] !== null && a.position[1] !== undefined ? Number(a.position[1]) || 0 : null
                ]
              : null,
            rotation: a.rotation !== undefined && a.rotation !== null ? Number(a.rotation) : null,
            zoom: a.zoom !== undefined && a.zoom !== null && Number(a.zoom) > 0 ? Number(a.zoom) : null,
            angleOffset: Number(a.angleOffset) || 0,
            ease: String(a.ease || 'Linear')
          });
          break;
        }
        case 'MoveTrack': {
          let sx = null;
          let sy = null;
          if (Array.isArray(a.scale)) {
            sx = a.scale[0] !== null && a.scale[0] !== undefined && Number.isFinite(Number(a.scale[0])) ? Number(a.scale[0]) / 100 : null;
            sy = a.scale[1] !== null && a.scale[1] !== undefined && Number.isFinite(Number(a.scale[1])) ? Number(a.scale[1]) / 100 : null;
          } else if (a.scale !== undefined && a.scale !== null && Number.isFinite(Number(a.scale))) {
            sx = Number(a.scale) / 100;
            sy = sx;
          }
          moveTrackEvents.push({
            floor: f,
            startTile: a.startTile,
            endTile: a.endTile,
            duration: Math.max(0, Number(a.duration) || 0),
            ox: Array.isArray(a.positionOffset) && a.positionOffset[0] !== null && a.positionOffset[0] !== undefined ? Number(a.positionOffset[0]) || 0 : null,
            oy: Array.isArray(a.positionOffset) && a.positionOffset[1] !== null && a.positionOffset[1] !== undefined ? Number(a.positionOffset[1]) || 0 : null,
            rot: a.rotationOffset !== undefined && a.rotationOffset !== null && Number.isFinite(Number(a.rotationOffset)) ? Number(a.rotationOffset) : null,
            sx,
            sy,
            opacity: a.opacity !== undefined && a.opacity !== null && Number.isFinite(Number(a.opacity)) ? clamp(Number(a.opacity) / 100, 0, 2) : null,
            angleOffset: Number(a.angleOffset) || 0,
            ease: String(a.ease || 'Linear')
          });
          break;
        }
        case 'AnimateTrack': {
          animTrackEvents.push({
            floor: f,
            duration: 0,
            trackAnimation: a.trackAnimation ? String(a.trackAnimation) : null,
            beatsAhead: a.beatsAhead !== undefined && a.beatsAhead !== null && Number.isFinite(Number(a.beatsAhead)) ? Number(a.beatsAhead) : null,
            trackDisappearAnimation: a.trackDisappearAnimation ? String(a.trackDisappearAnimation) : null,
            beatsBehind: a.beatsBehind !== undefined && a.beatsBehind !== null && Number.isFinite(Number(a.beatsBehind)) ? Number(a.beatsBehind) : null,
            angleOffset: Number(a.angleOffset) || 0
          });
          break;
        }
        case 'SetFilter': {
          filterEvents.push({
            floor: f,
            duration: 0,
            filter: String(a.filter || 'Grayscale'),
            enabled: a.enabled !== 'Disabled' && a.enabled !== false,
            intensity: a.intensity !== undefined && a.intensity !== null && Number.isFinite(Number(a.intensity)) ? Number(a.intensity) : 100,
            disableOthers: a.disableOthers === 'Enabled' || a.disableOthers === true,
            angleOffset: Number(a.angleOffset) || 0
          });
          break;
        }
        case 'Bloom': {
          filterEvents.push({
            floor: f,
            duration: 0,
            filter: 'Bloom',
            enabled: a.enabled !== 'Disabled' && a.enabled !== false,
            intensity: a.intensity !== undefined && a.intensity !== null && Number.isFinite(Number(a.intensity)) ? Number(a.intensity) : 100,
            disableOthers: false,
            angleOffset: Number(a.angleOffset) || 0
          });
          break;
        }
        case 'CustomBackground': {
          bgEvents.push({
            floor: f,
            duration: 0,
            color: hexColor(a.color, '#000000'),
            bgImage: a.bgImage !== undefined ? String(a.bgImage || '') : null,
            imageColor: hexColor(a.imageColor, '#ffffff'),
            lockRot: a.lockRot !== 'Disabled' && a.lockRot !== false,
            angleOffset: Number(a.angleOffset) || 0
          });
          break;
        }
        case 'Flash': {
          flashEvents.push({
            floor: f,
            duration: Math.max(0, Number(a.duration) || 0),
            plane: String(a.plane || 'Background'),
            startColor: hexColor(a.startColor, '#ffffff'),
            startOpacity: clamp(Number(a.startOpacity !== undefined ? a.startOpacity : 100) / 100, 0, 1),
            endColor: hexColor(a.endColor, '#ffffff'),
            endOpacity: clamp(Number(a.endOpacity !== undefined ? a.endOpacity : 0) / 100, 0, 1),
            angleOffset: Number(a.angleOffset) || 0,
            ease: String(a.ease || 'Linear')
          });
          break;
        }
        case 'ShakeScreen': {
          shakeEvents.push({
            floor: f,
            duration: Math.max(0, Number(a.duration) || 0),
            strength: clamp(Number(a.strength) || 0, 0, 500),
            fadeOut: a.fadeOut === 'Enabled' || a.fadeOut === true,
            angleOffset: Number(a.angleOffset) || 0
          });
          break;
        }
        case 'PositionTrack':
          if (Array.isArray(a.positionOffset) && a.editorOnly !== 'Enabled' && a.editorOnly !== true) {
            const e = getEvent(events, f);
            const dx = Number(a.positionOffset[0]) || 0;
            const dy = Number(a.positionOffset[1]) || 0;
            e.shift = [(e.shift ? e.shift[0] : 0) + dx, (e.shift ? e.shift[1] : 0) + dy];
          }
          break;
        default:
          break;
      }
    }

    return {
      angles,
      bpm: Number(s.bpm) > 0 ? Number(s.bpm) : 100,
      pitch: Number(s.pitch) > 0 ? Number(s.pitch) / 100 : 1,
      offsetSec: (Number(s.offset) || 0) / 1000, // 타일 1을 밟는 음악 시각
      ticks: clamp(Math.round(Number(s.countdownTicks) || 4), 1, 16),
      volume: s.volume !== undefined ? clamp(Number(s.volume) / 100, 0, 1) : 1,
      events,
      camEvents,
      flashEvents,
      shakeEvents,
      moveTrackEvents,
      animTrackEvents,
      recolorEvents,
      filterEvents,
      bgEvents,
      camRelativeTo: String(s.relativeTo || 'Player'),
      camPosition: Array.isArray(s.position) ? [Number(s.position[0]) || 0, Number(s.position[1]) || 0] : [0, 0],
      camRotation: Number(s.rotation) || 0,
      trackColor: baseTrackColor,
      trackStyleObj: parseTrackColorStyle(s, baseTrackColor),
      trackAnimation: String(s.trackAnimation || 'None'),
      beatsAhead: s.beatsAhead !== undefined && Number.isFinite(Number(s.beatsAhead)) ? Number(s.beatsAhead) : 3,
      trackDisappearAnimation: String(s.trackDisappearAnimation || 'None'),
      beatsBehind: s.beatsBehind !== undefined && Number.isFinite(Number(s.beatsBehind)) ? Number(s.beatsBehind) : 4,
      bgColor: hexColor(s.backgroundColor, null),
      bgImageColor: hexColor(s.bgImageColor, '#ffffff'),
      lockRot: s.lockRot !== 'Disabled' && s.lockRot !== false,
      stickToFloors: s.stickToFloors === 'Enabled' || s.stickToFloors === true,
      planetEase: String(s.planetEase || 'Linear'),
      zoom: Number(s.zoom) > 0 ? Number(s.zoom) : 100,
      title: stripRichText(s.song) || '제목 없음',
      artist: stripRichText(s.artist) || '알 수 없음',
      author: stripRichText(s.author) || '알 수 없음',
      songFilename: String(s.songFilename || ''),
      bgImage: String(s.bgImage || '')
    };
  }

  function defFromSteps(stage) {
    const angles = stage.steps.map((st) => mod(st.a, 360));
    const events = new Map();
    stage.steps.forEach((st, i) => {
      if (!st.type) return;
      const e = getEvent(events, i + 1);
      if (st.type === 'twirl') e.twirl++;
      else if (st.type === 'rabbit') e.speed.push({ mult: 1.5 });
      else if (st.type === 'snail') e.speed.push({ mult: 1 / 1.5 });
    });
    const ticks = 4;
    const baseColor = stage.trackColor || '#70bdff';
    return {
      angles,
      bpm: stage.bpm,
      pitch: 1,
      offsetSec: (ticks + 1) * (60 / stage.bpm) + 0.4,
      ticks,
      volume: 1,
      events,
      trackColor: baseColor,
      trackStyleObj: parseTrackColorStyle({}, baseColor),
      trackAnimation: 'None',
      beatsAhead: 4,
      trackDisappearAnimation: 'None',
      beatsBehind: 4,
      bgColor: null,
      bgImageColor: '#ffffff',
      lockRot: true,
      stickToFloors: false,
      planetEase: 'Linear',
      zoom: 100,
      title: stage.title,
      artist: stage.artist,
      author: stage.author
    };
  }

  // =====================================================================
  // 4. LEVEL COMPILER (타일 위치 + 고정 타이밍 계산)
  // =====================================================================
  // 배속 변화 비율(ratio)을 'x2', 'x4', 'x1/2', 'x1/4', 'x1.5' 형태로 포맷팅
  function formatSpeedRatio(ratio) {
    if (!Number.isFinite(ratio) || ratio <= 0) return '';
    if (ratio >= 1) {
      const rounded = Math.round(ratio);
      if (Math.abs(ratio - rounded) < 0.025) return 'x' + rounded;
      return 'x' + Number(ratio.toFixed(2));
    }
    // 감속 구간: 1/2, 1/3, 1/4, 1/8, 2/3, 3/4 등 분수 우선 표기
    const denoms = [2, 3, 4, 5, 6, 8, 10, 12, 16, 32];
    for (const d of denoms) {
      const num = Math.round(ratio * d);
      if (num >= 1 && num < d && Math.abs(ratio - num / d) < 0.015) {
        return `x${num}/${d}`;
      }
    }
    return 'x' + Number(ratio.toFixed(2));
  }

  function compileLevel(def, speed) {
    const A = def.angles;
    const n = A.length + 1;
    const rate = def.pitch * speed;
    const F = new Array(n);

    let x = 0;
    let y = 0;
    let bpm = def.bpm * rate;
    let cw = true;
    let color = def.trackColor;
    let colorStyle = def.trackStyleObj || parseTrackColorStyle({}, color);
    let planet = 0;
    let zoom = 100 / def.zoom;
    let rel = 0;

    for (let i = 0; i < n; i++) {
      const e = def.events.get(i);
      let twirl = false;
      let fast = false;
      let slow = false;
      let speedRatio = 1;
      let speedLabel = '';
      let pause = 0;
      if (e) {
        if (e.shift) { x += e.shift[0]; y += e.shift[1]; }
        if (e.twirl % 2 === 1) cw = !cw;
        twirl = e.twirl > 0;
        const before = bpm;
        for (const op of e.speed) {
          if (op.bpm) bpm = op.bpm * rate;
          else if (op.mult) bpm *= op.mult;
        }
        speedRatio = before > 0 ? bpm / before : 1;
        fast = speedRatio > 1.001;
        slow = speedRatio < 0.999;
        if (fast || slow) {
          speedLabel = formatSpeedRatio(speedRatio);
        }
        if (e.color) color = e.color;
        if (e.colorStyle) colorStyle = e.colorStyle;
        if (e.zoom) zoom = 100 / e.zoom;
        pause = e.pause;
      }

      // 이 타일로 들어온 방향의 반대 = 공전 행성의 출발 각도 (미드스핀 뒤에는 반전)
      let k = i - 1;
      let flips = 0;
      while (k >= 0 && A[k] === 999) { flips++; k--; }
      const start = mod((k >= 0 ? A[k] : 0) + 180 + 180 * flips, 360);

      const out = i < n - 1 ? A[i] : null;
      let travel;
      let dur;
      if (out === null) {
        travel = 360;
        dur = (60 / bpm) * 2;
      } else if (out === 999) {
        travel = 0;
        dur = 0;
      } else {
        travel = cw ? mod(start - out, 360) : mod(out - start, 360);
        if (travel < 1e-6) travel = 360;
        dur = (travel / 180 + pause) * (60 / bpm);
      }

      F[i] = {
        x, y, out, start, travel, cw, bpm, dur, rel, planet, color, colorStyle, zoom,
        twirl, fast, slow, speedRatio, speedLabel,
        midspin: out === 999,
        goal: i === n - 1
      };

      if (i < n - 1) rel += dur;
      if (out === 999 && i > 0) {
        x = F[i - 1].x;
        y = F[i - 1].y;
        planet = F[i - 1].planet;
      } else if (out !== null && out !== 999) {
        x += Math.cos(deg2rad(out));
        y += Math.sin(deg2rad(out));
        planet = 1 - planet;
      }
    }

    // 원작 ADOFAI 카메라(MoveCamera) / 트랙(MoveTrack, AnimateTrack, RecolorTrack) / 필터(SetFilter, Flash, ShakeScreen, CustomBackground) 타임라인 컴파일
    const compileTimed = (arr, withTileRange) => {
      if (!Array.isArray(arr) || !arr.length) return [];
      return arr
        .map((ev, order) => {
          const fl = clamp(ev.floor, 0, n - 1);
          const fObj = F[fl];
          const beatSec = 60 / fObj.bpm;
          const startRel = fObj.rel + ((ev.angleOffset || 0) / 180) * beatSec;
          const durSec = Math.max(0, (ev.duration || 0) * beatSec);
          if (withTileRange) {
            const aIdx = resolveTileRef(ev.startTile, fl, n);
            const bIdx = resolveTileRef(ev.endTile !== undefined ? ev.endTile : ev.startTile, fl, n);
            return { ...ev, floor: fl, i0: Math.min(aIdx, bIdx), i1: Math.max(aIdx, bIdx), startRel, durSec, order };
          }
          return { ...ev, floor: fl, startRel, durSec, order };
        })
        .sort((a, b) => (a.startRel !== b.startRel ? a.startRel - b.startRel : a.order - b.order));
    };

    return {
      def,
      floors: F,
      n,
      rate,
      bpm0: def.bpm * rate,
      beat0: 60 / (def.bpm * rate),
      T1: def.offsetSec / rate, // 타일 1의 목표 시각 (실제 초)
      camTimeline: compileTimed(def.camEvents, false),
      flashTimeline: compileTimed(def.flashEvents, false),
      shakeTimeline: compileTimed(def.shakeEvents, false),
      moveTrackTimeline: compileTimed(def.moveTrackEvents, true),
      recolorTimeline: compileTimed(def.recolorEvents, true),
      animTrackTimeline: compileTimed(def.animTrackEvents, false),
      filterTimeline: compileTimed(def.filterEvents, false),
      bgTimeline: compileTimed(def.bgEvents, false)
    };
  }

  // 원작 ADOFAI 이징(Ease) 함수 전체 지원
  function easeVal(name, t) {
    const k = clamp(t, 0, 1);
    switch (name) {
      case 'InSine': return 1 - Math.cos((k * Math.PI) / 2);
      case 'OutSine': return Math.sin((k * Math.PI) / 2);
      case 'InOutSine': return -(Math.cos(Math.PI * k) - 1) / 2;
      case 'InQuad': return k * k;
      case 'OutQuad': return 1 - (1 - k) * (1 - k);
      case 'InOutQuad': return k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
      case 'InCubic': return k * k * k;
      case 'OutCubic': return 1 - Math.pow(1 - k, 3);
      case 'InOutCubic': return k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
      case 'InQuart': return k * k * k * k;
      case 'OutQuart': return 1 - Math.pow(1 - k, 4);
      case 'InOutQuart': return k < 0.5 ? 8 * k * k * k * k : 1 - Math.pow(-2 * k + 2, 4) / 2;
      case 'InQuint': return k * k * k * k * k;
      case 'OutQuint': return 1 - Math.pow(1 - k, 5);
      case 'InOutQuint': return k < 0.5 ? 16 * k * k * k * k * k : 1 - Math.pow(-2 * k + 2, 5) / 2;
      case 'InCirc': return 1 - Math.sqrt(Math.max(0, 1 - k * k));
      case 'OutCirc': return Math.sqrt(Math.max(0, 1 - Math.pow(k - 1, 2)));
      case 'InOutCirc':
        return k < 0.5
          ? (1 - Math.sqrt(Math.max(0, 1 - Math.pow(2 * k, 2)))) / 2
          : (Math.sqrt(Math.max(0, 1 - Math.pow(-2 * k + 2, 2))) + 1) / 2;
      case 'OutExpo': return k >= 1 ? 1 : 1 - Math.pow(2, -10 * k);
      case 'InExpo': return k <= 0 ? 0 : Math.pow(2, 10 * k - 10);
      case 'InOutExpo':
        if (k <= 0) return 0;
        if (k >= 1) return 1;
        return k < 0.5 ? Math.pow(2, 20 * k - 10) / 2 : (2 - Math.pow(2, -20 * k + 10)) / 2;
      case 'InBack': {
        const c1 = 1.70158;
        const c3 = c1 + 1;
        return c3 * k * k * k - c1 * k * k;
      }
      case 'OutBack': {
        const c1 = 1.70158;
        const c3 = c1 + 1;
        return 1 + c3 * Math.pow(k - 1, 3) + c1 * Math.pow(k - 1, 2);
      }
      case 'InOutBack': {
        const c1 = 1.70158;
        const c2 = c1 * 1.525;
        return k < 0.5
          ? (Math.pow(2 * k, 2) * ((c2 + 1) * 2 * k - c2)) / 2
          : (Math.pow(2 * k - 2, 2) * ((c2 + 1) * (k * 2 - 2) + c2) + 2) / 2;
      }
      case 'OutElastic': {
        if (k <= 0 || k >= 1) return k;
        return Math.pow(2, -10 * k) * Math.sin((k * 10 - 0.75) * ((2 * Math.PI) / 3)) + 1;
      }
      case 'OutBounce': {
        const n1 = 7.5625;
        const d1 = 2.75;
        let x = k;
        if (x < 1 / d1) return n1 * x * x;
        if (x < 2 / d1) { x -= 1.5 / d1; return n1 * x * x + 0.75; }
        if (x < 2.5 / d1) { x -= 2.25 / d1; return n1 * x * x + 0.9375; }
        x -= 2.625 / d1;
        return n1 * x * x + 0.984375;
      }
      case 'InFlash': return k >= 1 ? 1 : 0;
      case 'OutFlash': return 1;
      case 'InOutFlash': return k < 0.5 ? 0 : 1;
      default: return k;
    }
  }

  // 특정 상대 시각(curRel)에서의 원작 MoveCamera 상태 계산
  function evalCameraState(L, curRel, playerX, playerY) {
    const def = L.def;
    let relMode = def.camRelativeTo || 'Player';
    let ox = def.camPosition ? def.camPosition[0] : 0;
    let oy = def.camPosition ? def.camPosition[1] : 0;
    const f0 = L.floors[0];
    let x = (relMode === 'Tile' || relMode === 'Global' ? f0.x : playerX) + ox;
    let y = (relMode === 'Tile' || relMode === 'Global' ? f0.y : playerY) + oy;
    let rot = def.camRotation || 0;
    let zoomPct = def.zoom || 100;

    const tl = L.camTimeline || [];
    for (let i = 0; i < tl.length; i++) {
      const ev = tl[i];
      if (curRel < ev.startRel) break;
      const k = ev.durSec <= 1e-6 ? 1 : clamp((curRel - ev.startRel) / ev.durSec, 0, 1);
      const e = easeVal(ev.ease, k);

      const mode = ev.relativeTo || relMode;
      const hasPx = ev.position && ev.position[0] !== null && ev.position[0] !== undefined;
      const hasPy = ev.position && ev.position[1] !== null && ev.position[1] !== undefined;
      const nextOx = hasPx ? ev.position[0] : ox;
      const nextOy = hasPy ? ev.position[1] : oy;

      let tx;
      let ty;
      if (mode === 'Player') {
        tx = playerX + nextOx;
        ty = playerY + nextOy;
      } else if (mode === 'Tile') {
        const tf = L.floors[ev.floor] || f0;
        tx = tf.x + nextOx;
        ty = tf.y + nextOy;
      } else if (mode === 'Global') {
        tx = f0.x + nextOx;
        ty = f0.y + nextOy;
      } else {
        // LastPosition / LastPositionNoRotation
        tx = x + (hasPx ? ev.position[0] : 0);
        ty = y + (hasPy ? ev.position[1] : 0);
      }

      x += (tx - x) * e;
      y += (ty - y) * e;
      if (mode !== 'LastPosition' && mode !== 'LastPositionNoRotation') {
        relMode = mode;
        ox = nextOx;
        oy = nextOy;
      }

      if (mode !== 'LastPositionNoRotation' && ev.rotation !== null && ev.rotation !== undefined && Number.isFinite(ev.rotation)) {
        rot += (ev.rotation - rot) * e;
      }
      if (ev.zoom !== null && ev.zoom !== undefined && ev.zoom > 0) {
        zoomPct += (ev.zoom - zoomPct) * e;
      }
    }

    return {
      x,
      y,
      rot,
      zoom: 100 / clamp(zoomPct, 20, 800)
    };
  }

  // 특정 상대 시각(curRel)에서의 Flash / ShakeScreen / SetFilter / AnimateTrack / CustomBackground 통합 평가
  function evalVisualEffects(L, curRel) {
    const def = L.def;
    let bgFlash = null;
    let fgFlash = null;
    const ftl = L.flashTimeline || [];
    for (let i = 0; i < ftl.length; i++) {
      const ev = ftl[i];
      if (curRel < ev.startRel) break;
      if (curRel > ev.startRel + ev.durSec + 0.05 && ev.endOpacity <= 0.005) continue;
      const k = ev.durSec <= 1e-6 ? 1 : clamp((curRel - ev.startRel) / ev.durSec, 0, 1);
      const e = easeVal(ev.ease, k);
      const alpha = ev.startOpacity + (ev.endOpacity - ev.startOpacity) * e;
      const color = lerpHexColor(ev.startColor, ev.endColor, e);
      if (ev.plane === 'Foreground') fgFlash = { color, alpha };
      else bgFlash = { color, alpha };
    }

    let mapShake = 0;
    const stl = L.shakeTimeline || [];
    for (let i = 0; i < stl.length; i++) {
      const ev = stl[i];
      if (curRel < ev.startRel) break;
      if (curRel > ev.startRel + ev.durSec) continue;
      const k = ev.durSec <= 1e-6 ? 1 : clamp((curRel - ev.startRel) / ev.durSec, 0, 1);
      const mult = ev.fadeOut ? 1 - k : 1;
      mapShake = Math.max(mapShake, (ev.strength * 0.35) * mult);
    }

    // SetFilter / Bloom 평가 (disableOthers 지원)
    const filters = {};
    const fltTl = L.filterTimeline || [];
    for (let i = 0; i < fltTl.length; i++) {
      const ev = fltTl[i];
      if (curRel < ev.startRel) break;
      if (ev.disableOthers) {
        for (const k of Object.keys(filters)) delete filters[k];
      }
      if (ev.enabled) {
        filters[ev.filter] = ev.intensity;
      } else {
        delete filters[ev.filter];
      }
    }

    // AnimateTrack 평가
    const animTrack = {
      trackAnimation: def.trackAnimation || 'None',
      beatsAhead: def.beatsAhead !== undefined ? def.beatsAhead : 3,
      trackDisappearAnimation: def.trackDisappearAnimation || 'None',
      beatsBehind: def.beatsBehind !== undefined ? def.beatsBehind : 4
    };
    const atl = L.animTrackTimeline || [];
    for (let i = 0; i < atl.length; i++) {
      const ev = atl[i];
      if (curRel < ev.startRel) break;
      if (ev.trackAnimation) animTrack.trackAnimation = ev.trackAnimation;
      if (ev.beatsAhead !== null && ev.beatsAhead !== undefined) animTrack.beatsAhead = ev.beatsAhead;
      if (ev.trackDisappearAnimation) animTrack.trackDisappearAnimation = ev.trackDisappearAnimation;
      if (ev.beatsBehind !== null && ev.beatsBehind !== undefined) animTrack.beatsBehind = ev.beatsBehind;
    }

    // CustomBackground 평가
    const bgState = {
      color: def.bgColor || null,
      imageColor: def.bgImageColor || '#ffffff',
      lockRot: def.lockRot !== false
    };
    const btl = L.bgTimeline || [];
    for (let i = 0; i < btl.length; i++) {
      const ev = btl[i];
      if (curRel < ev.startRel) break;
      if (ev.color) bgState.color = ev.color;
      if (ev.imageColor) bgState.imageColor = ev.imageColor;
      if (ev.lockRot !== undefined) bgState.lockRot = ev.lockRot;
    }

    return { bgFlash, fgFlash, mapShake, filters, animTrack, bgState };
  }

  // 가시 범위 [lo..hi] 타일의 MoveTrack / AnimateTrack / RecolorTrack 상태 고속 계산 (GC 최소화 재사용 버퍼)
  const tileSliceBuf = {
    ox: new Float64Array(256),
    oy: new Float64Array(256),
    rot: new Float64Array(256),
    sx: new Float64Array(256),
    sy: new Float64Array(256),
    alpha: new Float64Array(256),
    styles: new Array(256)
  };

  function evalVisibleTileStates(L, curRel, cur, lo, hi, animTrack, pivotBpm, vfxActive, isPlaying) {
    const count = Math.max(0, hi - lo + 1);
    if (count > tileSliceBuf.ox.length) {
      const cap = count + 64;
      tileSliceBuf.ox = new Float64Array(cap);
      tileSliceBuf.oy = new Float64Array(cap);
      tileSliceBuf.rot = new Float64Array(cap);
      tileSliceBuf.sx = new Float64Array(cap);
      tileSliceBuf.sy = new Float64Array(cap);
      tileSliceBuf.alpha = new Float64Array(cap);
      tileSliceBuf.styles = new Array(cap);
    }
    const { ox, oy, rot, sx, sy, alpha, styles } = tileSliceBuf;
    const F = L.floors;
    for (let j = 0; j < count; j++) {
      ox[j] = 0;
      oy[j] = 0;
      rot[j] = 0;
      sx[j] = 1;
      sy[j] = 1;
      alpha[j] = 1;
      styles[j] = F[lo + j].colorStyle;
    }

    if (!vfxActive) return tileSliceBuf;

    // 1. MoveTrack 타임라인 보간 (가시 구간 [lo..hi]와 겹치는 이벤트만 고속 반영)
    const mtl = L.moveTrackTimeline || [];
    for (let i = 0; i < mtl.length; i++) {
      const ev = mtl[i];
      if (curRel < ev.startRel) break;
      const sIdx = Math.max(lo, ev.i0);
      const eIdx = Math.min(hi, ev.i1);
      if (sIdx > eIdx) continue;
      const k = ev.durSec <= 1e-6 ? 1 : clamp((curRel - ev.startRel) / ev.durSec, 0, 1);
      const e = easeVal(ev.ease, k);
      for (let tileIdx = sIdx; tileIdx <= eIdx; tileIdx++) {
        const j = tileIdx - lo;
        if (ev.ox !== null) ox[j] += (ev.ox - ox[j]) * e;
        if (ev.oy !== null) oy[j] += (ev.oy - oy[j]) * e;
        if (ev.rot !== null) rot[j] += (ev.rot - rot[j]) * e;
        if (ev.sx !== null) sx[j] += (ev.sx - sx[j]) * e;
        if (ev.sy !== null) sy[j] += (ev.sy - sy[j]) * e;
        if (ev.opacity !== null) alpha[j] += (ev.opacity - alpha[j]) * e;
      }
    }

    // 2. RecolorTrack 타임라인 반영
    const rtl = L.recolorTimeline || [];
    for (let i = 0; i < rtl.length; i++) {
      const ev = rtl[i];
      if (curRel < ev.startRel) break;
      const sIdx = Math.max(lo, ev.i0);
      const eIdx = Math.min(hi, ev.i1);
      if (sIdx > eIdx) continue;
      for (let tileIdx = sIdx; tileIdx <= eIdx; tileIdx++) {
        styles[tileIdx - lo] = ev.colorStyle;
      }
    }

    // 3. AnimateTrack 등장/퇴장 애니메이션 (실제 플레이 중일 때 적용)
    if (isPlaying && animTrack) {
      const beatSec = 60 / Math.max(1, pivotBpm || L.bpm0);
      const appear = animTrack.trackAnimation || 'None';
      const disappear = animTrack.trackDisappearAnimation || 'None';
      const ahead = Math.max(1, animTrack.beatsAhead || 4);
      const behind = Math.max(0, animTrack.beatsBehind || 0);

      for (let j = 0; j < count; j++) {
        const tileIdx = lo + j;
        const tf = F[tileIdx];
        if (tileIdx > cur && appear !== 'None') {
          const beatsRem = (tf.rel - curRel) / beatSec;
          if (beatsRem > ahead) {
            alpha[j] = 0;
          } else if (beatsRem > ahead - 1.25) {
            const u = clamp((ahead - beatsRem) / 1.25, 0, 1);
            alpha[j] *= u;
            if (appear === 'Grow' || appear === 'Extend') {
              const g = 0.25 + 0.75 * easeVal('OutBack', u);
              sx[j] *= g;
              sy[j] *= g;
            } else if (appear === 'Assemble' || appear === 'Scatter') {
              const inv = 1 - easeVal('OutCubic', u);
              oy[j] += inv * (((tileIdx % 2) * 2 - 1) * 1.15);
              rot[j] += inv * 90;
            }
          }
        } else if (tileIdx < cur && disappear !== 'None') {
          const beatsPast = (curRel - tf.rel) / beatSec;
          if (beatsPast > behind) {
            const v = 1 - clamp((beatsPast - behind) / 1.2, 0, 1);
            alpha[j] *= v;
            if (disappear === 'Shrink' || disappear === 'Retract') {
              sx[j] *= v;
              sy[j] *= v;
            } else if (disappear === 'Scatter') {
              const inv = 1 - v;
              ox[j] += inv * (((tileIdx * 7) % 5 - 2) * 0.55);
              oy[j] -= inv * 0.85;
              rot[j] += inv * 135;
            }
          }
        }
      }
    } else if (!isPlaying) {
      // 대기/연습 탐색 모드에서는 현재 시작 타일 주변 길을 항상 식별할 수 있도록 최소 가시성 보장
      for (let tileIdx = Math.max(lo, cur); tileIdx <= Math.min(hi, cur + 18); tileIdx++) {
        const j = tileIdx - lo;
        if (alpha[j] < 0.38) alpha[j] = 0.38;
      }
    }

    return tileSliceBuf;
  }

  // ColorTrack / RecolorTrack 동적 색상(Single / Glow / Rainbow / Blink + Forward/Backward Pulse) 계산
  function evalTileColor(styleObj, fallbackColor, tileIdx, curRel, vfxActive) {
    if (!styleObj || !vfxActive) return fallbackColor || '#70bdff';
    const type = styleObj.type || 'Single';
    if (type === 'Single' && (!styleObj.pulse || styleObj.pulse === 'None')) {
      return styleObj.color || fallbackColor;
    }
    let ph = curRel / Math.max(0.06, styleObj.animDur || 2);
    if (styleObj.pulse === 'Forward') ph -= tileIdx / Math.max(1, styleObj.pulseLen || 10);
    else if (styleObj.pulse === 'Backward') ph += tileIdx / Math.max(1, styleObj.pulseLen || 10);

    if (type === 'Rainbow') {
      const hue = Math.round(mod(ph * 360, 360));
      return `hsl(${hue}, 88%, 64%)`;
    }
    if (type === 'Blink' || type === 'Switch') {
      return mod(ph, 1) < 0.5 ? styleObj.color : styleObj.secColor;
    }
    // Glow / Volume / Pulse
    const wave = 0.5 - 0.5 * Math.cos(ph * Math.PI * 2);
    return lerpHexColor(styleObj.color, styleObj.secColor, wave);
  }

  // =====================================================================
  // 5. STAGES
  // =====================================================================
  function rep(pattern, times) {
    const out = [];
    for (let i = 0; i < times; i++) for (const p of pattern) out.push(typeof p === 'number' ? { a: p } : { ...p });
    return out;
  }

  const STAGES = [
    {
      kind: 'builtin', title: '1-X: 얼음과 불의 춤 (기초 리듬)', artist: 'Web Synth Original', author: 'Built-in World 1',
      bpm: 130, theme: ['#0b0d1f', '#1d1433', '#ff4757'],
      steps: [
        ...rep([0], 8),
        { a: 90 }, { a: 0 }, { a: 90 }, { a: 0 },
        ...rep([0], 4),
        { a: 270 }, { a: 0 }, { a: 270 }, { a: 0 },
        ...rep([0], 4),
        { a: 90 }, { a: 90 }, { a: 180 }, { a: 180 }, { a: 90 }, { a: 0 }, { a: 0 },
        { a: 0, type: 'rabbit' },
        ...rep([0], 6),
        { a: 90 }, { a: 0 }, { a: 270 }, { a: 0 },
        ...rep([0], 6)
      ]
    },
    {
      kind: 'builtin', title: '2-X: 엇박과 대각선 (Offbeats)', artist: 'Web Synth Original', author: 'Built-in World 2',
      bpm: 145, theme: ['#071926', '#0f293a', '#00d2d3'],
      steps: [
        ...rep([0], 6),
        { a: 45 }, { a: 0 }, { a: 315 }, { a: 0 },
        { a: 45 }, { a: 0 }, { a: 315 }, { a: 0 },
        ...rep([0], 3),
        { a: 45 }, { a: 45 }, { a: 0 }, { a: 315 }, { a: 315 }, { a: 0 },
        ...rep([0], 3),
        { a: 90, type: 'twirl' }, { a: 0 }, { a: 270, type: 'twirl' }, { a: 0 },
        { a: 0, type: 'rabbit' },
        { a: 45 }, { a: 315 }, { a: 45 }, { a: 315 },
        ...rep([0], 6)
      ]
    },
    {
      kind: 'builtin', title: '3-X: 소용돌이 태엽 (The Wind-Up)', artist: 'Web Synth Original', author: 'Built-in World 3',
      bpm: 155, theme: ['#1a0b24', '#2d1238', '#a55eea'],
      steps: [
        ...rep([0], 6),
        { a: 0, type: 'twirl' }, { a: 0 }, { a: 0, type: 'twirl' }, { a: 0 },
        { a: 60 }, { a: 300 }, { a: 0 },
        { a: 60 }, { a: 300 }, { a: 0 },
        { a: 90, type: 'twirl' }, { a: 0, type: 'twirl' },
        { a: 90, type: 'twirl' }, { a: 0, type: 'twirl' },
        ...rep([0], 4),
        { a: 0, type: 'snail' },
        { a: 60 }, { a: 120, type: 'twirl' }, { a: 60 }, { a: 0 },
        { a: 0, type: 'rabbit' },
        ...rep([{ a: 0, type: 'twirl' }, { a: 0 }], 3),
        ...rep([0], 5)
      ]
    },
    {
      kind: 'builtin', title: 'X-X: 불꽃과 얼음의 질주 (Speed Trial)', artist: 'Web Synth Original', author: 'Built-in World 4',
      bpm: 170, theme: ['#24080d', '#081b2e', '#ffa502'],
      steps: [
        ...rep([0], 6),
        { a: 45 }, { a: 0, type: 'twirl' }, { a: 315 }, { a: 0 },
        { a: 0, type: 'rabbit' },
        ...rep([0], 6),
        { a: 90 }, { a: 0 }, { a: 270 }, { a: 0 },
        { a: 0, type: 'snail' },
        { a: 60 }, { a: 300 }, { a: 60 }, { a: 300 }, { a: 0 },
        { a: 0, type: 'rabbit' },
        { a: 0, type: 'twirl' }, { a: 0 }, { a: 0, type: 'twirl' }, { a: 0 },
        { a: 45 }, { a: 315 }, { a: 45 }, { a: 315 },
        ...rep([0], 8)
      ]
    }
  ];

  // 4, 5: 업로드된 예시 맵 (sample_data.js)
  const samples = Array.isArray(window.PRELOADED_SAMPLE_MAPS) ? window.PRELOADED_SAMPLE_MAPS : [];
  for (let i = 0; i < 2; i++) {
    const smp = samples[i];
    if (smp && smp.data) {
      STAGES.push({
        kind: 'adofai', title: smp.name, data: smp.data, audioUrl: smp.audioUrl, bgUrl: smp.bgUrl,
        theme: ['#070b19', '#111b36', '#70bdff']
      });
    } else {
      STAGES.push({
        kind: 'builtin', title: '예시 맵 없음 — [맵 파일 열기]로 .zip을 열어주세요', artist: '-', author: '-',
        bpm: 120, theme: ['#070b19', '#111b36', '#70bdff'], steps: rep([0], 12)
      });
    }
  }

  // 6: 커스텀 에디터 맵
  const CUSTOM_STAGE_INDEX = STAGES.length;
  STAGES.push({
    kind: 'builtin', title: '🛠️ 내 커스텀 에디터 맵', artist: 'Custom Builder', author: 'Player',
    bpm: 140, theme: ['#0d1b2a', '#1b263b', '#48dbfb'],
    steps: [{ a: 0 }, { a: 0 }, { a: 0 }, { a: 0 }, { a: 90, type: 'twirl' }, { a: 0 }, { a: 270, type: 'rabbit' }, { a: 0 }, { a: 0 }, { a: 0 }, { a: 0 }]
  });

  function stageDef(stage) {
    if (stage.kind === 'adofai') {
      if (!stage.def) stage.def = defFromAdofai(stage.data);
      return stage.def;
    }
    return defFromSteps(stage);
  }

  // =====================================================================
  // 6. GAME STATE
  // =====================================================================
  const settings = {
    autoplay: false,
    noFail: false,
    hitsound: true,
    vfx: true,
    keyLimitEnabled: false,
    userOffsetMs: 0,
    speed: 1.0,
    userZoomMultiplier: 1.0
  };
  const allowedKeys = new Set();
  const activeHitKeyUntil = new Map();

  let stageIndex = 0;
  let level = null;
  let bgImage = null;

  const run = {
    phase: 'idle', // idle | playing | dead | clear
    floor: 0,
    startFloor: 0,
    lastKeyPerf: 0,
    chordAnchorT: -Infinity,
    chordHitT: -Infinity,
    chordWindow: null,
    times: null,
    ticks: [],
    perfBase: 0,
    freezeT: 0,
    endedAt: 0,
    noteIdx: 1,
    overload: 0,
    bgmStarted: false,
    stats: null,
    countdownText: '',
    countdownAt: 0
  };

  const fx = {
    texts: [],
    particles: [],
    trail: [],
    pulse: 0,
    shake: 0,
    bgFlash: null,
    fgFlash: null,
    filters: {},
    animTrack: null,
    bgState: null,
    curRel: 0
  };
  const cam = { x: 0, y: 0, px: 0, py: 0, zoom: 1, rot: 0 };
  const keyLog = { stamps: [], pills: [] };

  // 판정선(Hit Error Meter) 상태: 각 입력의 판정 위치를 3.0초 동안 표시
  const HIT_MARK_DURATION = 3.0;
  const hitMeter = {
    marks: [],          // { norm: [-1..1], kind, color, life: 3.0, maxLife: 3.0, createdAt }
    caretNorm: 0,       // 하단 화살표(^) 현재 보간 위치
    targetCaretNorm: 0, // 하단 화살표(^) 목표 위치
    hasHits: false
  };

  function resetHitMeter() {
    hitMeter.marks = [];
    hitMeter.caretNorm = 0;
    hitMeter.targetCaretNorm = 0;
    hitMeter.hasHits = false;
  }

  // 판정 오차(diff)를 판정선 바의 정규화 좌표(-1.0 ~ +1.0)로 변환
  // 바 구간 비율: 완벽[-0.36..+0.36], 빠름/느림[0.36..0.68], 조금빠름/느림[0.68..0.92], 너무빠름/느림[0.92..1.00]
  function diffToMeterNorm(diff, w, kind) {
    if (kind === 'tooEarly') return -0.96;
    if (kind === 'tooLate' || kind === 'miss') return 0.96;
    if (!w || !Number.isFinite(diff)) return 0;
    const ad = Math.abs(diff);
    const sign = diff < 0 ? -1 : 1;
    if (ad <= w.pure) {
      return sign * (ad / Math.max(1e-6, w.pure)) * 0.36;
    }
    if (ad <= w.perfect) {
      return sign * (0.36 + ((ad - w.pure) / Math.max(1e-6, w.perfect - w.pure)) * 0.32);
    }
    const r = clamp((ad - w.perfect) / Math.max(1e-6, w.counted - w.perfect), 0, 1);
    return sign * (0.68 + r * 0.24);
  }

  function meterColorForKind(kind) {
    switch (kind) {
      case 'perfect':
      case 'auto': return '#3ae374';
      case 'ep':
      case 'lp': return '#e8f542';
      case 'early':
      case 'late': return '#ff793f';
      case 'tooEarly':
      case 'tooLate': return '#ff3838';
      case 'miss': return '#c56cf0';
      default: return '#3ae374';
    }
  }

  function recordHitMark(diff, w, kind) {
    const norm = clamp(diffToMeterNorm(diff, w, kind), -0.98, 0.98);
    const color = meterColorForKind(kind);
    hitMeter.marks.push({
      norm,
      kind,
      color,
      life: HIT_MARK_DURATION,
      maxLife: HIT_MARK_DURATION,
      createdAt: performance.now()
    });
    if (hitMeter.marks.length > 180) hitMeter.marks.shift();
    if (!hitMeter.hasHits) {
      hitMeter.hasHits = true;
      hitMeter.caretNorm = norm;
      hitMeter.targetCaretNorm = norm;
    } else {
      // 최근 타격 위치 쪽으로 화살표(^) 이동
      hitMeter.targetCaretNorm = hitMeter.targetCaretNorm * 0.35 + norm * 0.65;
    }
  }

  function songNow(perf) {
    return ((perf === undefined ? performance.now() : perf) - run.perfBase) / 1000;
  }

  function newStats() {
    return {
      overloadCount: 0, // 좌측 보라 (과부하/연타초과)
      tooEarly: 0,      // 좌측 빨강 (너무 빠름!!)
      early: 0,         // 좌측 주황 (조금 빠름!)
      ep: 0,            // 좌측 연두 (빠름!)
      perfect: 0,       // 중앙 초록 (완벽!)
      lp: 0,            // 우측 연두 (느림!)
      late: 0,          // 우측 주황 (조금 느림!)
      tooLate: 0,       // 우측 빨강 (너무 느림!!)
      miss: 0,          // 우측 보라 (놓침!)
      judged: 0,
      accSum: 0,
      stdAccSum: 0,
      combo: 0,
      maxCombo: 0,
      peakKps: 0,
      totalKeys: 0,
      startedAt: performance.now(),
      hitHistory: []    // { floor, diffMs, kind }
    };
  }

  // =====================================================================
  // 7. STAGE SELECT / START / STOP
  // =====================================================================
  function loadLevel() {
    const stage = STAGES[stageIndex];
    level = compileLevel(stageDef(stage), settings.speed);
    bgImage = null;
    if (stage.bgUrl) {
      const img = new Image();
      img.src = /^(blob:|data:)/.test(stage.bgUrl) ? stage.bgUrl : encodeURI(stage.bgUrl);
      bgImage = img;
    }
    if (stage.audioUrl && (!bgm.audio || bgm.url !== stage.audioUrl)) {
      // 웹 호스팅(Render 등) 환경에서 Space로 시작하기 전에 음원을 미리 프리로드
      const a = prepareBgm(stage.audioUrl, (level.def.volume || 1) * 0.9, level.rate);
      if (a && a.readyState === 0) {
        try { a.load(); } catch (e) { /* ignore */ }
      }
    }
  }

  // 맵 선택 드롭다운(<select>)이나 파일 열기(<input>)가 포커스를 잡고 키 입력을 가로채지 못하도록 즉시 해제
  function releaseFocusToGame() {
    const ae = document.activeElement;
    if (ae && ae !== document.body && ae !== canvas && typeof ae.blur === 'function') {
      try { ae.blur(); } catch (e) { /* ignore */ }
    }
    if (canvas && typeof canvas.focus === 'function') {
      try { canvas.focus({ preventScroll: true }); } catch (e) { /* ignore */ }
    }
  }

  function selectStage(idx) {
    if (!STAGES[idx]) return;
    stageIndex = idx;
    if (el.stageDropdown) el.stageDropdown.value = String(idx);
    document.querySelectorAll('.stage-btn').forEach((b) => {
      b.classList.toggle('active', Number(b.dataset.stage) === idx);
    });
    run.startFloor = 0;
    stopToIdle(true);
    releaseFocusToGame();
  }

  function stopToIdle(resetStart) {
    stopBgm();
    loadLevel();
    if (resetStart) run.startFloor = 0;
    const target = clamp(run.startFloor || 0, 0, Math.max(0, level.n - 2));
    run.phase = 'idle';
    run.floor = target;
    run.startFloor = target;
    run.times = null;
    run.overload = 0;
    run.stats = newStats();
    resetHitMeter();
    run.countdownText = '';
    fx.texts = [];
    fx.particles = [];
    fx.trail = [];
    const f0 = level.floors[target] || level.floors[0];
    cam.px = f0.x;
    cam.py = f0.y;
    const cs = settings.vfx ? evalCameraState(level, f0.rel, cam.px, cam.py) : { x: cam.px, y: cam.py, rot: 0, zoom: 100 / clamp(level.def.zoom || 100, 20, 800) };
    cam.x = cs.x;
    cam.y = cs.y;
    cam.zoom = cs.zoom;
    cam.rot = cs.rot;
    fx.curRel = f0.rel;
    fx.bgFlash = null;
    fx.fgFlash = null;
    fx.filters = {};
    const initVfx = settings.vfx ? evalVisualEffects(level, f0.rel) : null;
    fx.animTrack = initVfx ? initVfx.animTrack : null;
    fx.bgState = initVfx ? initVfx.bgState : null;
    updateTitle();
    updateHud(true);
    const def = level.def;
    showOverlay(
      def.title,
      `BPM ${Math.round(level.bpm0)} · 시작 타일 ${target} / ${level.n - 1} — [Space] 키 또는 [▶️ 게임 시작] 클릭 (하단 바 / ←·→ 키로 타일 이동)`
    );
  }

  // 게임을 시작하지 않고 대기 상태에서 원하는 타일 인덱스로 이동(프로그레스 바 / 좌우 화살표 키)
  function seekToFloor(targetFloor, dir = 0) {
    stopBgm();
    if (!level) loadLevel();
    const L = level;
    let idx = clamp(Math.floor(targetFloor), 0, Math.max(0, L.n - 2));
    if (dir > 0) {
      while (idx < L.n - 2 && L.floors[idx].out === 999) idx++;
    } else {
      while (idx > 0 && L.floors[idx].out === 999) idx--;
    }

    run.phase = 'idle';
    run.floor = idx;
    run.startFloor = idx;
    run.times = null;
    run.overload = 0;
    run.stats = newStats();
    resetHitMeter();
    run.countdownText = '';
    fx.texts = [];
    fx.particles = [];
    fx.trail = [];

    const sf = L.floors[idx] || L.floors[0];
    cam.px = sf.x;
    cam.py = sf.y;
    const cs = settings.vfx ? evalCameraState(L, sf.rel, cam.px, cam.py) : { x: cam.px, y: cam.py, rot: 0, zoom: 100 / clamp(L.def.zoom || 100, 20, 800) };
    cam.x = cs.x;
    cam.y = cs.y;
    cam.zoom = cs.zoom;
    cam.rot = cs.rot;
    fx.curRel = sf.rel;
    fx.bgFlash = null;
    fx.fgFlash = null;
    fx.filters = {};
    const seekVfx = settings.vfx ? evalVisualEffects(L, sf.rel) : null;
    fx.animTrack = seekVfx ? seekVfx.animTrack : null;
    fx.bgState = seekVfx ? seekVfx.bgState : null;

    // 타일 탐색 중에는 중앙 오버레이가 타일을 가리지 않도록 숨김
    hideOverlay();
    updateHud(true);
    releaseFocusToGame();
  }

  // Esc 입력 시: 플레이 중이거나 결과창(실패/클리어)에서 즉시 시작한 타일 위치(run.startFloor)의 대기 상태로 복귀
  function exitToStartFloor() {
    seekToFloor(run.startFloor || 0, 0);
  }

  // startFloor: 0부터 시작하지 않고 특정 타일 인덱스부터 즉시 연습 시작 가능
  function startRunAtFloor(startFloor = 0) {
    ensureAudio();
    if (!level) loadLevel();
    loadLevel(); // 배속 등 최신 설정 반영
    const L = level;
    const stage = STAGES[stageIndex];
    const off = settings.userOffsetMs / 1000;
    const t1 = L.T1 + off;
    const t0 = t1 - L.floors[0].dur;

    run.times = new Float64Array(L.n);
    for (let i = 0; i < L.n; i++) run.times[i] = t0 + L.floors[i].rel;

    startFloor = Math.max(0, Math.min(L.n - 2, Math.floor(startFloor)));
    while (startFloor > 0 && L.floors[startFloor].out === 999) {
      startFloor--;
    }

    run.ticks = [];
    let s0;
    if (startFloor === 0) {
      for (let k = L.def.ticks; k >= 1; k--) {
        run.ticks.push({ t: t1 - k * L.beat0, label: String(k), sched: false, shown: false, accent: k === 1 });
      }
      s0 = Math.min(0, t1 - (L.def.ticks + 1) * L.beat0) - 0.5;
    } else {
      // 중간 시작 시 해당 타일의 직전 박자에 맞춰 카운트다운 생성
      const startTargetTime = run.times[startFloor];
      const stepDur = Math.max(L.floors[startFloor].dur || L.beat0, L.beat0, 0.3);
      const ticksCount = 3;
      for (let k = ticksCount; k >= 1; k--) {
        run.ticks.push({
          t: startTargetTime - k * stepDur,
          label: String(k),
          sched: false,
          shown: false,
          accent: k === 1
        });
      }
      s0 = startTargetTime - (ticksCount + 0.5) * stepDur;
    }

    run.perfBase = performance.now() - s0 * 1000;
    run.phase = 'playing';
    run.floor = startFloor;
    run.startFloor = startFloor;
    run.lastKeyPerf = performance.now();
    run.chordAnchorT = -Infinity;
    run.chordHitT = -Infinity;
    run.chordWindow = null;
    run.noteIdx = startFloor + 1;
    run.overload = 0;
    run.stats = newStats();
    resetHitMeter();
    run.countdownText = '';
    run.bgmStarted = false;
    fx.texts = [];
    fx.particles = [];
    fx.trail = [];

    const sf = L.floors[startFloor] || L.floors[0];
    cam.px = sf.x;
    cam.py = sf.y;
    const cs = settings.vfx ? evalCameraState(L, sf.rel, cam.px, cam.py) : { x: cam.px, y: cam.py, rot: 0, zoom: 100 / clamp(L.def.zoom || 100, 20, 800) };
    cam.x = cs.x;
    cam.y = cs.y;
    cam.zoom = cs.zoom;
    cam.rot = cs.rot;
    fx.curRel = sf.rel;
    fx.bgFlash = null;
    fx.fgFlash = null;
    const startVfx = settings.vfx ? evalVisualEffects(L, sf.rel) : null;
    fx.filters = startVfx ? startVfx.filters : {};
    fx.animTrack = startVfx ? startVfx.animTrack : null;
    fx.bgState = startVfx ? startVfx.bgState : null;

    if (stage.audioUrl) {
      prepareBgm(stage.audioUrl, (L.def.volume || 1) * 0.9, L.rate);
    } else {
      stopBgm();
    }

    autoChain();
    hideOverlay();
    updateHud(true);
    releaseFocusToGame();
  }

  function startRun() {
    startRunAtFloor(run.startFloor || 0);
  }

  function failRun(reason) {
    if (run.phase !== 'playing') return;
    if (reason === '놓침!' && run.stats) {
      run.stats.tooLate = (run.stats.tooLate || 0) + 1;
      run.stats.miss = (run.stats.miss || 0) + 1;
      run.stats.combo = 0;
      recordHitMark(0.15, null, 'miss');
    }
    run.phase = 'dead';
    run.freezeT = songNow();
    run.endedAt = performance.now();
    stopBgm();
    sfx.fail();
    fx.shake = 14;
    const f = level.floors[Math.min(level.n - 1, run.floor + 1)];
    spawnText(f.x, f.y, reason, '#ff3b3b', 1.4);
    spawnParticles(f.x, f.y, '#ff4757', 30);
    showResultScreen({ cleared: false, reason });
    updateHud(true);
  }

  function clearRun() {
    run.phase = 'clear';
    run.freezeT = songNow();
    run.endedAt = performance.now();
    sfx.clear();
    const g = level.floors[level.n - 1];
    spawnParticles(g.x, g.y, '#ffd32a', 50);
    showResultScreen({ cleared: true, reason: '' });
    updateHud(true);
  }

  // =====================================================================
  // 8. JUDGMENT (개선된 연타 & 동타 매칭 엔진)
  // =====================================================================
  function isDongtaStep(step) {
    // 의사동타 / 미드스핀 동타 / 초고속 연타 판별:
    // 회전 각도가 60도 이하(15°~60° 미세 각도)이거나 타일 간격이 55ms 이하(680+ 고BPM 연타)인 경우
    return Boolean(step && step.dur > 0 && (step.travel <= 60.5 || step.dur <= 0.055));
  }

  function evaluateHit(nx, t) {
    const L = level;
    const curFloor = nx - 1;
    const step = L.floors[curFloor];
    let w = windowsFor(step.bpm);
    const isDongta = curFloor > 0 && isDongtaStep(step);

    // 동타/연타의 2번째 이후 노트는 첫 노트의 판정 폭을 승계
    if (isDongta && run.chordWindow) {
      w = {
        pure: Math.max(w.pure, run.chordWindow.pure),
        perfect: Math.max(w.perfect, run.chordWindow.perfect),
        counted: Math.max(w.counted, run.chordWindow.counted)
      };
    }

    const targetT = run.times[nx];
    // 동타 및 초고속 연타 노트는 첫 노트의 정박 시각(anchorT)과 현재 노트의 정박 시각(targetT) 사이에서
    // 여러 키가 동시에(또는 빠른 롤링으로) 눌렸을 때 순서대로 매칭되도록 보정
    const baseAnchor = run.chordAnchorT > -1e8
      ? Math.min(run.times[curFloor], run.chordAnchorT)
      : run.times[curFloor];
    const anchorT = isDongta
      ? Math.max(targetT - 0.095, baseAnchor)
      : targetT;
    const lateAnchor = (isDongta && run.chordHitT > anchorT)
      ? Math.min(targetT + 0.050, Math.max(targetT, run.chordHitT))
      : targetT;

    let diff;
    if (t < anchorT) diff = t - anchorT;
    else if (t <= lateAnchor) diff = 0;
    else diff = t - lateAnchor;

    return { diff, w, isDongta };
  }

  function autoChain() {
    const F = level.floors;
    let advanced = false;
    // 미드스핀(out === 999) 및 0초 링크 연속 관통 처리
    while (run.phase === 'playing' && run.floor < level.n - 1) {
      const cur = F[run.floor];
      if (cur.out === 999 || cur.dur <= 1e-5) {
        run.floor++;
        advanced = true;
      } else {
        break;
      }
    }
    if (run.phase === 'playing' && run.floor >= level.n - 1) {
      clearRun();
    }
    return advanced;
  }

  function hitFloor(idx, kind, hitSongT, hitWindow, hitDiff) {
    const F = level.floors;
    const prevFloor = idx - 1;
    const prevStep = prevFloor >= 0 ? F[prevFloor] : null;
    const w = hitWindow || (prevStep ? windowsFor(prevStep.bpm) : windowsFor(level.bpm0));
    if (!isDongtaStep(prevStep)) {
      run.chordAnchorT = run.times ? run.times[idx] : -Infinity;
      run.chordWindow = w;
    }
    if (hitSongT !== undefined && kind !== 'auto' && kind !== 'miss') {
      run.chordHitT = hitSongT;
    }

    run.floor = idx;
    const info = JUDGE_INFO[kind];
    const s = run.stats;
    if (kind !== 'auto') {
      s[kind] = (s[kind] || 0) + 1;
      if (kind === 'miss') {
        s.tooLate = (s.tooLate || 0) + 1;
        s.combo = 0;
      } else {
        s.combo = (s.combo || 0) + 1;
        if (s.combo > s.maxCombo) s.maxCombo = s.combo;
        s.hitHistory.push({
          floor: idx,
          diffMs: (hitDiff !== undefined ? hitDiff : 0) * 1000,
          kind
        });
      }
    } else {
      s.combo = (s.combo || 0) + 1;
      if (s.combo > s.maxCombo) s.maxCombo = s.combo;
    }
    s.judged++;
    s.accSum += info.acc;
    const stdWeight = (kind === 'perfect' || kind === 'ep' || kind === 'lp' || kind === 'auto')
      ? 100
      : (kind === 'early' || kind === 'late') ? 50 : 0;
    s.stdAccSum += stdWeight;

    // 판정선(Hit Error Meter)에 3초간 유지되는 판정 위치 눈금 기록
    recordHitMark(hitDiff !== undefined ? hitDiff : 0, w, kind);

    const f = F[idx];
    if (kind !== 'auto') {
      spawnText(f.x, f.y, info.text, info.color, kind === 'miss' ? 1.2 : 1);
    }
    if (kind !== 'miss') {
      if (settings.hitsound) sfx.hit();
      spawnParticles(f.x, f.y, F[idx].planet === 0 ? '#4db8ff' : '#ff5a4e', kind === 'auto' ? 6 : 10);
      fx.pulse = 1;
    }
    autoChain();
  }

  function handleInput(perfTs) {
    // 대기/사망/클리어 상태에서는 일반 키나 클릭으로 시작하지 않음 (오직 Space 또는 시작 버튼으로만 시작)
    if (run.phase !== 'playing') return;
    if (settings.autoplay) return;
    const L = level;
    if (run.floor >= L.n - 1) return;

    const inputPerf = perfTs !== undefined ? perfTs : eventPerf();
    run.lastKeyPerf = inputPerf;
    const t = songNow(inputPerf);

    // 카운트다운 완료 전 warm-up 입력 무시 (첫 목표 타일의 판정 범위는 항상 허용)
    const startIdx = run.startFloor || 0;
    const firstTargetIdx = Math.min(L.n - 1, startIdx + 1);
    const warmupCutoff = Math.min(run.times[startIdx] - 0.05, run.times[firstTargetIdx] - 0.22);
    if (t < warmupCutoff) return;

    if (run.stats) run.stats.totalKeys = (run.stats.totalKeys || 0) + 1;

    let matched = false;
    let targetIdx = run.floor + 1;
    let firstDiff = -0.15;
    let firstW = null;

    // [핵심] 빠른 연타 시 현재 타일뿐만 아니라 바로 다음 초단타 타일까지 검사하여 올바른 타일에 매칭
    while (targetIdx < L.n) {
      const { diff, w } = evaluateHit(targetIdx, t);
      if (firstW === null) {
        firstDiff = diff;
        firstW = w;
      }

      // 판정 범위 내에 완벽/빠름/느림으로 들어온 경우
      if (Math.abs(diff) <= w.counted) {
        const ad = Math.abs(diff);
        let kind;
        if (ad <= w.pure) kind = 'perfect';
        else if (ad <= w.perfect) kind = diff < 0 ? 'ep' : 'lp';
        else kind = diff < 0 ? 'early' : 'late';

        hitFloor(targetIdx, kind, t, w, diff);
        matched = true;
        break;
      }
      // 너무 늦게 눌린 경우 (놓침)
      else if (diff > w.counted) {
        if (settings.noFail) {
          hitFloor(targetIdx, 'miss', t, w, diff);
          targetIdx = run.floor + 1;
          continue;
        } else {
          failRun('놓침!');
          return;
        }
      }
      // 판정선보다 훨씬 일찍 누른 경우 (너무 빠름)
      else {
        break;
      }
    }

    // 어떤 타일의 유효 판정선에도 닿지 못한 선입력인 경우에만 "너무 빠름!!" 1회 부여
    if (!matched) {
      tooEarly(firstDiff, firstW);
    }
  }

  function tooEarly(diff, w) {
    const L = level;
    const s = run.stats;
    s.tooEarly++;
    s.judged++;
    s.accSum += JUDGE_INFO.tooEarly.acc;
    s.stdAccSum += 20;
    s.combo = 0;
    s.hitHistory.push({
      floor: Math.min(L.n - 1, run.floor + 1),
      diffMs: clamp((diff !== undefined ? diff : -0.14) * 1000, -150, -60),
      kind: 'tooEarly'
    });
    run.overload += 1;
    recordHitMark(diff !== undefined ? diff : -0.15, w || windowsFor(L.bpm0), 'tooEarly');
    sfx.tooEarly();
    fx.shake = Math.max(fx.shake, 4);
    const nxIdx = Math.min(L.n - 1, run.floor + 1);
    const nx = L.floors[nxIdx];
    spawnText(nx.x, nx.y, JUDGE_INFO.tooEarly.text, JUDGE_INFO.tooEarly.color, 1.1);

    const progress = run.floor / Math.max(1, L.n - 1);
    if (run.overload >= OVERLOAD_MAX) {
      s.overloadCount = (s.overloadCount || 0) + 1;
      if (settings.noFail || progress >= OVERLOAD_SAFE_PROGRESS) {
        run.overload = OVERLOAD_MAX - 0.01;
      } else {
        failRun('과부하!');
      }
    }
    updateHud(true);
  }

  // =====================================================================
  // 9. UPDATE LOOP
  // =====================================================================
  function update(dt, perf) {
    if (run.phase === 'playing' && level) {
      const L = level;
      const stage = STAGES[stageIndex];
      let t = songNow(perf);

      // --- 외부 음악 시작 & 싱크 ---
      const a = stage.audioUrl ? bgm.audio : null;
      if (a) {
        if (!run.bgmStarted && t >= -0.01) {
          run.bgmStarted = true;
          try { a.currentTime = Math.max(0, t) * a.playbackRate; } catch (e) { /* ignore */ }
          const p = a.play();
          if (p && p.catch) p.catch(() => { /* 재생 실패해도 게임은 진행 */ });
        } else if (run.bgmStarted && !a.paused && !a.ended && !a.seeking && a.readyState >= 2 && a.currentTime > 0.05) {
          const err = a.currentTime / a.playbackRate - t;
          if (Math.abs(err) > 0.2) run.perfBase -= err * 1000;
          else run.perfBase -= err * 1000 * Math.min(1, dt * 2);
          t = songNow(perf);
        }
      }

      // --- 카운트다운 ---
      for (const tk of run.ticks) {
        if (!tk.sched && tk.t - t < 0.1) {
          tk.sched = true;
          if (tk.t - t > -0.05) sfx.tick(tk.t - t, tk.accent);
        }
        if (!tk.shown && t >= tk.t) {
          tk.shown = true;
          run.countdownText = tk.label;
          run.countdownAt = perf;
          fx.pulse = 0.6;
        }
      }

      // --- 내장 스테이지 멜로디 (타일 박자에 맞춰 재생: 입력과 무관) ---
      if (!stage.audioUrl) {
        const scale = SCALES[stageIndex % SCALES.length];
        while (run.noteIdx < L.n && run.times[run.noteIdx] - t < 0.1) {
          const d = run.times[run.noteIdx] - t;
          if (d > -0.03 && L.floors[run.noteIdx - 1].dur > 0) sfx.note(d, run.noteIdx, scale);
          run.noteIdx++;
        }
      }

      // --- 오토플레이 / 놓침 판정 ---
      let guard = 0;
      while (run.phase === 'playing' && run.floor < L.n - 1 && guard++ < 256) {
        const nx = run.floor + 1;
        if (settings.autoplay) {
          if (t - run.times[nx] >= 0) hitFloor(nx, 'auto', t);
          else break;
        } else {
          const { diff, w } = evaluateHit(nx, t);
          if (diff > w.counted) {
            if (settings.noFail) hitFloor(nx, 'miss', t, w);
            else failRun('놓침!');
          } else break;
        }
      }

      // --- 과부하 게이지 감소 (기본 BPM 기준) ---
      run.overload = Math.max(0, run.overload - (dt * (L.bpm0 / 60)) / OVERLOAD_DECAY_BEATS);
    }

    // --- 원작 ADOFAI 카메라 & 연출 타임라인 ---
    if (level) {
      const L = level;
      const p = L.floors[run.floor] || L.floors[0];
      // 고BPM(680~1360 BPM)에서도 행성 추적 지연이 없도록 BPM 비례 반응형 추적 속도 적용
      const followSpeed = clamp(12 + (p.bpm / 60) * 1.4, 14, 42);
      const followRate = 1 - Math.exp(-followSpeed * dt);
      cam.px += (p.x - cam.px) * followRate;
      cam.py += (p.y - cam.py) * followRate;

      let curRel;
      if (run.phase === 'playing' && run.times) {
        curRel = Math.max(0, songNow(perf) - run.times[0]);
      } else if ((run.phase === 'dead' || run.phase === 'clear') && run.times) {
        const refT = run.phase === 'clear' ? songNow(perf) : run.freezeT;
        curRel = Math.max(0, refT - run.times[0]);
      } else {
        curRel = p.rel;
      }
      fx.curRel = curRel;

      if (settings.vfx) {
        const cs = evalCameraState(L, curRel, cam.px, cam.py);
        cam.x = cs.x;
        cam.y = cs.y;
        cam.zoom = cs.zoom;
        cam.rot = cs.rot;

        const vfx = evalVisualEffects(L, curRel);
        fx.animTrack = vfx.animTrack;
        fx.bgState = vfx.bgState;
        if (run.phase === 'playing') {
          fx.bgFlash = vfx.bgFlash;
          fx.fgFlash = vfx.fgFlash;
          fx.filters = vfx.filters;
          if (vfx.mapShake > fx.shake) fx.shake = vfx.mapShake;
        } else {
          fx.bgFlash = null;
          fx.fgFlash = null;
          fx.filters = {};
        }
      } else {
        cam.x = cam.px;
        cam.y = cam.py;
        cam.zoom = 100 / clamp(L.def.zoom || 100, 20, 800);
        cam.rot = 0;
        fx.bgFlash = null;
        fx.fgFlash = null;
        fx.filters = {};
        fx.animTrack = null;
        fx.bgState = null;
      }
    }

    fx.pulse = Math.max(0, fx.pulse - dt * 3);
    fx.shake = Math.max(0, fx.shake - dt * 40);
    for (let i = fx.particles.length - 1; i >= 0; i--) {
      const pt = fx.particles[i];
      pt.x += pt.vx * dt;
      pt.y += pt.vy * dt;
      pt.life -= dt * 1.8;
      if (pt.life <= 0) fx.particles.splice(i, 1);
    }
    for (let i = fx.texts.length - 1; i >= 0; i--) {
      const tx = fx.texts[i];
      tx.rise += dt * 0.9;
      tx.life -= dt * 1.3;
      if (tx.life <= 0) fx.texts.splice(i, 1);
    }

    // 판정선(Hit Error Meter) 눈금 3초 수명 업데이트 및 하단 화살표(^) 보간
    for (let i = hitMeter.marks.length - 1; i >= 0; i--) {
      const mk = hitMeter.marks[i];
      mk.life -= dt;
      if (mk.life <= 0) hitMeter.marks.splice(i, 1);
    }
    hitMeter.caretNorm += (hitMeter.targetCaretNorm - hitMeter.caretNorm) * Math.min(1, dt * 18);

    const nowMs = performance.now();
    while (keyLog.stamps.length && nowMs - keyLog.stamps[0] > 1000) keyLog.stamps.shift();
    updateJipperVisualizer(dt, nowMs);
  }

  function spawnText(x, y, text, color, scale) {
    fx.texts.push({ x, y, text, color, scale: scale || 1, rise: 0, life: 1 });
    if (fx.texts.length > 24) fx.texts.shift();
  }

  function spawnParticles(x, y, color, count) {
    for (let i = 0; i < count; i++) {
      const ang = Math.random() * Math.PI * 2;
      const sp = 0.6 + Math.random() * 2.2;
      fx.particles.push({ x, y, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp, color, life: 1, r: 0.03 + Math.random() * 0.05 });
    }
    if (fx.particles.length > 220) fx.particles.splice(0, fx.particles.length - 220);
  }

  // =====================================================================
  // 10. RENDER
  // =====================================================================
  let W = 0;
  let H = 0;
  let dpr = 1;

  function resize() {
    dpr = window.devicePixelRatio || 1;
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
  }

  function orbitAngle(p, t) {
    const f = level.floors[p];
    if (!run.times || f.dur <= 0) return f.start;
    const elapsed = Math.max(0, t - run.times[p]);
    let progress = elapsed / f.dur;
    const easeName = level.def && level.def.planetEase;
    if (easeName && easeName !== 'Linear') {
      const whole = Math.floor(progress);
      progress = whole + easeVal(easeName, progress - whole);
    }
    const d = f.travel * progress;
    return f.cw ? f.start - d : f.start + d;
  }

  // SetFilter 화면 이펙트용 경량 오프스크린 패턴 캐시 (1회 생성 후 재사용)
  let cachedNoisePattern = null;
  let cachedScanPattern = null;
  let cachedLedPattern = null;

  function getNoisePattern() {
    if (cachedNoisePattern) return cachedNoisePattern;
    try {
      const oc = document.createElement('canvas');
      oc.width = 96;
      oc.height = 96;
      const octx = oc.getContext('2d');
      const img = octx.createImageData(96, 96);
      const d = img.data;
      let seed = 1337;
      for (let i = 0; i < d.length; i += 4) {
        seed = (seed * 1664525 + 1013904223) >>> 0;
        const v = (seed >>> 24) & 255;
        d[i] = v;
        d[i + 1] = v;
        d[i + 2] = v;
        d[i + 3] = (v > 140 ? 210 : 75);
      }
      octx.putImageData(img, 0, 0);
      cachedNoisePattern = ctx.createPattern(oc, 'repeat');
    } catch (e) {
      cachedNoisePattern = null;
    }
    return cachedNoisePattern;
  }

  function getScanPattern() {
    if (cachedScanPattern) return cachedScanPattern;
    try {
      const oc = document.createElement('canvas');
      oc.width = 4;
      oc.height = 4;
      const octx = oc.getContext('2d');
      octx.fillStyle = 'rgba(0, 0, 0, 0.48)';
      octx.fillRect(0, 2, 4, 2);
      cachedScanPattern = ctx.createPattern(oc, 'repeat');
    } catch (e) {
      cachedScanPattern = null;
    }
    return cachedScanPattern;
  }

  function getLedPattern() {
    if (cachedLedPattern) return cachedLedPattern;
    try {
      const oc = document.createElement('canvas');
      oc.width = 6;
      oc.height = 6;
      const octx = oc.getContext('2d');
      octx.fillStyle = 'rgba(0, 0, 0, 0.42)';
      octx.fillRect(0, 0, 6, 1.5);
      octx.fillRect(0, 0, 1.5, 6);
      cachedLedPattern = ctx.createPattern(oc, 'repeat');
    } catch (e) {
      cachedLedPattern = null;
    }
    return cachedLedPattern;
  }

  // 원작 ADOFAI SetFilter / Bloom 후처리 렌더링
  function renderScreenFilters(filters, perf) {
    if (!filters || !settings.vfx) return;
    const keys = Object.keys(filters);
    if (!keys.length) return;

    const cw = canvas.width;
    const ch = canvas.height;
    if (cw <= 0 || ch <= 0) return;

    ctx.save();

    // 1. 기하 왜곡 계열 (Waves / Fisheye / Compression / Glitch / Aberration) — 물리 픽셀 단위 셀프 블릿
    if (filters.Fisheye !== undefined) {
      const k = clamp((filters.Fisheye || 100) / 100, 0, 2) * 0.055;
      if (k > 0.002) {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.drawImage(canvas, cw * k, ch * k, cw * (1 - 2 * k), ch * (1 - 2 * k), 0, 0, cw, ch);
      }
    }

    if (filters.Waves !== undefined) {
      const k = clamp(Math.abs(filters.Waves || 100) / 100, 0, 2.5);
      if (k > 0.01) {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        const bands = 14;
        const bh = Math.ceil(ch / bands);
        for (let b = 0; b < bands; b++) {
          const sy0 = b * bh;
          const sh = Math.min(bh, ch - sy0);
          if (sh <= 0) break;
          const shift = Math.sin(b * 0.72 + perf * 0.0085) * 11 * dpr * k;
          ctx.drawImage(canvas, 0, sy0, cw, sh, shift, sy0, cw, sh);
        }
      }
    }

    if (filters.Compression !== undefined) {
      const k = clamp(Math.abs(filters.Compression || 100) / 100, 0, 2.5);
      if (k > 0.01) {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        const tick = Math.floor(perf / 42);
        const bands = 6;
        const bh = Math.ceil(ch / bands);
        for (let b = 0; b < bands; b++) {
          const hVal = Math.sin((tick + 1) * 12.9898 + b * 78.233) * 43758.5453;
          const r = hVal - Math.floor(hVal);
          if (r > 0.35) {
            const sy0 = b * bh;
            const sh = Math.min(bh, ch - sy0);
            const shift = (r - 0.65) * 24 * dpr * k;
            ctx.drawImage(canvas, 0, sy0, cw, sh, shift, sy0, cw, sh);
          }
        }
      }
    }

    if (filters.Glitch !== undefined || filters.Aberration !== undefined) {
      const raw = Math.max(Math.abs(filters.Glitch || 0), Math.abs(filters.Aberration || 0));
      const k = clamp(raw / 100, 0, 2.5);
      if (k > 0.01) {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        const tick = Math.floor(perf / 34);
        for (let s = 0; s < 7; s++) {
          const h1 = Math.abs(Math.sin((tick + 3) * 19.17 + s * 47.31) * 9182.13) % 1;
          const h2 = Math.abs(Math.cos((tick + 5) * 31.71 + s * 13.97) * 5417.79) % 1;
          const sy0 = Math.floor(h1 * ch * 0.9);
          const sh = Math.max(4, Math.floor((0.02 + (h2 * 0.08)) * ch));
          const shift = (h2 - 0.5) * 38 * dpr * k;
          ctx.drawImage(canvas, 0, sy0, cw, Math.min(sh, ch - sy0), shift, sy0, cw, Math.min(sh, ch - sy0));
        }
        // RGB 색수차 밴드 오버레이
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.globalCompositeOperation = 'lighter';
        const bandY = ((tick * 73) % Math.max(1, Math.floor(H)));
        ctx.fillStyle = `rgba(255, 45, 95, ${(0.11 * k).toFixed(3)})`;
        ctx.fillRect(0, bandY, W, Math.max(18, H * 0.08));
        ctx.fillStyle = `rgba(0, 235, 255, ${(0.11 * k).toFixed(3)})`;
        ctx.fillRect(0, (bandY + H * 0.43) % H, W, Math.max(14, H * 0.06));
        ctx.globalCompositeOperation = 'source-over';
      }
    }

    // 2. 색상/질감/기상 오버레이 (논리 CSS 좌표계)
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    if (filters.Grayscale !== undefined) {
      const a = clamp((filters.Grayscale || 100) / 100, 0, 1);
      if (a > 0.01) {
        ctx.globalCompositeOperation = 'saturation';
        ctx.globalAlpha = a;
        ctx.fillStyle = 'hsl(0, 0%, 50%)';
        ctx.fillRect(0, 0, W, H);
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = 1;
      }
    }

    if (filters.Sepia !== undefined) {
      const a = clamp((filters.Sepia || 100) / 100, 0, 1);
      if (a > 0.01) {
        ctx.globalCompositeOperation = 'saturation';
        ctx.globalAlpha = a * 0.85;
        ctx.fillStyle = 'hsl(0, 0%, 50%)';
        ctx.fillRect(0, 0, W, H);
        ctx.globalCompositeOperation = 'color';
        ctx.globalAlpha = a * 0.48;
        ctx.fillStyle = '#9c6b30';
        ctx.fillRect(0, 0, W, H);
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = 1;
      }
    }

    if (filters.Invert !== undefined) {
      const a = clamp((filters.Invert || 100) / 100, 0, 1);
      if (a > 0.01) {
        ctx.globalCompositeOperation = 'difference';
        ctx.globalAlpha = a;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, W, H);
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = 1;
      }
    }

    if (filters.Static !== undefined || filters.Grain !== undefined) {
      const raw = Math.max(filters.Static || 0, filters.Grain || 0);
      const a = clamp((raw / 100) * 0.34, 0.02, 0.42);
      const pat = getNoisePattern();
      if (pat) {
        const jx = Math.floor((perf * 0.73) % 96);
        const jy = Math.floor((perf * 1.19) % 96);
        ctx.save();
        ctx.globalAlpha = a;
        ctx.translate(-jx, -jy);
        ctx.fillStyle = pat;
        ctx.fillRect(0, 0, W + 96, H + 96);
        ctx.restore();
      }
    }

    if (filters.Arcade !== undefined || filters.LED !== undefined) {
      const isLed = filters.LED !== undefined;
      const raw = isLed ? (filters.LED || 100) : (filters.Arcade || 100);
      const a = clamp((raw / 100) * 0.65, 0.08, 0.75);
      const pat = isLed ? getLedPattern() : getScanPattern();
      if (pat) {
        ctx.globalAlpha = a;
        ctx.fillStyle = pat;
        ctx.fillRect(0, 0, W, H);
        ctx.globalAlpha = 1;
      }
      // CRT 모서리 비네팅
      const vig = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.32, W / 2, H / 2, Math.max(W, H) * 0.72);
      vig.addColorStop(0, 'rgba(0,0,0,0)');
      vig.addColorStop(1, `rgba(0,0,0,${(0.38 * a).toFixed(3)})`);
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, W, H);
    }

    if (filters.Blizzard !== undefined || filters.Rain !== undefined) {
      const isRain = filters.Rain !== undefined && filters.Blizzard === undefined;
      const raw = isRain ? (filters.Rain || 50) : (filters.Blizzard || 40);
      const strength = clamp(Math.abs(raw) / 40, 0.25, 2.2);
      const count = Math.round(44 * clamp(strength, 0.5, 1.8));
      ctx.strokeStyle = isRain ? 'rgba(160, 215, 255, 0.55)' : 'rgba(240, 248, 255, 0.78)';
      ctx.fillStyle = 'rgba(245, 250, 255, 0.82)';
      ctx.lineWidth = isRain ? 1.4 : 2.0;
      const tSec = perf / 1000;
      for (let i = 0; i < count; i++) {
        const depth = 0.45 + ((i * 37) % 100) / 110;
        const speedX = (isRain ? -180 : -340) * depth * strength;
        const speedY = (isRain ? 680 : 290) * depth * strength;
        const seedX = ((i * 197.3) % 1) * (W + 160);
        const seedY = ((i * 83.7) % 1) * (H + 160);
        const x = mod(seedX + tSec * speedX, W + 120) - 60;
        const y = mod(seedY + tSec * speedY, H + 120) - 60;
        if (isRain) {
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x - 6 * depth, y + 22 * depth);
          ctx.stroke();
        } else {
          ctx.globalAlpha = clamp(0.35 + depth * 0.4, 0, 0.9);
          ctx.beginPath();
          ctx.arc(x, y, 1.4 + depth * 2.1, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
    }

    if (filters.Neon !== undefined || filters.Bloom !== undefined || filters.Compression !== undefined) {
      const raw = Math.max(filters.Neon || 0, filters.Bloom || 0, (filters.Compression || 0) * 0.55);
      const a = clamp((raw / 100) * 0.28, 0, 0.36);
      if (a > 0.01) {
        ctx.globalCompositeOperation = 'screen';
        const bloom = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.12, W / 2, H / 2, Math.max(W, H) * 0.68);
        bloom.addColorStop(0, `rgba(112, 189, 255, ${(a * 0.55).toFixed(3)})`);
        bloom.addColorStop(0.65, `rgba(168, 85, 247, ${(a * 0.35).toFixed(3)})`);
        bloom.addColorStop(1, `rgba(236, 72, 153, ${(a * 0.65).toFixed(3)})`);
        ctx.fillStyle = bloom;
        ctx.fillRect(0, 0, W, H);
        ctx.globalCompositeOperation = 'source-over';
      }
    }

    ctx.restore();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
  }

  function render(perf) {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const stage = STAGES[stageIndex];
    const theme = stage.theme || ['#090b1a', '#18122b', '#70bdff'];

    // 배경 (CustomBackground 색상 / 이미지 밝기 / 회전 잠금 반영)
    if (settings.vfx && fx.bgState && fx.bgState.color && stage.kind === 'adofai') {
      ctx.fillStyle = fx.bgState.color;
      ctx.fillRect(0, 0, W, H);
    } else {
      const grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, theme[0]);
      grad.addColorStop(1, theme[1]);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);
    }
    if (bgImage && bgImage.complete && bgImage.naturalWidth > 0) {
      const imgTintLuma = settings.vfx && fx.bgState ? hexLuma(fx.bgState.imageColor) : 0.85;
      const bgAlpha = clamp(0.42 * imgTintLuma, 0.05, 0.5);
      const unlockBgRot = settings.vfx && fx.bgState && fx.bgState.lockRot === false && Math.abs(cam.rot) > 0.1;
      ctx.save();
      ctx.globalAlpha = bgAlpha;
      if (unlockBgRot) {
        const diag = Math.hypot(W, H);
        const sc = Math.max(diag / bgImage.naturalWidth, diag / bgImage.naturalHeight);
        const dw = bgImage.naturalWidth * sc;
        const dh = bgImage.naturalHeight * sc;
        ctx.translate(W / 2, H / 2);
        ctx.rotate(deg2rad(-(cam.rot || 0)));
        ctx.drawImage(bgImage, -dw / 2, -dh / 2, dw, dh);
      } else {
        const sc = Math.max(W / bgImage.naturalWidth, H / bgImage.naturalHeight);
        const dw = bgImage.naturalWidth * sc;
        const dh = bgImage.naturalHeight * sc;
        ctx.drawImage(bgImage, (W - dw) / 2, (H - dh) / 2, dw, dh);
      }
      ctx.restore();
    }
    if (fx.bgFlash && fx.bgFlash.alpha > 0.005) {
      ctx.globalAlpha = clamp(fx.bgFlash.alpha, 0, 1);
      ctx.fillStyle = fx.bgFlash.color;
      ctx.fillRect(0, 0, W, H);
      ctx.globalAlpha = 1;
    }
    ctx.strokeStyle = theme[2];
    ctx.globalAlpha = 0.05 + fx.pulse * 0.12;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(W / 2, H / 2, Math.min(W, H) * (0.3 + fx.pulse * 0.04), 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;

    if (!level) return;
    const L = level;
    const F = L.floors;

    const U = clamp(Math.min(W, H) / 10.5, 32, 96) * cam.zoom * settings.userZoomMultiplier;
    const cx = W / 2 + (Math.random() - 0.5) * fx.shake;
    const cy = H * 0.5 + (Math.random() - 0.5) * fx.shake;
    const rotRad = deg2rad(-(cam.rot || 0));
    const cosR = Math.cos(rotRad);
    const sinR = Math.sin(rotRad);
    const sx = (x, y) => {
      const dx = x - cam.x;
      const dy = (y === undefined ? 0 : y) - cam.y;
      return cx + (dx * cosR - dy * sinR) * U;
    };
    const sy = (x, y) => {
      const dx = x - cam.x;
      const dy = y - cam.y;
      return cy - (dx * sinR + dy * cosR) * U;
    };

    // 시간
    let t;
    if (run.phase === 'playing') t = songNow(perf);
    else if (run.phase === 'dead' || run.phase === 'clear') t = run.phase === 'clear' ? songNow(perf) : run.freezeT;
    else t = null;

    const cur = run.floor;
    const lo = Math.max(0, cur - 45);
    const hi = Math.min(L.n - 1, cur + 140);
    const pivot = F[cur];
    const curRel = fx.curRel || 0;

    // 가시 구간 타일들의 MoveTrack / AnimateTrack / RecolorTrack 변환 상태 계산
    const ts = evalVisibleTileStates(
      L,
      curRel,
      cur,
      lo,
      hi,
      fx.animTrack,
      pivot ? pivot.bpm : L.bpm0,
      settings.vfx,
      run.phase === 'playing'
    );

    // 트랙
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    for (let i = lo; i < hi; i++) {
      const a = F[i];
      const b = F[i + 1];
      if (a.midspin) continue;
      if (Math.abs(a.x - b.x) < 1e-6 && Math.abs(a.y - b.y) < 1e-6) continue;

      const j = i - lo;
      const j1 = j + 1;
      const aAlpha = ts.alpha[j];
      const bAlpha = ts.alpha[j1];
      const passed = i < cur;
      const stObj = ts.styles[j] || a.colorStyle;
      const dynCol = passed ? 'rgba(120,140,170,0.28)' : evalTileColor(stObj, a.color, i, curRel, settings.vfx);
      const isNeon = !passed && settings.vfx && stObj && (stObj.style === 'Neon' || stObj.style === 'NeonLight');
      const coreCol = passed
        ? 'rgba(10,14,28,0.7)'
        : stObj && stObj.style === 'NeonLight'
          ? 'rgba(28,38,68,0.72)'
          : 'rgba(12,18,36,0.85)';

      const detached =
        Math.abs(ts.ox[j] - ts.ox[j1]) > 0.04 ||
        Math.abs(ts.oy[j] - ts.oy[j1]) > 0.04 ||
        Math.abs(ts.rot[j]) > 0.5 ||
        Math.abs(ts.sx[j] - 1) > 0.02 ||
        Math.abs(ts.sy[j] - 1) > 0.02;

      let ax;
      let ay;
      let bx;
      let by;
      let segAlpha;
      let segScale = 1;

      if (!detached) {
        segAlpha = clamp(Math.min(aAlpha, bAlpha), 0, 1) * (passed ? 1 : 0.92);
        if (segAlpha <= 0.01) continue;
        ax = sx(a.x + ts.ox[j], a.y + ts.oy[j]);
        ay = sy(a.x + ts.ox[j], a.y + ts.oy[j]);
        bx = sx(b.x + ts.ox[j1], b.y + ts.oy[j1]);
        by = sy(b.x + ts.ox[j1], b.y + ts.oy[j1]);
      } else {
        // MoveTrack 스케일/회전/오프셋 분리 시 개별 트랙 조각으로 렌더링
        segAlpha = clamp(aAlpha, 0, 1) * (passed ? 0.85 : 0.94);
        segScale = clamp((ts.sx[j] + ts.sy[j]) * 0.5, 0, 2.5);
        if (segAlpha <= 0.01 || segScale <= 0.02) continue;
        const baseRad = deg2rad(a.out !== null && a.out !== 999 ? a.out : 0);
        const mx = a.x + ts.ox[j] + 0.5 * Math.cos(baseRad);
        const my = a.y + ts.oy[j] + 0.5 * Math.sin(baseRad);
        const rotAng = baseRad + deg2rad(ts.rot[j]);
        const halfLen = 0.5 * segScale;
        const dx = Math.cos(rotAng) * halfLen;
        const dy = Math.sin(rotAng) * halfLen;
        ax = sx(mx - dx, my - dy);
        ay = sy(mx - dx, my - dy);
        bx = sx(mx + dx, my + dy);
        by = sy(mx + dx, my + dy);
      }

      if (isNeon) {
        ctx.strokeStyle = dynCol;
        ctx.globalAlpha = segAlpha * 0.24;
        ctx.lineWidth = U * 0.54 * segScale;
        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.lineTo(bx, by);
        ctx.stroke();
      }
      ctx.strokeStyle = dynCol;
      ctx.globalAlpha = segAlpha;
      ctx.lineWidth = U * 0.36 * segScale;
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.lineTo(bx, by);
      ctx.stroke();

      ctx.strokeStyle = coreCol;
      ctx.lineWidth = U * 0.24 * segScale;
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.lineTo(bx, by);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // 타일
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (let i = lo; i <= hi; i++) {
      const f = F[i];
      const j = i - lo;
      const tAlpha = clamp(ts.alpha[j], 0, 1);
      const tScale = clamp((ts.sx[j] + ts.sy[j]) * 0.5, 0, 2.5);
      if (tAlpha <= 0.01 || tScale <= 0.02) continue;

      const wx = f.x + ts.ox[j];
      const wy = f.y + ts.oy[j];
      const X = sx(wx, wy);
      const Y = sy(wx, wy);
      const passed = i <= cur;
      const isNext = i === cur + 1 && (run.phase === 'playing' || run.phase === 'idle');
      const isPostMidspinAnchor = i > 0 && F[i - 1].midspin;
      const isDongtaTarget = i > 0 && isDongtaStep(F[i - 1]);
      const stObj = ts.styles[j] || f.colorStyle;
      const tileCol = evalTileColor(stObj, f.color, i, curRel, settings.vfx);

      ctx.globalAlpha = tAlpha;
      if (f.midspin) {
        // 미드스핀 오각형 타일
        const r = U * (isNext ? 0.23 : 0.19) * tScale;
        const spinOff = deg2rad(ts.rot[j]);
        ctx.fillStyle = passed ? 'rgba(150,170,200,0.5)' : isNext ? '#ffffff' : '#ffd32a';
        ctx.strokeStyle = 'rgba(10,14,28,0.9)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let k = 0; k < 5; k++) {
          const a = -Math.PI / 2 + spinOff + (k * Math.PI * 2) / 5;
          const px = X + Math.cos(a) * r;
          const py = Y + Math.sin(a) * r;
          if (k === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      } else if (!isPostMidspinAnchor) {
        ctx.fillStyle = f.goal ? '#ffd32a' : passed ? 'rgba(150,170,200,0.55)' : isNext ? '#ffffff' : tileCol;
        ctx.beginPath();
        ctx.arc(X, Y, U * (isNext ? 0.17 : 0.13) * tScale, 0, Math.PI * 2);
        ctx.fill();
      }
      if (isDongtaTarget && !passed) {
        ctx.strokeStyle = '#00f2fe';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(X, Y, U * 0.23 * tScale, 0, Math.PI * 2);
        ctx.stroke();
      }
      if (isNext) {
        ctx.strokeStyle = 'rgba(255,255,255,0.7)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(X, Y, U * (0.27 + 0.04 * Math.sin(perf * 0.012)) * tScale, 0, Math.PI * 2);
        ctx.stroke();
      }
      const fs = Math.max(10, U * 0.3 * tScale);
      if (f.twirl && !passed) {
        ctx.font = `900 ${fs}px 'Pretendard', sans-serif`;
        ctx.lineWidth = 3;
        ctx.strokeStyle = 'rgba(0,0,0,0.85)';
        ctx.strokeText('↺', X, Y - U * 0.42 * tScale);
        ctx.fillStyle = '#e056fd';
        ctx.fillText('↺', X, Y - U * 0.42 * tScale);
      }
      if (f.fast || f.slow) {
        const spColor = f.fast ? '#ff6b6b' : '#5ec8ff';
        const label = f.speedLabel || (f.fast ? 'x2' : 'x1/2');
        ctx.save();
        ctx.globalAlpha = tAlpha * (passed ? 0.42 : 1);
        // 토끼/달팽이 배속 타일 외곽 링 표시
        ctx.strokeStyle = spColor;
        ctx.lineWidth = Math.max(1.8, U * 0.045 * tScale);
        ctx.beginPath();
        ctx.arc(X, Y, U * 0.21 * tScale, 0, Math.PI * 2);
        ctx.stroke();

        // 타일에 x2, x4, x1/2, x1/4 등 배속 텍스트 표시
        const spFont = Math.max(11, Math.round(U * 0.27 * tScale));
        ctx.font = `900 ${spFont}px 'Pretendard', 'Malgun Gothic', sans-serif`;
        ctx.lineWidth = 3.5;
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.88)';
        ctx.strokeText(label, X, Y + U * 0.44 * tScale);
        ctx.fillStyle = spColor;
        ctx.fillText(label, X, Y + U * 0.44 * tScale);
        ctx.restore();
      }
      if (f.goal) {
        ctx.font = `bold ${fs}px sans-serif`;
        ctx.fillStyle = '#ffd32a';
        ctx.fillText('★', X, Y - U * 0.42 * tScale);
      }
    }
    ctx.globalAlpha = 1;

    // 행성 (stickToFloors 옵션 반영)
    let ang;
    if (t === null) {
      const idleDeg = ((perf / 1000) * (pivot.bpm / 60) * 180) % 360;
      ang = pivot.cw ? pivot.start - idleDeg : pivot.start + idleDeg;
    } else {
      ang = orbitAngle(cur, t);
    }
    const stick = settings.vfx && L.def && L.def.stickToFloors;
    const curJ = cur - lo;
    const px = pivot.x + (stick ? ts.ox[curJ] : 0);
    const py = pivot.y + (stick ? ts.oy[curJ] : 0);
    const ox = px + Math.cos(deg2rad(ang));
    const oy = py + Math.sin(deg2rad(ang));

    fx.trail.push({ x: ox, y: oy });
    if (fx.trail.length > 14) fx.trail.shift();

    ctx.setLineDash([5, 6]);
    ctx.strokeStyle = 'rgba(255,255,255,0.18)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(sx(px, py), sy(px, py), U, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    const fireColor = ['#ff5a4e', '#ffd0a0'];
    const iceColor = ['#4db8ff', '#d8f3ff'];
    const pivotCol = pivot.planet === 0 ? fireColor : iceColor;
    const orbCol = pivot.planet === 0 ? iceColor : fireColor;

    for (let i = 0; i < fx.trail.length; i++) {
      const tp = fx.trail[i];
      ctx.globalAlpha = (i / fx.trail.length) * 0.35;
      ctx.fillStyle = orbCol[0];
      ctx.beginPath();
      ctx.arc(sx(tp.x, tp.y), sy(tp.x, tp.y), U * 0.12 * (i / fx.trail.length), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    const drawPlanet = (x, y, col) => {
      const pX = sx(x, y);
      const pY = sy(x, y);
      ctx.save();
      ctx.shadowColor = col[0];
      ctx.shadowBlur = U * 0.35;
      ctx.fillStyle = col[0];
      ctx.beginPath();
      ctx.arc(pX, pY, U * 0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      ctx.fillStyle = col[1];
      ctx.beginPath();
      ctx.arc(pX, pY, U * 0.11, 0, Math.PI * 2);
      ctx.fill();
    };
    drawPlanet(px, py, pivotCol);
    drawPlanet(ox, oy, orbCol);

    // 파티클
    for (const pt of fx.particles) {
      ctx.globalAlpha = Math.max(0, pt.life);
      ctx.fillStyle = pt.color;
      ctx.beginPath();
      ctx.arc(sx(pt.x, pt.y), sy(pt.x, pt.y), Math.max(1, pt.r * U), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // 판정 텍스트
    for (const tx of fx.texts) {
      ctx.globalAlpha = Math.max(0, Math.min(1, tx.life * 1.5));
      ctx.font = `900 ${Math.round(Math.max(13, U * 0.3) * tx.scale)}px 'Pretendard', 'Malgun Gothic', sans-serif`;
      ctx.lineWidth = 4;
      ctx.strokeStyle = 'rgba(0,0,0,0.75)';
      const X = sx(tx.x, tx.y);
      const Y = sy(tx.x, tx.y) - U * (0.45 + tx.rise);
      ctx.strokeText(tx.text, X, Y);
      ctx.fillStyle = tx.color;
      ctx.fillText(tx.text, X, Y);
    }
    ctx.globalAlpha = 1;

    if (fx.fgFlash && fx.fgFlash.alpha > 0.005) {
      ctx.globalAlpha = clamp(fx.fgFlash.alpha, 0, 1);
      ctx.fillStyle = fx.fgFlash.color;
      ctx.fillRect(0, 0, W, H);
      ctx.globalAlpha = 1;
    }

    // 원작 ADOFAI 화면 필터 이펙트 (HUD/판정선 아래 레이어에 적용해 판정선 가독성 보존)
    if (run.phase === 'playing' && settings.vfx) {
      renderScreenFilters(fx.filters, perf);
    }

    // 카운트다운
    const firstHitIdx = Math.min(L.n - 1, (run.startFloor || 0) + 1);
    if (run.phase === 'playing' && run.countdownText && perf - run.countdownAt < 700 && t !== null && t < run.times[firstHitIdx] + 0.2) {
      const k = (perf - run.countdownAt) / 700;
      ctx.globalAlpha = 1 - k;
      ctx.font = `900 ${Math.round(Math.min(W, H) * 0.14 * (1 + k * 0.2))}px 'Pretendard', sans-serif`;
      ctx.fillStyle = '#ffffff';
      ctx.fillText(run.countdownText, W / 2, H * 0.32);
      ctx.globalAlpha = 1;
    }

    // 하단 중앙 판정선 (Timing Scale + 3초 판정 위치 눈금 + 컬러 판정 바 + 화살표 + 판정별 누적 카운터)
    const bannerVisible = run.phase !== 'playing' && el.overlay && el.overlay.classList.contains('hidden');
    renderHitErrorMeter(L, pivot, bannerVisible ? H - 118 : H - 76);

    // 타일 탐색(대기) 안내 배너 (오버레이가 숨겨진 상태에서 현재 선택된 시작 타일 안내)
    if (bannerVisible) {
      const total = Math.max(1, L.n - 1);
      const pct = Math.floor((run.floor / total) * 100);
      const msg = `📍 선택된 시작 타일: #${run.floor} / ${total} (${pct}%)   |   [← / →] 1칸 이동 (Shift: 10칸)   |   [Space] 게임 시작`;
      ctx.font = `700 14px 'Pretendard', 'Malgun Gothic', sans-serif`;
      const tw = ctx.measureText(msg).width + 32;
      const bx = (W - tw) / 2;
      const by = H - 56;
      ctx.fillStyle = 'rgba(10, 14, 28, 0.88)';
      ctx.strokeStyle = 'rgba(112, 189, 255, 0.55)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(bx, by, tw, 34, 10);
      else ctx.rect(bx, by, tw, 34);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#e2e8f0';
      ctx.fillText(msg, W / 2, by + 17);
    }
  }

  // 원작 스타일 하단 판정선 (Hit Error Meter) 렌더링
  function renderHitErrorMeter(L, pivot, barY) {
    const mCx = W / 2;
    const barW = Math.min(310, Math.max(220, W * 0.26));
    const halfW = barW / 2;
    const barH = 10;

    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // 1. 상단 Timing Scale 표시 (기준 300 BPM 이하 = 100%, 고BPM에서는 스케일 비율 표시)
    const curBpm = (pivot && pivot.bpm) ? pivot.bpm : L.bpm0;
    const timingScalePct = Math.round(clamp(300 / Math.max(1, curBpm), 0.35, 1.0) * 100);
    ctx.font = `800 13px 'Pretendard', 'Malgun Gothic', sans-serif`;
    ctx.lineWidth = 3.5;
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.85)';
    const scaleText = `Timing Scale - ${timingScalePct}%`;
    ctx.strokeText(scaleText, mCx, barY - 31);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(scaleText, mCx, barY - 31);

    // 2. 바 상단 3초 판정 위치 눈금 (| || |||| |)
    const tickTop = barY - 20;
    const tickBottom = barY - 6;
    for (let i = 0; i < hitMeter.marks.length; i++) {
      const mk = hitMeter.marks[i];
      // 3초 동안 유지하되 마지막 0.45초 동안 부드럽게 페이드아웃
      const alpha = mk.life < 0.45 ? clamp(mk.life / 0.45, 0, 1) : 0.92;
      const mx = mCx + mk.norm * halfW;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = mk.color;
      ctx.fillRect(mx - 1.3, tickTop, 2.6, tickBottom - tickTop);
    }
    ctx.globalAlpha = 1;

    // 3. 수평 컬러 판정선 바 (빨강 - 주황 - 노랑 - 초록 - 노랑 - 주황 - 빨강)
    const segments = [
      { l: -1.00, r: -0.92, c: '#ff2e2e' }, // 너무 빠름!!
      { l: -0.92, r: -0.68, c: '#ff6b4a' }, // 조금 빠름!
      { l: -0.68, r: -0.36, c: '#e8f542' }, // 빠름!
      { l: -0.36, r:  0.36, c: '#3ae374' }, // 완벽!
      { l:  0.36, r:  0.68, c: '#e8f542' }, // 느림!
      { l:  0.68, r:  0.92, c: '#ff6b4a' }, // 조금 느림!
      { l:  0.92, r:  1.00, c: '#ff2e2e' }  // 너무 느림!!
    ];

    // 바 외곽 그림자 배경
    ctx.fillStyle = 'rgba(0, 0, 0, 0.72)';
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(mCx - halfW - 2, barY - barH / 2 - 2, barW + 4, barH + 4, 6);
    else ctx.rect(mCx - halfW - 2, barY - barH / 2 - 2, barW + 4, barH + 4);
    ctx.fill();

    // 둥근 클리핑 영역 내부에 구간별 색상 채우기
    ctx.save();
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(mCx - halfW, barY - barH / 2, barW, barH, 4);
    else ctx.rect(mCx - halfW, barY - barH / 2, barW, barH);
    ctx.clip();
    for (const seg of segments) {
      const sx0 = mCx + seg.l * halfW;
      const sw = (seg.r - seg.l) * halfW + 0.6;
      ctx.fillStyle = seg.c;
      ctx.fillRect(sx0, barY - barH / 2, sw, barH);
    }
    ctx.restore();

    // 정중앙(0ms) 흰색 기준선
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(mCx - 1.5, barY - barH / 2 - 3, 3, barH + 6);

    // 4. 바 하단 현재 판정 위치 화살표 (^ 모양 카렛)
    const caretX = mCx + (hitMeter.hasHits ? hitMeter.caretNorm : 0) * halfW;
    const caretTop = barY + barH / 2 + 4;
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.85)';
    ctx.lineWidth = 4.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(caretX - 6, caretTop + 6);
    ctx.lineTo(caretX, caretTop);
    ctx.lineTo(caretX + 6, caretTop + 6);
    ctx.stroke();

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(caretX - 6, caretTop + 6);
    ctx.lineTo(caretX, caretTop);
    ctx.lineTo(caretX + 6, caretTop + 6);
    ctx.stroke();

    // 5. 하단 판정별 누적 카운터 (보라 - 빨강 - 주황 - 연두 - 초록 - 연두 - 주황 - 빨강 - 보라)
    const s = run.stats || newStats();
    const counters = [
      { val: s.overloadCount || 0, color: '#c56cf0' }, // 좌측 보라 (과부하)
      { val: s.tooEarly || 0,      color: '#ff3838' }, // 좌측 빨강 (너무 빠름!!)
      { val: s.early || 0,         color: '#ff9f1a' }, // 좌측 주황 (조금 빠름!)
      { val: s.ep || 0,            color: '#d4ff4d' }, // 좌측 연두 (빠름!)
      { val: s.perfect || 0,       color: '#3ae374', center: true }, // 중앙 초록 (완벽!)
      { val: s.lp || 0,            color: '#d4ff4d' }, // 우측 연두 (느림!)
      { val: s.late || 0,          color: '#ff9f1a' }, // 우측 주황 (조금 느림!)
      { val: s.tooLate || 0,       color: '#ff3838' }, // 우측 빨강 (너무 느림!!)
      { val: s.miss || 0,          color: '#c56cf0' }  // 우측 보라 (놓침!)
    ];

    ctx.font = `900 15px 'Pretendard', 'Malgun Gothic', sans-serif`;
    const gap = 10;
    const widths = counters.map((c) => Math.max(12, ctx.measureText(String(c.val)).width));
    const totalW = widths.reduce((acc, w) => acc + w, 0) + gap * (counters.length - 1);
    let curX = mCx - totalW / 2;
    const countY = barY + 28;

    ctx.lineWidth = 3.5;
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.88)';
    for (let i = 0; i < counters.length; i++) {
      const c = counters[i];
      const w = widths[i];
      const tx = curX + w / 2;
      const str = String(c.val);
      ctx.strokeText(str, tx, countY);
      ctx.fillStyle = c.color;
      ctx.fillText(str, tx, countY);
      curX += w + gap;
    }

    ctx.restore();
  }

  // =====================================================================
  // 11. HUD
  // =====================================================================
  let hudTimer = 0;

  function updateTitle() {
    const def = level.def;
    if (el.levelTitle) el.levelTitle.textContent = def.title;
    if (el.levelMeta) el.levelMeta.textContent = `아티스트: ${def.artist} | 제작자: ${def.author}`;
  }

  function updateHud(force) {
    const nowMs = performance.now();
    if (!force && nowMs - hudTimer < 90) return;
    hudTimer = nowMs;
    if (!level) return;
    const total = Math.max(1, level.n - 1);
    const f = level.floors[run.floor] || level.floors[0];
    const pct = Math.min(100, Math.floor((run.floor / total) * 100));
    if (el.bpm) el.bpm.textContent = `BPM: ${Math.round(f.bpm)}`;
    if (el.progress) el.progress.textContent = `진행도: ${pct}% (${run.floor} / ${total})`;
    if (el.progressFill) el.progressFill.style.width = pct + '%';
    const s = run.stats || newStats();
    if (el.accuracy) el.accuracy.textContent = `정확도: ${s.judged ? (s.accSum / s.judged).toFixed(2) : '100.00'}%`;
    if (el.overload) {
      const ov = Math.ceil(run.overload - 1e-6);
      el.overload.textContent = `🔥 과부하: ${ov}/${OVERLOAD_MAX}`;
      el.overload.style.color = ov >= 3 ? '#ff4757' : ov >= 1 ? '#ffa502' : '';
    }
    if (el.kps) el.kps.textContent = `KPS: ${keyLog.stamps.length}`;
  }

  function showOverlay(title, sub) {
    if (el.overlay) {
      el.overlay.classList.remove('result-mode');
      el.overlay.classList.remove('hidden');
    }
    if (el.resultPanel) el.resultPanel.classList.add('hidden');
    if (el.btnPracticeFail) el.btnPracticeFail.classList.add('hidden');
    if (el.overlayKeyHints) el.overlayKeyHints.classList.remove('hidden');
    if (el.btnOverlayStart) el.btnOverlayStart.textContent = '▶️ 게임 시작 (Space)';
    if (el.overlayTitle) el.overlayTitle.textContent = title;
    if (el.overlaySubtitle) el.overlaySubtitle.textContent = sub;
  }

  function hideOverlay() {
    if (el.overlay) el.overlay.classList.add('hidden');
  }

  function formatDurationSec(sec) {
    const s = Math.max(0, Math.floor(sec));
    const mm = String(Math.floor(s / 60)).padStart(2, '0');
    const ss = String(s % 60).padStart(2, '0');
    return `${mm}:${ss}`;
  }

  function computeGrade(cleared, xAcc, s) {
    if (!cleared) return { label: 'F', cls: 'rank-f' };
    const startIdx = run.startFloor || 0;
    const isPurePerfect =
      !settings.autoplay &&
      !settings.noFail &&
      startIdx === 0 &&
      s.judged > 0 &&
      s.perfect === s.judged &&
      s.tooEarly === 0 &&
      s.miss === 0;
    if (isPurePerfect) return { label: 'PP', cls: 'rank-pp' };
    if (xAcc >= 99.5) return { label: 'X+', cls: 'rank-x' };
    if (xAcc >= 98.5) return { label: 'S+', cls: 'rank-s' };
    if (xAcc >= 97.0) return { label: 'S', cls: 'rank-s' };
    if (xAcc >= 93.0) return { label: 'A', cls: 'rank-a' };
    if (xAcc >= 85.0) return { label: 'B', cls: 'rank-b' };
    if (xAcc >= 75.0) return { label: 'C', cls: 'rank-c' };
    return { label: 'D', cls: 'rank-c' };
  }

  // 클리어 및 실패 시 상세 결과창 표시
  function showResultScreen({ cleared, reason }) {
    if (!level) return;
    const L = level;
    const def = L.def;
    const s = run.stats || newStats();
    const totalTiles = Math.max(1, L.n - 1);
    const startIdx = run.startFloor || 0;
    const pctExact = clamp((run.floor / totalTiles) * 100, 0, 100);
    const xAcc = s.judged ? s.accSum / s.judged : 100;
    const stdAcc = s.judged ? s.stdAccSum / s.judged : 100;
    const grade = computeGrade(cleared, xAcc, s);

    if (el.overlayTitle) {
      el.overlayTitle.textContent = cleared
        ? (settings.autoplay ? '🤖 오토플레이 완주!' : '🎉 STAGE CLEAR!')
        : `💥 ${reason || '실패!'}`;
    }
    if (el.overlaySubtitle) {
      el.overlaySubtitle.textContent = cleared
        ? `[Space] 키로 다시 플레이 · [Esc] 시작 위치(#${startIdx})로 나가기 · [← / →] 타일 이동`
        : `#${run.floor} / ${totalTiles} 타일 (${pctExact.toFixed(1)}%) 지점에서 중단됨 — [Space] 재도전 · [Esc] 시작 위치(#${startIdx})로 나가기 · [← / →] 타일 이동`;
    }

    if (el.resultRank) {
      el.resultRank.className = `result-rank ${grade.cls}`;
      el.resultRank.textContent = grade.label;
    }
    if (el.resultSongTitle) el.resultSongTitle.textContent = def.title;
    if (el.resultSongMeta) {
      el.resultSongMeta.textContent = `아티스트: ${def.artist} · 제작자: ${def.author} · 기본 BPM ${Math.round(L.bpm0)}`;
    }

    // 태그 배지 렌더링
    if (el.resultTags) {
      el.resultTags.textContent = '';
      const addTag = (txt, extraCls) => {
        const sp = document.createElement('span');
        sp.className = 'res-tag' + (extraCls ? ' ' + extraCls : '');
        sp.textContent = txt;
        el.resultTags.appendChild(sp);
      };
      addTag(`배속 ${Math.round(settings.speed * 100)}%`);
      if (settings.userOffsetMs !== 0) {
        addTag(`싱크 ${settings.userOffsetMs > 0 ? '+' : ''}${settings.userOffsetMs}ms`);
      }
      if (startIdx > 0) addTag(`🎯 구간 연습 (#${startIdx} ~ #${run.floor})`, 'warn');
      else addTag(`구간 #0 → #${run.floor}`);
      if (settings.autoplay) addTag('🤖 오토플레이', 'warn');
      if (settings.noFail) addTag('🛡️ 무적 모드', 'warn');
      if (cleared && !settings.autoplay && s.tooEarly === 0 && s.miss === 0 && startIdx === 0) {
        addTag(s.perfect === s.judged ? '✨ PURE PERFECT' : '🔥 FULL COMBO', 'good');
      }
    }

    // 1. 정확도 & 진행도 & 콤보
    if (el.resAcc) el.resAcc.textContent = `${xAcc.toFixed(2)}%`;
    if (el.resStdAcc) el.resStdAcc.textContent = `일반 정확도 ${stdAcc.toFixed(2)}%`;
    if (el.resProgress) el.resProgress.textContent = `${pctExact.toFixed(1)}%`;
    if (el.resTiles) el.resTiles.textContent = `${run.floor} / ${totalTiles} 타일`;
    if (el.resCombo) el.resCombo.textContent = `${s.maxCombo || 0}`;
    if (el.resComboBadge) {
      if (cleared && !settings.autoplay && s.perfect === s.judged && s.judged > 0 && s.tooEarly === 0 && s.miss === 0) {
        el.resComboBadge.textContent = '✨ PURE PERFECT!';
      } else if (cleared && !settings.autoplay && s.tooEarly === 0 && s.miss === 0) {
        el.resComboBadge.textContent = '🔥 FULL COMBO!';
      } else {
        el.resComboBadge.textContent = `판정 수 ${s.judged}회`;
      }
    }

    // 2. 평균 오차(ms) & 표준편차 / Unstable Rate 계산
    const timedHits = (s.hitHistory || []).filter((h) => h.kind !== 'tooEarly');
    let meanMs = 0;
    let sdMs = 0;
    if (timedHits.length > 0) {
      for (const h of timedHits) meanMs += h.diffMs;
      meanMs /= timedHits.length;
      let varSum = 0;
      for (const h of timedHits) {
        const d = h.diffMs - meanMs;
        varSum += d * d;
      }
      sdMs = Math.sqrt(varSum / timedHits.length);
    }
    const ur = sdMs * 10;
    if (el.resOffset) {
      if (timedHits.length === 0) {
        el.resOffset.textContent = settings.autoplay ? '0.0ms (오토)' : '-';
      } else {
        const sign = meanMs > 0.05 ? '+' : '';
        const tendency = Math.abs(meanMs) < 1.5 ? '정박' : meanMs < 0 ? '빠름' : '느림';
        el.resOffset.textContent = `${sign}${meanMs.toFixed(1)}ms (${tendency})`;
      }
    }
    if (el.resUr) {
      el.resUr.textContent = timedHits.length > 0
        ? `편차 ±${sdMs.toFixed(1)}ms · UR ${ur.toFixed(1)}`
        : '편차 ±0.0ms · UR 0.0';
    }

    // 평균 오차가 ±15ms 이상 치우친 경우 싱크 보정 가이드 노출
    if (el.resSyncTip) {
      if (!settings.autoplay && timedHits.length >= 8 && Math.abs(meanMs) >= 15) {
        const recDelta = Math.round(meanMs / 10) * 10;
        const nextOffset = settings.userOffsetMs + recDelta;
        el.resSyncTip.textContent =
          `💡 입력이 평균 ${Math.abs(meanMs).toFixed(1)}ms ${meanMs < 0 ? '빠릅' : '느립'}니다. 상단 [싱크]를 ${nextOffset > 0 ? '+' : ''}${nextOffset}ms 쪽으로 조절하면 정박에 더 잘 맞습니다.`;
        el.resSyncTip.classList.remove('hidden');
      } else {
        el.resSyncTip.classList.add('hidden');
      }
    }

    // 3. KPS & 플레이 시간
    const elapsedSec = Math.max(0.1, ((run.endedAt || performance.now()) - (s.startedAt || performance.now())) / 1000);
    const avgKps = (s.totalKeys || 0) / elapsedSec;
    if (el.resKps) el.resKps.textContent = `최고 ${s.peakKps || 0} KPS`;
    if (el.resTime) el.resTime.textContent = `평균 ${avgKps.toFixed(1)} KPS · ${formatDurationSec(elapsedSec)}`;

    // 4. 9단계 판정별 상세 집계 바 생성
    if (el.resultJudgments) {
      el.resultJudgments.textContent = '';
      const denom = Math.max(1, s.perfect + s.ep + s.lp + s.early + s.late + s.tooEarly + s.miss);
      const rows = [
        { name: '완벽! (Pure)',    count: s.perfect || 0,       color: '#3ae374' },
        { name: '빠름! (E-Perf)',  count: s.ep || 0,            color: '#d4ff4d' },
        { name: '느림! (L-Perf)',  count: s.lp || 0,            color: '#d4ff4d' },
        { name: '조금 빠름!',       count: s.early || 0,         color: '#ff9f1a' },
        { name: '조금 느림!',       count: s.late || 0,          color: '#ff9f1a' },
        { name: '너무 빠름!!',      count: s.tooEarly || 0,      color: '#ff3838' },
        { name: '너무 느림!!',      count: s.tooLate || 0,       color: '#ff3838' },
        { name: '과부하',           count: s.overloadCount || 0, color: '#c56cf0' },
        { name: '놓침! (Miss)',    count: s.miss || 0,          color: '#c56cf0' }
      ];
      for (const r of rows) {
        const pct = clamp((r.count / denom) * 100, 0, 100);
        const rowEl = document.createElement('div');
        rowEl.className = 'judge-row';

        const nameEl = document.createElement('span');
        nameEl.className = 'judge-name';
        nameEl.style.color = r.color;
        nameEl.textContent = r.name;

        const barBg = document.createElement('div');
        barBg.className = 'judge-bar-bg';
        const barFill = document.createElement('div');
        barFill.className = 'judge-bar-fill';
        barFill.style.width = `${pct.toFixed(1)}%`;
        barFill.style.background = r.color;
        barBg.appendChild(barFill);

        const countEl = document.createElement('span');
        countEl.className = 'judge-count';
        countEl.textContent = String(r.count);
        const pctSpan = document.createElement('span');
        pctSpan.className = 'judge-pct';
        pctSpan.textContent = `(${Math.round(pct)}%)`;
        countEl.appendChild(pctSpan);

        rowEl.appendChild(nameEl);
        rowEl.appendChild(barBg);
        rowEl.appendChild(countEl);
        el.resultJudgments.appendChild(rowEl);
      }
    }

    // 5. 오차 히스토그램 & 구간별 산점도 차트 렌더링
    renderResultChart(s.hitHistory || [], totalTiles);

    // 6. 버튼 및 오버레이 전환
    if (el.btnOverlayStart) {
      el.btnOverlayStart.textContent = cleared ? '🔄 다시 플레이 (Space)' : '🔄 다시 도전 (Space)';
    }
    if (el.btnPracticeFail) {
      if (!cleared && run.floor >= 4) {
        const pracFloor = Math.max(0, run.floor - 8);
        el.btnPracticeFail.dataset.pracFloor = String(pracFloor);
        el.btnPracticeFail.textContent = `🎯 실패 직전 구간 연습 (#${pracFloor})`;
        el.btnPracticeFail.classList.remove('hidden');
      } else {
        el.btnPracticeFail.classList.add('hidden');
      }
    }
    if (el.overlayKeyHints) el.overlayKeyHints.classList.add('hidden');
    if (el.resultPanel) el.resultPanel.classList.remove('hidden');
    if (el.overlay) {
      el.overlay.classList.add('result-mode');
      el.overlay.classList.remove('hidden');
    }
  }

  function renderResultChart(history, totalTiles) {
    const c = el.resultChart;
    if (!c) return;
    const rDpr = window.devicePixelRatio || 1;
    const cssW = 380;
    const cssH = 148;
    if (c.width !== Math.round(cssW * rDpr) || c.height !== Math.round(cssH * rDpr)) {
      c.width = Math.round(cssW * rDpr);
      c.height = Math.round(cssH * rDpr);
    }
    const rCtx = c.getContext('2d');
    if (!rCtx) return;
    rCtx.setTransform(rDpr, 0, 0, rDpr, 0, 0);
    rCtx.clearRect(0, 0, cssW, cssH);

    // 배경 구분선 (좌: 오차 분포 히스토그램 / 우: 구간별 산점도)
    const midX = 176;
    rCtx.strokeStyle = 'rgba(255,255,255,0.1)';
    rCtx.lineWidth = 1;
    rCtx.beginPath();
    rCtx.moveTo(midX, 8);
    rCtx.lineTo(midX, cssH - 8);
    rCtx.stroke();

    // --- 좌측: 오차 분포 히스토그램 (-120ms ~ +120ms) ---
    const hLeft = 10;
    const hRight = midX - 10;
    const hW = hRight - hLeft;
    const hTop = 16;
    const hBottom = cssH - 20;
    const hH = hBottom - hTop;
    const bins = 17;
    const counts = new Array(bins).fill(0);
    for (const h of history) {
      const idx = clamp(Math.floor(((h.diffMs + 120) / 240) * bins), 0, bins - 1);
      counts[idx]++;
    }
    const maxBin = Math.max(1, ...counts);
    const binW = hW / bins;

    // 0ms 기준선
    const zeroX = hLeft + hW / 2;
    rCtx.setLineDash([3, 3]);
    rCtx.strokeStyle = 'rgba(255,255,255,0.28)';
    rCtx.beginPath();
    rCtx.moveTo(zeroX, hTop - 4);
    rCtx.lineTo(zeroX, hBottom);
    rCtx.stroke();
    rCtx.setLineDash([]);

    for (let i = 0; i < bins; i++) {
      const cnt = counts[i];
      if (!cnt) continue;
      const centerMs = -120 + ((i + 0.5) / bins) * 240;
      const absMs = Math.abs(centerMs);
      const col = absMs <= 42 ? '#3ae374' : absMs <= 80 ? '#d4ff4d' : absMs <= 108 ? '#ff9f1a' : '#ff3838';
      const bh = Math.max(2, (cnt / maxBin) * hH);
      rCtx.fillStyle = col;
      rCtx.fillRect(hLeft + i * binW + 1, hBottom - bh, Math.max(2, binW - 2), bh);
    }

    rCtx.fillStyle = '#94a3b8';
    rCtx.font = `600 9px 'Pretendard', sans-serif`;
    rCtx.textAlign = 'left';
    rCtx.fillText('빠름(-)', hLeft, cssH - 6);
    rCtx.textAlign = 'center';
    rCtx.fillStyle = '#e2e8f0';
    rCtx.fillText('0ms', zeroX, cssH - 6);
    rCtx.textAlign = 'right';
    rCtx.fillStyle = '#94a3b8';
    rCtx.fillText('느림(+)', hRight, cssH - 6);

    // --- 우측: 구간별 타이밍 추이 산점도 (0% -> 100%, Y축: -120ms ~ +120ms) ---
    const sLeft = midX + 12;
    const sRight = cssW - 10;
    const sW = sRight - sLeft;
    const sMidY = (hTop + hBottom) / 2;
    const sHalfH = (hBottom - hTop) / 2;

    // 0ms 수평 기준선
    rCtx.setLineDash([3, 3]);
    rCtx.strokeStyle = 'rgba(255,255,255,0.28)';
    rCtx.beginPath();
    rCtx.moveTo(sLeft, sMidY);
    rCtx.lineTo(sRight, sMidY);
    rCtx.stroke();
    rCtx.setLineDash([]);

    const stepStride = history.length > 400 ? Math.ceil(history.length / 400) : 1;
    for (let i = 0; i < history.length; i += stepStride) {
      const h = history[i];
      const px = sLeft + clamp(h.floor / Math.max(1, totalTiles), 0, 1) * sW;
      const py = sMidY + clamp(h.diffMs / 120, -1, 1) * sHalfH;
      rCtx.fillStyle = meterColorForKind(h.kind);
      rCtx.globalAlpha = 0.85;
      rCtx.beginPath();
      rCtx.arc(px, py, 2.1, 0, Math.PI * 2);
      rCtx.fill();
    }
    rCtx.globalAlpha = 1;

    if (history.length === 0) {
      rCtx.fillStyle = '#64748b';
      rCtx.font = `600 11px 'Pretendard', sans-serif`;
      rCtx.textAlign = 'center';
      rCtx.fillText(settings.autoplay ? '오토플레이 정박 (0.0ms)' : '기록된 타격 없음', (sLeft + sRight) / 2, sMidY + 4);
    }

    rCtx.fillStyle = '#94a3b8';
    rCtx.font = `600 9px 'Pretendard', sans-serif`;
    rCtx.textAlign = 'left';
    rCtx.fillText('0%', sLeft, cssH - 6);
    rCtx.textAlign = 'center';
    rCtx.fillText('진행도', (sLeft + sRight) / 2, cssH - 6);
    rCtx.textAlign = 'right';
    rCtx.fillText('100%', sRight, cssH - 6);
  }

  // =====================================================================
  // 12. INPUT & KEY LIMITER (사용자 지정 키 제한 및 판정 입력)
  // =====================================================================
  const BROWSER_KEYS = new Set(['F5', 'F11', 'F12']);
  const KEY_LIMIT_STORAGE_KEY = 'adofai_key_limiter_v1';

  // 한/영 상태에서 e.code가 누락된 환경을 대비한 두벌식 자모 -> 물리 키 코드 매핑
  const HANGUL_TO_CODE = {
    'ㅂ': 'KeyQ', 'ㅃ': 'KeyQ', 'ㅈ': 'KeyW', 'ㅉ': 'KeyW', 'ㄷ': 'KeyE', 'ㄸ': 'KeyE',
    'ㄱ': 'KeyR', 'ㄲ': 'KeyR', 'ㅅ': 'KeyT', 'ㅆ': 'KeyT', 'ㅛ': 'KeyY', 'ㅕ': 'KeyU',
    'ㅑ': 'KeyI', 'ㅐ': 'KeyO', 'ㅒ': 'KeyO', 'ㅔ': 'KeyP', 'ㅖ': 'KeyP',
    'ㅁ': 'KeyA', 'ㄴ': 'KeyS', 'ㅇ': 'KeyD', 'ㄹ': 'KeyF', 'ㅎ': 'KeyG',
    'ㅗ': 'KeyH', 'ㅓ': 'KeyJ', 'ㅏ': 'KeyK', 'ㅣ': 'KeyL',
    'ㅋ': 'KeyZ', 'ㅌ': 'KeyX', 'ㅊ': 'KeyC', 'ㅍ': 'KeyV', 'ㅠ': 'KeyB', 'ㅜ': 'KeyN', 'ㅡ': 'KeyM'
  };

  const PUNCT_TO_CODE = {
    ';': 'Semicolon', ':': 'Semicolon',
    "'": 'Quote', '"': 'Quote',
    ',': 'Comma', '<': 'Comma',
    '.': 'Period', '>': 'Period',
    '/': 'Slash', '?': 'Slash',
    '[': 'BracketLeft', '{': 'BracketLeft',
    ']': 'BracketRight', '}': 'BracketRight',
    '\\': 'Backslash', '|': 'Backslash',
    '-': 'Minus', '_': 'Minus',
    '=': 'Equal', '+': 'Equal',
    '`': 'Backquote', '~': 'Backquote'
  };

  const CODE_TO_LABEL_MAP = {
    Space: 'Space',
    Semicolon: ';',
    Quote: "'",
    Comma: ',',
    Period: '.',
    Slash: '/',
    BracketLeft: '[',
    BracketRight: ']',
    Backslash: '\\',
    Minus: '-',
    Equal: '=',
    Backquote: '`',
    ArrowLeft: '←',
    ArrowRight: '→',
    ArrowUp: '↑',
    ArrowDown: '↓',
    ShiftLeft: 'L-Shift',
    ShiftRight: 'R-Shift',
    ControlLeft: 'L-Ctrl',
    ControlRight: 'R-Ctrl',
    Enter: 'Enter',
    NumpadEnter: 'NumEnter',
    Backspace: 'Bksp',
    Tab: 'Tab'
  };

  const KEY_PRESETS = {
    'askl': ['KeyA', 'KeyS', 'KeyK', 'KeyL'],
    'cvnm': ['KeyC', 'KeyV', 'KeyN', 'KeyM'],
    '2k': ['KeyF', 'KeyJ'],
    '4k': ['KeyD', 'KeyF', 'KeyJ', 'KeyK'],
    '6k': ['KeyS', 'KeyD', 'KeyF', 'KeyJ', 'KeyK', 'KeyL'],
    '8k': ['KeyA', 'KeyS', 'KeyD', 'KeyF', 'KeyJ', 'KeyK', 'KeyL', 'Semicolon'],
    '8k-ergo': ['KeyW', 'KeyE', 'KeyD', 'KeyF', 'KeyJ', 'KeyK', 'KeyI', 'KeyO']
  };

  // Jipper's Keys Visualizer 상태 (키 제한 allowedKeys와 실시간 양방향 연동)
  const jipperState = {
    slots: ['KeyA', 'KeyS', 'KeyK', 'KeyL'],
    dynamicRecent: [],        // { code, ts } 최근 자동 감지된 물리 키 목록
    slotElements: new Map(),  // code -> { slotEl, railEl, capEl, nameEl, countEl, isFire }
    renderedSig: '',
    heldBeams: new Map(),     // code -> active beam obj
    beams: [],                // { el, code, held, y, h, alpha, bornMs }
    keyCounts: new Map(),     // code -> 누적 타격 횟수
    totalPresses: 0,
    peakKps: 0,
    lastKpsText: -1,
    lastPeakText: -1,
    lastTotalText: -1,
    rebindIndex: -1,
    dockRight: false
  };

  const MINI_KEYBOARD_ROWS = [
    ['Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5', 'Digit6', 'Digit7', 'Digit8', 'Digit9', 'Digit0'],
    ['KeyQ', 'KeyW', 'KeyE', 'KeyR', 'KeyT', 'KeyY', 'KeyU', 'KeyI', 'KeyO', 'KeyP', 'BracketLeft', 'BracketRight'],
    ['KeyA', 'KeyS', 'KeyD', 'KeyF', 'KeyG', 'KeyH', 'KeyJ', 'KeyK', 'KeyL', 'Semicolon', 'Quote'],
    ['KeyZ', 'KeyX', 'KeyC', 'KeyV', 'KeyB', 'KeyN', 'KeyM', 'Comma', 'Period', 'Slash'],
    ['ShiftLeft', 'Space', 'ShiftRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp', 'ArrowRight']
  ];

  function normalizeKeyCode(eOrCode) {
    if (!eOrCode) return '';
    if (typeof eOrCode === 'string') {
      const s = eOrCode.trim();
      if (!s) return '';
      if (/^(Key[A-Z]|Digit[0-9]|Numpad|Arrow|Shift|Control|Space|Semicolon|Quote|Comma|Period|Slash|Bracket|Back|Minus|Equal|Enter|Tab)/.test(s)) {
        return s;
      }
      if (s === ' ') return 'Space';
      if (s.length === 1) {
        if (/[a-zA-Z]/.test(s)) return 'Key' + s.toUpperCase();
        if (/[0-9]/.test(s)) return 'Digit' + s;
        if (HANGUL_TO_CODE[s]) return HANGUL_TO_CODE[s];
        if (PUNCT_TO_CODE[s]) return PUNCT_TO_CODE[s];
      }
      return s;
    }
    const c = eOrCode.code;
    if (c && c !== 'Unidentified') return String(c);
    const k = eOrCode.key;
    if (!k) return 'Key';
    if (k === ' ' || k === 'Spacebar') return 'Space';
    if (k.length === 1) {
      if (/[a-zA-Z]/.test(k)) return 'Key' + k.toUpperCase();
      if (/[0-9]/.test(k)) return 'Digit' + k;
      if (HANGUL_TO_CODE[k]) return HANGUL_TO_CODE[k];
      if (PUNCT_TO_CODE[k]) return PUNCT_TO_CODE[k];
    }
    if (k === 'Shift') return 'ShiftLeft';
    if (k === 'Control') return 'ControlLeft';
    return String(k);
  }

  function codeToLabel(code) {
    if (!code) return 'Key';
    if (CODE_TO_LABEL_MAP[code]) return CODE_TO_LABEL_MAP[code];
    if (code.startsWith('Key') && code.length === 4) return code.slice(3);
    if (code.startsWith('Digit') && code.length === 6) return code.slice(5);
    if (code.startsWith('Numpad')) return 'Num' + code.slice(6);
    return code;
  }

  function keyLabel(e) {
    return codeToLabel(normalizeKeyCode(e));
  }

  function isSettingsModalOpen() {
    return Boolean(el.settingsModal && !el.settingsModal.classList.contains('hidden'));
  }

  function isKeyLimitModalOpen() {
    return Boolean(
      isSettingsModalOpen() &&
      el.keyLimitPanel &&
      !el.keyLimitPanel.classList.contains('hidden')
    );
  }

  // 플레이 중 현재 키가 허용된 키인지 판별 (keyLimitEnabled가 꺼져 있으면 모든 키 허용)
  function isKeyAllowed(eOrCode) {
    if (!settings.keyLimitEnabled) return true;
    const code = normalizeKeyCode(eOrCode);
    if (!code) return false;
    return allowedKeys.has(code);
  }

  function saveKeyLimitConfig() {
    try {
      localStorage.setItem(
        KEY_LIMIT_STORAGE_KEY,
        JSON.stringify({
          enabled: Boolean(settings.keyLimitEnabled),
          keys: Array.from(allowedKeys),
          slots: jipperState.slots.slice(),
          dockRight: Boolean(jipperState.dockRight)
        })
      );
    } catch (e) { /* ignore storage errors */ }
  }

  function loadKeyLimitConfig() {
    try {
      const raw = localStorage.getItem(KEY_LIMIT_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.slots) && parsed.slots.length > 0) {
        const cleanSlots = parsed.slots.map((k) => normalizeKeyCode(String(k))).filter(Boolean);
        if (cleanSlots.length > 0) jipperState.slots = cleanSlots;
      }
      if (parsed && Array.isArray(parsed.keys)) {
        allowedKeys.clear();
        for (const k of parsed.keys) {
          const norm = normalizeKeyCode(String(k));
          if (norm) allowedKeys.add(norm);
        }
        settings.keyLimitEnabled = Boolean(parsed.enabled) && allowedKeys.size > 0;
        if (settings.keyLimitEnabled && allowedKeys.size > 0) {
          jipperState.slots = Array.from(allowedKeys);
        }
      }
      if (parsed && typeof parsed.dockRight === 'boolean') {
        jipperState.dockRight = parsed.dockRight;
      }
    } catch (e) { /* ignore */ }
  }

  // Jipper 키뷰어의 개별 슬롯 클릭 시: 해당 슬롯 키 리바인딩 모드 진입 -> 입력 시 키 제한 자동 연동!
  function startSlotRebind(slotIdx) {
    if (slotIdx < 0 || slotIdx >= jipperState.slots.length) {
      cancelSlotRebind();
      return;
    }
    jipperState.rebindIndex = slotIdx;
    if (el.jipperRebindHint) {
      const curLabel = codeToLabel(jipperState.slots[slotIdx]);
      el.jipperRebindHint.textContent = `🎯 슬롯 #${slotIdx + 1} (${curLabel})에 지정할 키를 누르세요 (키 제한 자동 연동 · Esc: 취소)`;
      el.jipperRebindHint.classList.remove('hidden');
    }
    renderKeyVisualizer();
  }

  function cancelSlotRebind() {
    if (jipperState.rebindIndex < 0) return;
    jipperState.rebindIndex = -1;
    if (el.jipperRebindHint) el.jipperRebindHint.classList.add('hidden');
    renderKeyVisualizer();
  }

  function rebindJipperSlot(slotIdx, codeOrEvent) {
    const code = normalizeKeyCode(codeOrEvent);
    if (!code) return;
    if (slotIdx >= 0 && slotIdx < jipperState.slots.length) {
      const existingIdx = jipperState.slots.indexOf(code);
      if (existingIdx >= 0 && existingIdx !== slotIdx) {
        // 이미 다른 슬롯에 있는 키면 두 슬롯의 키를 서로 교환(Swap)
        jipperState.slots[existingIdx] = jipperState.slots[slotIdx];
      }
      jipperState.slots[slotIdx] = code;
    }
    jipperState.rebindIndex = -1;
    if (el.jipperRebindHint) el.jipperRebindHint.classList.add('hidden');

    // [핵심 연동] 키뷰어 키를 사용자가 설정하면 키 제한(allowedKeys)이 그에 맞춰 즉시 연동 & 활성화됨
    allowedKeys.clear();
    for (const c of jipperState.slots) {
      if (c) allowedKeys.add(c);
    }
    settings.keyLimitEnabled = true;
    jipperState.renderedSig = '';
    saveKeyLimitConfig();
    renderKeyLimitUI();
  }

  // Jipper's Keys Visualizer DOM 빌드 및 상태 동기화 (슬롯 구성이 바뀔 때만 DOM 재생성하여 144FPS 리페인트 지연 방지)
  function renderKeyVisualizer() {
    if (!el.kvPills) return;
    const now = performance.now();

    if (el.keyVisualizer) {
      el.keyVisualizer.classList.toggle('dock-right', Boolean(jipperState.dockRight));
    }
    if (el.btnJipperPos) {
      el.btnJipperPos.textContent = jipperState.dockRight ? '⇄ 좌측' : '⇄ 우측';
    }

    // 키 제한이 켜져 있고 허용 키가 있으면 키뷰어 슬롯도 허용 키 목록과 1:1 동기화
    let displaySlots;
    if (settings.keyLimitEnabled) {
      displaySlots = Array.from(allowedKeys);
      if (displaySlots.length > 0) {
        jipperState.slots = displaySlots.slice();
      }
      if (el.kvLabel) {
        el.kvLabel.textContent = `🔒 LIMIT (${displaySlots.length}K)`;
        el.kvLabel.classList.add('locked');
      }
      if (el.btnJipperLock) {
        el.btnJipperLock.textContent = '🔒 제한 ON';
        el.btnJipperLock.classList.add('active');
      }
    } else {
      displaySlots = jipperState.slots.length > 0 ? jipperState.slots : ['KeyA', 'KeyS', 'KeyK', 'KeyL'];
      if (el.kvLabel) {
        el.kvLabel.textContent = '🔓 AUTO KEYS';
        el.kvLabel.classList.remove('locked');
      }
      if (el.btnJipperLock) {
        el.btnJipperLock.textContent = '🔓 제한 OFF';
        el.btnJipperLock.classList.remove('active');
      }
    }

    const sig = `${settings.keyLimitEnabled ? 'L' : 'A'}:${displaySlots.join(',')}`;
    if (jipperState.renderedSig !== sig) {
      jipperState.renderedSig = sig;
      jipperState.slotElements.clear();
      jipperState.heldBeams.clear();
      jipperState.beams.length = 0;
      el.kvPills.textContent = '';

      if (settings.keyLimitEnabled && displaySlots.length === 0) {
        const empty = document.createElement('span');
        empty.className = 'kv-placeholder';
        empty.textContent = '허용된 키 없음 (⚙️ 설정 또는 슬롯 등록)';
        el.kvPills.appendChild(empty);
      } else {
        displaySlots.forEach((code, idx) => {
          const isFire = idx % 2 === 1;
          const slotEl = document.createElement('div');
          slotEl.className =
            'jipper-key-slot ' +
            (isFire ? 'theme-fire' : 'theme-ice') +
            (settings.keyLimitEnabled ? ' allowed-key' : '');
          slotEl.dataset.code = code;
          slotEl.dataset.slotIndex = String(idx);
          slotEl.title = `클릭하여 슬롯 #${idx + 1} (${codeToLabel(code)}) 키 변경 (키 제한 자동 연동)`;

          const railEl = document.createElement('div');
          railEl.className = 'jipper-rail-track';

          const capEl = document.createElement('div');
          capEl.className = 'jipper-keycap';

          const nameEl = document.createElement('span');
          nameEl.className = 'jipper-key-name';
          nameEl.textContent = codeToLabel(code);

          const countEl = document.createElement('span');
          countEl.className = 'jipper-key-count';
          countEl.textContent = String(jipperState.keyCounts.get(code) || 0);

          capEl.appendChild(nameEl);
          capEl.appendChild(countEl);
          slotEl.appendChild(railEl);
          slotEl.appendChild(capEl);

          slotEl.addEventListener('click', (ev) => {
            ev.stopPropagation();
            if (jipperState.rebindIndex === idx) cancelSlotRebind();
            else startSlotRebind(idx);
            releaseFocusToGame();
          });

          el.kvPills.appendChild(slotEl);
          jipperState.slotElements.set(code, { slotEl, railEl, capEl, nameEl, countEl, isFire, idx });
        });
      }
    }

    // 각 슬롯의 활성/카운트/리바인딩 상태만 경량 토글
    for (const [code, info] of jipperState.slotElements.entries()) {
      const isHit = (activeHitKeyUntil.get(code) || 0) > now || jipperState.heldBeams.has(code);
      const isRebinding = jipperState.rebindIndex === info.idx;
      info.slotEl.classList.toggle('is-pressed', isHit);
      info.slotEl.classList.toggle('active-hit', isHit);
      info.slotEl.classList.toggle('rebinding', isRebinding);
      const expectedName = isRebinding ? '···' : codeToLabel(code);
      if (info.nameEl.textContent !== expectedName) {
        info.nameEl.textContent = expectedName;
      }
      const cnt = jipperState.keyCounts.get(code) || 0;
      const cntStr = String(cnt);
      if (info.countEl.textContent !== cntStr) {
        info.countEl.textContent = cntStr;
      }
    }

    updateJipperTelemetryText();
  }

  function updateJipperTelemetryText() {
    const curKps = keyLog.stamps.length;
    if (curKps > jipperState.peakKps) jipperState.peakKps = curKps;
    if (el.jipperKpsVal && jipperState.lastKpsText !== curKps) {
      jipperState.lastKpsText = curKps;
      el.jipperKpsVal.textContent = String(curKps);
    }
    if (el.jipperKpsMax && jipperState.lastPeakText !== jipperState.peakKps) {
      jipperState.lastPeakText = jipperState.peakKps;
      el.jipperKpsMax.textContent = `MAX ${jipperState.peakKps}`;
    }
    if (el.jipperTotalVal && jipperState.lastTotalText !== jipperState.totalPresses) {
      jipperState.lastTotalText = jipperState.totalPresses;
      el.jipperTotalVal.textContent = String(jipperState.totalPresses);
    }
  }

  // Jipper 라이브 키 스트로크 레일(Key Ripple / Rising Beam) 생성 및 60~144FPS 애니메이션
  function spawnJipperBeam(code, nowMs) {
    const info = jipperState.slotElements.get(code);
    if (!info || !info.railEl) return;

    // 기존에 홀드 중이던 빔이 있으면 위로 날려보냄
    const prev = jipperState.heldBeams.get(code);
    if (prev) {
      prev.held = false;
      jipperState.heldBeams.delete(code);
    }

    // 동시 활성 빔 개수 제한 (DOM 부하 방지)
    while (jipperState.beams.length >= 32) {
      const oldest = jipperState.beams.shift();
      if (oldest && oldest.el && oldest.el.parentNode) oldest.el.parentNode.removeChild(oldest.el);
    }

    const beamEl = document.createElement('div');
    beamEl.className = 'jipper-beam ' + (info.isFire ? 'beam-fire' : 'beam-ice');
    beamEl.style.height = '12px';
    beamEl.style.opacity = '0.95';
    beamEl.style.transform = 'translate3d(0, 0px, 0)';
    info.railEl.appendChild(beamEl);

    const beamObj = {
      el: beamEl,
      code,
      held: true,
      y: 0,
      h: 12,
      alpha: 0.95,
      bornMs: nowMs
    };
    jipperState.heldBeams.set(code, beamObj);
    jipperState.beams.push(beamObj);
  }

  function releaseJipperKey(code) {
    if (!code) return;
    activeHitKeyUntil.delete(code);
    const held = jipperState.heldBeams.get(code);
    if (held) {
      held.held = false;
      jipperState.heldBeams.delete(code);
    }
    const info = jipperState.slotElements.get(code);
    if (info && info.slotEl) {
      info.slotEl.classList.remove('is-pressed', 'active-hit');
    }
  }

  function updateJipperVisualizer(dt, nowMs) {
    updateJipperTelemetryText();

    // keyup 이벤트가 오지 않은 합성 입력 등의 만료 처리
    for (const [code, until] of activeHitKeyUntil.entries()) {
      if (nowMs >= until) {
        activeHitKeyUntil.delete(code);
        const held = jipperState.heldBeams.get(code);
        if (held && nowMs - held.bornMs > 180) {
          held.held = false;
          jipperState.heldBeams.delete(code);
        }
        const info = jipperState.slotElements.get(code);
        if (info && info.slotEl && !jipperState.heldBeams.has(code)) {
          info.slotEl.classList.remove('is-pressed', 'active-hit');
        }
      }
    }

    // 라이트 레일(Beam) 상승 및 페이드아웃 업데이트
    for (let i = jipperState.beams.length - 1; i >= 0; i--) {
      const b = jipperState.beams[i];
      if (b.held && nowMs - b.bornMs < 260) {
        b.h = Math.min(64, b.h + dt * 210);
      } else {
        b.held = false;
        b.y += dt * 185;
        b.h = Math.max(8, b.h + dt * 20);
        b.alpha -= dt * 2.35;
      }
      if (b.alpha <= 0.02 || b.y > 70) {
        if (b.el && b.el.parentNode) b.el.parentNode.removeChild(b.el);
        if (jipperState.heldBeams.get(b.code) === b) jipperState.heldBeams.delete(b.code);
        jipperState.beams.splice(i, 1);
      } else if (b.el) {
        b.el.style.height = `${b.h.toFixed(1)}px`;
        b.el.style.transform = `translate3d(0, ${(-b.y).toFixed(1)}px, 0)`;
        b.el.style.opacity = b.alpha.toFixed(2);
      }
    }
  }

  // 키 제한 해제(AUTO KEYS) 상태에서 플레이어가 누른 최근 4~6개 고유 물리 키를 슬롯에 동적 자동 매핑
  function autoMapDynamicKey(code, nowMs) {
    if (!code || code === 'Escape' || settings.keyLimitEnabled) return;
    // 대기 상태에서 탐색용 화살표나 시작용 Space는 기존 슬롯을 덮어쓰지 않음 (플레이 중에는 모두 매핑)
    if (run.phase !== 'playing' && (code === 'ArrowLeft' || code === 'ArrowRight' || code === 'Space')) {
      return;
    }
    const existingIdx = jipperState.dynamicRecent.findIndex((x) => x.code === code);
    if (existingIdx >= 0) {
      jipperState.dynamicRecent.splice(existingIdx, 1);
    }
    jipperState.dynamicRecent.push({ code, ts: nowMs });
    const targetCount = clamp(jipperState.slots.length || 4, 4, 6);
    while (jipperState.dynamicRecent.length > targetCount) {
      jipperState.dynamicRecent.shift();
    }

    if (!jipperState.slots.includes(code)) {
      const recentCodes = jipperState.dynamicRecent.map((x) => x.code);
      if (recentCodes.length >= targetCount) {
        jipperState.slots = recentCodes.slice(-targetCount);
      } else {
        const nextSlots = jipperState.slots.slice(0, targetCount);
        while (nextSlots.length < targetCount) {
          nextSlots.push(['KeyA', 'KeyS', 'KeyK', 'KeyL', 'KeyD', 'KeyF'][nextSlots.length]);
        }
        for (let i = 0; i < recentCodes.length; i++) {
          const rc = recentCodes[i];
          const swapIdx = nextSlots.indexOf(rc);
          if (swapIdx >= 0 && swapIdx !== i) {
            nextSlots[swapIdx] = nextSlots[i];
          }
          nextSlots[i] = rc;
        }
        jipperState.slots = nextSlots;
      }
      jipperState.renderedSig = '';
    }
  }

  function renderKeyLimitUI() {
    const enabled = Boolean(settings.keyLimitEnabled);
    const count = allowedKeys.size;

    // 1. 상단 HUD 버튼 텍스트 & 활성 상태
    if (el.btnKeyLimit) {
      if (enabled && count > 0) {
        const preview = Array.from(allowedKeys).slice(0, 4).map(codeToLabel).join('·') + (count > 4 ? '…' : '');
        el.btnKeyLimit.textContent = `⌨️ 키 제한: ${count}키 (${preview})`;
        el.btnKeyLimit.classList.add('active');
      } else if (enabled && count === 0) {
        el.btnKeyLimit.textContent = '⌨️ 키 제한: 0키 (입력 차단됨)';
        el.btnKeyLimit.classList.add('active');
      } else {
        el.btnKeyLimit.textContent = '⌨️ 키 제한: 전체';
        el.btnKeyLimit.classList.remove('active');
      }
    }

    // 2. 모달 상단 토글 스위치 버튼
    if (el.btnToggleKeyLimit) {
      el.btnToggleKeyLimit.classList.toggle('active', enabled);
      el.btnToggleKeyLimit.textContent = enabled
        ? `🔒 현재: 지정된 키뷰어 허용 키(${count}개)만 입력 작동 중 (클릭하면 모든 키 허용)`
        : '🔓 현재: 모든 키 허용 / 자동 감지 중 (클릭하여 키 제한 켜기)';
    }

    if (el.klCountBadge) {
      el.klCountBadge.textContent = `${count}개`;
    }

    // 3. 등록된 키 칩(Chip) 목록
    if (el.klChipList) {
      el.klChipList.textContent = '';
      if (count === 0) {
        const empty = document.createElement('span');
        empty.className = 'kl-empty-msg';
        empty.textContent = '등록된 허용 키가 없습니다. 키보드의 원하는 키를 누르거나 아래 키캡을 클릭해 추가하세요.';
        el.klChipList.appendChild(empty);
      } else {
        for (const code of allowedKeys) {
          const btn = document.createElement('button');
          btn.className = 'kl-chip';
          btn.dataset.code = code;
          btn.title = '클릭하여 허용 목록에서 제거';
          btn.innerHTML = `<span>${codeToLabel(code)}</span><span class="kl-chip-remove">✕</span>`;
          btn.addEventListener('click', () => {
            toggleAllowedKey(code);
          });
          el.klChipList.appendChild(btn);
        }
      }
    }

    // 4. 미니 키보드 그리드 선택 상태 동기화
    if (el.klKeyboardGrid) {
      el.klKeyboardGrid.querySelectorAll('.kl-keycap').forEach((cap) => {
        cap.classList.toggle('selected', allowedKeys.has(cap.dataset.code));
      });
    }

    renderKeyVisualizer();
  }

  function buildMiniKeyboardGrid() {
    if (!el.klKeyboardGrid) return;
    el.klKeyboardGrid.textContent = '';
    for (const row of MINI_KEYBOARD_ROWS) {
      const rowDiv = document.createElement('div');
      rowDiv.className = 'kl-kb-row';
      for (const code of row) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'kl-keycap' + (code === 'Space' ? ' wide' : '');
        btn.dataset.code = code;
        btn.textContent = codeToLabel(code);
        btn.addEventListener('click', () => {
          toggleAllowedKey(code);
        });
        rowDiv.appendChild(btn);
      }
      el.klKeyboardGrid.appendChild(rowDiv);
    }
  }

  function toggleAllowedKey(codeOrEvent) {
    const code = normalizeKeyCode(codeOrEvent);
    if (!code) return;
    if (allowedKeys.has(code)) {
      allowedKeys.delete(code);
    } else {
      allowedKeys.add(code);
      settings.keyLimitEnabled = true;
    }
    if (allowedKeys.size > 0) {
      jipperState.slots = Array.from(allowedKeys);
    }
    jipperState.renderedSig = '';
    saveKeyLimitConfig();
    renderKeyLimitUI();
  }

  function setAllowedKeys(codes, enableLimit = true) {
    allowedKeys.clear();
    if (Array.isArray(codes)) {
      for (const c of codes) {
        const norm = normalizeKeyCode(c);
        if (norm) allowedKeys.add(norm);
      }
    }
    if (allowedKeys.size > 0) {
      jipperState.slots = Array.from(allowedKeys);
    }
    settings.keyLimitEnabled = Boolean(enableLimit);
    jipperState.renderedSig = '';
    saveKeyLimitConfig();
    renderKeyLimitUI();
  }

  function applyKeyPreset(preset) {
    if (preset === 'all') {
      settings.keyLimitEnabled = false;
      jipperState.dynamicRecent = [];
      jipperState.renderedSig = '';
      saveKeyLimitConfig();
      renderKeyLimitUI();
      return;
    }
    if (preset === 'clear') {
      allowedKeys.clear();
      settings.keyLimitEnabled = true;
      jipperState.renderedSig = '';
      saveKeyLimitConfig();
      renderKeyLimitUI();
      return;
    }
    const list = KEY_PRESETS[preset];
    if (list) {
      setAllowedKeys(list, true);
    }
  }

  function recordKey(label, code) {
    const nowMs = performance.now();
    keyLog.stamps.push(nowMs);
    while (keyLog.stamps.length && nowMs - keyLog.stamps[0] > 1000) keyLog.stamps.shift();
    if (run.phase === 'playing' && run.stats && keyLog.stamps.length > (run.stats.peakKps || 0)) {
      run.stats.peakKps = keyLog.stamps.length;
    }
    jipperState.totalPresses++;
    if (code) {
      jipperState.keyCounts.set(code, (jipperState.keyCounts.get(code) || 0) + 1);
      autoMapDynamicKey(code, nowMs);
      activeHitKeyUntil.set(code, nowMs + 160);
    }
    keyLog.pills.push(label);
    if (keyLog.pills.length > 8) keyLog.pills.shift();
    renderKeyVisualizer();
    if (code) {
      spawnJipperBeam(code, nowMs);
    }
  }

  function isTypingTarget(t) {
    // 플레이 중에는 어떤 UI 요소가 포커스를 가지고 있더라도 무조건 리듬 판정 입력으로 처리
    if (run.phase === 'playing') return false;
    if (!t) return false;
    if (t.tagName === 'TEXTAREA' || t.isContentEditable) return true;
    // <select>(맵 변경 드롭다운)나 숨겨진 <input type="file">은 타이핑 대상이 아님!
    // 오직 화면에 열려 있는 텍스트/숫자 입력칸(예: 에디터 BPM 입력란)만 예외 허용
    if (t.tagName === 'INPUT') {
      const tp = String(t.type || 'text').toLowerCase();
      if (tp === 'file' || tp === 'button' || tp === 'submit' || tp === 'checkbox' || tp === 'radio' || tp === 'range') {
        return false;
      }
      return t.offsetParent !== null;
    }
    return false;
  }

  function eventPerf() {
    // 브라우저별 e.timeStamp 기준점(Time Origin) 불일치 및 동일 프레임 타임스탬프 역전 방지:
    // performance.now() 단일 시계 기준 + 단조 증가(Monotonic) 보장
    const now = performance.now();
    return now > run.lastKeyPerf ? now : run.lastKeyPerf + 0.01;
  }

  window.addEventListener('keydown', (e) => {
    if (isTypingTarget(e.target)) return;
    if (BROWSER_KEYS.has(e.key)) return;
    if ((e.ctrlKey && e.key !== 'Control') || (e.altKey && e.key !== 'Alt') || (e.metaKey && e.key !== 'Meta')) return;
    e.preventDefault();
    e.stopPropagation();

    // 드롭다운(<select>) 등에 포커스가 남아있다면 즉시 해제하여 키 입력 가로채기 차단
    if (document.activeElement && document.activeElement !== document.body && document.activeElement !== canvas) {
      releaseFocusToGame();
    }

    // 1) Jipper 키뷰어 개별 슬롯 리바인딩 대기 중일 때: 누른 키를 해당 슬롯에 배정하고 키 제한 자동 연동!
    if (jipperState.rebindIndex >= 0) {
      if (e.repeat) return;
      if (e.key === 'Escape' || e.code === 'Escape') {
        cancelSlotRebind();
        return;
      }
      rebindJipperSlot(jipperState.rebindIndex, e);
      return;
    }

    // 2) 키 제한 설정 페이지(#key-limit-panel)가 열려 있을 때: 누른 키를 즉시 허용 목록에 추가/제거
    if (isKeyLimitModalOpen()) {
      if (e.repeat) return;
      if (e.key === 'Escape' || e.code === 'Escape') {
        closeSettingsModal();
        return;
      }
      toggleAllowedKey(e);
      return;
    }

    // 통합 설정 모달의 다른 페이지(플레이 & 환경 / 에디터)가 열려 있을 때 Esc로 닫기
    if (isSettingsModalOpen() && (e.key === 'Escape' || e.code === 'Escape')) {
      closeSettingsModal();
      return;
    }

    // 3) 모달이 닫혀 있을 때 Esc 키를 누르면: 플레이 중이거나 결과창에서 즉시 시작한 위치(run.startFloor)로 나가기!
    if (e.key === 'Escape' || e.code === 'Escape') {
      if (!e.repeat) {
        recordKey('Esc', 'Escape');
        exitToStartFloor();
      }
      return;
    }

    // 4) 게임 플레이 중이 아닐 때:
    // - 좌/우 화살표 키(ArrowLeft / ArrowRight): 타일 간 세부 이동 (누르고 있으면 연속 이동)
    // - 스페이스 바(Space): 현재 선택된 타일(run.startFloor)부터 게임 시작
    // - 그 외의 키는 게임을 시작하지 않되, 키뷰어 테스트(타건감 및 자동 매핑 확인)는 작동!
    if (run.phase !== 'playing') {
      if (e.key === 'ArrowLeft' || e.code === 'ArrowLeft') {
        const step = e.shiftKey ? 10 : 1;
        const base = run.phase === 'idle' ? run.floor : (run.startFloor || 0);
        recordKey('←', 'ArrowLeft');
        seekToFloor(base - step, -1);
        return;
      }
      if (e.key === 'ArrowRight' || e.code === 'ArrowRight') {
        const step = e.shiftKey ? 10 : 1;
        const base = run.phase === 'idle' ? run.floor : (run.startFloor || 0);
        recordKey('→', 'ArrowRight');
        seekToFloor(base + step, 1);
        return;
      }
      if (e.repeat) return;
      if (e.code === 'Space' || e.key === ' ') {
        recordKey('Space', 'Space');
        startRunAtFloor(run.startFloor || 0);
        return;
      }
      // 대기 중에도 허용된 키(또는 자동 감지 모드 키)를 누르면 Jipper 키뷰어 반응 표시
      if (isKeyAllowed(e)) {
        const idleCode = normalizeKeyCode(e);
        if (idleCode) recordKey(codeToLabel(idleCode), idleCode);
      }
      return;
    }

    if (e.repeat) return;
    // 사용자 지정 키 제한이 켜져 있으면 허용된 키만 판정 입력으로 통과
    if (!isKeyAllowed(e)) return;

    const normCode = normalizeKeyCode(e);
    recordKey(codeToLabel(normCode), normCode);
    handleInput(eventPerf());
  }, true);

  window.addEventListener('keyup', (e) => {
    if (isTypingTarget(e.target)) return;
    if (e.ctrlKey || e.metaKey || e.altKey || BROWSER_KEYS.has(e.key)) return;
    e.preventDefault(); // 포커스된 버튼이 Space/Enter로 눌리는 것 방지
    const normCode = normalizeKeyCode(e);
    if (normCode) {
      releaseJipperKey(normCode);
    }
  }, true);

  on(canvas, 'pointerdown', (e) => {
    if (e.button !== 0) return;
    e.preventDefault();
    releaseFocusToGame();
    recordKey('Click');
    handleInput(eventPerf(e));
  });

  // 버튼이 포커스를 가져가지 않게 (키 입력이 버튼을 누르지 않도록)
  document.addEventListener('mousedown', (e) => {
    if (e.target && e.target.closest && e.target.closest('button')) {
      e.preventDefault();
      releaseFocusToGame();
    }
  }, true);

  // =====================================================================
  // 13. MOUSE UI
  // =====================================================================
  function setToggle(btn, label, value) {
    if (!btn) return;
    btn.textContent = `${label}: ${value ? 'ON' : 'OFF'}`;
    btn.classList.toggle('active', value);
  }

  on(el.stageDropdown, 'change', (e) => {
    selectStage(Number(e.target.value));
    releaseFocusToGame();
  });

  on(el.stageSelector, 'click', (e) => {
    const btn = e.target.closest('.stage-btn');
    if (!btn) return;
    selectStage(Number(btn.dataset.stage));
  });

  // 전체 화면 전환
  on(el.btnFullscreen, 'click', () => {
    if (!document.fullscreenElement) {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
      if (el.btnFullscreen) el.btnFullscreen.textContent = '✕ 전체 해제';
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      if (el.btnFullscreen) el.btnFullscreen.textContent = '⛶ 전체 화면';
    }
  });
  document.addEventListener('fullscreenchange', () => {
    if (el.btnFullscreen) {
      el.btnFullscreen.textContent = document.fullscreenElement ? '✕ 전체 해제' : '⛶ 전체 화면';
    }
  });

  // 카메라 시야(기본 줌 배율) 수동 조절
  function updateZoomDisplay() {
    if (el.zoomVal) el.zoomVal.textContent = `${Math.round(settings.userZoomMultiplier * 100)}%`;
  }
  on(el.btnZoomDown, 'click', () => {
    settings.userZoomMultiplier = Math.max(0.4, Math.round((settings.userZoomMultiplier - 0.1) * 10) / 10);
    updateZoomDisplay();
  });
  on(el.btnZoomUp, 'click', () => {
    settings.userZoomMultiplier = Math.min(2.5, Math.round((settings.userZoomMultiplier + 0.1) * 10) / 10);
    updateZoomDisplay();
  });

  // 하단 진행도 바 클릭/드래그 시 게임을 바로 시작하지 않고 해당 타일로 이동만 수행
  let draggingProgress = false;
  function jumpFromProgressEvent(e) {
    if (!level || !el.progressContainer) return;
    const rect = el.progressContainer.getBoundingClientRect();
    if (rect.width <= 0) return;
    const clickRatio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const targetFloor = Math.floor(clickRatio * (level.n - 1));
    seekToFloor(targetFloor, 0);
  }
  on(el.progressContainer, 'pointerdown', (e) => {
    e.preventDefault();
    e.stopPropagation();
    draggingProgress = true;
    jumpFromProgressEvent(e);
  });
  window.addEventListener('pointermove', (e) => {
    if (!draggingProgress) return;
    jumpFromProgressEvent(e);
  });
  window.addEventListener('pointerup', () => {
    draggingProgress = false;
  });

  on(el.btnStart, 'click', () => startRun());
  on(el.btnOverlayStart, 'click', () => startRun());
  on(el.btnPracticeFail, 'click', () => {
    const pf = Number(el.btnPracticeFail && el.btnPracticeFail.dataset.pracFloor);
    seekToFloor(Number.isFinite(pf) ? pf : Math.max(0, (run.floor || 0) - 8), -1);
  });
  on(el.btnStop, 'click', () => stopToIdle());

  on(el.btnAutoplay, 'click', () => {
    settings.autoplay = !settings.autoplay;
    setToggle(el.btnAutoplay, '🤖 오토', settings.autoplay);
  });
  on(el.btnNoFail, 'click', () => {
    settings.noFail = !settings.noFail;
    setToggle(el.btnNoFail, '🛡️ 무적', settings.noFail);
  });
  on(el.btnHitsound, 'click', () => {
    settings.hitsound = !settings.hitsound;
    setToggle(el.btnHitsound, '🥁 타격음', settings.hitsound);
  });
  on(el.btnVfx, 'click', () => {
    settings.vfx = !settings.vfx;
    setToggle(el.btnVfx, '✨ 이펙트', settings.vfx);
  });

  function showOffset() {
    if (el.offsetVal) el.offsetVal.textContent = `${settings.userOffsetMs > 0 ? '+' : ''}${settings.userOffsetMs}ms`;
  }
  on(el.btnOffsetDown, 'click', () => { settings.userOffsetMs -= 10; showOffset(); });
  on(el.btnOffsetUp, 'click', () => { settings.userOffsetMs += 10; showOffset(); });

  function changeSpeed(delta) {
    settings.speed = clamp(Math.round((settings.speed + delta) * 10) / 10, 0.5, 2.0);
    if (el.speedVal) el.speedVal.textContent = `${Math.round(settings.speed * 100)}%`;
    stopToIdle();
  }
  on(el.btnSpeedDown, 'click', () => changeSpeed(-0.1));
  on(el.btnSpeedUp, 'click', () => changeSpeed(0.1));

  function openFilePicker() {
    if (!el.fileInput) return;
    el.fileInput.value = '';
    el.fileInput.click();
  }
  on(el.btnOpenFile, 'click', openFilePicker);
  on(el.btnOverlayOpen, 'click', openFilePicker);
  on(el.fileInput, 'change', (e) => handleImportedFiles(e.target.files));
  window.addEventListener('dragover', (e) => e.preventDefault());
  window.addEventListener('drop', (e) => {
    e.preventDefault();
    if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length) handleImportedFiles(e.dataTransfer.files);
  });

  // ---- 페이지별 통합 사용자 설정 모달 (Unified Multi-Page Settings Modal) ----
  const SETTINGS_PAGES = ['gameplay', 'keylimit', 'editor'];
  let currentSettingsPage = 'gameplay';

  function showSettingsPage(pageName) {
    if (!el.settingsModal) return;
    cancelSlotRebind();
    const target = SETTINGS_PAGES.includes(pageName) ? pageName : 'gameplay';
    currentSettingsPage = target;
    el.settingsModal.classList.remove('hidden');
    if (el.btnSettings) el.btnSettings.classList.add('open');

    if (el.settingsPageGameplay) {
      el.settingsPageGameplay.classList.toggle('hidden', target !== 'gameplay');
    }
    if (el.keyLimitPanel) {
      el.keyLimitPanel.classList.toggle('hidden', target !== 'keylimit');
    }
    if (el.editorPanel) {
      el.editorPanel.classList.toggle('hidden', target !== 'editor');
    }

    // 상단 페이지 탭 버튼 활성화
    if (el.tabPageGameplay) el.tabPageGameplay.classList.toggle('active-tab', target === 'gameplay');
    if (el.btnKeyLimit) el.btnKeyLimit.classList.toggle('active-tab', target === 'keylimit');
    if (el.btnEditor) el.btnEditor.classList.toggle('active-tab', target === 'editor');

    // 페이지 번호 배지 & 하단 도트 업데이트
    const pageIdx = SETTINGS_PAGES.indexOf(target) + 1;
    if (el.settingsPageIndicator) {
      el.settingsPageIndicator.textContent = `${pageIdx} / ${SETTINGS_PAGES.length} 페이지`;
    }
    document.querySelectorAll('.page-dot[data-dot]').forEach((dot) => {
      dot.classList.toggle('active', dot.dataset.dot === target);
    });

    if (target === 'keylimit') {
      renderKeyLimitUI();
    }
    releaseFocusToGame();
  }

  function closeSettingsModal() {
    if (el.settingsModal) el.settingsModal.classList.add('hidden');
    if (el.settingsPageGameplay) el.settingsPageGameplay.classList.add('hidden');
    if (el.keyLimitPanel) el.keyLimitPanel.classList.add('hidden');
    if (el.editorPanel) el.editorPanel.classList.add('hidden');
    if (el.btnSettings) el.btnSettings.classList.remove('open');
    releaseFocusToGame();
  }

  function stepSettingsPage(delta) {
    const curIdx = Math.max(0, SETTINGS_PAGES.indexOf(currentSettingsPage));
    const nextIdx = (curIdx + delta + SETTINGS_PAGES.length) % SETTINGS_PAGES.length;
    showSettingsPage(SETTINGS_PAGES[nextIdx]);
  }

  function openKeyLimitPanel() {
    showSettingsPage('keylimit');
  }
  function closeKeyLimitPanel() {
    closeSettingsModal();
  }

  on(el.btnSettings, 'click', () => {
    if (isSettingsModalOpen()) closeSettingsModal();
    else showSettingsPage(currentSettingsPage || 'gameplay');
  });
  on(el.btnCloseSettings, 'click', closeSettingsModal);
  on(el.tabPageGameplay, 'click', () => showSettingsPage('gameplay'));
  on(el.btnKeyLimit, 'click', () => showSettingsPage('keylimit'));
  on(el.btnEditor, 'click', () => showSettingsPage('editor'));
  on(el.btnSettingsPrev, 'click', () => stepSettingsPage(-1));
  on(el.btnSettingsNext, 'click', () => stepSettingsPage(1));
  document.querySelectorAll('.page-dot[data-dot]').forEach((dot) => {
    on(dot, 'click', () => showSettingsPage(dot.dataset.dot));
  });

  on(el.btnJipperConfig, 'click', (e) => {
    e.stopPropagation();
    if (isKeyLimitModalOpen()) closeSettingsModal();
    else showSettingsPage('keylimit');
  });
  on(el.btnJipperVis, 'click', (e) => {
    e.stopPropagation();
    if (!el.keyVisualizer) return;
    const isHidden = el.keyVisualizer.classList.toggle('hidden');
    setToggle(el.btnJipperVis, '👁️ 키뷰어', !isHidden);
    releaseFocusToGame();
  });
  on(el.btnJipperLock, 'click', (e) => {
    e.stopPropagation();
    if (!settings.keyLimitEnabled) {
      // 현재 Jipper 키뷰어 슬롯에 표시된 키들을 그대로 키 제한(allowedKeys)으로 잠금 연동!
      const currentSlots = jipperState.slots.length > 0 ? jipperState.slots.slice() : KEY_PRESETS['askl'];
      setAllowedKeys(currentSlots, true);
    } else {
      settings.keyLimitEnabled = false;
      jipperState.renderedSig = '';
      saveKeyLimitConfig();
      renderKeyLimitUI();
    }
    releaseFocusToGame();
  });
  on(el.btnJipperPos, 'click', (e) => {
    e.stopPropagation();
    jipperState.dockRight = !jipperState.dockRight;
    if (el.keyVisualizer) {
      el.keyVisualizer.style.left = '';
      el.keyVisualizer.style.top = '';
      el.keyVisualizer.style.right = '';
      el.keyVisualizer.style.bottom = '';
    }
    saveKeyLimitConfig();
    renderKeyVisualizer();
    releaseFocusToGame();
  });

  // Jipper 키뷰어 상단 헤더 드래그 이동 지원
  let draggingJipper = false;
  let jipperDragOffX = 0;
  let jipperDragOffY = 0;
  on(el.jipperDragHandle, 'pointerdown', (e) => {
    if (e.target && e.target.closest && e.target.closest('button')) return;
    if (!el.keyVisualizer) return;
    e.preventDefault();
    const rect = el.keyVisualizer.getBoundingClientRect();
    draggingJipper = true;
    jipperDragOffX = e.clientX - rect.left;
    jipperDragOffY = e.clientY - rect.top;
  });
  window.addEventListener('pointermove', (e) => {
    if (!draggingJipper || !el.keyVisualizer) return;
    const rect = el.keyVisualizer.getBoundingClientRect();
    const nx = clamp(e.clientX - jipperDragOffX, 8, Math.max(8, window.innerWidth - rect.width - 8));
    const ny = clamp(e.clientY - jipperDragOffY, 8, Math.max(8, window.innerHeight - rect.height - 8));
    el.keyVisualizer.classList.remove('dock-right');
    el.keyVisualizer.style.left = `${Math.round(nx)}px`;
    el.keyVisualizer.style.top = `${Math.round(ny)}px`;
    el.keyVisualizer.style.right = 'auto';
    el.keyVisualizer.style.bottom = 'auto';
  });
  window.addEventListener('pointerup', () => {
    draggingJipper = false;
  });

  on(el.btnCloseKeyLimit, 'click', closeSettingsModal);
  on(el.btnDoneKeyLimit, 'click', closeSettingsModal);
  on(el.btnToggleKeyLimit, 'click', () => {
    settings.keyLimitEnabled = !settings.keyLimitEnabled;
    if (settings.keyLimitEnabled && allowedKeys.size === 0) {
      // 처음 켤 때 등록된 키가 하나도 없으면 현재 키뷰어 슬롯(또는 기본 4키)으로 연동
      const fallback = jipperState.slots.length > 0 ? jipperState.slots : KEY_PRESETS['4k'];
      for (const c of fallback) allowedKeys.add(c);
    }
    jipperState.renderedSig = '';
    saveKeyLimitConfig();
    renderKeyLimitUI();
    releaseFocusToGame();
  });
  document.querySelectorAll('.kl-preset-btn[data-kl-preset]').forEach((btn) => {
    on(btn, 'click', () => {
      applyKeyPreset(btn.dataset.klPreset);
      releaseFocusToGame();
    });
  });

  // ---- 에디터 ----
  on(el.btnCloseEditor, 'click', closeSettingsModal);

  function showCustom() {
    if (el.customStageBtn) {
      el.customStageBtn.style.display = 'inline-block';
      el.customStageBtn.dataset.stage = String(CUSTOM_STAGE_INDEX);
    }
    selectStage(CUSTOM_STAGE_INDEX);
    const last = level.floors[level.n - 1];
    cam.x = last.x;
    cam.y = last.y;
  }

  on(el.editorBpm, 'change', () => {
    STAGES[CUSTOM_STAGE_INDEX].bpm = clamp(Number(el.editorBpm.value) || 140, 40, 600);
    if (stageIndex === CUSTOM_STAGE_INDEX) stopToIdle();
  });
  document.querySelectorAll('.dir-btn[data-angle]').forEach((b) => {
    on(b, 'click', () => {
      STAGES[CUSTOM_STAGE_INDEX].steps.push({ a: Number(b.dataset.angle) });
      showCustom();
    });
  });
  on(el.btnUndoTile, 'click', () => {
    const steps = STAGES[CUSTOM_STAGE_INDEX].steps;
    if (steps.length > 2) steps.pop();
    showCustom();
  });
  document.querySelectorAll('.gimmick-btn').forEach((b) => {
    on(b, 'click', () => {
      const steps = STAGES[CUSTOM_STAGE_INDEX].steps;
      const last = steps[steps.length - 1];
      if (!last) return;
      if (b.dataset.type === 'none') delete last.type;
      else last.type = b.dataset.type;
      showCustom();
    });
  });
  on(el.btnClearEditor, 'click', () => {
    STAGES[CUSTOM_STAGE_INDEX].steps = [{ a: 0 }, { a: 0 }, { a: 0 }];
    showCustom();
  });
  on(el.btnPlayCustom, 'click', () => {
    closeSettingsModal();
    showCustom();
    startRun();
  });

  // =====================================================================
  // 14. FILE IMPORT (.zip / .adofai / 음악 / 이미지)
  // =====================================================================
  async function inflateRaw(bytes) {
    if (typeof DecompressionStream === 'undefined') throw new Error('이 브라우저는 ZIP 압축 해제를 지원하지 않습니다. (최신 Chrome/Edge 사용)');
    const ds = new DecompressionStream('deflate-raw');
    const stream = new Blob([bytes]).stream().pipeThrough(ds);
    return new Uint8Array(await new Response(stream).arrayBuffer());
  }

  async function unzip(arrayBuffer) {
    const view = new DataView(arrayBuffer);
    const bytes = new Uint8Array(arrayBuffer);
    let eocd = -1;
    for (let i = bytes.length - 22; i >= Math.max(0, bytes.length - 65557); i--) {
      if (view.getUint32(i, true) === 0x06054b50) { eocd = i; break; }
    }
    if (eocd < 0) throw new Error('올바른 ZIP 파일이 아닙니다.');
    const count = view.getUint16(eocd + 10, true);
    let ptr = view.getUint32(eocd + 16, true);
    const utf8 = new TextDecoder('utf-8');
    const files = [];
    for (let i = 0; i < count; i++) {
      if (view.getUint32(ptr, true) !== 0x02014b50) break;
      const method = view.getUint16(ptr + 10, true);
      const csize = view.getUint32(ptr + 20, true);
      const nameLen = view.getUint16(ptr + 28, true);
      const extraLen = view.getUint16(ptr + 30, true);
      const commentLen = view.getUint16(ptr + 32, true);
      const localOff = view.getUint32(ptr + 42, true);
      const fullName = utf8.decode(bytes.subarray(ptr + 46, ptr + 46 + nameLen));
      ptr += 46 + nameLen + extraLen + commentLen;
      if (fullName.endsWith('/') || fullName.includes('__MACOSX')) continue;
      if (view.getUint32(localOff, true) !== 0x04034b50) continue;
      const lNameLen = view.getUint16(localOff + 26, true);
      const lExtraLen = view.getUint16(localOff + 28, true);
      const start = localOff + 30 + lNameLen + lExtraLen;
      const raw = bytes.subarray(start, start + csize);
      let data;
      if (method === 0) data = raw;
      else if (method === 8) data = await inflateRaw(raw);
      else continue;
      files.push({ name: fullName.split(/[\\/]/).pop(), data });
    }
    return files;
  }

  function audioMime(name) {
    if (/\.ogg$/i.test(name)) return 'audio/ogg';
    if (/\.mp3$/i.test(name)) return 'audio/mpeg';
    if (/\.wav$/i.test(name)) return 'audio/wav';
    if (/\.flac$/i.test(name)) return 'audio/flac';
    return '';
  }

  async function handleImportedFiles(fileList) {
    if (!fileList || !fileList.length) return;
    try {
      const maps = [];
      const audio = new Map();
      const images = new Map();
      let firstAudio = null;
      let firstImage = null;
      const addAudio = (name, url) => { audio.set(name.toLowerCase(), url); if (!firstAudio) firstAudio = url; };
      const addImage = (name, url) => { images.set(name.toLowerCase(), url); if (!firstImage) firstImage = url; };

      for (const file of fileList) {
        const lower = file.name.toLowerCase();
        if (lower.endsWith('.zip')) {
          const entries = await unzip(await file.arrayBuffer());
          for (const en of entries) {
            const ln = en.name.toLowerCase();
            if (ln.endsWith('.adofai')) maps.push({ name: en.name, text: new TextDecoder('utf-8').decode(en.data) });
            else if (/\.(ogg|mp3|wav|flac)$/.test(ln)) addAudio(en.name, URL.createObjectURL(new Blob([en.data], { type: audioMime(ln) })));
            else if (/\.(jpg|jpeg|png|webp|gif|bmp)$/.test(ln)) addImage(en.name, URL.createObjectURL(new Blob([en.data])));
          }
        } else if (lower.endsWith('.adofai')) {
          maps.push({ name: file.name, text: await file.text() });
        } else if (/\.(ogg|mp3|wav|flac)$/.test(lower)) {
          addAudio(file.name, URL.createObjectURL(file));
        } else if (/\.(jpg|jpeg|png|webp|gif|bmp)$/.test(lower)) {
          addImage(file.name, URL.createObjectURL(file));
        }
      }

      if (!maps.length) {
        alert('.adofai 맵 파일을 찾지 못했습니다. (.zip 압축 파일 또는 .adofai 파일을 선택하세요)');
        return;
      }

      let firstIdx = -1;
      for (const m of maps) {
        const data = parseAdofaiJson(m.text);
        const s = data.settings || {};
        const audioUrl = audio.get(String(s.songFilename || '').toLowerCase()) || firstAudio;
        const bgUrl = images.get(String(s.bgImage || '').toLowerCase()) || firstImage;
        const idx = STAGES.length;
        const st = { kind: 'adofai', title: m.name, data, audioUrl, bgUrl, theme: ['#070b19', '#111b36', '#38bdf8'] };
        STAGES.push(st);
        const def = stageDef(st);
        const labelText = `📂 ${def.title} (${m.name.replace(/\.adofai$/i, '')})`;
        if (el.optImported) {
          const opt = document.createElement('option');
          opt.value = String(idx);
          opt.textContent = labelText;
          el.optImported.appendChild(opt);
        }
        if (el.importedStages) {
          const btn = document.createElement('button');
          btn.className = 'stage-btn';
          btn.dataset.stage = String(idx);
          btn.textContent = labelText;
          el.importedStages.appendChild(btn);
        }
        if (firstIdx < 0) firstIdx = idx;
        if (!audioUrl) console.warn('음악 파일 없음:', m.name);
      }
      selectStage(firstIdx);
      releaseFocusToGame();
      if (!STAGES[firstIdx].audioUrl) {
        showOverlay(level.def.title, '⚠️ 음악 파일이 없어 무음으로 진행됩니다. (.zip 또는 음악 파일을 함께 선택하세요) — [▶️ 게임 시작]');
      }
    } catch (err) {
      console.error(err);
      alert('맵 파일을 여는 중 오류가 발생했습니다: ' + (err && err.message ? err.message : err));
    }
  }

  // =====================================================================
  // 15. BOOT
  // =====================================================================
  if (canvas) {
    canvas.tabIndex = -1;
    canvas.style.outline = 'none';
  }
  buildMiniKeyboardGrid();
  loadKeyLimitConfig();
  renderKeyLimitUI();
  window.addEventListener('resize', resize);
  resize();
  selectStage(0);

  let lastPerf = performance.now();
  function frame(perf) {
    const dt = Math.min(0.05, Math.max(0, (perf - lastPerf) / 1000));
    lastPerf = perf;
    try {
      update(dt, perf);
      render(perf);
      updateHud(false);
    } catch (err) {
      console.error(err);
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  // 디버그/테스트용
  window.__adofai = {
    STAGES, settings, run, cam, fx, hitMeter, allowedKeys, jipperState,
    get level() { return level; },
    get stageIndex() { return stageIndex; },
    get currentSettingsPage() { return currentSettingsPage; },
    selectStage, seekToFloor, exitToStartFloor, startRun, startRunAtFloor, stopToIdle, handleInput, update, render, songNow, windowsFor,
    compileLevel, defFromAdofai, pathToAngles, formatSpeedRatio,
    evalCameraState, evalVisualEffects, evalVisibleTileStates, evalTileColor, resolveTileRef,
    isKeyAllowed, toggleAllowedKey, setAllowedKeys, applyKeyPreset, normalizeKeyCode,
    startSlotRebind, rebindJipperSlot, cancelSlotRebind,
    showSettingsPage, closeSettingsModal, stepSettingsPage
  };
})();
