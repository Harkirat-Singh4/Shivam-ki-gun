const statusEl = document.getElementById('status');
const video = document.getElementById('camera');
const overlay = document.getElementById('overlay');
const toggleCamBtn = document.getElementById('toggleCam');
const fileInput = document.getElementById('file');
const detectBtn = document.getElementById('detectBtn');
const confSlider = document.getElementById('conf');
const confVal = document.getElementById('confVal');
const iouSlider = document.getElementById('iou');
const iouVal = document.getElementById('iouVal');
const alerts = document.getElementById('alerts');
const log = document.getElementById('log');

let streamActive = false;
let lastFrameBlob = null;
let roiNorm = null; // [x1,y1,x2,y2] normalized

function setStatus(text, ok = true) {
  statusEl.textContent = text;
  statusEl.style.color = ok ? '#9fb0c3' : '#ff6b6b';
}

async function checkHealth() {
  try {
    const res = await fetch('/api/health');
    const data = await res.json();
    if (data.status === 'ok') {
      setStatus('Model ready');
    } else {
      setStatus('Loading model…');
    }
  } catch (e) {
    setStatus('Backend unreachable', false);
  }
}

checkHealth();
setInterval(checkHealth, 5000);

confSlider.addEventListener('input', () => confVal.textContent = confSlider.value);
iouSlider.addEventListener('input', () => iouVal.textContent = iouSlider.value);

async function enableCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720 } });
    video.srcObject = stream;
    streamActive = true;
    toggleCamBtn.textContent = 'Disable Camera';
  } catch (e) {
    setStatus('Camera permission denied', false);
  }
}

function disableCamera() {
  const stream = video.srcObject;
  if (stream) {
    for (const track of stream.getTracks()) track.stop();
  }
  video.srcObject = null;
  streamActive = false;
  toggleCamBtn.textContent = 'Enable Camera';
}

toggleCamBtn.addEventListener('click', () => {
  if (streamActive) disableCamera(); else enableCamera();
});

fileInput.addEventListener('change', async () => {
  const file = fileInput.files[0];
  if (!file) return;
  lastFrameBlob = file;
  drawImageOnOverlay(await createImageBitmap(file));
});

video.addEventListener('play', () => {
  overlay.width = video.clientWidth;
  overlay.height = video.clientHeight;
});

function drawImageOnOverlay(bitmap) {
  overlay.width = bitmap.width;
  overlay.height = bitmap.height;
  const ctx = overlay.getContext('2d');
  ctx.clearRect(0,0,overlay.width, overlay.height);
  ctx.drawImage(bitmap, 0, 0);
}

// ROI drawing
let isDrawing = false;
let startX = 0, startY = 0;
let endX = 0, endY = 0;

overlay.addEventListener('mousedown', (e) => {
  isDrawing = true;
  const rect = overlay.getBoundingClientRect();
  startX = e.clientX - rect.left;
  startY = e.clientY - rect.top;
});

window.addEventListener('mouseup', () => {
  if (!isDrawing) return;
  isDrawing = false;
  const w = overlay.width, h = overlay.height;
  const x1 = Math.max(0, Math.min(startX, endX));
  const y1 = Math.max(0, Math.min(startY, endY));
  const x2 = Math.min(w, Math.max(startX, endX));
  const y2 = Math.min(h, Math.max(startY, endY));
  roiNorm = [x1/w, y1/h, x2/w, y2/h];
});

overlay.addEventListener('mousemove', (e) => {
  if (!isDrawing) return;
  const rect = overlay.getBoundingClientRect();
  endX = e.clientX - rect.left;
  endY = e.clientY - rect.top;
  renderOverlay();
});

