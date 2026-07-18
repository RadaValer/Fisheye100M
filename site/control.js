document.getElementById('logout-btn').addEventListener('click', () => {
  window.FisheyeApi.logout();
  window.location.href = 'login.html';
});

const ICONS = {
  pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 21s7-7.58 7-12a7 7 0 1 0-14 0c0 4.42 7 12 7 12Z"/><circle cx="12" cy="9" r="2.5"/></svg>',
  thermo: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 14.5V5a2 2 0 1 0-4 0v9.5a4 4 0 1 0 4 0Z"/></svg>',
  gauge: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 15a8 8 0 1 1 16 0"/><path d="M12 15l4-5"/></svg>',
  droplet: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3s6 7 6 11a6 6 0 0 1-12 0c0-4 6-11 6-11Z"/></svg>',
  bolt: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z"/></svg>',
  bulb: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18h6M10 22h4"/><path d="M12 2a7 7 0 0 0-4 12.7c.7.5 1 1.3 1 2.3h6c0-1 .3-1.8 1-2.3A7 7 0 0 0 12 2Z"/></svg>',
  sub: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><ellipse cx="12" cy="12" rx="9" ry="4"/><circle cx="8" cy="12" r="1.4" fill="currentColor" stroke="none"/></svg>',
  boat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 15h18l-2 5H5l-2-5Z"/><path d="M12 15V4M12 4l5 4H12"/></svg>',
};

let VEHICLES = [];
const ledState = {};
let activeId = null;
let clockTimer = null;

function t(key) {
  return window.FisheyeI18n ? window.FisheyeI18n.t(key) : key;
}

function ensureLedState(id) {
  if (!ledState[id]) {
    ledState[id] = { frontL: false, frontR: false, vertUp: false, vertDown: false, horizL: false, horizR: false };
  }
}

function formatMinutes(mins) {
  const h = Math.floor(mins / 60);
  const m = Math.round(mins % 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function formatHMS(totalSec) {
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = Math.floor(totalSec % 60);
  return `${h}h ${String(m).padStart(2, '0')}m ${String(s).padStart(2, '0')}s`;
}

function fleetIcon(type) {
  return type === 'boat' ? ICONS.boat : ICONS.sub;
}

function statusLabel(status) {
  if (status === 'online') return t('dash.statusOnline');
  if (status === 'charging') return t('dash.statusCharging');
  return t('dash.statusOffline');
}

function getVehicle(id) {
  return VEHICLES.find((x) => x.id === id);
}

function renderFleetList() {
  const list = document.getElementById('fleet-list');
  list.innerHTML = VEHICLES.map((v) => `
    <div class="fleet-item ${v.id === activeId ? 'is-active' : ''}" data-id="${v.id}" role="button" tabindex="0">
      <span class="fleet-icon">${fleetIcon(v.type)}</span>
      <span class="fleet-meta">
        <span class="fleet-name">${v.name}</span>
        <span class="fleet-sub">
          <span class="status-dot is-${v.status}"></span>
          ${statusLabel(v.status)} · ${v.type === 'boat' ? t('dash.typeBoat') : t('dash.typeSubmarine')}
        </span>
      </span>
      <button class="fleet-info-btn" data-info-id="${v.id}" type="button" aria-label="${t('dash.vehicleInfoAria')}">i</button>
    </div>
  `).join('');

  list.querySelectorAll('.fleet-item').forEach((el) => {
    el.addEventListener('click', () => selectVehicle(el.dataset.id));
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectVehicle(el.dataset.id); }
    });
  });
  list.querySelectorAll('.fleet-info-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      openVehicleInfo(btn.dataset.infoId);
    });
  });
}

function telemetryTile(icon, label, value, unit) {
  return `
    <div class="tel-tile">
      <div class="tel-icon">${icon}</div>
      <div class="tel-label">${label}</div>
      <div class="tel-value">${value}${unit ? `<small>${unit}</small>` : ''}</div>
    </div>
  `;
}

function lightLevel(v) {
  return Math.round(Math.max(2, 850 - v.depth * 8.3));
}

