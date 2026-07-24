# FRIDAY OS v1.3

A responsive JARVIS-inspired Home Assistant command center based on the original FRIDAY concept design.

## v1.3 portrait and environmental telemetry

- Reframes FRIDAY to preserve her full face within the center holographic stage
- Fixes numeric sensor lookup when mappings use Home Assistant friendly names
- Adds confirmed defaults for Front yard temperature and humidity
- Adds the confirmed Chicken Coop temperature default
- Leaves rainfall explicitly unmapped until a real rain entity is exposed or selected

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

v1.3 — improved FRIDAY framing and corrected environmental telemetry
