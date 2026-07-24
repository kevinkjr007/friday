# FRIDAY OS v1.1

A responsive JARVIS-inspired Home Assistant command center based on the original FRIDAY concept design.

## v1.1 home intelligence

- Removes the "AI Assistant" designation; FRIDAY is the home's intelligence
- Adds live thermostat temperature, mode, setpoint, and adjustment controls
- Adds mapped outdoor temperature, humidity, rainfall, and coop temperature telemetry
- Adds Oasis controls for the water feature, porch fan, porch lights, and dog-bowl valve
- Resolves MCP-confirmed device names at runtime while preserving explicit entity selectors
- Keeps the v1.0 command-center composition, WHOOP data, doors, and system telemetry

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

v1.1 — climate, weather, coop, and Oasis controls
