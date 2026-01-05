import { MODE_COLORS, MODE_ICONS } from '../const';
import { ModeColorScheme, ClimateMode } from '../types';

/**
 * Get the color scheme for a climate mode
 */
export function getModeColors(mode: string): ModeColorScheme {
  const normalizedMode = mode.toLowerCase();
  return MODE_COLORS[normalizedMode] ?? MODE_COLORS.off;
}

/**
 * Get the icon for a climate mode
 */
export function getModeIcon(mode: string): string {
  const normalizedMode = mode.toLowerCase();
  return MODE_ICONS[normalizedMode] ?? 'mdi:thermostat';
}

/**
 * Get the CSS class for a mode
 */
export function getModeClass(mode: string): string {
  const normalizedMode = mode.toLowerCase().replace(/\s+/g, '_');
  return `mode-${normalizedMode}`;
}

/**
 * Check if a mode is considered "active" (not off)
 */
export function isModeActive(mode: string): boolean {
  const normalizedMode = mode.toLowerCase();
  return normalizedMode !== 'off';
}

/**
 * Get a human-readable mode label
 */
export function getModeLabel(mode: string): string {
  const labels: Record<string, string> = {
    off: 'Off',
    cool: 'Cool',
    heat: 'Heat',
    heat_cool: 'Auto',
    auto: 'Auto',
    fan: 'Fan',
    fan_only: 'Fan',
    dry: 'Dry',
  };

  const normalizedMode = mode.toLowerCase();
  return labels[normalizedMode] ?? mode.charAt(0).toUpperCase() + mode.slice(1).replace(/_/g, ' ');
}

/**
 * Normalize mode string (handles different casing and underscores/spaces)
 */
export function normalizeMode(mode: string): ClimateMode {
  const normalized = mode.toLowerCase().replace(/\s+/g, '_');
  const validModes: ClimateMode[] = ['off', 'cool', 'heat', 'fan_only', 'dry', 'auto', 'heat_cool'];
  
  if (validModes.includes(normalized as ClimateMode)) {
    return normalized as ClimateMode;
  }
  
  // Handle common variations
  if (normalized === 'fan') return 'fan_only';
  if (normalized === 'cooling') return 'cool';
  if (normalized === 'heating') return 'heat';
  if (normalized === 'automatic') return 'auto';
  
  return 'off';
}
