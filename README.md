# FRIDAY OS v1.0

A responsive JARVIS-inspired Home Assistant command center based on the original FRIDAY concept design.

## v1.0 visual redesign

- Restores the original three-column command-center composition
- Places the animated reactor above FRIDAY as the primary system overview
- Centers FRIDAY as a borderless holographic presence
- Reorganizes WHOOP biometrics into the left telemetry rail
- Places actual mapped property entities and HA telemetry in the right rail
- Keeps insights and system advisories integrated beside FRIDAY
- Uses only explicitly mapped Home Assistant entities; no generic sensor guessing
- Preserves live controls, persistent local credentials, connection states, and responsive behavior

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

v1.0 — original-concept command-center layout
