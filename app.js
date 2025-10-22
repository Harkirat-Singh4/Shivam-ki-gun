/* AI Sniper Detection System - Interface Only (No backend required)
   This file implements the SPA router, UI interactions, demo detections,
   overlays, simple zone editor, and basic persistence via localStorage. */

(function () {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const routes = {
    dashboard: renderDashboard,
    live: renderLive,
    analyze: renderAnalyze,
    events: renderEvents,
    settings: renderSettings,
    help: renderHelp,
  };

  const state = {
    currentRoute: 'dashboard',
    demoMode: false,
    zones: loadJson('sniper.zones', []),
    settings: loadJson('sniper.settings', {
      threshold: 0.5,
      iou: 0.45,
      soundAlerts: true,
      browserAlerts: false,
      recordEvents: true,
      apiEndpoint: '',
    }),
    events: loadJson('sniper.events', []),
  };

  // --- Utilities ---
  function saveJson(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
  }
  function loadJson(key, fallback) {
    try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; }
  }
  function toast(title, desc = '') {
    const el = $('#toast');
    el.innerHTML = `<div class="title">${title}</div>${desc ? `<div class="desc">${desc}</div>` : ''}`;
    el.classList.add('show');
    setTimeout(() => el.classList.remove('show'), 2200);
  }
  function setStatus(online, text) {
    const dot = $('#statusDot');
    const txt = $('#statusText');
    dot.classList.toggle('online', !!online);
    txt.textContent = text || (online ? 'Connected' : 'Disconnected');
  }
  function setRoute(route) {
    state.currentRoute = route;
    window.location.hash = `#${route}`;
    $$('#app .nav-item').forEach(a => a.classList.toggle('is-active', a.dataset.route === route));
    $('#routeTitle').textContent = titleCase(route);
    const tpl = $(`#tpl-${route}`);
    $('#view').innerHTML = tpl ? tpl.innerHTML : '<p>Not found.</p>';
    // attach handlers for this view
    switch (route) {
      case 'dashboard':
        attachDashboard(); break;
      case 'live':
        attachLive(); break;
      case 'analyze':
        attachAnalyze(); break;
      case 'events':
        attachEvents(); break;
      case 'settings':
        attachSettings(); break;
      case 'help':
        attachHelp(); break;
    }
  }
  function titleCase(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  function formatPct(p) { return `${(p * 100).toFixed(1)}%`; }
  function formatTime(ts) { const d = new Date(ts); return d.toLocaleString(); }

  // --- Router & nav ---
  function initRouter() {
    const initial = (window.location.hash || '#dashboard').slice(1);
    $$('#app .nav-item').forEach(a => {
      a.addEventListener('click', (e) => {
        e.preventDefault();
        setRoute(a.dataset.route);
      });
    });
    $('#demoToggle').addEventListener('click', () => {
      state.demoMode = !state.demoMode;
      const chk = $('#demoModeToggle');
      if (chk) { chk.checked = state.demoMode; }
      toast('Demo Mode', state.demoMode ? 'On' : 'Off');
      setStatus(state.demoMode, state.demoMode ? 'Demo Connected' : 'Disconnected');
      if (state.currentRoute === 'live') { startDemoDetections(); }
    });
    setRoute(initial in routes ? initial : 'dashboard');
  }

  // --- Dashboard ---
  function renderDashboard() {}
  function attachDashboard() {
    setStatus(state.demoMode, state.demoMode ? 'Demo Connected' : 'Disconnected');
    // Metrics table from results.csv if available
    fetch('./results.csv').then(r => r.ok ? r.text() : Promise.reject()).then(csv => {
      const rows = csv.trim().split(/\r?\n/).map(l => l.split(','));
      if (!rows.length) return;
      const headers = rows[0];
      const tbl = document.createElement('table');
      tbl.className = 'table';
      const thead = document.createElement('thead');
      thead.innerHTML = `<tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>`;
      const tbody = document.createElement('tbody');
      rows.slice(1).forEach(r => {
        const tr = document.createElement('tr');
        tr.innerHTML = r.map(c => `<td>${c}</td>`).join('');
        tbody.appendChild(tr);
      });
      tbl.append(thead, tbody);
      $('#metricsTableWrap').innerHTML = '';
      $('#metricsTableWrap').appendChild(tbl);
    }).catch(() => {
      $('#metricsTableWrap').innerHTML = '<div class="hint">results.csv not found or unreadable.</div>';
    });

    // Quick action buttons to navigate
    $$('[data-nav]').forEach(btn => btn.addEventListener('click', () => {
      const to = btn.getAttribute('data-nav');
      if (to) window.location.hash = to;
      const route = to?.slice(1) || 'dashboard';
      setRoute(route);
    }));
  }

  // --- Live Monitor ---
  let liveCtx, liveCanvas, videoEl, zoneCanvas, zoneCtx;
  let videoStream = null;
  let detectionTimer = null;
  let currentZones = [];

  function renderLive() {}
  function attachLive() {
    setStatus(state.demoMode, state.demoMode ? 'Demo Connected' : 'Disconnected');

    videoEl = $('#liveVideo');
    liveCanvas = $('#liveCanvas');
    zoneCanvas = $('#zoneCanvas');
    liveCtx = liveCanvas.getContext('2d');
    zoneCtx = zoneCanvas.getContext('2d');

    currentZones = [...state.zones];
    fitCanvasesToStage(videoEl, [liveCanvas, zoneCanvas]);
    drawZones();

    window.addEventListener('resize', () => fitCanvasesToStage(videoEl, [liveCanvas, zoneCanvas]));

    $('#startCamBtn').addEventListener('click', startCamera);
    $('#stopCamBtn').addEventListener('click', stopCamera);
    $('#videoFileInput').addEventListener('change', onVideoFile);

    const apiInput = $('#apiEndpoint');
    apiInput.value = state.settings.apiEndpoint || '';
    apiInput.addEventListener('change', () => { state.settings.apiEndpoint = apiInput.value; persistSettings(); });

    const demoToggle = $('#demoModeToggle');
    if (demoToggle) {
      demoToggle.checked = state.demoMode; 
      demoToggle.addEventListener('change', () => { state.demoMode = demoToggle.checked; toast('Demo Mode', state.demoMode ? 'On' : 'Off'); setStatus(state.demoMode, state.demoMode ? 'Demo Connected' : 'Disconnected'); });
    }

    $('#resetConnectionBtn').addEventListener('click', () => {
      setStatus(false, 'Disconnected'); clearInterval(detectionTimer); detectionTimer = null; toast('Connection reset');
    });

    // Zone Editing
    const zoneEditToggle = $('#zoneEditToggle');
    zoneEditToggle.addEventListener('change', () => {
      zoneCanvas.style.pointerEvents = zoneEditToggle.checked ? 'auto' : 'none';
    });
    $('#clearZonesBtn').addEventListener('click', () => { currentZones = []; persistZones(); drawZones(); });
    initZoneEditor(zoneCanvas);

    // Simulated detection loop in demo mode
    startDemoDetections();
  }

  function fitCanvasesToStage(stageEl, canvases) {
    requestAnimationFrame(() => {
      const rect = stageEl.getBoundingClientRect();
      canvases.forEach(c => { c.width = rect.width; c.height = rect.height; });
    });
  }

  async function startCamera() {
    try {
      videoStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
      videoEl.srcObject = videoStream; await videoEl.play();
      $('#stopCamBtn').disabled = false; toast('Camera started');
    } catch (e) {
      toast('Camera error', e.message || String(e));
    }
  }

  function stopCamera() {
    if (videoStream) { videoStream.getTracks().forEach(t => t.stop()); videoStream = null; }
    videoEl.pause(); videoEl.srcObject = null; $('#stopCamBtn').disabled = true; toast('Camera stopped');
  }

  function onVideoFile(ev) {
    const file = ev.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    videoEl.src = url; videoEl.play(); $('#stopCamBtn').disabled = false;
  }

  function drawDetections(dets) {
    const ctx = liveCtx; if (!ctx) return;
    ctx.clearRect(0, 0, liveCanvas.width, liveCanvas.height);
    ctx.lineWidth = 2; ctx.font = '12px ui-sans-serif';
    dets.forEach(d => {
      const [x, y, w, h] = d.bbox;
      const score = d.score;
      ctx.strokeStyle = 'rgba(239,68,68,0.9)';
      ctx.fillStyle = 'rgba(239,68,68,0.15)';
      ctx.beginPath(); ctx.rect(x, y, w, h); ctx.fill(); ctx.stroke();
      const label = `${d.label} ${Math.round(score * 100)}%`;
      const tw = ctx.measureText(label).width + 8;
      ctx.fillStyle = 'rgba(239,68,68,0.9)'; ctx.fillRect(x, Math.max(0, y - 18), tw, 18);
      ctx.fillStyle = '#fff'; ctx.fillText(label, x + 4, Math.max(12, y - 6));
    });
  }

  function addDetectionEvent(snapDataUrl, det) {
    const event = {
      id: Date.now() + '-' + Math.random().toString(36).slice(2, 6),
      time: Date.now(),
      score: det.score,
      label: det.label,
      bbox: det.bbox,
      snapshot: snapDataUrl,
    };
    state.events.unshift(event);
    if (state.events.length > 200) state.events.pop();
    saveJson('sniper.events', state.events);
  }

  function snapshotWithOverlay() {
    const canvas = document.createElement('canvas');
    canvas.width = liveCanvas.width; canvas.height = liveCanvas.height;
    const ctx = canvas.getContext('2d');
    // Draw base frame
    try {
      ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);
    } catch {}
    // Draw overlay
    ctx.drawImage(liveCanvas, 0, 0);
    return canvas.toDataURL('image/jpeg', 0.85);
  }

  function startDemoDetections() {
    clearInterval(detectionTimer);
    if (!state.demoMode) return; // only when demo enabled
    const list = $('#detectionsList');
    detectionTimer = setInterval(() => {
      if (!document.body.contains(list)) { clearInterval(detectionTimer); return; }
      const w = liveCanvas.width, h = liveCanvas.height;
      if (!w || !h) return;
      const bw = 120 + Math.random() * 160;
      const bh = 40 + Math.random() * 80;
      const x = Math.random() * (w - bw);
      const y = Math.random() * (h - bh);
      const score = 0.6 + Math.random() * 0.35;
      const det = { label: 'sniper', score, bbox: [x, y, bw, bh] };
      drawDetections([det]);
      // list item
      const li = document.createElement('li');
      li.innerHTML = `<span class="badge ${score >= state.settings.threshold ? 'err' : 'warn'}">${Math.round(score * 100)}%</span><div>${det.label}</div><time>${new Date().toLocaleTimeString()}</time>`;
      list.prepend(li); while (list.children.length > 50) list.removeChild(list.lastChild);

      // Record event if enabled and above threshold
      if (state.settings.recordEvents && score >= state.settings.threshold) {
        const snap = snapshotWithOverlay();
        addDetectionEvent(snap, det);
        if (state.settings.soundAlerts) playBeep();
        if (state.settings.browserAlerts) notifyBrowser('Sniper detected', `${Math.round(score*100)}% confidence`);
      }
    }, 1500);
  }

  function playBeep() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const o = ctx.createOscillator(); const g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination); o.type = 'square'; o.frequency.value = 880; g.gain.setValueAtTime(0.001, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.01);
      o.start(); setTimeout(() => { g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05); o.stop(ctx.currentTime + 0.08); }, 80);
    } catch {}
  }

  function notifyBrowser(title, body) {
    if (!('Notification' in window)) return;
    if (Notification.permission === 'granted') new Notification(title, { body });
    else if (Notification.permission !== 'denied') Notification.requestPermission();
  }

  // --- Zone editor ---
  function persistZones() { state.zones = [...currentZones]; saveJson('sniper.zones', state.zones); }

  function drawZones() {
    zoneCtx.clearRect(0, 0, zoneCanvas.width, zoneCanvas.height);
    zoneCtx.lineWidth = 2; zoneCtx.strokeStyle = 'rgba(59,130,246,0.9)'; zoneCtx.fillStyle = 'rgba(59,130,246,0.12)';
    currentZones.forEach(poly => {
      if (poly.length < 2) return;
      zoneCtx.beginPath(); zoneCtx.moveTo(poly[0].x, poly[0].y);
      for (let i = 1; i < poly.length; i++) zoneCtx.lineTo(poly[i].x, poly[i].y);
      zoneCtx.closePath(); zoneCtx.fill(); zoneCtx.stroke();
    });
  }

  function initZoneEditor(canvas) {
    let drawing = false; let currentPoly = [];
    canvas.addEventListener('pointerdown', (e) => {
      if (canvas.style.pointerEvents !== 'auto') return;
      drawing = true; currentPoly = [];
      const p = getPos(e, canvas); currentPoly.push(p); currentPoly.push(p);
      draw();
    });
    canvas.addEventListener('pointermove', (e) => {
      if (!drawing) return; const p = getPos(e, canvas); currentPoly[currentPoly.length - 1] = p; draw();
    });
    canvas.addEventListener('dblclick', (e) => {
      if (!drawing) return; drawing = false; if (currentPoly.length > 2) { currentZones.push(currentPoly); persistZones(); drawZones(); }
      currentPoly = []; draw();
    });
    canvas.addEventListener('pointerup', (e) => {
      if (!drawing) return; const p = getPos(e, canvas); currentPoly.push(p); draw();
    });

    function draw() {
      drawZones();
      if (!currentPoly.length) return;
      zoneCtx.lineWidth = 1; zoneCtx.setLineDash([4, 4]); zoneCtx.strokeStyle = 'rgba(255,255,255,0.6)';
      zoneCtx.beginPath(); zoneCtx.moveTo(currentPoly[0].x, currentPoly[0].y);
      for (let i = 1; i < currentPoly.length; i++) zoneCtx.lineTo(currentPoly[i].x, currentPoly[i].y);
      zoneCtx.stroke(); zoneCtx.setLineDash([]);
    }
  }

  function getPos(e, canvas) {
    const r = canvas.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }

  // --- Analyze ---
  function renderAnalyze() {}
  function attachAnalyze() {
    const img = $('#analyzeImage');
    const vid = $('#analyzeVideo');
    const canvas = $('#analyzeCanvas');
    const ctx = canvas.getContext('2d');
    const fileInput = $('#analyzeFile');
    const runBtn = $('#runAnalyzeBtn');
    const exportBtn = $('#exportAnnotatedBtn');
    const threshInput = $('#analyzeThreshold');
    const resultsList = $('#analyzeResults');

    function fit() {
      const stage = img.classList.contains('hidden') ? vid : img;
      const rect = stage.getBoundingClientRect(); canvas.width = rect.width; canvas.height = rect.height; draw();
    }

    function draw(dets = []) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.lineWidth = 2; ctx.font = '12px ui-sans-serif';
      dets.forEach(d => {
        const [x, y, w, h] = d.bbox; const score = d.score;
        ctx.strokeStyle = 'rgba(239,68,68,0.9)'; ctx.fillStyle = 'rgba(239,68,68,0.15)';
        ctx.beginPath(); ctx.rect(x, y, w, h); ctx.fill(); ctx.stroke();
        const label = `${d.label} ${Math.round(score * 100)}%`;
        const tw = ctx.measureText(label).width + 8;
        ctx.fillStyle = 'rgba(239,68,68,0.9)'; ctx.fillRect(x, Math.max(0, y - 18), tw, 18);
        ctx.fillStyle = '#fff'; ctx.fillText(label, x + 4, Math.max(12, y - 6));
      });
    }

    function fakeDetections(w, h) {
      const boxes = [];
      const n = 1 + Math.floor(Math.random() * 3);
      for (let i = 0; i < n; i++) {
        const bw = 80 + Math.random() * 180; const bh = 30 + Math.random() * 80;
        const x = Math.random() * (w - bw); const y = Math.random() * (h - bh);
        boxes.push({ label: 'sniper', score: 0.55 + Math.random() * 0.4, bbox: [x, y, bw, bh] });
      }
      return boxes;
    }

    function run() {
      const stage = img.classList.contains('hidden') ? vid : img;
      const rect = stage.getBoundingClientRect();
      const dets = fakeDetections(rect.width, rect.height).filter(d => d.score >= (parseFloat(threshInput.value) || state.settings.threshold));
      draw(dets);
      // Save thumbnail result
      const c2 = document.createElement('canvas'); c2.width = canvas.width; c2.height = canvas.height; const c2x = c2.getContext('2d');
      try { c2x.drawImage(stage, 0, 0, c2.width, c2.height); } catch {}
      c2x.drawImage(canvas, 0, 0);
      const thumb = c2.toDataURL('image/jpeg', 0.8);
      const item = { id: Date.now(), time: Date.now(), thumb, num: dets.length };
      const li = document.createElement('li');
      li.innerHTML = `<img src="${thumb}" alt="" style="width:88px;height:56px;object-fit:cover;border-radius:6px;border:1px solid var(--border)"> <div>${item.num} detections</div> <time>${new Date(item.time).toLocaleTimeString()}</time>`;
      resultsList.prepend(li);
      while (resultsList.children.length > 30) resultsList.removeChild(resultsList.lastChild);
      exportBtn.disabled = false;
    }

    fileInput.addEventListener('change', () => {
      const f = fileInput.files?.[0]; if (!f) return; exportBtn.disabled = true;
      const url = URL.createObjectURL(f);
      if (f.type.startsWith('video/')) {
        img.classList.add('hidden'); vid.classList.remove('hidden'); vid.src = url; vid.addEventListener('loadeddata', fit, { once: true });
      } else {
        vid.classList.add('hidden'); img.classList.remove('hidden'); img.src = url; img.onload = fit;
      }
      runBtn.disabled = false;
    });

    runBtn.addEventListener('click', run);
    exportBtn.addEventListener('click', () => {
      const c2 = document.createElement('canvas'); c2.width = canvas.width; c2.height = canvas.height; const c2x = c2.getContext('2d');
      try { const stage = img.classList.contains('hidden') ? vid : img; c2x.drawImage(stage, 0, 0, c2.width, c2.height); } catch {}
      c2x.drawImage(canvas, 0, 0);
      const a = document.createElement('a'); a.href = c2.toDataURL('image/png'); a.download = `annotated-${Date.now()}.png`; a.click();
    });

    window.addEventListener('resize', fit);
  }

  // --- Events ---
  function renderEvents() {}
  function attachEvents() {
    const grid = $('#eventsGrid');
    const filter = $('#eventFilter');
    function render() {
      const q = (filter.value || '').toLowerCase();
      grid.innerHTML = '';
      state.events.filter(e => !q || e.label.includes(q)).forEach(e => {
        const card = document.createElement('div'); card.className = 'event';
        card.innerHTML = `<img src="${e.snapshot}" alt="Event snapshot"><div class="meta"><span>${new Date(e.time).toLocaleString()}</span><span class="badge err">${Math.round(e.score*100)}%</span></div>`;
        grid.appendChild(card);
      });
    }
    filter.addEventListener('input', render);
    $('#clearEventsBtn').addEventListener('click', () => { state.events = []; saveJson('sniper.events', state.events); render(); });
    render();
  }

  // --- Settings ---
  function renderSettings() {}
  function attachSettings() {
    const th = $('#threshold'); const thOut = $('#thresholdOut'); th.value = state.settings.threshold; thOut.textContent = formatPct(state.settings.threshold);
    const iou = $('#iou'); const iouOut = $('#iouOut'); iou.value = state.settings.iou; iouOut.textContent = formatPct(state.settings.iou);
    const sound = $('#soundAlerts'); const browserN = $('#browserAlerts'); const record = $('#recordEvents');
    sound.checked = !!state.settings.soundAlerts; browserN.checked = !!state.settings.browserAlerts; record.checked = !!state.settings.recordEvents;

    function bindRange(input, out, key) {
      const sync = () => { const v = parseFloat(input.value); out.textContent = formatPct(v); state.settings[key] = v; persistSettings(); };
      input.addEventListener('input', sync); input.addEventListener('change', sync);
    }
    bindRange(th, thOut, 'threshold');
    bindRange(iou, iouOut, 'iou');

    sound.addEventListener('change', () => { state.settings.soundAlerts = sound.checked; persistSettings(); });
    browserN.addEventListener('change', () => { state.settings.browserAlerts = browserN.checked; persistSettings(); });
    record.addEventListener('change', () => { state.settings.recordEvents = record.checked; persistSettings(); });
  }

  function persistSettings() { saveJson('sniper.settings', state.settings); }

  // --- Help ---
  function renderHelp() {}
  function attachHelp() {}

  // Init app
  window.addEventListener('hashchange', () => {
    const route = (window.location.hash || '#dashboard').slice(1);
    if (route in routes) setRoute(route);
  });

  document.addEventListener('DOMContentLoaded', () => {
    initRouter();
  });
})();
