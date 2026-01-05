import { TEMPERATURE_UNITS, PERCENTAGE_SYMBOL, DAY_NAMES_SHORT } from '../const';

/**
 * Format a temperature value with units
 */
export function formatTemperature(
  value: number,
  decimals = 1,
  unit: 'celsius' | 'fahrenheit' = 'celsius'
): string {
  const formatted = value.toFixed(decimals);
  return `${formatted}${TEMPERATURE_UNITS[unit]}`;
}

/**
 * Format a percentage value
 */
export function formatPercentage(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}${PERCENTAGE_SYMBOL}`;
}

/**
 * Format a humidity value with icon placeholder
 */
export function formatHumidity(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format a number with consistent decimal places
 */
export function formatNumber(value: number, decimals = 1): string {
  return value.toFixed(decimals);
}

/**
 * Get the short day name for a date
 */
export function getShortDayName(date: Date): string {
  return DAY_NAMES_SHORT[date.getDay()];
}

/**
 * Get short day name from ISO date string
 */
export function getDayFromISOString(isoString: string): string {
  const date = new Date(isoString);
  return getShortDayName(date);
}

/**
 * Check if a date is today
 */
export function isToday(date: Date): boolean {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

/**
 * Format a date for display
 */
export function formatDate(date: Date): string {
  return date.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format a time for display
 */
export function formatTime(date: Date): string {
  return date.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Clamp a value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Round a number to the nearest step
 */
export function roundToStep(value: number, step: number): number {
  return Math.round(value / step) * step;
}

/**
 * Parse a state value to a number, returning undefined if invalid
 */
export function parseStateNumber(state: string | undefined): number | undefined {
  if (state === undefined || state === null || state === '' || state === 'unknown' || state === 'unavailable') {
    return undefined;
  }
  
  const parsed = parseFloat(state);
  return isNaN(parsed) ? undefined : parsed;
}

/**
 * Get a friendly name from an entity or fall back to entity ID
 */
export function getFriendlyName(
  entityId: string,
  attributes?: { friendly_name?: string }
): string {
  if (attributes?.friendly_name) {
    return attributes.friendly_name;
  }
  
  // Convert entity_id to a readable name
  // sensor.living_room_temperature -> Living Room Temperature
  const name = entityId.split('.').pop() ?? entityId;
  return name
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Debounce a function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle a function
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}
