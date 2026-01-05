import { WEATHER_ICONS, WEATHER_ICON_COLORS } from '../const';

/**
 * Get the MDI icon name for a weather condition
 */
export function getWeatherIcon(condition: string): string {
  return WEATHER_ICONS[condition] ?? 'mdi:weather-cloudy';
}

/**
 * Get the icon color for a weather condition
 */
export function getWeatherIconColor(condition: string): string {
  return WEATHER_ICON_COLORS[condition] ?? 'var(--primary-text-color)';
}

/**
 * Determine if a weather condition represents daytime
 */
export function isDaytimeCondition(condition: string): boolean {
  return !condition.includes('night');
}

/**
 * Get a human-readable weather condition label
 */
export function getConditionLabel(condition: string): string {
  const labels: Record<string, string> = {
    'clear-night': 'Clear',
    'cloudy': 'Cloudy',
    'fog': 'Foggy',
    'hail': 'Hail',
    'lightning': 'Lightning',
    'lightning-rainy': 'Thunderstorm',
    'partlycloudy': 'Partly Cloudy',
    'partly-cloudy': 'Partly Cloudy',
    'pouring': 'Heavy Rain',
    'rainy': 'Rainy',
    'snowy': 'Snowy',
    'snowy-rainy': 'Sleet',
    'sunny': 'Sunny',
    'windy': 'Windy',
    'windy-variant': 'Windy',
    'exceptional': 'Exceptional',
  };

  return labels[condition] ?? condition.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}
