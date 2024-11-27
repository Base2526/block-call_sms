import NodeCache from 'node-cache';

// Define the shape of a position object
interface Position {
  _id: string;
  level: number;
  name: string;
  percent: number;
  budget: number;
}

// Initialize cache with a default expiration of 48 hours
const cache = new NodeCache({ stdTTL: 3600 * 48, checkperiod: 120 });

// Initial positions data
const initPosition: Position[] = [
  { _id: "6721098ce9dccb02aab4cb3e", level: 0, name: "BM", percent: 0, budget: 0 },
  { _id: "6721098ce9dccb02aab4cb3f", level: 1, name: "BS", percent: 0, budget: 5000 },
  // ... other positions omitted for brevity
];

// Cache key for positions data
const CACHE_KEY = 'positions';

/**
 * Save initial positions data to cache only if it doesn't already exist.
 * @param ttl - Expiration time in seconds
 */
function savePositionsIfNotExists(ttl: number = 3600 * 24): void {
  if (!cache.has(CACHE_KEY)) {
    cache.set(CACHE_KEY, initPosition, ttl);
  }
}

/**
 * Get positions data from cache
 * @returns Positions data if available, otherwise undefined
 */
function getPositions(): Position[] | undefined {
  return cache.get<Position[]>(CACHE_KEY);
}

/**
 * Update positions data in cache with custom expiration time
 * @param newData - Updated positions data
 * @param ttl - Expiration time in seconds
 */
function updatePositions(newData: Position[], ttl: number = 3600): void {
  cache.set(CACHE_KEY, newData, ttl);
}

/**
 * Check if positions data is in cache
 * @returns True if positions data is in cache, false otherwise
 */
function isPositionsCached(): boolean {
  return cache.has(CACHE_KEY);
}

/**
 * Get a position by _id.
 * @param id - The _id of the position to retrieve
 * @returns The position object or null if not found
 */
function getPositionById(id: string): Position | null {
  const positions = getPositions();
  return positions?.find(position => position._id === id) || null;
}

/**
 * Get percent by _id.
 * @param id - The _id of the position to retrieve percent for
 * @returns The percent value or null if position not found
 */
function getPercentById(id: string): number | null {
  const position = getPositionById(id);
  return position ? position.percent : null;
}

/**
 * Find all IDs with levels lower than the specified target
 */
function findPositionIdsLevelLess(targetId: string): string[] {
  const positions = getPositions();
  const targetItem = positions?.find(item => item._id === targetId);

  if(positions !== undefined){
    return targetItem ? positions.filter(item => item.level < targetItem.level).map(item => item._id) : [];
  }
  return [];
}

/**
 * Find all IDs with levels lower or equal to the specified target
 */
function positionLevelLessAndEqual(targetId: string): string[] {
  const positions = getPositions();
  const targetItem = positions?.find(item => item._id === targetId);
  if(positions !== undefined){
    return targetItem ? positions.filter(item => item.level <= targetItem.level).map(item => item._id) : [];
  }
  return [];
}

/**
 * Find all IDs with levels greater than or equal to the specified target
 */
function positionLevelMoreThan(targetId: string): string[] {
  const positions = getPositions();
  const targetItem = positions?.find(item => item._id === targetId);
  if(positions !== undefined){
    return targetItem ? positions.filter(item => item.level > targetItem.level).map(item => item._id) : [];
  }

  return [];
}

// Export functions
export {
  savePositionsIfNotExists,
  getPositions,
  updatePositions,
  isPositionsCached,
  getPositionById,
  getPercentById,
  findPositionIdsLevelLess,
  positionLevelLessAndEqual,
  positionLevelMoreThan
};
