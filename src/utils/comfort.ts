export interface ComfortInfo {
  label: string;
  icon: string;
  color: string;
}

/**
 * Calculate dewpoint from temperature (°C) and relative humidity (%)
 * using the Magnus formula.
 */
export function calculateDewpoint(temperature: number, humidity: number): number {
  const b = 17.67;
  const c = 243.5;
  const gamma = Math.log(humidity / 100) + (b * temperature) / (c + temperature);
  return (c * gamma) / (b - gamma);
}

/**
 * Get the comfort level based on dewpoint temperature.
 * Dewpoint is the best single metric for humidity comfort as it
 * captures the absolute moisture content of the air.
 */
export function getComfortLevel(dewpoint: number): ComfortInfo {
  if (dewpoint < 10) {
    return { label: 'Dry', icon: 'mdi:water-off-outline', color: '#3B82F6' };
  }
  if (dewpoint < 13) {
    return { label: 'Pleasant', icon: 'mdi:emoticon-happy-outline', color: '#06B6D4' };
  }
  if (dewpoint < 16) {
    return { label: 'Comfortable', icon: 'mdi:emoticon-outline', color: '#10B981' };
  }
  if (dewpoint < 18) {
    return { label: 'Slightly Humid', icon: 'mdi:water-outline', color: '#F59E0B' };
  }
  if (dewpoint < 21) {
    return { label: 'Humid', icon: 'mdi:water', color: '#F97316' };
  }
  return { label: 'Oppressive', icon: 'mdi:water-alert', color: '#EF4444' };
}
