# Climate Card

A comprehensive climate monitoring and control card for Home Assistant that brings together weather forecasting, room temperature monitoring with sparkline trends, ducted AC zone control, and standalone climate entity management.

![Climate Card](examples/screenshots/climate-card-preview.png)

---

## Table of Contents

1. [Features](#features)
2. [Installation](#installation)
3. [Configuration](#configuration)
4. [Visual Editor](#visual-editor)
5. [Customization](#customization)
6. [Responsive Behavior](#responsive-behavior)

---

## Features

### Weather & Forecast
- Current outdoor temperature and conditions in the header
- 8-day weather forecast with high/low temperatures
- Collapsible forecast section
- Weather icons for each condition

### Temperature Sensors
- Room temperature monitoring with color-coded values
- Optional humidity display for each sensor
- 24-hour sparkline trend graphs as card backgrounds
- Configurable temperature thresholds for color ranges
- Click any sensor card to open the more-info dialog
- Configurable grid columns (1-4)
- Collapsible section

### House AC (Ducted Systems)
- Master control row with mode and fan speed dropdowns
- Individual zone rows with on/off state and temperature/damper controls
- Collapsible zones with configurable default state
- Visual feedback with mode-based color accents
- Support for both temperature setpoints and percentage-based dampers

### Standalone Climate Entities
- Support for any climate entity (e.g., split systems, portable AC)
- Mode dropdown with visual icons
- Temperature control with +/- buttons
- Click row to open more-info dialog
- Color-coded accent based on current mode

---

## Installation

### HACS (Recommended)

1. Open HACS in Home Assistant
2. Click the three dots menu → Custom repositories
3. Add repository URL and select "Lovelace" category
4. Search for "Climate Card" and install
5. Refresh your browser

### Manual Installation

1. Download `climate-card.js` from the latest release
2. Copy to `/config/www/climate-card/climate-card.js`
3. Add resource in Home Assistant:
   - Settings → Dashboards → Resources
   - Add `/local/climate-card/climate-card.js` as JavaScript Module

---

## Configuration

### Full Configuration Example

```yaml
type: custom:climate-card
title: Climate

weather:
  entity: weather.home
  forecast_days: 8
  collapsible: true
  collapsed: false

temperature_sensors:
  collapsible: true
  collapsed: false
  trend_hours: 24
  columns: 3
  thresholds:
    cold: 18
    cool: 22
    comfortable: 26
    warm: 30
  sensors:
    - name: Living Room
      temperature_entity: sensor.living_room_temperature
      humidity_entity: sensor.living_room_humidity
    - name: Bedroom
      temperature_entity: sensor.bedroom_temperature
      humidity_entity: sensor.bedroom_humidity
    - name: Kitchen
      temperature_entity: sensor.kitchen_temperature

house_ac:
  name: AC
  icon: mdi:air-conditioner
  power_entity: switch.ac_power
  mode_entity: select.ac_mode
  fan_entity: select.ac_fan_speed
  zones_collapsible: true
  zones_collapsed: false
  zones:
    - name: Master Bedroom
      power_entity: switch.ac_zone_master
      temperature_entity: number.ac_zone_master_setpoint
      icon: mdi:bed-king
    - name: Living Room
      power_entity: switch.ac_zone_living
      percent_open_entity: number.ac_zone_living_damper
      step: 5

climate_entities:
  - entity: climate.garage_ac
    name: Garage Air Con
    section_name: GARAGE
    icon: mdi:air-conditioner
```

### Minimal Configuration

```yaml
type: custom:climate-card
weather:
  entity: weather.home
temperature_sensors:
  sensors:
    - name: Living Room
      temperature_entity: sensor.living_room_temperature
```

---

## Configuration Options

### Card Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `title` | string | `"Climate"` | Card title displayed in header |
| `weather` | object | - | Weather configuration |
| `temperature_sensors` | object | - | Temperature sensors configuration |
| `house_ac` | object | - | Ducted AC system configuration |
| `climate_entities` | array | - | Standalone climate entities |

### Weather Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `entity` | string | **Required** | Weather entity ID |
| `forecast_days` | number | `8` | Number of forecast days (1-10) |
| `collapsible` | boolean | `true` | Allow section to collapse |
| `collapsed` | boolean | `false` | Initial collapsed state |

### Temperature Sensors Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `collapsible` | boolean | `true` | Allow section to collapse |
| `collapsed` | boolean | `false` | Initial collapsed state |
| `trend_hours` | number | `24` | Hours of history for sparklines |
| `columns` | number | `3` | Grid columns (1-4) |
| `thresholds` | object | See below | Temperature color thresholds |
| `sensors` | array | **Required** | Array of sensor configurations |

#### Temperature Thresholds

| Threshold | Default | Color | Range |
|-----------|---------|-------|-------|
| `cold` | `18` | Blue | Below this value |
| `cool` | `22` | Cyan | Between cold and this value |
| `comfortable` | `26` | Green | Between cool and this value |
| `warm` | `30` | Orange | Between comfortable and this value |
| - | - | Red | Above warm value |

#### Sensor Configuration

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `name` | string | **Required** | Display name |
| `temperature_entity` | string | **Required** | Temperature sensor entity |
| `humidity_entity` | string | - | Optional humidity sensor entity |

### House AC Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `name` | string | `"AC"` | Display name for master row |
| `icon` | string | `"mdi:air-conditioner"` | Icon for master row |
| `power_entity` | string | - | Optional power switch entity |
| `mode_entity` | string | **Required** | Select entity for AC mode |
| `fan_entity` | string | **Required** | Select entity for fan speed |
| `zones_collapsible` | boolean | `true` | Allow zones to collapse |
| `zones_collapsed` | boolean | `false` | Initial zones collapsed state |
| `zones` | array | **Required** | Array of zone configurations |

#### Zone Configuration

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `name` | string | **Required** | Zone display name |
| `power_entity` | string | - | Zone power switch entity |
| `temperature_entity` | string | - | Temperature setpoint entity |
| `percent_open_entity` | string | - | Damper percentage entity |
| `step` | number | `0.5` / `5` | Increment step (temp: 0.5, percent: 5) |
| `icon` | string | `"mdi:air-conditioner"` | Zone icon |

*Note: Each zone should have either `temperature_entity` OR `percent_open_entity`, not both.*

### Climate Entity Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `entity` | string | **Required** | Climate entity ID |
| `name` | string | Entity friendly name | Display name |
| `section_name` | string | - | Section header text |
| `icon` | string | `"mdi:air-conditioner"` | Entity icon |

---

## Visual Editor

The card includes a full visual editor accessible from the Home Assistant UI:

1. Add a new card to your dashboard
2. Search for "Climate Card"
3. Use the visual editor to configure all options

The editor includes sections for:
- Weather configuration
- Temperature sensors with threshold settings
- House AC master controls and zones
- Standalone climate entities

---

## Customization

### Temperature Colors

The card uses CSS custom properties for temperature colors that can be overridden in your theme:

```css
:root {
  --temp-cold: #3B82F6;        /* Blue - below cold threshold */
  --temp-cool: #06B6D4;        /* Cyan - between cold and cool */
  --temp-comfortable: #10B981; /* Green - between cool and comfortable */
  --temp-warm: #F59E0B;        /* Orange - between comfortable and warm */
  --temp-hot: #EF4444;         /* Red - above warm threshold */
}
```

### AC Mode Colors

```css
:root {
  --climate-cool: #3B82F6;
  --climate-heat: #F97316;
  --climate-fan: #06B6D4;
  --climate-dry: #A855F7;
  --climate-auto: #10B981;
  --climate-off: var(--secondary-text-color);
}
```

### Weather Colors

```css
:root {
  --weather-sun: #FBBF24;
  --weather-moon: #FCD34D;
  --weather-cloud: #94A3B8;
  --weather-rain: #3B82F6;
  --weather-storm: #6366F1;
}
```

---

## Responsive Behavior

The card automatically adapts to different screen sizes:

### Desktop (> 800px)
- Temperature sensors: Configured columns (default 3)
- Forecast: 8 columns in grid
- Full AC control layout

### Tablet (600-800px)
- Temperature sensors: 2 columns
- Forecast: 8 columns
- AC controls wrap as needed

### Mobile (< 600px)
- Temperature sensors: 1 column
- Forecast: Horizontal scroll
- AC master row controls stack vertically

---

## Interactions

- **Section headers**: Click to expand/collapse (when enabled)
- **Temperature sensor cards**: Click to open more-info dialog
- **Climate entity rows**: Click to open more-info dialog
- **AC zone rows**: Click row (not controls) to toggle power
- **Dropdowns**: Click to select mode/fan speed
- **+/- buttons**: Adjust temperature or damper percentage

---

## Changelog

### Recent Updates

- **Configurable temperature thresholds** - Set custom temperature ranges for color coding
- **Collapsible AC zones** - Zones can be collapsed under House AC with `zones_collapsible` and `zones_collapsed` options
- **24-hour sparkline trends** - Default trend period increased to 24 hours to match native HA cards
- **Full-card sparkline overlay** - Sparklines now fill the entire sensor card as a subtle background
- **Improved mobile layout** - Better responsive behavior for all screen sizes
- **Click-to-dialog** - Temperature sensors and climate rows open more-info dialogs when clicked
- **Visual editor enhancements** - Full UI editor support for all configuration options including thresholds

---

## License

MIT License - See [LICENSE](../LICENSE) for details.
