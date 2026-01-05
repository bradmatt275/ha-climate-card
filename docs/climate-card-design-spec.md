# Climate Card Design Specification

A unified climate monitoring and control card for Home Assistant that brings together weather forecasting, ducted AC zone control, standalone climate entities, and room temperature monitoring with historical trends.

---

## Table of Contents

1. [Overview](#overview)
2. [Visual Design](#visual-design)
3. [Component Breakdown](#component-breakdown)
4. [Configuration Schema](#configuration-schema)
5. [TypeScript Interfaces](#typescript-interfaces)
6. [Interaction Behaviors](#interaction-behaviors)
7. [Animation Specifications](#animation-specifications)
8. [Responsive Behavior](#responsive-behavior)
9. [File Structure](#file-structure)
10. [Implementation Notes](#implementation-notes)

---

## Overview

### Purpose

Replace a basic climate dashboard with a polished, unified card that provides:

- Current weather conditions and 8-day forecast
- Room temperature monitoring with 12-hour trend sparklines
- Ducted AC system control with zone management
- Standalone climate entity controls (e.g., garage AC)

### Design Philosophy

- **Material You aesthetic** matching existing custom cards in the dashboard
- **Dark-first design** with proper theme integration
- **Monitoring data grouped together** (weather + temps) separate from controls
- **Collapsible sections** for forecast and temperatures to focus on controls when needed
- **Dynamic configuration** — dropdown options fetched from entities, not hardcoded

---

## Visual Design

### Layout Structure

```
┌─────────────────────────────────────────────────────────────────────┐
│  Climate                                          ☀️ 23.3°C        │
│                                                   Clear, night      │
├─────────────────────────────────────────────────────────────────────┤
│  ▼ FORECAST                                                         │
│  ┌───────┬───────┬───────┬───────┬───────┬───────┬───────┬───────┐  │
│  │  Mon  │  Tue  │  Wed  │  Thu  │  Fri  │  Sat  │  Sun  │  Mon  │  │
│  │  🌙   │  ☀️   │  ☀️   │  ☀️   │  ☁️   │  ☀️   │  ☀️   │  ☀️   │  │
│  │  34°  │  31°  │  33°  │  30°  │  30°  │  33°  │  35°  │  36°  │  │
│  │   —   │  19°  │  17°  │  17°  │  16°  │  14°  │  18°  │  20°  │  │
│  └───────┴───────┴───────┴───────┴───────┴───────┴───────┴───────┘  │
├─────────────────────────────────────────────────────────────────────┤
│  ▼ TEMPERATURES                                                     │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐        │
│  │ Dusk's Room     │ │ Master Bedroom  │ │ Kitchen         │        │
│  │ 28.9°C  💧41.6% │ │ 26.7°C  💧48.7% │ │ 27.5°C  💧48.9% │        │
│  │ ╭──────────────╮│ │ ╭──────────────╮│ │ ╭──────────────╮│        │
│  │ │▁▂▃▄▅▆▇█▇▆▅▄▃▂││ │ │▁▁▂▂▃▃▄▄▃▃▂▂▁▁││ │ │▂▂▃▃▄▅▅▄▄▃▃▂▂▁││        │
│  │ ╰──────────────╯│ │ ╰──────────────╯│ │ ╰──────────────╯│        │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘        │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐        │
│  │ Garage          │ │ Roof            │ │ Back Yard       │        │
│  │ 27.5°C  💧37.8% │ │ 20.3°C  💧58.6% │ │ 25.4°C  💧51.0% │        │
│  │ ╭──────────────╮│ │ ╭──────────────╮│ │ ╭──────────────╮│        │
│  │ │▄▄▄▄▃▃▃▃▃▃▄▄▄▄││ │ │▇▆▅▄▃▂▁▁▂▃▄▅▆▇││ │ │▃▃▄▅▆▆▆▅▄▃▃▂▂▂││        │
│  │ ╰──────────────╯│ │ ╰──────────────╯│ │ ╰──────────────╯│        │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘        │
├─────────────────────────────────────────────────────────────────────┤
│  HOUSE AC                                                           │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │ ⚡ AC                      [❄️ Cool ▼]    [✱ Low ▼]             ││
│  └─────────────────────────────────────────────────────────────────┘│
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │ ⚡ Master Bedroom          24.0 °C             [ − ]  [ + ]     ││
│  │   On                                                            ││
│  └─────────────────────────────────────────────────────────────────┘│
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │ ⚡ Living Room             24.0 °C             [ − ]  [ + ]     ││
│  │   Off                                                           ││
│  └─────────────────────────────────────────────────────────────────┘│
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │ ⚡ TV Room                 26.0 °C             [ − ]  [ + ]     ││
│  │   Off                                                           ││
│  └─────────────────────────────────────────────────────────────────┘│
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │ ⚡ Bedroom 2               ✱ 0.0%              [ − ]  [ + ]     ││
│  │   Off                                                           ││
│  └─────────────────────────────────────────────────────────────────┘│
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │ ⚡ Bedroom 3               ✱ 0.0%              [ − ]  [ + ]     ││
│  │   Off                                                           ││
│  └─────────────────────────────────────────────────────────────────┘│
├─────────────────────────────────────────────────────────────────────┤
│  GARAGE                                                             │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │ 🌀 Garage Air Con         [⏻ Off ▼]      [ − ] 23 [ + ]        ││
│  └─────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────┘
```

### Section Order

1. **Header** — Card title + current weather conditions
2. **Forecast** — 8-day weather forecast (collapsible)
3. **Temperatures** — Room temperature sensors with sparklines (collapsible)
4. **House AC** — Ducted AC master controls + zone rows
5. **Garage** — Standalone climate entities

This groups monitoring data (weather, temps) together at the top, with controls below. When collapsible sections are collapsed, the view focuses on AC controls.

### Color Scheme

Reference the main design guidelines in `ha-card-design-guidelines.md` for base colors. Additional climate-specific colors:

```css
:host {
  /* AC Mode Colors */
  --climate-cool: #3B82F6;
  --climate-cool-container: #1E3A8A;
  
  --climate-heat: #F97316;
  --climate-heat-container: #9A3412;
  
  --climate-fan: #06B6D4;
  --climate-fan-container: #155E75;
  
  --climate-dry: #A855F7;
  --climate-dry-container: #581C87;
  
  --climate-auto: #10B981;
  --climate-auto-container: #064E3B;
  
  --climate-off: var(--secondary-text-color);
  
  /* Temperature Range Colors (for sensor cards) */
  --temp-cold: #3B82F6;        /* < 18°C */
  --temp-cool: #06B6D4;        /* 18-22°C */
  --temp-comfortable: #10B981; /* 22-26°C */
  --temp-warm: #F59E0B;        /* 26-30°C */
  --temp-hot: #EF4444;         /* > 30°C */
  
  /* Weather Icon Colors */
  --weather-sun: #FBBF24;
  --weather-moon: #FCD34D;
  --weather-cloud: #94A3B8;
  --weather-rain: #3B82F6;
  --weather-storm: #6366F1;
}
```

### Typography

| Element | Size | Weight | Font | Color |
|---------|------|--------|------|-------|
| Card title | 16px | 500 | System | `--primary-text-color` |
| Current outdoor temp | 24px | 500 | Monospace | `--primary-text-color` |
| Weather condition | 14px | 400 | System | `--secondary-text-color` |
| Section headers | 12px | 500 | System, uppercase | `--secondary-text-color` |
| Forecast day | 12px | 500 | System | `--secondary-text-color` |
| Forecast high temp | 14px | 500 | Monospace | `--primary-text-color` |
| Forecast low temp | 14px | 400 | Monospace | `--secondary-text-color` |
| Sensor room name | 12px | 500 | System | `--primary-text-color` |
| Sensor temperature | 16px | 600 | Monospace | Temp range color |
| Sensor humidity | 12px | 500 | Monospace | `--secondary-text-color` |
| Zone name | 14px | 500 | System | `--primary-text-color` |
| Zone state | 12px | 400 | System | `--secondary-text-color` |
| Zone value | 16px | 600 | Monospace | `--primary-text-color` |
| Dropdown text | 14px | 500 | System | Inherit from mode |

---

## Component Breakdown

### 1. Card Header

```
┌─────────────────────────────────────────────────────────────────────┐
│  Climate                                          ☀️ 23.3°C        │
│                                                   Clear, night      │
└─────────────────────────────────────────────────────────────────────┘
```

**Left side:**
- Card title (configurable, defaults to "Climate")

**Right side:**
- Weather icon (from weather entity condition)
- Current temperature (hero value, 24px monospace)
- Weather condition text below (14px, secondary color)

**Styling:**
- Flexbox row with `justify-content: space-between`
- Right side is a column aligned to the end
- Standard card header padding (16px)

### 2. Forecast Section

```
┌─────────────────────────────────────────────────────────────────────┐
│  ▼ FORECAST                                                         │
│  ┌───────┬───────┬───────┬───────┬───────┬───────┬───────┬───────┐  │
│  │  Mon  │  Tue  │  Wed  │  Thu  │  Fri  │  Sat  │  Sun  │  Mon  │  │
│  │  🌙   │  ☀️   │  ☀️   │  ☀️   │  ☁️   │  ☀️   │  ☀️   │  ☀️   │  │
│  │  34°  │  31°  │  33°  │  30°  │  30°  │  33°  │  35°  │  36°  │  │
│  │   —   │  19°  │  17°  │  17°  │  16°  │  14°  │  18°  │  20°  │  │
│  └───────┴───────┴───────┴───────┴───────┴───────┴───────┴───────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

**Section header:**
- Collapse indicator (▼ expanded, ▶ collapsed)
- "FORECAST" label (12px, uppercase, 500 weight)
- Entire header is clickable to toggle collapse

**Forecast grid:**
- 8 columns, equal width
- Each day shows:
  - Abbreviated day name (Mon, Tue, etc.)
  - Weather condition icon
  - High temperature (prominent)
  - Low temperature (subdued, or "—" if unavailable)
- Centered text in each column

**Collapsible behavior:**
- Smooth height animation (200ms ease)
- Only the grid collapses, header remains visible
- Collapsed state persisted in config

### 3. Temperature Sensors Section

```
┌─────────────────────────────────────────────────────────────────────┐
│  ▼ TEMPERATURES                                                     │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐        │
│  │ Dusk's Room     │ │ Master Bedroom  │ │ Kitchen         │        │
│  │ 28.9°C  💧41.6% │ │ 26.7°C  💧48.7% │ │ 27.5°C  💧48.9% │        │
│  │ ╭──────────────╮│ │ ╭──────────────╮│ │ ╭──────────────╮│        │
│  │ │   sparkline  ││ │ │   sparkline  ││ │ │   sparkline  ││        │
│  │ ╰──────────────╯│ │ ╰──────────────╯│ │ ╰──────────────╯│        │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘        │
└─────────────────────────────────────────────────────────────────────┘
```

**Section header:**
- Same collapsible pattern as forecast
- "TEMPERATURES" label

**Sensor grid:**
- CSS Grid, configurable columns (default 3)
- Gap of 8px between cards

**Individual sensor card:**
- Room name (12px, 500 weight)
- Temperature value (16px, 600 weight, monospace, color-coded)
- Humidity value (12px, secondary color) — optional, only shown if configured
- 12-hour sparkline graph (SVG)

**Sensor card styling:**
- Background: `var(--card-background-color)`
- Border: `1px solid var(--divider-color)`
- Border radius: 12px
- Padding: 12px

**Sparkline:**
- Height: 32px
- SVG path with `stroke-linecap: round`
- Line color matches current temperature range
- Fill: subtle gradient to transparent
- Animated draw on initial render

**Temperature color mapping:**
```typescript
function getTemperatureColor(temp: number): string {
  if (temp < 18) return 'var(--temp-cold)';
  if (temp < 22) return 'var(--temp-cool)';
  if (temp < 26) return 'var(--temp-comfortable)';
  if (temp < 30) return 'var(--temp-warm)';
  return 'var(--temp-hot)';
}
```

### 4. House AC Section

```
┌─────────────────────────────────────────────────────────────────────┐
│  HOUSE AC                                                           │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │ ⚡ AC                      [❄️ Cool ▼]    [✱ Low ▼]             ││
│  └─────────────────────────────────────────────────────────────────┘│
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │ ⚡ Master Bedroom          24.0 °C             [ − ]  [ + ]     ││
│  │   On                                                            ││
│  └─────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────┘
```

**Section header:**
- "HOUSE AC" label (not collapsible)

**Master control row:**
- Icon (configurable, default `mdi:air-conditioner`)
- Name (configurable, default "AC")
- Mode dropdown (fetches options from select entity)
- Fan speed dropdown (fetches options from select entity)

**Master row styling:**
- Background tint based on current mode
- Left border accent (4px) in mode color
- Dropdowns use `ha-select` or custom styled select

**Mode-to-color mapping:**
```typescript
const modeColors: Record<string, { color: string; container: string }> = {
  cool: { color: 'var(--climate-cool)', container: 'var(--climate-cool-container)' },
  heat: { color: 'var(--climate-heat)', container: 'var(--climate-heat-container)' },
  fan: { color: 'var(--climate-fan)', container: 'var(--climate-fan-container)' },
  fan_only: { color: 'var(--climate-fan)', container: 'var(--climate-fan-container)' },
  dry: { color: 'var(--climate-dry)', container: 'var(--climate-dry-container)' },
  auto: { color: 'var(--climate-auto)', container: 'var(--climate-auto-container)' },
  off: { color: 'var(--climate-off)', container: 'transparent' },
};
```

**Mode dropdown icons:**
```typescript
const modeIcons: Record<string, string> = {
  cool: 'mdi:snowflake',
  heat: 'mdi:fire',
  fan: 'mdi:fan',
  fan_only: 'mdi:fan',
  dry: 'mdi:water-percent',
  auto: 'mdi:autorenew',
  off: 'mdi:power',
};
```

**Zone rows:**
- Icon (configurable per zone, default `mdi:air-conditioner`)
- Zone name
- State indicator (On/Off) below name
- Value display (temperature or percentage)
- +/- control buttons

**Zone row styling:**
- Background: `var(--card-background-color)`
- Border: `1px solid var(--divider-color)`
- Border radius: 12px
- Left border accent (4px) in teal/emerald when active
- Active zones have subtle pulse animation on icon

**Zone value types:**
- `temperature`: Displays as "24.0 °C", +/- adjusts by 0.5
- `percentage`: Displays as "✱ 45.0%", +/- adjusts by 5

### 5. Standalone Climate Entities Section

```
┌─────────────────────────────────────────────────────────────────────┐
│  GARAGE                                                             │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │ 🌀 Garage Air Con         [⏻ Off ▼]      [ − ] 23 [ + ]        ││
│  └─────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────┘
```

**Section header:**
- Section name (configurable, derived from first entity or explicit)

**Climate entity row:**
- Icon (from entity or configured)
- Entity name
- Mode dropdown (options from `hvac_modes` attribute)
- Temperature setpoint with +/- buttons

**Row styling:**
- Same pattern as master AC row
- Mode-based coloring

---

## Configuration Schema

### Full YAML Configuration

```yaml
type: custom:climate-card
title: Climate  # Optional, defaults to "Climate"

# Weather configuration
weather:
  entity: weather.bom_piara_waters  # Required for weather features
  forecast_days: 8  # Optional, 1-10, default 8
  show_humidity: false  # Optional, show humidity in header
  collapsible: true  # Optional, default true
  collapsed: false  # Optional, initial state, default false

# Temperature sensors configuration
temperature_sensors:
  collapsible: true  # Optional, default true
  collapsed: false  # Optional, initial state, default false
  trend_hours: 12  # Optional, 1-24, default 12
  columns: 3  # Optional, 1-4, default 3
  sensors:
    - name: Dusk's Room
      temperature_entity: sensor.dusks_room_temperature
      humidity_entity: sensor.dusks_room_humidity  # Optional
      icon: mdi:teddy-bear  # Optional
    - name: Master Bedroom
      temperature_entity: sensor.master_bedroom_temperature
      humidity_entity: sensor.master_bedroom_humidity
    - name: Kitchen
      temperature_entity: sensor.kitchen_temperature
      humidity_entity: sensor.kitchen_humidity
    - name: Garage
      temperature_entity: sensor.garage_temperature
      humidity_entity: sensor.garage_humidity
    - name: Roof
      temperature_entity: sensor.roof_temperature
      humidity_entity: sensor.roof_humidity
    - name: Back Yard
      temperature_entity: sensor.back_yard_temperature
      humidity_entity: sensor.back_yard_humidity

# House AC configuration (custom ducted system)
house_ac:
  name: AC  # Optional display name
  icon: mdi:air-conditioner  # Optional
  mode_entity: select.ac_mode  # Required - select entity for mode
  fan_entity: select.ac_fan_speed  # Required - select entity for fan
  zones:
    - name: Master Bedroom
      state_entity: binary_sensor.ac_zone_master  # On/Off state
      value_entity: number.ac_zone_master_setpoint  # Temperature or damper
      value_type: temperature  # 'temperature' or 'percentage'
      step: 0.5  # Optional, default 0.5 for temp, 5 for percentage
      icon: mdi:bed-king  # Optional
    - name: Living Room
      state_entity: binary_sensor.ac_zone_living
      value_entity: number.ac_zone_living_setpoint
      value_type: temperature
    - name: TV Room
      state_entity: binary_sensor.ac_zone_tv
      value_entity: number.ac_zone_tv_setpoint
      value_type: temperature
    - name: Bedroom 2
      state_entity: binary_sensor.ac_zone_bed2
      value_entity: number.ac_zone_bed2_damper
      value_type: percentage
      step: 5
    - name: Bedroom 3
      state_entity: binary_sensor.ac_zone_bed3
      value_entity: number.ac_zone_bed3_damper
      value_type: percentage
      step: 5

# Standalone climate entities (optional, array)
climate_entities:
  - entity: climate.garage_air_con
    name: Garage Air Con  # Optional, uses friendly_name if not set
    section_name: Garage  # Optional, section header text
    icon: mdi:air-conditioner  # Optional
    show_humidity: false  # Optional, show current humidity if available
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
climate_entities:
  - entity: climate.living_room_ac
```

---

## TypeScript Interfaces

```typescript
// ============================================
// Configuration Interfaces
// ============================================

interface ClimateCardConfig {
  type: string;
  title?: string;
  weather?: WeatherConfig;
  temperature_sensors?: TemperatureSensorsConfig;
  house_ac?: HouseACConfig;
  climate_entities?: ClimateEntityConfig[];
}

interface WeatherConfig {
  entity: string;
  forecast_days?: number;
  show_humidity?: boolean;
  collapsible?: boolean;
  collapsed?: boolean;
}

interface TemperatureSensorsConfig {
  collapsible?: boolean;
  collapsed?: boolean;
  trend_hours?: number;
  columns?: number;
  sensors: TemperatureSensorConfig[];
}

interface TemperatureSensorConfig {
  name: string;
  temperature_entity: string;
  humidity_entity?: string;
  icon?: string;
}

interface HouseACConfig {
  name?: string;
  icon?: string;
  mode_entity: string;
  fan_entity: string;
  zones: ACZoneConfig[];
}

interface ACZoneConfig {
  name: string;
  state_entity: string;
  value_entity: string;
  value_type: 'temperature' | 'percentage';
  step?: number;
  icon?: string;
}

interface ClimateEntityConfig {
  entity: string;
  name?: string;
  section_name?: string;
  icon?: string;
  show_humidity?: boolean;
}

// ============================================
// Runtime State Interfaces
// ============================================

interface WeatherState {
  condition: string;
  temperature: number;
  humidity?: number;
  forecast: WeatherForecast[];
}

interface WeatherForecast {
  datetime: string;
  condition: string;
  temperature: number;
  templow?: number;
}

interface TemperatureHistoryPoint {
  time: Date;
  value: number;
}

interface TemperatureHistory {
  entity_id: string;
  data: TemperatureHistoryPoint[];
}

interface CollapsibleState {
  forecast: boolean;
  temperatures: boolean;
}

// ============================================
// Helper Types
// ============================================

type ClimateMode = 'off' | 'cool' | 'heat' | 'fan_only' | 'dry' | 'auto';

type TemperatureRange = 'cold' | 'cool' | 'comfortable' | 'warm' | 'hot';

interface ModeColorScheme {
  color: string;
  container: string;
  icon: string;
}
```

---

## Interaction Behaviors

### Dropdowns (Mode/Fan Selection)

**Trigger:** Tap on dropdown button

**Behavior:**
1. Open native `ha-select` or custom dropdown overlay
2. Show all options from entity's `options` attribute
3. Current selection highlighted
4. On selection, call `select.select_option` service:
   ```typescript
   this.hass.callService('select', 'select_option', {
     entity_id: entityId,
     option: selectedOption,
   });
   ```

**Visual feedback:**
- Dropdown shows current value with chevron indicator
- Mode dropdown includes icon for current mode
- Smooth transition when mode changes (300ms color fade)

### Climate Entity Mode Dropdown

**Trigger:** Tap on mode dropdown

**Behavior:**
1. Read `hvac_modes` from climate entity attributes
2. Display available modes in dropdown
3. On selection, call `climate.set_hvac_mode`:
   ```typescript
   this.hass.callService('climate', 'set_hvac_mode', {
     entity_id: entityId,
     hvac_mode: selectedMode,
   });
   ```

### Zone +/- Buttons

**Trigger:** Tap +/- button

**Behavior:**
1. Read current value from `value_entity`
2. Increment or decrement by step (0.5 for temperature, 5 for percentage)
3. Clamp to entity's min/max attributes
4. Call `number.set_value`:
   ```typescript
   this.hass.callService('number', 'set_value', {
     entity_id: valueEntityId,
     value: newValue,
   });
   ```

**Visual feedback:**
- Button shows pressed state
- Value updates optimistically, then confirms from state

### Zone Row Tap

**Trigger:** Tap anywhere on zone row (except buttons)

**Behavior:**
1. Toggle zone state (On → Off, Off → On)
2. Call appropriate service for the zone's `state_entity`
3. For binary_sensor backed zones, may need custom service call

**Note:** If zones are controlled via a custom integration, the service call may need to be configurable. Default assumption is toggle via `homeassistant.toggle`.

### Climate Setpoint +/- Buttons

**Trigger:** Tap +/- button on climate entity row

**Behavior:**
1. Read current `temperature` attribute
2. Adjust by 1°C
3. Clamp to entity's min_temp/max_temp
4. Call `climate.set_temperature`:
   ```typescript
   this.hass.callService('climate', 'set_temperature', {
     entity_id: entityId,
     temperature: newTemp,
   });
   ```

### Section Collapse Toggle

**Trigger:** Tap section header (FORECAST or TEMPERATURES)

**Behavior:**
1. Toggle collapsed state for that section
2. Animate height change (200ms ease)
3. Update chevron direction (▼ → ▶)
4. Persist state to card config if possible, or local storage

### Temperature Sensor Card Tap

**Trigger:** Tap on sensor card

**Behavior:**
- Open more-info dialog for the temperature entity
- Use HA's built-in `fire-dom-event` with `hass-more-info`

---

## Animation Specifications

### Timing Standards

| Animation | Duration | Easing | Property |
|-----------|----------|--------|----------|
| Section collapse | 200ms | ease | height, opacity |
| Value change | 300ms | ease | color |
| Mode color transition | 300ms | ease | background-color, border-color |
| Active zone pulse | 2s | ease-in-out | opacity (infinite) |
| Sparkline draw | 500ms | ease-out | stroke-dashoffset |
| Button press | 100ms | ease | transform, background |

### CSS Implementations

```css
/* Section collapse animation */
.section-content {
  overflow: hidden;
  transition: height 200ms ease, opacity 200ms ease;
}

.section-content.collapsed {
  height: 0;
  opacity: 0;
}

/* Value change animation */
.value {
  transition: color 300ms ease;
}

/* Mode color transition */
.ac-row {
  transition: background-color 300ms ease, border-color 300ms ease;
}

/* Active zone pulse */
.zone-row.active .zone-icon {
  animation: zone-pulse 2s ease-in-out infinite;
}

@keyframes zone-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* Sparkline draw animation */
.sparkline-path {
  stroke-dasharray: var(--path-length);
  stroke-dashoffset: var(--path-length);
  animation: draw-sparkline 500ms ease-out forwards;
}

@keyframes draw-sparkline {
  to { stroke-dashoffset: 0; }
}

/* Button press feedback */
.control-button:active {
  transform: scale(0.95);
  background-color: var(--divider-color);
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Responsive Behavior

### Breakpoints

| Breakpoint | Temp Grid Columns | Forecast | Zone Rows |
|------------|-------------------|----------|-----------|
| > 800px | 3 columns | Full 8-day | Full width |
| 600-800px | 2 columns | Full 8-day | Full width |
| < 600px | 1 column | Horizontal scroll | Stacked |

### CSS Implementation

```css
.sensor-grid {
  display: grid;
  gap: 8px;
  grid-template-columns: repeat(var(--columns, 3), 1fr);
}

@media (max-width: 800px) {
  .sensor-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 600px) {
  .sensor-grid {
    grid-template-columns: 1fr;
  }
  
  .forecast-grid {
    overflow-x: auto;
    scroll-snap-type: x mandatory;
  }
  
  .forecast-day {
    scroll-snap-align: start;
    min-width: 60px;
  }
}
```

---

## File Structure

```
climate-card/
├── src/
│   ├── climate-card.ts           # Main card component
│   ├── editor.ts                 # Visual config editor
│   ├── types.ts                  # TypeScript interfaces
│   ├── const.ts                  # Constants, defaults, mappings
│   ├── styles.ts                 # Shared CSS styles
│   ├── components/
│   │   ├── weather-header.ts     # Header with current weather
│   │   ├── forecast-section.ts   # Collapsible forecast grid
│   │   ├── temp-sensor-grid.ts   # Collapsible temperature sensors
│   │   ├── temp-sensor-card.ts   # Individual sensor with sparkline
│   │   ├── sparkline.ts          # SVG sparkline component
│   │   ├── house-ac-section.ts   # House AC master + zones
│   │   ├── ac-master-row.ts      # AC mode/fan controls
│   │   ├── ac-zone-row.ts        # Individual zone row
│   │   ├── climate-section.ts    # Standalone climate entities
│   │   ├── climate-row.ts        # Individual climate entity row
│   │   ├── collapsible-section.ts # Reusable collapsible wrapper
│   │   └── control-button.ts     # Reusable +/- button
│   └── utils/
│       ├── weather-icons.ts      # Weather condition → icon mapping
│       ├── temperature-color.ts  # Temperature → color mapping
│       ├── mode-colors.ts        # Climate mode → color mapping
│       ├── history.ts            # Fetch entity history for sparklines
│       └── format.ts             # Number/unit formatting utilities
├── dist/
│   └── climate-card.js           # Bundled output
├── package.json
├── rollup.config.js
├── tsconfig.json
├── hacs.json
└── README.md
```

---

## Implementation Notes

### 1. Weather Forecast Data

BOM and most weather integrations provide forecast data via the `forecast` attribute or the `weather.get_forecasts` service (HA 2023.12+).

```typescript
// Modern approach (HA 2023.12+)
const response = await this.hass.callWS({
  type: 'weather/subscribe_forecast',
  entity_id: weatherEntity,
  forecast_type: 'daily',
});

// Fallback for older HA or integrations
const state = this.hass.states[weatherEntity];
const forecast = state.attributes.forecast;
```

### 2. Dynamic Dropdown Options

Read options from select entities dynamically:

```typescript
const modeEntity = this.hass.states[config.house_ac.mode_entity];
const modeOptions = modeEntity.attributes.options; // ['Auto', 'Heat', 'Dry', 'Fan', 'Cool']
const currentMode = modeEntity.state;
```

### 3. Temperature History for Sparklines

Use Home Assistant's WebSocket API to fetch history:

```typescript
async function fetchHistory(
  hass: HomeAssistant,
  entityId: string,
  hours: number
): Promise<TemperatureHistoryPoint[]> {
  const endTime = new Date();
  const startTime = new Date(endTime.getTime() - hours * 60 * 60 * 1000);
  
  const history = await hass.callWS({
    type: 'history/history_during_period',
    start_time: startTime.toISOString(),
    end_time: endTime.toISOString(),
    entity_ids: [entityId],
    minimal_response: true,
    significant_changes_only: false,
  });
  
  return history[entityId]?.map((point: any) => ({
    time: new Date(point.lu * 1000), // last_updated timestamp
    value: parseFloat(point.s), // state
  })) ?? [];
}
```

**Caching:** Cache history results for 5 minutes to avoid excessive API calls. Refresh on card visibility change or manual refresh.

### 4. Sparkline SVG Generation

Generate SVG path from data points:

```typescript
function generateSparklinePath(
  data: TemperatureHistoryPoint[],
  width: number,
  height: number,
  padding: number = 2
): string {
  if (data.length < 2) return '';
  
  const values = data.map(d => d.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  
  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - padding - ((d.value - min) / range) * (height - padding * 2);
    return { x, y };
  });
  
  // Generate smooth curve using quadratic bezier
  let path = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const midX = (prev.x + curr.x) / 2;
    path += ` Q ${prev.x} ${prev.y} ${midX} ${(prev.y + curr.y) / 2}`;
  }
  path += ` L ${points[points.length - 1].x} ${points[points.length - 1].y}`;
  
  return path;
}
```

### 5. Weather Icon Mapping

Map weather conditions to MDI icons:

```typescript
const weatherIcons: Record<string, string> = {
  'clear-night': 'mdi:weather-night',
  'cloudy': 'mdi:weather-cloudy',
  'fog': 'mdi:weather-fog',
  'hail': 'mdi:weather-hail',
  'lightning': 'mdi:weather-lightning',
  'lightning-rainy': 'mdi:weather-lightning-rainy',
  'partlycloudy': 'mdi:weather-partly-cloudy',
  'pouring': 'mdi:weather-pouring',
  'rainy': 'mdi:weather-rainy',
  'snowy': 'mdi:weather-snowy',
  'snowy-rainy': 'mdi:weather-snowy-rainy',
  'sunny': 'mdi:weather-sunny',
  'windy': 'mdi:weather-windy',
  'windy-variant': 'mdi:weather-windy-variant',
  'exceptional': 'mdi:alert-circle-outline',
};
```

### 6. Editor Implementation

Use native HA form components as per design guidelines:

```typescript
// Entity pickers
html`<ha-entity-picker
  .hass=${this.hass}
  .value=${this._config.weather?.entity}
  .label=${"Weather Entity"}
  .includeDomains=${['weather']}
  @value-changed=${this._valueChanged}
></ha-entity-picker>`

// For temperature sensors, use a dynamic list with add/remove
// For zones, similar dynamic list pattern
```

### 7. Card Registration

```typescript
// At the end of climate-card.ts
window.customCards = window.customCards || [];
window.customCards.push({
  type: 'climate-card',
  name: 'Climate Card',
  description: 'Unified climate monitoring and control',
  preview: true,
  documentationURL: 'https://github.com/your-repo/climate-card',
});
```

### 8. Performance Considerations

- Use `shouldUpdate()` to only re-render when relevant entities change
- Debounce history fetches
- Use CSS containment on sections: `contain: content`
- Lazy-load sparklines (only fetch history when section is expanded)
- Consider using `lit-virtualizer` if many temperature sensors

### 9. Accessibility

- All interactive elements must have proper ARIA labels
- Dropdowns should be keyboard navigable
- Color should not be the only indicator (icons accompany mode colors)
- Minimum touch target size of 44x44px for buttons

---

## Example Configurations

### Full Featured Setup

```yaml
type: custom:climate-card
title: Home Climate

weather:
  entity: weather.bom_piara_waters
  forecast_days: 8
  collapsible: true
  collapsed: false

temperature_sensors:
  collapsible: true
  collapsed: false
  trend_hours: 12
  columns: 3
  sensors:
    - name: Dusk's Room
      temperature_entity: sensor.dusks_room_temperature
      humidity_entity: sensor.dusks_room_humidity
    - name: Master Bedroom
      temperature_entity: sensor.master_bedroom_temperature
      humidity_entity: sensor.master_bedroom_humidity
    - name: Kitchen
      temperature_entity: sensor.kitchen_temperature
      humidity_entity: sensor.kitchen_humidity
    - name: Garage
      temperature_entity: sensor.garage_temperature
      humidity_entity: sensor.garage_humidity
    - name: Roof
      temperature_entity: sensor.roof_temperature
      humidity_entity: sensor.roof_humidity
    - name: Back Yard
      temperature_entity: sensor.back_yard_temperature
      humidity_entity: sensor.back_yard_humidity

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
    - name: TV Room
      state_entity: binary_sensor.ac_zone_tv
      value_entity: number.ac_zone_tv_setpoint
      value_type: temperature
    - name: Bedroom 2
      state_entity: binary_sensor.ac_zone_bed2
      value_entity: number.ac_zone_bed2_damper
      value_type: percentage
    - name: Bedroom 3
      state_entity: binary_sensor.ac_zone_bed3
      value_entity: number.ac_zone_bed3_damper
      value_type: percentage

climate_entities:
  - entity: climate.garage_air_con
    section_name: Garage
```

### Minimal Setup (Weather + Single Climate)

```yaml
type: custom:climate-card
weather:
  entity: weather.home
climate_entities:
  - entity: climate.living_room
```

### Temperature Monitoring Only

```yaml
type: custom:climate-card
title: Room Temperatures
weather:
  entity: weather.home
  collapsible: false
temperature_sensors:
  collapsible: false
  columns: 2
  sensors:
    - name: Living Room
      temperature_entity: sensor.living_room_temp
    - name: Bedroom
      temperature_entity: sensor.bedroom_temp
```