function renderTelemetry(v) {
  const grid = document.getElementById('telemetry-grid');
  const loc = `${v.lat.toFixed(4)}, ${v.lng.toFixed(4)}`;
  let tiles = [
    telemetryTile(ICONS.pin, t('dash.location'), loc, ''),
  ];

  if (v.type === 'submarine') {
    tiles.push(
      telemetryTile(ICONS.thermo, t('dash.tempInternal'), v.tempInternal.toFixed(1), '°C'),
      telemetryTile(ICONS.thermo, t('dash.tempExternal'), v.tempExternal.toFixed(1), '°C'),
      telemetryTile(ICONS.gauge, t('dash.pressureInternal'), v.pressureInternal.toFixed(2), 'bar'),
      telemetryTile(ICONS.gauge, t('dash.pressureExternal'), v.pressureExternal.toFixed(2), 'bar'),
      telemetryTile(ICONS.droplet, t('dash.humidity'), Math.round(v.humidity), '%'),
      telemetryTile(ICONS.bulb, t('dash.lightLevel'), lightLevel(v), 'lux'),
      telemetryTile(ICONS.bolt, t('dash.motor1'), v.motor1.toFixed(1), 'A'),
      telemetryTile(ICONS.bolt, t('dash.motor2'), v.motor2.toFixed(1), 'A')
    );
  } else {
    tiles.push(
      telemetryTile(ICONS.thermo, t('dash.tempExternal'), v.tempExternal.toFixed(1), '°C'),
      telemetryTile(ICONS.bolt, t('dash.motor1'), v.motor1.toFixed(1), 'A'),
      telemetryTile(ICONS.bolt, t('dash.motor2'), v.motor2.toFixed(1), 'A')
    );
  }

  grid.innerHTML = tiles.join('');
}

function renderCamera(v) {
  const frame = document.getElementById('camera-frame');
  const badge = document.getElementById('camera-live-badge');
  const offlineMsg = document.getElementById('camera-offline-msg');
  const timestamp = document.getElementById('camera-timestamp');

  frame.classList.toggle('is-live', v.cameraOnline);
  badge.hidden = !v.cameraOnline;
  offlineMsg.hidden = v.cameraOnline;
  timestamp.hidden = !v.cameraOnline;

  if (clockTimer) clearInterval(clockTimer);
  if (v.cameraOnline) {
    const tick = () => { timestamp.textContent = new Date().toLocaleTimeString(); };
    tick();
    clockTimer = setInterval(tick, 1000);
  }
}

function renderDepth(v) {
  const isSubmarine = v.type === 'submarine';
  document.getElementById('depth-content').hidden = !isSubmarine;
  document.getElementById('depth-hint').hidden = isSubmarine;
  if (isSubmarine) setDepth(v.depth);
}

function setDepth(depth) {
  const clamped = Math.max(0, Math.min(100, Math.round(depth * 2) / 2));
  const v = getVehicle(activeId);
  if (v) v.depth = clamped;
  document.getElementById('depth-num').textContent = clamped.toFixed(1);
  document.getElementById('dg-fill').style.width = clamped + '%';
  document.getElementById('dg-dot').style.left = clamped + '%';
  if (v && v.type === 'submarine') renderTelemetry(v);
}

function renderLeds(v) {
  ensureLedState(v.id);
  const card = document.getElementById('led-card');
  const hint = document.getElementById('led-hint');
  const rows = card.querySelectorAll('.led-row');
  const isSubmarine = v.type === 'submarine';

  rows.forEach((row) => { row.hidden = !isSubmarine; });
  hint.hidden = isSubmarine;

  card.querySelectorAll('input[data-led]').forEach((input) => {
    input.checked = ledState[v.id][input.dataset.led];
  });
}

function batteryChip(label, value) {
  return `
    <span class="battery-chip">
      <span class="battery-chip-label">${label}</span>
      <span class="battery-bar"><span class="battery-fill" style="width:${value}%"></span></span>
      <span>${value}%</span>
    </span>
  `;
}

function renderVehicleHeader(v) {
  document.getElementById('vehicle-name').textContent = v.name;
  const pill = document.getElementById('vehicle-status');
  pill.innerHTML = `<span class="status-dot is-${v.status}"></span>${statusLabel(v.status)}`;

  const group = document.getElementById('battery-group');
  if (v.type === 'submarine') {
    group.innerHTML =
      batteryChip(t('dash.batteryPropulsion'), v.batteryPropulsion) +
      batteryChip(t('dash.batteryElectronics'), v.batteryElectronics);
  } else {
    group.innerHTML = batteryChip(t('dash.battery'), v.battery);
  }
}

