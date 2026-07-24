# FRIDAY OS v0.5

A responsive JARVIS-inspired command dashboard for Home Assistant.

## Included

- Live Home Assistant WebSocket connection with automatic reconnect
- Browser-local credential storage
- Live entity state store
- Explicitly mapped WHOOP recovery, sleep, HRV, resting heart rate, and strain
- Garage, exterior door, chicken coop, and unavailable-device status
- Responsive desktop, tablet, and mobile HUD
- Recovery-aware daily recommendation
- Browser-based entity mapping for WHOOP, garage, exterior doors, and coop
- No automatic entity guessing; unmapped capabilities remain unconfigured
- Confirmed garage and coop cover controls
- Default link address set to `http://homeassistant.local:8123`

## Install on Home Assistant Green

Copy the repository files into:

```text
/homeassistant/www/friday/
```

Open:

```text
http://HOME_ASSISTANT_ADDRESS:8123/local/friday/index.html
```

Select **Configure Link**, then enter the Home Assistant URL and a Long-Lived Access Token.
Create the token in your Home Assistant profile under **Security**.

The token is saved only in that browser's local storage.

## Entity mapping

After the first successful connection, select only the entities that exist in your
Home Assistant instance under **Configure Link**. FRIDAY never guesses entities by
name. Blank mappings remain visibly unconfigured and do not control anything.

## Version

v0.5 — explicit entity mapping with no generic fallbacks
