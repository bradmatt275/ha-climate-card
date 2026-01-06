import { HomeAssistant, LovelaceCardConfig } from 'custom-card-helpers';

// ============================================
// Configuration Interfaces
// ============================================

export interface ClimateCardConfig extends LovelaceCardConfig {
  type: string;
  title?: string;
  section_order?: string[];
  weather?: WeatherConfig;
  temperature_sensors?: TemperatureSensorsConfig;
  house_ac?: HouseACConfig;
  climate_entities?: ClimateEntityConfig[];
  fans?: FansConfig;
}

export interface FansConfig {
  section_name?: string;
  entities: FanEntityConfig[];
}

export interface FanEntityConfig {
  entity: string;
  name?: string;
  icon?: string;
  power_entity?: string;
}

export interface WeatherConfig {
  entity: string;
  forecast_days?: number;
  show_humidity?: boolean;
  collapsible?: boolean;
  collapsed?: boolean;
}

export interface TemperatureThresholds {
  cold?: number;
  cool?: number;
  comfortable?: number;
  warm?: number;
}

export interface TemperatureSensorsConfig {
  collapsible?: boolean;
  collapsed?: boolean;
  trend_hours?: number;
  columns?: number;
  thresholds?: TemperatureThresholds;
  sensors: TemperatureSensorConfig[];
}

export interface TemperatureSensorConfig {
  name: string;
  temperature_entity: string;
  humidity_entity?: string;
  icon?: string;
}

export interface HouseACConfig {
  name?: string;
  icon?: string;
  power_entity?: string;
  mode_entity: string;
  fan_entity: string;
  zones: ACZoneConfig[];
  zones_collapsible?: boolean;
  zones_collapsed?: boolean;
}

export interface ACZoneConfig {
  name: string;
  // Control mode select entity - if present, zone supports temp/fan switching
  // The entity's current state determines the display mode (Temperature vs Fan/Percentage)
  control_mode_entity?: string;
  // Power toggle switch
  power_entity: string;
  // Current temperature sensor
  temperature_entity?: string;
  // Current setpoint sensor (displays current value)
  setpoint_entity?: string;
  // Setpoint control buttons (for button-based control)
  setpoint_up_entity?: string;
  setpoint_down_entity?: string;
  // Alternative: number entity for direct setpoint control
  setpoint_number_entity?: string;
  icon?: string;
}

export interface ClimateEntityConfig {
  entity: string;
  name?: string;
  section_name?: string;
  icon?: string;
  show_humidity?: boolean;
}

// ============================================
// Runtime State Interfaces
// ============================================

export interface WeatherState {
  condition: string;
  temperature: number;
  humidity?: number;
  forecast: WeatherForecast[];
}

export interface WeatherForecast {
  datetime: string;
  condition: string;
  temperature: number;
  templow?: number;
  precipitation?: number;
  precipitation_probability?: number;
  humidity?: number;
  wind_speed?: number;
  wind_bearing?: number;
}

export interface TemperatureHistoryPoint {
  time: Date;
  value: number;
}

export interface TemperatureHistory {
  entity_id: string;
  data: TemperatureHistoryPoint[];
}

export interface CollapsibleState {
  forecast: boolean;
  temperatures: boolean;
}

// ============================================
// Helper Types
// ============================================

export type ClimateMode = 'off' | 'cool' | 'heat' | 'fan_only' | 'dry' | 'auto' | 'heat_cool';

export type TemperatureRange = 'cold' | 'cool' | 'comfortable' | 'warm' | 'hot';

export interface ModeColorScheme {
  color: string;
  container: string;
  icon: string;
}

// ============================================
// Component Property Interfaces
// ============================================

export interface WeatherHeaderProps {
  hass: HomeAssistant;
  config: WeatherConfig;
  title?: string;
}

export interface ForecastSectionProps {
  hass: HomeAssistant;
  config: WeatherConfig;
  forecast: WeatherForecast[];
  collapsed: boolean;
  onToggle: () => void;
}

export interface TempSensorGridProps {
  hass: HomeAssistant;
  config: TemperatureSensorsConfig;
  collapsed: boolean;
  onToggle: () => void;
}

export interface TempSensorCardProps {
  hass: HomeAssistant;
  config: TemperatureSensorConfig;
  trendHours: number;
}

export interface SparklineProps {
  data: TemperatureHistoryPoint[];
  color: string;
  width?: number;
  height?: number;
  animated?: boolean;
}

export interface HouseACSectionProps {
  hass: HomeAssistant;
  config: HouseACConfig;
}

export interface ACMasterRowProps {
  hass: HomeAssistant;
  name: string;
  icon: string;
  modeEntity: string;
  fanEntity: string;
}

export interface ACZoneRowProps {
  hass: HomeAssistant;
  config: ACZoneConfig;
}

export interface ClimateSectionProps {
  hass: HomeAssistant;
  config: ClimateEntityConfig;
}

export interface ClimateRowProps {
  hass: HomeAssistant;
  config: ClimateEntityConfig;
}

export interface CollapsibleSectionProps {
  title: string;
  collapsed: boolean;
  collapsible: boolean;
  onToggle: () => void;
}

export interface ControlButtonProps {
  icon: string;
  disabled?: boolean;
  onClick: () => void;
}

// ============================================
// Home Assistant Extended Types
// ============================================

export interface HassEntity {
  entity_id: string;
  state: string;
  attributes: Record<string, unknown>;
  last_changed: string;
  last_updated: string;
  context: {
    id: string;
    parent_id: string | null;
    user_id: string | null;
  };
}

export interface SelectEntityAttributes {
  options: string[];
  friendly_name?: string;
  icon?: string;
}

export interface NumberEntityAttributes {
  min: number;
  max: number;
  step: number;
  mode: 'auto' | 'box' | 'slider';
  unit_of_measurement?: string;
  friendly_name?: string;
  icon?: string;
}

export interface ClimateEntityAttributes {
  hvac_modes: ClimateMode[];
  min_temp: number;
  max_temp: number;
  target_temp_step?: number;
  current_temperature?: number;
  current_humidity?: number;
  temperature?: number;
  target_temp_high?: number;
  target_temp_low?: number;
  fan_mode?: string;
  fan_modes?: string[];
  preset_mode?: string;
  preset_modes?: string[];
  swing_mode?: string;
  swing_modes?: string[];
  friendly_name?: string;
  icon?: string;
}

export interface WeatherEntityAttributes {
  temperature: number;
  temperature_unit: string;
  humidity?: number;
  pressure?: number;
  pressure_unit?: string;
  wind_bearing?: number;
  wind_speed?: number;
  wind_speed_unit?: string;
  visibility?: number;
  visibility_unit?: string;
  precipitation_unit?: string;
  forecast?: WeatherForecast[];
  friendly_name?: string;
  attribution?: string;
}

// ============================================
// Event Types
// ============================================

export interface ForecastEvent {
  type: string;
  forecast: WeatherForecast[];
}

export interface ValueChangedEvent extends CustomEvent {
  detail: {
    value: string | number | boolean;
  };
}

// ============================================
// History API Types
// ============================================

export interface HistoryPoint {
  s: string; // state
  lu: number; // last_updated timestamp
}

export interface HistoryResponse {
  [entityId: string]: HistoryPoint[];
}

// ============================================
// Card Registration
// ============================================

declare global {
  interface Window {
    customCards?: CustomCardInfo[];
  }
}

export interface CustomCardInfo {
  type: string;
  name: string;
  description: string;
  preview?: boolean;
  documentationURL?: string;
}
