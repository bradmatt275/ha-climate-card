import { HomeAssistant } from 'custom-card-helpers';
import { TemperatureHistoryPoint, HistoryResponse, HistoryPoint } from '../types';
import { HISTORY_CACHE_DURATION } from '../const';

// Cache for history data
interface CacheEntry {
  data: TemperatureHistoryPoint[];
  timestamp: number;
}

const historyCache = new Map<string, CacheEntry>();

/**
 * Fetch temperature history for an entity
 */
export async function fetchHistory(
  hass: HomeAssistant,
  entityId: string,
  hours: number
): Promise<TemperatureHistoryPoint[]> {
  const cacheKey = `${entityId}-${hours}`;
  const cached = historyCache.get(cacheKey);

  // Return cached data if still valid
  if (cached && Date.now() - cached.timestamp < HISTORY_CACHE_DURATION) {
    return cached.data;
  }

  const endTime = new Date();
  const startTime = new Date(endTime.getTime() - hours * 60 * 60 * 1000);

  try {
    const history = await hass.callWS<HistoryResponse>({
      type: 'history/history_during_period',
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      entity_ids: [entityId],
      minimal_response: true,
      significant_changes_only: false,
    });

    const data = processHistoryData(history, entityId);
    
    // Cache the result
    historyCache.set(cacheKey, { data, timestamp: Date.now() });
    
    return data;
  } catch (error) {
    console.error(`Failed to fetch history for ${entityId}:`, error);
    
    // Return cached data even if expired, or empty array
    return cached?.data ?? [];
  }
}

/**
 * Process raw history response into usable data points
 */
function processHistoryData(
  history: HistoryResponse,
  entityId: string
): TemperatureHistoryPoint[] {
  const entityHistory = history[entityId];
  
  if (!entityHistory || !Array.isArray(entityHistory)) {
    return [];
  }

  return entityHistory
    .map((point: HistoryPoint) => ({
      time: new Date(point.lu * 1000), // lu is last_updated timestamp in seconds
      value: parseFloat(point.s), // s is state
    }))
    .filter((p) => !isNaN(p.value) && isFinite(p.value));
}

/**
 * Fetch history for multiple entities in parallel
 */
export async function fetchMultipleHistory(
  hass: HomeAssistant,
  entityIds: string[],
  hours: number
): Promise<Map<string, TemperatureHistoryPoint[]>> {
  const results = new Map<string, TemperatureHistoryPoint[]>();
  
  // Filter out entities we have cached
  const uncachedEntities: string[] = [];
  const now = Date.now();
  
  for (const entityId of entityIds) {
    const cacheKey = `${entityId}-${hours}`;
    const cached = historyCache.get(cacheKey);
    
    if (cached && now - cached.timestamp < HISTORY_CACHE_DURATION) {
      results.set(entityId, cached.data);
    } else {
      uncachedEntities.push(entityId);
    }
  }
  
  // Fetch uncached entities
  if (uncachedEntities.length > 0) {
    const endTime = new Date();
    const startTime = new Date(endTime.getTime() - hours * 60 * 60 * 1000);
    
    try {
      const history = await hass.callWS<HistoryResponse>({
        type: 'history/history_during_period',
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        entity_ids: uncachedEntities,
        minimal_response: true,
        significant_changes_only: false,
      });
      
      for (const entityId of uncachedEntities) {
        const data = processHistoryData(history, entityId);
        results.set(entityId, data);
        
        // Cache the result
        const cacheKey = `${entityId}-${hours}`;
        historyCache.set(cacheKey, { data, timestamp: Date.now() });
      }
    } catch (error) {
      console.error('Failed to fetch history:', error);
      
      // Set empty arrays for failed entities
      for (const entityId of uncachedEntities) {
        results.set(entityId, []);
      }
    }
  }
  
  return results;
}

/**
 * Clear the history cache
 */
export function clearHistoryCache(): void {
  historyCache.clear();
}

/**
 * Clear cache for a specific entity
 */
export function clearEntityCache(entityId: string): void {
  // Clear all cache entries for this entity (any hour value)
  for (const key of historyCache.keys()) {
    if (key.startsWith(`${entityId}-`)) {
      historyCache.delete(key);
    }
  }
}

/**
 * Downsample history data to a maximum number of points
 */
export function downsampleHistory(
  data: TemperatureHistoryPoint[],
  maxPoints: number
): TemperatureHistoryPoint[] {
  if (data.length <= maxPoints) {
    return data;
  }
  
  const step = data.length / maxPoints;
  const result: TemperatureHistoryPoint[] = [];
  
  for (let i = 0; i < maxPoints; i++) {
    const index = Math.floor(i * step);
    result.push(data[index]);
  }
  
  // Always include the last point
  if (result[result.length - 1] !== data[data.length - 1]) {
    result.push(data[data.length - 1]);
  }
  
  return result;
}

/**
 * Get statistics from history data
 */
export function getHistoryStats(data: TemperatureHistoryPoint[]): {
  min: number;
  max: number;
  avg: number;
  current: number;
} {
  if (data.length === 0) {
    return { min: 0, max: 0, avg: 0, current: 0 };
  }
  
  const values = data.map((p) => p.value);
  const sum = values.reduce((a, b) => a + b, 0);
  
  return {
    min: Math.min(...values),
    max: Math.max(...values),
    avg: sum / values.length,
    current: values[values.length - 1],
  };
}
