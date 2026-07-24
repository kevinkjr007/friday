import { connectHA, subscribe } from './websocket.js';

const $ = (id) => document.getElementById(id);
const entities = new Map();
const saved = {
  url: localStorage.getItem('friday.haUrl') || '',
  token: localStorage.getItem('friday.haToken') || ''
};

const entityAliases = {
  recovery: ['sensor.whoop_recovery_score', 'sensor.recovery_score'],
  sleep: ['sensor.whoop_sleep_performance', 'sensor.sleep_performance'],
  hrv: ['sensor.whoop_hrv', 'sensor.hrv'],
  rhr: ['sensor.whoop_resting_hr', 'sensor.resting_heart_rate'],
  strain: ['sensor.whoop_day_strain', 'sensor.day_strain']
};

function tick() {
  const now = new Date();
  $('clock').textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  $('date').textContent = now.toLocaleDateString([], {
    weekday: 'long', month: 'short', day: 'numeric'
  }).toUpperCase();
  const hour = now.getHours();
  $('greeting').textContent =
    `Good ${hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening'}, Kevin.`;
}

function numberState(key) {
  const ids = entityAliases[key];
  const state = ids.map((id) => entities.get(id)).find(Boolean);
  const value = Number.parseFloat(state?.state);
  return Number.isFinite(value) ? value : null;
}

function findEntities(pattern, domains = []) {
  return [...entities.values()].filter((entity) => {
    const [domain] = entity.entity_id.split('.');
    const text = `${entity.entity_id} ${entity.attributes?.friendly_name || ''}`.toLowerCase();
    return (!domains.length || domains.includes(domain)) && pattern.test(text);
  });
}

function setMetric(id, value, digits = 0) {
  $(id).textContent = value === null ? '--' : value.toFixed(digits);
}

function render() {
  const recovery = numberState('recovery');
  const sleep = numberState('sleep');
  const hrv = numberState('hrv');
  const rhr = numberState('rhr');
  const strain = numberState('strain');

  setMetric('recovery', recovery);
  setMetric('sleep', sleep);
  setMetric('hrv', hrv);
  setMetric('rhr', rhr);
  setMetric('strain', strain, 1);

  const gauge = $('recovery-gauge');
  gauge.style.setProperty('--value', Math.max(0, Math.min(100, recovery || 0)));
  const color = recovery === null ? '#39d5ff' : recovery >= 67 ? '#55f29a' : recovery >= 34 ? '#ffd166' : '#ff5d73';
  gauge.style.setProperty('--gauge', color);
  $('recovery-label').textContent = recovery === null
    ? 'AWAITING BIOMETRICS'
    : recovery >= 67 ? 'READY FOR HIGH OUTPUT' : recovery >= 34 ? 'MODERATE CAPACITY' : 'RECOVERY PRIORITY';

  const garage = findEntities(/garage/, ['cover']);
  $('garage').textContent = garage.length ? garage[0].state.toUpperCase() : 'NOT FOUND';

  const exterior = findEntities(/(front|back|side|exterior).*(door)|door.*(front|back|side|exterior)/, ['binary_sensor']);
  const openDoors = exterior.filter((entity) => entity.state === 'on');
  $('doors').textContent = exterior.length ? (openDoors.length ? `${openDoors.length} OPEN` : 'SECURE') : 'NOT FOUND';

  const coop = findEntities(/(chicken|coop)/);
  const coopDoor = coop.find((entity) => ['cover', 'binary_sensor'].includes(entity.entity_id.split('.')[0]));
  $('coop').textContent = coopDoor ? coopDoor.state.toUpperCase() : (coop.length ? 'ONLINE' : 'NOT FOUND');

  const unavailable = [...entities.values()].filter((entity) => entity.state === 'unavailable');
  $('systems').textContent = unavailable.length ? `${unavailable.length} UNAVAILABLE` : 'NOMINAL';
  $('systems').classList.toggle('warning', unavailable.length > 0);
  $('entity-count').textContent = `${entities.size} ENTITIES LINKED`;

  if (recovery !== null) {
    $('summary').textContent = `Recovery is ${Math.round(recovery)}%. ${
      sleep === null ? 'Sleep data is still synchronizing.' : `Sleep performance registered at ${Math.round(sleep)}%.`
    } Property systems are ${unavailable.length ? `reporting ${unavailable.length} unavailable entities` : 'nominal'}.`;
    $('recommendation').textContent =
      recovery >= 67 ? 'Use the green recovery window for demanding work.'
        : recovery >= 34 ? 'Keep the day measured and protect tonight’s sleep.'
          : 'Reduce load and prioritize recovery today.';
  }
}

function setStatus(status) {
  const labels = {
    connecting: 'LINKING TO HOME ASSISTANT',
    connected: 'HOME ASSISTANT ONLINE',
    disconnected: 'HOME ASSISTANT DISCONNECTED',
    error: 'CONNECTION ERROR',
    'auth-invalid': 'TOKEN REJECTED'
  };
  $('connection-status').textContent = labels[status] || status.toUpperCase();
  $('status-dot').className = `dot ${status}`;
  if (status === 'auth-invalid') $('setup').showModal();
}

subscribe((event) => {
  if (event.type === 'status') setStatus(event.status);
  if (event.type === 'states') {
    event.states.forEach((state) => entities.set(state.entity_id, state));
    render();
  }
  if (event.type === 'state' && event.state) {
    entities.set(event.state.entity_id, event.state);
    render();
  }
});

$('configure').addEventListener('click', () => {
  $('ha-url').value = saved.url;
  $('ha-token').value = saved.token;
  $('setup').showModal();
});

$('cancel').addEventListener('click', () => $('setup').close());

$('setup-form').addEventListener('submit', () => {
  saved.url = $('ha-url').value.trim();
  saved.token = $('ha-token').value.trim();
  localStorage.setItem('friday.haUrl', saved.url);
  localStorage.setItem('friday.haToken', saved.token);
  connectHA(saved.url, saved.token);
});

tick();
setInterval(tick, 1000);
if (saved.url && saved.token) connectHA(saved.url, saved.token);