function renderSession(v) {
  const isSubmarine = v.type === 'submarine';
  const submergedNow = isSubmarine && v.depth > 0;
  const statusText = isSubmarine
    ? (submergedNow ? t('dash.statusSubmerged') : t('dash.statusAtSurface'))
    : t('dash.statusAtSurface');

  document.getElementById('session-status').textContent = `${statusLabel(v.status)} · ${statusText}`;
  document.getElementById('session-deployed').textContent = formatHMS(Math.floor((Date.now() - v.deployedAt) / 1000));

  document.getElementById('session-submerged-tile').hidden = !isSubmarine;
  document.getElementById('session-surface-tile').hidden = !isSubmarine;
  if (isSubmarine) {
    document.getElementById('session-submerged').textContent = formatHMS(v.sessionSubmergedSec || 0);
    document.getElementById('session-surface').textContent = formatHMS(v.sessionSurfaceSec || 0);
  }
}

function vehicleLogTiles(v) {
  const tiles = [
    telemetryTile(ICONS.pin, t('dash.regNumber'), v.registrationNumber, ''),
    telemetryTile(ICONS.gauge, t('dash.launchCount'), v.launchCount, ''),
  ];
  if (v.type === 'submarine') {
    tiles.push(telemetryTile(ICONS.droplet, t('dash.totalSubmerged'), formatMinutes(v.totalSubmergedMinutes), ''));
  }
  tiles.push(telemetryTile(ICONS.boat, t('dash.totalAtSea'), formatMinutes(v.totalAtSeaMinutes), ''));
  return tiles;
}

function renderVehicleLog(v) {
  document.getElementById('vehicle-log-grid').innerHTML = vehicleLogTiles(v).join('');
}

function renderVehicle() {
  const v = getVehicle(activeId);
  if (!v) return;
  renderVehicleHeader(v);
  renderCamera(v);
  renderTelemetry(v);
  renderDepth(v);
  renderLeds(v);
  renderSession(v);
  renderVehicleLog(v);
}

function selectVehicle(id) {
  if (id === activeId) return;
  activeId = id;
  const v = getVehicle(activeId);
  renderFleetList();
  renderVehicle();
  logTerminal(`— ${v.name} —`);
}

function timestamp() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function logTerminal(text, isUser) {
  const output = document.getElementById('terminal-output');
  const line = document.createElement('div');
  line.className = 'terminal-line' + (isUser ? ' is-user' : '');
  line.innerHTML = `<span class="ts">${timestamp()}</span>${isUser ? '$ ' : '→ '}${text.replace(/</g, '&lt;')}`;
  output.appendChild(line);
  output.scrollTop = output.scrollHeight;
}

// ---- Modals ----
function openModal(id) { document.getElementById(id).classList.add('is-open'); }
function closeModal(id) { document.getElementById(id).classList.remove('is-open'); }

document.querySelectorAll('.modal-overlay').forEach((overlay) => {
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) overlay.classList.remove('is-open');
  });
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-overlay.is-open').forEach((o) => o.classList.remove('is-open'));
  }
});

function openVehicleInfo(id) {
  const v = getVehicle(id);
  if (!v) return;
  document.getElementById('info-modal-title').textContent = v.name;
  document.getElementById('info-modal-grid').innerHTML = vehicleLogTiles(v).join('');
  openModal('vehicle-info-overlay');
}
document.getElementById('info-modal-close').addEventListener('click', () => closeModal('vehicle-info-overlay'));

document.getElementById('add-vehicle-btn').addEventListener('click', () => {
  document.getElementById('add-vehicle-form').reset();
  document.getElementById('add-vehicle-error').hidden = true;
  openModal('add-vehicle-overlay');
});
document.getElementById('add-vehicle-close').addEventListener('click', () => closeModal('add-vehicle-overlay'));

document.getElementById('add-vehicle-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const errorEl = document.getElementById('add-vehicle-error');
  errorEl.hidden = true;
  const name = document.getElementById('new-vehicle-name').value.trim();
  const type = document.getElementById('new-vehicle-type').value;
  const reg = document.getElementById('new-vehicle-reg').value.trim();
  const password = document.getElementById('new-vehicle-password').value;

  if (!reg || !password) {
    errorEl.textContent = t('dash.addVehicleMissing');
    errorEl.hidden = false;
    return;
  }

  try {
    const vehicle = await window.FisheyeApi.addVehicle({ name, type, registrationNumber: reg, password });
    vehicle.deployedAt = Date.now();
    vehicle.sessionSubmergedSec = 0;
    vehicle.sessionSurfaceSec = 0;
    VEHICLES.push(vehicle);
    ensureLedState(vehicle.id);
    closeModal('add-vehicle-overlay');
    selectVehicleForce(vehicle.id);
    logTerminal(`+ ${vehicle.name} (${vehicle.registrationNumber})`);
  } catch (err) {
    errorEl.textContent = err.message === 'duplicate_registration'
      ? t('dash.addVehicleDuplicate')
      : t('dash.addVehicleMissing');
    errorEl.hidden = false;
  }
});