function renderOverlay(dets = []) {
  const ctx = overlay.getContext('2d');
  ctx.clearRect(0,0,overlay.width, overlay.height);

  // draw ROI
  if (roiNorm) {
    ctx.strokeStyle = '#45a1ff';
    ctx.setLineDash([6, 4]);
    ctx.lineWidth = 2;
    ctx.fillStyle = 'rgba(69,161,255,0.1)';
    const [x1n,y1n,x2n,y2n] = roiNorm;
    const x1 = x1n * overlay.width;
    const y1 = y1n * overlay.height;
    const x2 = x2n * overlay.width;
    const y2 = y2n * overlay.height;
    ctx.strokeRect(x1, y1, x2-x1, y2-y1);
    ctx.fillRect(x1, y1, x2-x1, y2-y1);
  }

  // draw live drag rectangle
  if (isDrawing) {
    ctx.strokeStyle = '#45a1ff';
    ctx.setLineDash([6, 4]);
    ctx.lineWidth = 2;
    ctx.strokeRect(Math.min(startX,endX), Math.min(startY,endY), Math.abs(endX-startX), Math.abs(endY-startY));
  }

  // draw detections
  for (const d of dets) {
    const clr = d.confidence >= 0.6 ? '#ff6b6b' : (d.confidence >= 0.4 ? '#ffb020' : '#19c37d');
    ctx.setLineDash([]);
    ctx.strokeStyle = clr;
    ctx.lineWidth = 3;
    ctx.strokeRect(d.x1, d.y1, d.x2 - d.x1, d.y2 - d.y1);
    ctx.fillStyle = clr;
    ctx.font = '14px system-ui';
    const label = `${d.cls} ${(d.confidence*100).toFixed(1)}%`;
    const textW = ctx.measureText(label).width + 8;
    ctx.fillRect(d.x1, Math.max(0, d.y1 - 18), textW, 18);
    ctx.fillStyle = '#0b0f19';
    ctx.fillText(label, d.x1 + 4, Math.max(12, d.y1 - 4));
  }
}

async function grabFrameBlob() {
  if (lastFrameBlob) return lastFrameBlob;
  if (!streamActive) return null;
  const canvas = document.createElement('canvas');
  const w = video.videoWidth || 1280;
  const h = video.videoHeight || 720;
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(video, 0, 0, w, h);
  return await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.9));
}

function addAlert(dets) {
  alerts.innerHTML = '';
  if (!dets.length) return;
  for (const d of dets) {
    const sev = d.confidence >= 0.6 ? 'high' : (d.confidence >= 0.4 ? 'medium' : 'low');
    const el = document.createElement('div');
    el.className = `alert ${sev}`;
    el.textContent = `${d.cls} detected (${(d.confidence*100).toFixed(1)}%)`;
    alerts.appendChild(el);
  }
}

function addLogEntry(text) {
  const li = document.createElement('li');
  const ts = new Date().toLocaleTimeString();
  li.textContent = `[${ts}] ${text}`;
  log.prepend(li);
}

async function detectOnce() {
  const blob = await grabFrameBlob();
  if (!blob) {
    setStatus('No frame available. Use camera or upload.', false);
    return;
  }
  const fd = new FormData();
  fd.append('file', blob, 'frame.jpg');
  fd.append('conf_threshold', confSlider.value);
  fd.append('iou_threshold', iouSlider.value);
  if (roiNorm) fd.append('roi', roiNorm.join(','));

  try {
    const res = await fetch('/api/detect', { method: 'POST', body: fd });
    if (!res.ok) throw new Error('Detect failed');
    const data = await res.json();
    const dets = data.detections.map(d => ({
      ...d,
      // map model coords to overlay size
      x1: d.x1 * overlay.width / data.image_width,
      y1: d.y1 * overlay.height / data.image_height,
      x2: d.x2 * overlay.width / data.image_width,
      y2: d.y2 * overlay.height / data.image_height,
    }));
    renderOverlay(dets);
    addAlert(dets);
    addLogEntry(`Detected ${dets.length} target(s) in ${data.time_ms.toFixed(1)} ms`);
  } catch (e) {
    setStatus('Detection error', false);
  }
}

let autoTimer = null;

detectBtn.addEventListener('click', () => detectOnce());

// Optional: enable auto-detect by double-clicking detect
let detectClicks = 0;
detectBtn.addEventListener('dblclick', () => {
  detectClicks++;
  if (autoTimer) { clearInterval(autoTimer); autoTimer = null; detectBtn.textContent = 'Detect'; return; }
  autoTimer = setInterval(detectOnce, 800);
  detectBtn.textContent = 'Detect (Auto)';
});

renderOverlay();
