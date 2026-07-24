# FRIDAY OS v0.4

A responsive JARVIS-inspired command dashboard for Home Assistant.

## Included

- Live Home Assistant WebSocket connection with automatic reconnect
- Browser-local credential storage
- Live entity state store
- WHOOP recovery, sleep, HRV, resting heart rate, and strain
- Garage, exterior door, chicken coop, and unavailable-device status
- Responsive desktop, tablet, and mobile HUD
- Recovery-aware daily recommendation
- Browser-based entity mapping for garage, exterior doors, and coop
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

## Expected WHOOP entities

FRIDAY automatically checks these entity IDs:

- `sensor.whoop_recovery_score`
- `sensor.whoop_sleep_performance`
- `sensor.whoop_hrv`
- `sensor.whoop_resting_hr`
- `sensor.whoop_day_strain`

Fallback entity IDs without the `whoop_` prefix are also supported. Property entities can be selected under **Configure Link** after the first successful connection.

## Version

v0.4 — entity mapping and property controls