function selectVehicleForce(id) {
  activeId = id;
  renderFleetList();
  renderVehicle();
}

// ---- Controls ----
document.querySelectorAll('input[data-led]').forEach((input) => {
  input.addEventListener('change', () => {
    ensureLedState(activeId);
    ledState[activeId][input.dataset.led] = input.checked;
  });
});

document.querySelectorAll('.dpad-btn[data-cmd]').forEach((btn) => {
  btn.addEventListener('click', () => {
    const cmd = btn.dataset.cmd;
    const labels = {
      forward: 'dash.moveForward', back: 'dash.moveBack',
      turnLeft: 'dash.turnLeft', turnRight: 'dash.turnRight', stop: 'dash.stop',
    };
    logTerminal(t(labels[cmd] || cmd));
    btn.classList.add('is-active');
    setTimeout(() => btn.classList.remove('is-active'), 220);
  });
});

document.getElementById('btn-dive').addEventListener('click', () => {
  const v = getVehicle(activeId);
  if (v) {
    setDepth(v.depth + 0.5);
    logTerminal(`${t('dash.dive')} → ${v.depth.toFixed(1)}m`);
  }
});
document.getElementById('btn-surface').addEventListener('click', () => {
  const v = getVehicle(activeId);
  if (v) {
    setDepth(v.depth - 0.5);
    logTerminal(`${t('dash.surface')} → ${v.depth.toFixed(1)}m`);
  }
});

document.getElementById('depth-target-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const v = getVehicle(activeId);
  if (!v) return;
  const input = document.getElementById('depth-target-input');
  const value = parseFloat(input.value);
  if (Number.isNaN(value)) return;
  setDepth(value);
  logTerminal(`${t('dash.targetDepth')} → ${v.depth.toFixed(1)}m`);
});

const vehicleNameH1 = document.getElementById('vehicle-name');
const vehicleNameInput = document.getElementById('vehicle-name-input');
document.getElementById('rename-btn').addEventListener('click', () => {
  const v = getVehicle(activeId);
  if (!v) return;
  vehicleNameInput.value = v.name;
  vehicleNameH1.hidden = true;
  vehicleNameInput.hidden = false;
  vehicleNameInput.focus();
  vehicleNameInput.select();
});
async function commitRename() {
  if (vehicleNameInput.hidden) return;
  const v = getVehicle(activeId);
  const val = vehicleNameInput.value.trim();
  vehicleNameInput.hidden = true;
  vehicleNameH1.hidden = false;
  if (v && val && val !== v.name) {
    v.name = val;
    renderVehicleHeader(v);
    renderFleetList();
    try {
      await window.FisheyeApi.updateVehicle(v.id, { name: val });
    } catch (err) { /* mock store — safe to ignore in demo */ }
  }
}
vehicleNameInput.addEventListener('blur', commitRename);
vehicleNameInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') { e.preventDefault(); vehicleNameInput.blur(); }
  if (e.key === 'Escape') { vehicleNameInput.hidden = true; vehicleNameH1.hidden = false; }
});

setInterval(() => {
  VEHICLES.forEach((v) => {
    if (v.type === 'submarine') {
      if (v.depth > 0) v.sessionSubmergedSec = (v.sessionSubmergedSec || 0) + 1;
      else v.sessionSurfaceSec = (v.sessionSurfaceSec || 0) + 1;
    }
  });
  const active = getVehicle(activeId);
  if (active) renderSession(active);
}, 1000);

document.getElementById('terminal-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const input = document.getElementById('terminal-input');
  const value = input.value.trim();
  if (!value) return;
  logTerminal(value, true);
  input.value = '';
  setTimeout(() => logTerminal(t('dash.terminalUnknown')), 250);
});

window.addEventListener('fisheye-lang-changed', () => {
  renderVehicle();
  renderFleetList();
});

async function init() {
  try {
    VEHICLES = await window.FisheyeApi.getFleet();
  } catch (err) {
    VEHICLES = [];
  }
  VEHICLES.forEach((v) => {
    v.deployedAt = Date.now() - (v.deployedMinutesAgo || 0) * 60000;
    v.sessionSubmergedSec = 0;
    v.sessionSurfaceSec = 0;
    ensureLedState(v.id);
  });
  activeId = VEHICLES.length ? VEHICLES[0].id : null;
  renderFleetList();
  renderVehicle();
  logTerminal(t('dash.terminalReady'));
}

document.addEventListener('DOMContentLoaded', init);
