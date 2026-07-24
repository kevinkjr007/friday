const listeners = new Set();
let socket;
let messageId = 1;
let reconnectTimer;
let credentials;
const pending = new Map();

function websocketUrl(baseUrl) {
  const url = new URL(baseUrl);
  url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
  url.pathname = `${url.pathname.replace(/\/$/, '')}/api/websocket`;
  return url.toString();
}

function emit(event) {
  listeners.forEach((listener) => listener(event));
}

function send(type, extra = {}) {
  const id = messageId++;
  socket.send(JSON.stringify({ id, type, ...extra }));
  return id;
}

export function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function disconnect() {
  clearTimeout(reconnectTimer);
  credentials = null;
  socket?.close();
}

export function callService(domain, service, serviceData = {}, target = {}) {
  return new Promise((resolve, reject) => {
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      reject(new Error('Home Assistant is not connected.'));
      return;
    }

    const id = send('call_service', {
      domain,
      service,
      service_data: serviceData,
      target
    });
    pending.set(id, { resolve, reject });
    setTimeout(() => {
      if (!pending.has(id)) return;
      pending.delete(id);
      reject(new Error('Home Assistant did not respond.'));
    }, 10000);
  });
}

export function connectHA(baseUrl, token) {
  credentials = { baseUrl: baseUrl.replace(/\/$/, ''), token };
  clearTimeout(reconnectTimer);
  socket?.close();
  emit({ type: 'status', status: 'connecting' });

  try {
    socket = new WebSocket(websocketUrl(credentials.baseUrl));
  } catch (error) {
    emit({ type: 'error', error });
    return;
  }

  socket.addEventListener('message', ({ data }) => {
    const message = JSON.parse(data);

    if (message.type === 'auth_required') {
      socket.send(JSON.stringify({ type: 'auth', access_token: credentials.token }));
    } else if (message.type === 'auth_ok') {
      emit({ type: 'status', status: 'connected' });
      send('get_states');
      send('subscribe_events', { event_type: 'state_changed' });
    } else if (message.type === 'auth_invalid') {
      credentials = null;
      emit({ type: 'status', status: 'auth-invalid' });
    } else if (message.type === 'result') {
      const request = pending.get(message.id);
      if (request) {
        pending.delete(message.id);
        if (message.success) request.resolve(message.result);
        else request.reject(new Error(message.error?.message || 'Service call failed.'));
      } else if (Array.isArray(message.result)) {
        emit({ type: 'states', states: message.result });
      }
    } else if (message.type === 'event' && message.event?.event_type === 'state_changed') {
      emit({ type: 'state', state: message.event.data.new_state });
    }
  });

  socket.addEventListener('error', () => emit({ type: 'status', status: 'error' }));
  socket.addEventListener('close', () => {
    emit({ type: 'status', status: 'disconnected' });
    if (credentials) {
      reconnectTimer = setTimeout(
        () => connectHA(credentials.baseUrl, credentials.token),
        5000
      );
    }
  });
}
