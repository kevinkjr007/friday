# FRIDAY OS v1.4

A responsive JARVIS-inspired Home Assistant command center based on the original FRIDAY concept design.

## v1.4 priority and presentation fixes

- Translates the chicken-coop binary sensor into clear Open/Closed language
- Maps rainfall to the confirmed `Daily rain` Home Assistant entity
- Dissolves FRIDAY's portrait backdrop into the command stage
- Replaces the generic System Advisory with an actionable Priority Brief
- Shows WHOOP telemetry freshness and warns when data is over 90 minutes old

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

v1.4 — clearer status language, rain mapping, portrait integration, and data freshness
