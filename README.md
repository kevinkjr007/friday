# FRIDAY OS v0.8

A responsive JARVIS-inspired command dashboard for Home Assistant.

## Included

- Live Home Assistant WebSocket connection with automatic reconnect
- Optional persistent local configuration file for the Home Assistant URL and token
- Live entity state store
- Explicitly mapped WHOOP recovery, sleep, HRV, resting heart rate, and strain
- Garage, exterior door, chicken coop, and unavailable-device status
- Responsive desktop, tablet, and mobile HUD
- Original holographic FRIDAY portrait as the visual command presence
- Animated arc-reactor core tied to Home Assistant connection state
- Subtle cursor-responsive portrait parallax on desktop
- Reduced-motion support through the browser's motion preference
- Recovery-aware daily recommendation
- Browser-based entity mapping for WHOOP, garage, exterior doors, and coop
- Your known WHOOP sensors and chicken-coop door sensor are preconfigured by entity ID
- No automatic entity guessing; unknown capabilities remain unconfigured
- Confirmed garage and coop cover controls
- Default link address set to `http://homeassistant.local:8123`

## Install on Home Assistant Green

Copy the repository files into:

```text
/homeassistant/www/friday/
```

Open:

```text
http://homeassistant.local:8123/local/friday/index.html
```

## Persistent local credentials

Copy `config.local.example.js` to `config.local.js` in `/homeassistant/www/friday/`, then replace the placeholder token:

```js
window.FRIDAY_CONFIG = {
  haUrl: 'http://homeassistant.local:8123',
  token: 'PASTE_YOUR_LONG_LIVED_ACCESS_TOKEN_HERE'
};
```

Keep `config.local.js` in the Home Assistant folder when updating the other dashboard files. It is ignored by Git and must never be committed. When present, its token takes priority and FRIDAY removes any older token from browser local storage.

Anything served from `/config/www/` is reachable to clients that can access its URL. Use this only on a trusted local network and do not expose the FRIDAY directory publicly.

If the local file is absent, select **Configure Link** and enter the token in the browser as before.

## Entity mapping

After the first successful connection, select only the entities that exist in your Home Assistant instance under **Configure Link**. FRIDAY never guesses entities by name. Blank mappings remain visibly unconfigured and do not control anything.

## Version

v0.8 — holographic FRIDAY presence and animated connection-state reactor
