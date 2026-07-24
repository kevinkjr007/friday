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
  'coopDoor',
  'climate', 'outdoorTemp', 'outdoorHumidity', 'rainToday', 'coopTemp',
  'oasisWater', 'oasisFan', 'oasisLights', 'oasisValve'
];
const defaultMappings = {
  recovery: 'sensor.whoop_recovery_score',
  sleep: 'sensor.whoop_sleep_performance',
  hrv: 'sensor.whoop_hrv',
  rhr: 'sensor.whoop_resting_heart_rate',
  strain: 'sensor.whoop_day_strain',
  coopDoor: 'binary_sensor.chicken_coop_door_door',
  climate: '@Thermostat',
  outdoorTemp: '',
  outdoorHumidity: '',
  rainToday: '',
  coopTemp: '',
  oasisWater: '@Water Feature',
  oasisFan: '@TP-LINK_Smart Plug_E7BD Big Ass Fan',
  oasisLights: '@TP-LINK_Smart Plug_E7BD Back Porch Lights',
  oasisValve: '@Oasis'
};
const mappings = Object.fromEntries(
  mappingKeys.map((key) => [key, localStorage.getItem(`friday.entity.${key}`) || defaultMappings[key] || ''])
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
  const mapping = mappings[key];
  if (!mapping) return null;
  if (!mapping.startsWith('@')) return entities.get(mapping) || null;
  const wanted = mapping.slice(1).toLowerCase();
  return [...entities.values()].find((entity) =>
    (entity.attributes?.friendly_name || '').toLowerCase() === wanted
  ) || null;
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

  const coopDoor = mappedEntity('coopDoor');
  $('coop').textContent = coopDoor ? coopDoor.state.toUpperCase() : 'NOT CONFIGURED';
  $('coop-detail').textContent = entityLabel(coopDoor);
  $('coop-action').disabled = !coopDoor || !coopDoor.entity_id.startsWith('cover.');
  $('coop-action').textContent = isOpen(coopDoor) ? 'CLOSE' : 'OPEN';

  const climate = mappedEntity('climate');
  const currentTemp = Number.parseFloat(climate?.attributes?.current_temperature);
  const targetTemp = Number.parseFloat(climate?.attributes?.temperature);
  $('climate-current').textContent = Number.isFinite(currentTemp) ? `${Math.round(currentTemp)}°` : '--°';
  $('climate-target').textContent = Number.isFinite(targetTemp) ? `${Math.round(targetTemp)}°` : '--°';
  $('climate-mode').textContent = climate ? climate.state.toUpperCase() : 'NOT CONFIGURED';
  $('climate-down').disabled = !climate || !Number.isFinite(targetTemp);
  $('climate-up').disabled = !climate || !Number.isFinite(targetTemp);

  const renderEnvironment = (id, key, suffix = '') => {
    const value = numberState(key);
    $(id).textContent = value === null ? `--${suffix}` : `${Math.round(value * 10) / 10}${suffix}`;
  };
  renderEnvironment('outdoor-temp', 'outdoorTemp', '°');
  renderEnvironment('outdoor-humidity', 'outdoorHumidity', '%');
  renderEnvironment('rain-today', 'rainToday');
  renderEnvironment('coop-temp', 'coopTemp', '°');

  const oasisControls = [
    ['oasis-water', 'oasisWater'], ['oasis-fan', 'oasisFan'],
    ['oasis-lights', 'oasisLights'], ['oasis-valve', 'oasisValve']
  ];
  oasisControls.forEach(([id, key]) => {
    const entity = mappedEntity(key);
    const button = $(id);
    button.disabled = !entity;
    button.classList.toggle('active', entity?.state === 'on' || entity?.state === 'open');
    button.querySelector('strong').textContent = entity ? entity.state.toUpperCase() : 'NOT MAPPED';
  });

  const monitoredKeys = mappingKeys.filter((key) => mappings[key]);
  const monitored = monitoredKeys.map(mappedEntity).filter(Boolean);
  const unavailable = monitored.filter((entity) => entity.state === 'unavailable');
  const missingMappings = monitoredKeys.filter((key) => !mappedEntity(key));
  const priorityCount = unavailable.length + missingMappings.length;
  $('systems').textContent = priorityCount ? `${priorityCount} PRIORITY ISSUE${priorityCount === 1 ? '' : 'S'}` : 'NOMINAL';
  $('systems').classList.toggle('warning', priorityCount > 0);
  $('entity-count').textContent = `${monitored.length} PRIORITY ENTITIES // ${entities.size} LINKED`;
  $('priority-home').textContent = priorityCount ? `${priorityCount} NEED ATTENTION` : 'ALL CLEAR';
  $('priority-home-detail').textContent = priorityCount
    ? `${unavailable.length} unavailable // ${missingMappings.length} unresolved`
    : `${monitored.length} mapped systems nominal`;
  $('priority-health').textContent = recovery === null ? 'SYNCING' : recovery >= 67 ? 'HIGH OUTPUT' : recovery >= 34 ? 'MEASURED DAY' : 'RECOVERY MODE';
  $('priority-health-detail').textContent = recovery === null
    ? 'WHOOP telemetry pending'
    : `Recovery ${Math.round(recovery)}%${sleep === null ? '' : ` // Sleep ${Math.round(sleep)}%`}`;

  if (recovery !== null) {
    $('summary').textContent = `Recovery is ${Math.round(recovery)}%. ${
      sleep === null ? 'Sleep data is still synchronizing.' : `Sleep performance registered at ${Math.round(sleep)}%.`
    } Priority home systems are ${priorityCount ? `reporting ${priorityCount} issue${priorityCount === 1 ? '' : 's'}` : 'nominal'}.`;
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
  fillList($('all-entities'), [...entities.values()].sort((a, b) => entityLabel(a).localeCompare(entityLabel(b))));
}

async function adjustClimate(delta) {
  const climate = mappedEntity('climate');
  const target = Number.parseFloat(climate?.attributes?.temperature);
  if (!climate || !Number.isFinite(target)) return;
  await callService('climate', 'set_temperature', { temperature: target + delta }, { entity_id: climate.entity_id });
}

async function toggleMappedEntity(key) {
  const entity = mappedEntity(key);
  if (!entity) return;
  const domain = entity.entity_id.split('.')[0];
  const turnOff = ['on', 'open'].includes(entity.state);
  const service = domain === 'valve' ? (turnOff ? 'close_valve' : 'open_valve') : (turnOff ? 'turn_off' : 'turn_on');
  try {
    await callService(domain, service, {}, { entity_id: entity.entity_id });
  } catch (error) {
    window.alert(error.message);
  }
}

async function operateCover(key) {
  const entity = entities.get(mappings[key]);
  if (!entity?.entity_id.startsWith('cover.')) return;

  const label = entityLabel(entity);
  const action = isOpen(entity) ? 'close' : 'open';
  if (!window.confirm(`${action.toUpperCase()} ${label}?`)) return;

  const button = $('coop-action');
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
  const presence = $('friday-presence');
  if (presence) presence.dataset.state = status;
  const modeLabels = {
    connecting: 'SEARCHING',
    connected: 'ONLINE',
    disconnected: 'STANDBY',
    error: 'LINK ERROR',
    'auth-invalid': 'AUTH LOCK'
  };
  const presenceLabels = {
    connecting: 'ESTABLISHING HOME ASSISTANT LINK',
    connected: 'FRIDAY IS ONLINE',
    disconnected: 'AWAITING SYSTEM LINK',
    error: 'SYSTEM LINK INTERRUPTED',
    'auth-invalid': 'AUTHENTICATION REQUIRED'
  };
  if ($('friday-mode')) $('friday-mode').textContent = modeLabels[status] || status.toUpperCase();
  if ($('friday-status')) $('friday-status').textContent = presenceLabels[status] || labels[status] || status.toUpperCase();
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

$('coop-action').addEventListener('click', () => operateCover('coopDoor'));
$('climate-down').addEventListener('click', () => adjustClimate(-1));
$('climate-up').addEventListener('click', () => adjustClimate(1));
[
  ['oasis-water', 'oasisWater'], ['oasis-fan', 'oasisFan'],
  ['oasis-lights', 'oasisLights'], ['oasis-valve', 'oasisValve']
].forEach(([id, key]) => $(id).addEventListener('click', () => toggleMappedEntity(key)));

const portraitStage = document.querySelector('.portrait-stage');
if (portraitStage && window.matchMedia('(pointer:fine)').matches) {
  portraitStage.addEventListener('pointermove', (event) => {
    const box = portraitStage.getBoundingClientRect();
    const x = ((event.clientX - box.left) / box.width - .5) * 8;
    const y = ((event.clientY - box.top) / box.height - .5) * 6;
    portraitStage.style.setProperty('--look-x', `${x.toFixed(1)}px`);
    portraitStage.style.setProperty('--look-y', `${y.toFixed(1)}px`);
  });
  portraitStage.addEventListener('pointerleave', () => {
    portraitStage.style.setProperty('--look-x', '0px');
    portraitStage.style.setProperty('--look-y', '0px');
  });
}

tick();
setStatus('disconnected');
setInterval(tick, 1000);
if (saved.url && saved.token) connectHA(saved.url, saved.token);
