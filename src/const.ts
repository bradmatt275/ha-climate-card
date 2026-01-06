import { ClimateCardConfig, ModeColorScheme } from './types';

// ============================================
// Card Defaults
// ============================================

export const CARD_NAME = 'climate-card';
export const CARD_VERSION = '1.0.0';

export const DEFAULT_CONFIG: Partial<ClimateCardConfig> = {
  title: 'Climate',
};

export const DEFAULT_WEATHER_CONFIG = {
  forecast_days: 8,
  show_humidity: false,
  collapsible: true,
  collapsed: false,
};

export const DEFAULT_TEMPERATURE_SENSORS_CONFIG = {
  collapsible: true,
  collapsed: false,
  trend_hours: 24,
  columns: 3,
  thresholds: {
    cold: 18,
    cool: 22,
    comfortable: 26,
    warm: 30,
  },
};

export const DEFAULT_HOUSE_AC_CONFIG = {
  name: 'AC',
  icon: 'mdi:air-conditioner',
  zones_collapsible: true,
  zones_collapsed: false,
};

export const DEFAULT_ZONE_STEP = {
  temperature: 0.5,
  percentage: 5,
};

// ============================================
// Climate Mode Configuration
// ============================================

export const MODE_COLORS: Record<string, ModeColorScheme> = {
  cool: {
    color: 'var(--climate-cool)',
    container: 'var(--climate-cool-container)',
    icon: 'mdi:snowflake',
  },
  heat: {
    color: 'var(--climate-heat)',
    container: 'var(--climate-heat-container)',
    icon: 'mdi:fire',
  },
  heat_cool: {
    color: 'var(--climate-auto)',
    container: 'var(--climate-auto-container)',
    icon: 'mdi:autorenew',
  },
  auto: {
    color: 'var(--climate-auto)',
    container: 'var(--climate-auto-container)',
    icon: 'mdi:autorenew',
  },
  fan: {
    color: 'var(--climate-fan)',
    container: 'var(--climate-fan-container)',
    icon: 'mdi:fan',
  },
  fan_only: {
    color: 'var(--climate-fan)',
    container: 'var(--climate-fan-container)',
    icon: 'mdi:fan',
  },
  dry: {
    color: 'var(--climate-dry)',
    container: 'var(--climate-dry-container)',
    icon: 'mdi:water-percent',
  },
  off: {
    color: 'var(--climate-off)',
    container: 'transparent',
    icon: 'mdi:power',
  },
};

export const MODE_ICONS: Record<string, string> = {
  cool: 'mdi:snowflake',
  heat: 'mdi:fire',
  heat_cool: 'mdi:autorenew',
  auto: 'mdi:autorenew',
  fan: 'mdi:fan',
  fan_only: 'mdi:fan',
  dry: 'mdi:water-percent',
  off: 'mdi:power',
};

// ============================================
// Weather Icons
// ============================================

export const WEATHER_ICONS: Record<string, string> = {
  'clear-night': 'mdi:weather-night',
  'cloudy': 'mdi:weather-cloudy',
  'fog': 'mdi:weather-fog',
  'hail': 'mdi:weather-hail',
  'lightning': 'mdi:weather-lightning',
  'lightning-rainy': 'mdi:weather-lightning-rainy',
  'partlycloudy': 'mdi:weather-partly-cloudy',
  'partly-cloudy': 'mdi:weather-partly-cloudy',
  'pouring': 'mdi:weather-pouring',
  'rainy': 'mdi:weather-rainy',
  'snowy': 'mdi:weather-snowy',
  'snowy-rainy': 'mdi:weather-snowy-rainy',
  'sunny': 'mdi:weather-sunny',
  'windy': 'mdi:weather-windy',
  'windy-variant': 'mdi:weather-windy-variant',
  'exceptional': 'mdi:alert-circle-outline',
};

export const WEATHER_ICON_COLORS: Record<string, string> = {
  'clear-night': 'var(--weather-moon)',
  'sunny': 'var(--weather-sun)',
  'partlycloudy': 'var(--weather-sun)',
  'partly-cloudy': 'var(--weather-sun)',
  'cloudy': 'var(--weather-cloud)',
  'fog': 'var(--weather-cloud)',
  'rainy': 'var(--weather-rain)',
  'pouring': 'var(--weather-rain)',
  'snowy': 'var(--weather-cloud)',
  'snowy-rainy': 'var(--weather-rain)',
  'lightning': 'var(--weather-storm)',
  'lightning-rainy': 'var(--weather-storm)',
  'hail': 'var(--weather-cloud)',
  'windy': 'var(--weather-cloud)',
  'windy-variant': 'var(--weather-cloud)',
  'exceptional': 'var(--warning-color)',
};

// ============================================
// Temperature Ranges
// ============================================

export const TEMPERATURE_THRESHOLDS = {
  cold: 18,
  cool: 22,
  comfortable: 26,
  warm: 30,
};

export const TEMPERATURE_COLORS: Record<string, string> = {
  cold: 'var(--temp-cold)',
  cool: 'var(--temp-cool)',
  comfortable: 'var(--temp-comfortable)',
  warm: 'var(--temp-warm)',
  hot: 'var(--temp-hot)',
};

// ============================================
// Animation Timings
// ============================================

export const ANIMATION_DURATION = {
  collapse: 200,
  valueChange: 300,
  modeTransition: 300,
  zonePulse: 2000,
  sparklineDraw: 500,
  buttonPress: 100,
};

// ============================================
// Responsive Breakpoints
// ============================================

export const BREAKPOINTS = {
  small: 600,
  medium: 800,
};

// ============================================
// History Cache
// ============================================

export const HISTORY_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// ============================================
// Day Names
// ============================================

export const DAY_NAMES_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// ============================================
// Units
// ============================================

export const TEMPERATURE_UNITS = {
  celsius: '°C',
  fahrenheit: '°F',
};

export const PERCENTAGE_SYMBOL = '%';
