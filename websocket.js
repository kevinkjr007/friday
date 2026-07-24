const listeners = new Set();
let socket;
let messageId = 1;
let reconnectTimer;
let credentials;

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
  socket.send(JSON.stringify({ id: messageId++, type, ...extra }));
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
    } else if (message.type === 'result' && Array.isArray(message.result)) {
      emit({ type: 'states', states: message.result });
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
