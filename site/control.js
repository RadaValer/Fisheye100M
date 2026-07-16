const logoutBtn = document.getElementById('logout-btn');
logoutBtn.addEventListener('click', () => {
  localStorage.removeItem('fisheye-auth');
  window.location.href = 'login.html';
});

const ICONS = {
  pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 21s7-7.58 7-12a7 7 0 1 0-14 0c0 4.42 7 12 7 12Z"/><circle cx="12" cy="9" r="2.5"/></svg>',
  thermo: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 14.5V5a2 2 0 1 0-4 0v9.5a4 4 0 1 0 4 0Z"/></svg>',
  gauge: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 15a8 8 0 1 1 16 0"/><path d="M12 15l4-5"/></svg>',
  droplet: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3s6 7 6 11a6 6 0 0 1-12 0c0-4 6-11 6-11Z"/></svg>',
  bolt: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z"/></svg>',
  sub: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><ellipse cx="12" cy="12" rx="9" ry="4"/><circle cx="8" cy="12" r="1.4" fill="currentColor" stroke="none"/></svg>',
  boat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 15h18l-2 5H5l-2-5Z"/><path d="M12 15V4M12 4l5 4H12"/></svg>',
};

const VEHICLES = [
  {
    id: 'alpha', nameKey: 'vehicle.alpha', type: 'submarine', status: 'online',
    batteryPropulsion: 78, batteryElectronics: 88, cameraOnline: true, lat: 45.6427, lng: 25.5887,
    tempInternal: 24.1, tempExternal: 9.4, pressureInternal: 1.02, pressureExternal: 4.8,
    humidity: 38, motor1: 1.8, motor2: 1.7, depth: 38,
  },
  {
    id: 'beta', nameKey: 'vehicle.beta', type: 'submarine', status: 'charging',
    batteryPropulsion: 31, batteryElectronics: 57, cameraOnline: false, lat: 45.6431, lng: 25.5872,
    tempInternal: 22.6, tempExternal: 11.2, pressureInternal: 1.01, pressureExternal: 1.01,
    humidity: 41, motor1: 0, motor2: 0, depth: 0,
  },
  {
    id: 'boat', nameKey: 'vehicle.boat', type: 'boat', status: 'online',
    battery: 91, cameraOnline: false, lat: 45.6429, lng: 25.5880,
    tempExternal: 13.5, motor1: 0.6, motor2: 0.5,
  },
];

const ledState = {};
VEHICLES.forEach((v) => {
  ledState[v.id] = { frontL: false, frontR: false, vertUp: false, vertDown: false, horizL: false, horizR: false };
});

let activeId = VEHICLES[0].id;
let clockTimer = null;

function t(key) {
  return window.FisheyeI18n ? window.FisheyeI18n.t(key) : key;
}

function fleetIcon(type) {
  return type === 'boat' ? ICONS.boat : ICONS.sub;
}

function statusLabel(status) {
  if (status === 'online') return t('dash.statusOnline');
  if (status === 'charging') return t('dash.statusCharging');
  return t('dash.statusOffline');
}

function renderFleetList() {
  const list = document.getElementById('fleet-list');
  list.innerHTML = VEHICLES.map((v) => `
    <button class="fleet-item ${v.id === activeId ? 'is-active' : ''}" data-id="${v.id}" type="button">
      <span class="fleet-icon">${fleetIcon(v.type)}</span>
      <span class="fleet-meta">
        <span class="fleet-name">${t(v.nameKey)}</span>
        <span class="fleet-sub">
          <span class="status-dot is-${v.status}"></span>
          ${statusLabel(v.status)} · ${v.type === 'boat' ? t('dash.typeBoat') : t('dash.typeSubmarine')}
        </span>
      </span>
    </button>
  `).join('');

  list.querySelectorAll('.fleet-item').forEach((btn) => {
    btn.addEventListener('click', () => selectVehicle(btn.dataset.id));
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
  const v = VEHICLES.find((x) => x.id === activeId);
  if (v) v.depth = clamped;
  document.getElementById('depth-num').textContent = clamped.toFixed(1);
  document.getElementById('dg-fill').style.width = clamped + '%';
  document.getElementById('dg-dot').style.left = clamped + '%';
}

function renderLeds(v) {
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
  document.getElementById('vehicle-name').textContent = t(v.nameKey);
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

function renderVehicle() {
  const v = VEHICLES.find((x) => x.id === activeId);
  if (!v) return;
  renderVehicleHeader(v);
  renderCamera(v);
  renderTelemetry(v);
  renderDepth(v);
  renderLeds(v);
  document.getElementById('last-command').textContent = t('dash.noCommand');
}

function selectVehicle(id) {
  activeId = id;
  renderFleetList();
  renderVehicle();
}

document.querySelectorAll('input[data-led]').forEach((input) => {
  input.addEventListener('change', () => {
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
    document.getElementById('last-command').textContent = t(labels[cmd] || cmd);
    btn.classList.add('is-active');
    setTimeout(() => btn.classList.remove('is-active'), 220);
  });
});

document.getElementById('btn-dive').addEventListener('click', () => {
  const v = VEHICLES.find((x) => x.id === activeId);
  if (v) setDepth(v.depth + 0.5);
});
document.getElementById('btn-surface').addEventListener('click', () => {
  const v = VEHICLES.find((x) => x.id === activeId);
  if (v) setDepth(v.depth - 0.5);
});

window.addEventListener('fisheye-lang-changed', renderVehicle);
window.addEventListener('fisheye-lang-changed', renderFleetList);

document.addEventListener('DOMContentLoaded', () => {
  renderFleetList();
  renderVehicle();
});
