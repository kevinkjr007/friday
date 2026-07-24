import { callService, connectHA, subscribe } from './websocket.js';

const $ = (id) => document.getElementById(id);
const entities = new Map();
const localConfig = window.FRIDAY_CONFIG || {};
const localToken = typeof localConfig.token === 'string' ? localConfig.token.trim() : '';
const tokenFromLocalConfig = Boolean(localToken);
const saved = {
  url: localConfig.haUrl || localConfig.url || localStorage.getItem('friday.haUrl') || 'http://homeassistant.local:8123',
  token: localToken || localStorage.getItem('friday.haToken') || ''
};
if (tokenFromLocalConfig) localStorage.removeItem('friday.haToken');
const mappingKeys = [
  'recovery', 'sleep', 'hrv', 'rhr', 'strain',
  'garage', 'frontDoor', 'backDoor', 'coopDoor'
];
const mappings = Object.fromEntries(
  mappingKeys.map((key) => [key, localStorage.getItem(`friday.entity.${key}`) || ''])
);

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
  const state = entities.get(mappings[key]);
  const value = Number.parseFloat(state?.state);
  return Number.isFinite(value) ? value : null;
}

function mappedEntity(key) {
  return entities.get(mappings[key]) || null;
}

function isOpen(entity) {
  return ['on', 'open', 'opening'].includes(entity?.state);
}

function entityLabel(entity) {
  return entity?.attributes?.friendly_name || entity?.entity_id || 'Not mapped';
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

  const garage = mappedEntity('garage');
  $('garage').textContent = garage ? garage.state.toUpperCase() : 'NOT CONFIGURED';
  $('garage-detail').textContent = entityLabel(garage);
  $('garage-action').disabled = !garage;
  $('garage-action').textContent = isOpen(garage) ? 'CLOSE' : 'OPEN';

  const exterior = ['frontDoor', 'backDoor'].map((key) => entities.get(mappings[key])).filter(Boolean);
  const openDoors = exterior.filter((entity) => entity.state === 'on');
  $('doors').textContent = exterior.length ? (openDoors.length ? `${openDoors.length} OPEN` : 'SECURE') : 'NOT CONFIGURED';
  $('doors-detail').textContent = exterior.length ? `${exterior.length} monitored` : 'No door sensors mapped';

  const coopDoor = mappedEntity('coopDoor');
  $('coop').textContent = coopDoor ? coopDoor.state.toUpperCase() : 'NOT CONFIGURED';
  $('coop-detail').textContent = entityLabel(coopDoor);
  $('coop-action').disabled = !coopDoor || !coopDoor.entity_id.startsWith('cover.');
  $('coop-action').textContent = isOpen(coopDoor) ? 'CLOSE' : 'OPEN';

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

function populateEntityLists() {
  const propertyCandidates = [...entities.values()]
    .filter((entity) => ['cover', 'binary_sensor'].includes(entity.entity_id.split('.')[0]))
    .sort((a, b) => entityLabel(a).localeCompare(entityLabel(b)));
  const sensorCandidates = [...entities.values()]
    .filter((entity) => entity.entity_id.startsWith('sensor.'))
    .sort((a, b) => entityLabel(a).localeCompare(entityLabel(b)));

  const fillList = (list, candidates) => {
    list.replaceChildren(...candidates.map((entity) => {
      const option = document.createElement('option');
      option.value = entity.entity_id;
      option.label = entityLabel(entity);
      return option;
    }));
  };
  fillList($('property-entities'), propertyCandidates);
  fillList($('sensor-entities'), sensorCandidates);
}

async function operateCover(key) {
  const entity = entities.get(mappings[key]);
  if (!entity?.entity_id.startsWith('cover.')) return;

  const label = entityLabel(entity);
  const action = isOpen(entity) ? 'close' : 'open';
  if (!window.confirm(`${action.toUpperCase()} ${label}?`)) return;

  const button = key === 'garage' ? $('garage-action') : $('coop-action');
  button.disabled = true;
  button.textContent = 'SENDING';
  try {
    await callService('cover', `${action}_cover`, {}, { entity_id: entity.entity_id });
  } catch (error) {
    window.alert(error.message);
  } finally {
    render();
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
    populateEntityLists();
    render();
  }
  if (event.type === 'state' && event.state) {
    entities.set(event.state.entity_id, event.state);
    render();
  }
});

$('configure').addEventListener('click', () => {
  $('ha-url').value = saved.url;
  $('ha-token').value = tokenFromLocalConfig ? '' : saved.token;
  $('ha-token').placeholder = tokenFromLocalConfig
    ? 'Loaded from config.local.js'
    : 'Paste your Long-Lived Access Token';
  mappingKeys.forEach((key) => { $(`map-${key}`).value = mappings[key]; });
  $('setup').showModal();
});

$('cancel').addEventListener('click', () => $('setup').close());

$('setup-form').addEventListener('submit', () => {
  saved.url = $('ha-url').value.trim();
  const enteredToken = $('ha-token').value.trim();
  saved.token = localToken || enteredToken || saved.token;
  if (!saved.token) {
    window.alert('Add a Long-Lived Access Token or create config.local.js.');
    return;
  }
  localStorage.setItem('friday.haUrl', saved.url);
  if (tokenFromLocalConfig) localStorage.removeItem('friday.haToken');
  else localStorage.setItem('friday.haToken', saved.token);
  mappingKeys.forEach((key) => {
    mappings[key] = $(`map-${key}`).value.trim();
    localStorage.setItem(`friday.entity.${key}`, mappings[key]);
  });
  connectHA(saved.url, saved.token);
});

$('garage-action').addEventListener('click', () => operateCover('garage'));
$('coop-action').addEventListener('click', () => operateCover('coopDoor'));

tick();
setInterval(tick, 1000);
if (saved.url && saved.token) connectHA(saved.url, saved.token);
