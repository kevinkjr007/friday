# FRIDAY OS v1.5

A responsive JARVIS-inspired Home Assistant command center based on the original FRIDAY concept design.

## v1.5 presence and control upgrade

- Replaces the boxed portrait with a true transparent-background FRIDAY figure
- Adds thermostat HVAC-mode and fan-mode controls when supported
- Adds live controls for the confirmed Couch Table Lamp and Modern Lamp entities
- Adds a one-tap Living Room All Off command
- Keeps Oasis, weather, WHOOP freshness, and coop access controls intact

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

v1.5 — transparent FRIDAY presence, expanded climate control, and real quick actions
