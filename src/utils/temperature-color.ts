import { TEMPERATURE_THRESHOLDS, TEMPERATURE_COLORS } from '../const';
import { TemperatureRange } from '../types';

/**
 * Get the temperature range category for a temperature value
 */
export function getTemperatureRange(temp: number): TemperatureRange {
  if (temp < TEMPERATURE_THRESHOLDS.cold) return 'cold';
  if (temp < TEMPERATURE_THRESHOLDS.cool) return 'cool';
  if (temp < TEMPERATURE_THRESHOLDS.comfortable) return 'comfortable';
  if (temp < TEMPERATURE_THRESHOLDS.warm) return 'warm';
  return 'hot';
}

/**
 * Get the CSS color variable for a temperature value
 */
export function getTemperatureColor(temp: number): string {
  const range = getTemperatureRange(temp);
  return TEMPERATURE_COLORS[range];
}

/**
 * Get temperature color as a direct hex value (for SVG/canvas use)
 */
export function getTemperatureColorHex(temp: number): string {
  const hexColors: Record<TemperatureRange, string> = {
    cold: '#3B82F6',
    cool: '#06B6D4',
    comfortable: '#10B981',
    warm: '#F59E0B',
    hot: '#EF4444',
  };
  
  const range = getTemperatureRange(temp);
  return hexColors[range];
}

/**
 * Calculate a color gradient position based on temperature
 * Returns a value between 0 and 1
 */
export function getTemperatureGradientPosition(temp: number, min = 10, max = 40): number {
  return Math.max(0, Math.min(1, (temp - min) / (max - min)));
}

/**
 * Interpolate between two colors based on temperature
 */
export function interpolateTemperatureColor(temp: number, coldColor: string, hotColor: string): string {
  const position = getTemperatureGradientPosition(temp);
  // Simple linear interpolation - for more complex cases, use a proper color library
  return position < 0.5 ? coldColor : hotColor;
}
