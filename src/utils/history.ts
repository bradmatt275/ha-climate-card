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
 * Handles both minimal_response format and full response format
 */
function processHistoryData(
  history: HistoryResponse,
  entityId: string
): TemperatureHistoryPoint[] {
  const entityHistory = history[entityId];
  
  if (!entityHistory || !Array.isArray(entityHistory)) {
    return [];
  }

  const points = entityHistory
    .map((point: HistoryPoint | { state: string; last_updated: string }) => {
      // Handle minimal_response format (lu = timestamp in seconds, s = state)
      if ('lu' in point && 's' in point) {
        return {
          time: new Date(point.lu * 1000),
          value: parseFloat(point.s),
        };
      }
      // Handle full response format (last_updated = ISO string, state = string)
      if ('last_updated' in point && 'state' in point) {
        return {
          time: new Date(point.last_updated),
          value: parseFloat(point.state),
        };
      }
      return null;
    })
    .filter((p): p is TemperatureHistoryPoint => 
      p !== null && !isNaN(p.value) && isFinite(p.value)
    );
    
  // Sort by time to ensure chronological order
  points.sort((a, b) => a.time.getTime() - b.time.getTime());
  
  return points;
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
 * Uses a bucket-based approach that preserves min/max values within each bucket
 * to ensure important peaks and valleys are not lost
 */
export function downsampleHistory(
  data: TemperatureHistoryPoint[],
  maxPoints: number
): TemperatureHistoryPoint[] {
  if (data.length <= maxPoints) {
    return data;
  }
  
  // Find global min and max indices - we want to preserve these
  let minIdx = 0, maxIdx = 0;
  let minVal = data[0].value, maxVal = data[0].value;
  
  for (let i = 1; i < data.length; i++) {
    if (data[i].value < minVal) {
      minVal = data[i].value;
      minIdx = i;
    }
    if (data[i].value > maxVal) {
      maxVal = data[i].value;
      maxIdx = i;
    }
  }
  
  // Use Largest-Triangle-Three-Buckets (LTTB) algorithm for better visual downsampling
  const result: TemperatureHistoryPoint[] = [];
  
  // Always include first point
  result.push(data[0]);
  
  // Calculate bucket size (we need maxPoints - 2 buckets for the middle points)
  const bucketSize = (data.length - 2) / (maxPoints - 2);
  
  let prevSelectedIndex = 0;
  
  for (let i = 0; i < maxPoints - 2; i++) {
    // Calculate bucket boundaries
    const bucketStart = Math.floor((i) * bucketSize) + 1;
    const bucketEnd = Math.floor((i + 1) * bucketSize) + 1;
    
    // Calculate average point for next bucket (used as reference)
    const nextBucketStart = Math.floor((i + 1) * bucketSize) + 1;
    const nextBucketEnd = Math.min(Math.floor((i + 2) * bucketSize) + 1, data.length - 1);
    
    let avgX = 0, avgY = 0;
    const nextBucketLength = nextBucketEnd - nextBucketStart;
    
    if (nextBucketLength > 0) {
      for (let j = nextBucketStart; j < nextBucketEnd; j++) {
        avgX += j;
        avgY += data[j].value;
      }
      avgX /= nextBucketLength;
      avgY /= nextBucketLength;
    } else {
      avgX = data.length - 1;
      avgY = data[data.length - 1].value;
    }
    
    // Find point in current bucket that creates largest triangle
    let maxArea = -1;
    let selectedIndex = bucketStart;
    
    const prevX = prevSelectedIndex;
    const prevY = data[prevSelectedIndex].value;
    
    for (let j = bucketStart; j < bucketEnd && j < data.length - 1; j++) {
      // Calculate triangle area
      const area = Math.abs(
        (prevX - avgX) * (data[j].value - prevY) -
        (prevX - j) * (avgY - prevY)
      );
      
      if (area > maxArea) {
        maxArea = area;
        selectedIndex = j;
      }
    }
    
    result.push(data[selectedIndex]);
    prevSelectedIndex = selectedIndex;
  }
  
  // Always include last point
  result.push(data[data.length - 1]);
  
  // Ensure min and max points are included if they weren't already
  const resultIndices = new Set(result.map((_, i) => {
    // Find original index
    for (let j = 0; j < data.length; j++) {
      if (data[j] === result[i]) return j;
    }
    return -1;
  }));
  
  // Insert min point if not already included
  if (!resultIndices.has(minIdx)) {
    // Find correct position to insert
    let insertPos = 0;
    for (let i = 0; i < result.length; i++) {
      const origIdx = data.indexOf(result[i]);
      if (origIdx > minIdx) break;
      insertPos = i + 1;
    }
    result.splice(insertPos, 0, data[minIdx]);
  }
  
  // Insert max point if not already included
  if (!resultIndices.has(maxIdx)) {
    // Find correct position to insert
    let insertPos = 0;
    for (let i = 0; i < result.length; i++) {
      const origIdx = data.indexOf(result[i]);
      if (origIdx > maxIdx) break;
      insertPos = i + 1;
    }
    result.splice(insertPos, 0, data[maxIdx]);
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
