# FRIDAY OS v1.2

A responsive JARVIS-inspired Home Assistant command center based on the original FRIDAY concept design.

## v1.2 priority command center

- Counts only explicitly mapped priority systems when reporting availability
- Replaces unused garage and exterior-door cards with focused chicken-coop access
- Adds reactor-wing readouts for WHOOP readiness and priority home status
- Improves vertical scaling for common desktop dashboard heights
- Preserves climate, weather, Oasis, WHOOP, Home Assistant, and local credential support

## Install

Copy the repository files into `/homeassistant/www/friday/`, preserving your existing `config.local.js`, then open:

```text
http://homeassistant.local:8123/local/friday/index.html
```

## Persistent local credentials

Copy `config.local.example.js` to `config.local.js`, then add your token:

```js
window.FRIDAY_CONFIG = {
  haUrl: 'http://homeassistant.local:8123',
  token: 'PASTE_YOUR_LONG_LIVED_ACCESS_TOKEN_HERE'
};
```

`config.local.js` is ignored by Git. Keep it in the Home Assistant folder when updating the dashboard.

## Entity mapping

Use **Configure Link** to select only entities that exist in your Home Assistant instance. Known WHOOP sensors and the chicken-coop door sensor remain the built-in defaults. Blank mappings remain visibly unconfigured and cannot trigger controls.

## Version

v1.2 — priority status, cleaner availability, and responsive vertical scaling
