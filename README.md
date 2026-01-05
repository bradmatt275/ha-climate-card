# Climate Card

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-41BDF5.svg)](https://github.com/hacs/integration)
[![GitHub Release](https://img.shields.io/github/v/release/bradmatt275/ha-climate-card)](https://github.com/bradmatt275/ha-climate-card/releases)


A unified climate monitoring and control card for Home Assistant that brings together weather forecasting, ducted AC zone control, standalone climate entities, and room temperature monitoring with historical trends.

![Climate Card Preview](docs/examples/screenshots/climate-card-preview.png)

## Features

- **Weather Header** - Current conditions with 8-day forecast
- **Temperature Sensors** - Room temperatures with 12-hour sparkline trends
- **House AC Control** - Ducted AC system with zone management
- **Climate Entities** - Standalone climate device controls
- **Collapsible Sections** - Focus on what matters
- **Material You Design** - Dark-first, theme-aware styling

## Installation

### HACS (Recommended)

[![Open your Home Assistant instance and open a repository inside the Home Assistant Community Store.](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=bradmatt275&repository=ha-climate-card&category=integration)

1. Open HACS in Home Assistant
2. Go to "Frontend" section
3. Click the menu icon and select "Custom repositories"
4. Add this repository URL and select "Lovelace" as the category
5. Find "Climate Card" and install it
6. Refresh your browser

### Manual Installation

1. Download `climate-card.js` from the latest release
2. Copy it to `config/www/community/climate-card/`
3. Add the resource in your Lovelace configuration:

```yaml
resources:
  - url: /hacsfiles/climate-card/climate-card.js
    type: module
```

## Configuration

### Minimal Example

```yaml
type: custom:climate-card
weather:
  entity: weather.home
climate_entities:
  - entity: climate.living_room
```

### Full Example

```yaml
type: custom:climate-card
title: Home Climate

weather:
  entity: weather.home
  forecast_days: 8
  collapsible: true
  collapsed: false

temperature_sensors:
  collapsible: true
  collapsed: false
  trend_hours: 12
  columns: 3
  sensors:
    - name: Living Room
      temperature_entity: sensor.living_room_temperature
      humidity_entity: sensor.living_room_humidity
    - name: Bedroom
      temperature_entity: sensor.bedroom_temperature
      humidity_entity: sensor.bedroom_humidity

house_ac:
  name: AC
  icon: mdi:air-conditioner
  mode_entity: select.ac_mode
  fan_entity: select.ac_fan_speed
  zones:
    - name: Master Bedroom
      state_entity: binary_sensor.ac_zone_master
      value_entity: number.ac_zone_master_setpoint
      value_type: temperature
    - name: Living Room
      state_entity: binary_sensor.ac_zone_living
      value_entity: number.ac_zone_living_setpoint
      value_type: temperature

climate_entities:
  - entity: climate.garage_air_con
    section_name: Garage
```

## Configuration Options

### Weather

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `entity` | string | **Required** | Weather entity ID |
| `forecast_days` | number | 8 | Number of forecast days (1-10) |
| `show_humidity` | boolean | false | Show humidity in header |
| `collapsible` | boolean | true | Allow section to collapse |
| `collapsed` | boolean | false | Initial collapsed state |

### Temperature Sensors

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `collapsible` | boolean | true | Allow section to collapse |
| `collapsed` | boolean | false | Initial collapsed state |
| `trend_hours` | number | 12 | Hours of history for sparkline |
| `columns` | number | 3 | Grid columns (1-4) |
| `sensors` | array | **Required** | List of sensor configurations |

#### Sensor Configuration

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `name` | string | **Required** | Display name |
| `temperature_entity` | string | **Required** | Temperature sensor entity |
| `humidity_entity` | string | - | Optional humidity sensor |
| `icon` | string | - | Optional MDI icon |

### House AC

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `name` | string | "AC" | Display name |
| `icon` | string | mdi:air-conditioner | Header icon |
| `mode_entity` | string | **Required** | Select entity for mode |
| `fan_entity` | string | **Required** | Select entity for fan speed |
| `zones` | array | **Required** | List of zone configurations |

#### Zone Configuration

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `name` | string | **Required** | Zone display name |
| `state_entity` | string | **Required** | Binary sensor for on/off state |
| `value_entity` | string | **Required** | Number entity for setpoint |
| `value_type` | string | **Required** | "temperature" or "percentage" |
| `step` | number | 0.5/5 | Adjustment step |
| `icon` | string | - | Optional MDI icon |

### Climate Entities

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `entity` | string | **Required** | Climate entity ID |
| `name` | string | Entity name | Display name |
| `section_name` | string | - | Section header text |
| `icon` | string | Entity icon | Override icon |
| `show_humidity` | boolean | false | Show humidity if available |

## Development

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Development with watch mode
npm run watch
```

## License

MIT License - see [LICENSE](LICENSE) for details.
