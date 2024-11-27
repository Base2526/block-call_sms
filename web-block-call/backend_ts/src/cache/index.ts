import NodeCache from "node-cache";
import moment from "moment";

// Define the type for the cache value
interface CacheValue {
  [key: string]: any;
  createdAt: string; // We will add createdAt as a string (formatted date)
}

// Create a cache instance with specified TTL and check period
const cache = new NodeCache({ stdTTL: 100, checkperiod: 3600 });

// Function to get a value from cache
const ca_get = (key: string): CacheValue | {} => {
  console.log("ca_get :", key);
  // Handle the case where cache.get() may return undefined
  const result = cache.get<CacheValue>(key); // Type assertion for better type handling
  return result || {}; // Return empty object if undefined
};

// Function to save a value to cache, appending createdAt timestamp
const ca_save = (key: string, value: CacheValue): boolean => {
  console.log("ca_save :", key);
  value = { ...value, createdAt: moment().format() }; // Add timestamp
  return cache.set(key, value);
};

// Function to get all cache keys
const ca_keys = (): string[] => {
  return cache.keys();
};

// Function to delete a single value from cache
const ca_delete = (key: string): boolean => {
  console.log("ca_delete :", key);
  return cache.has(key) 
         ? cache.del(key) ? true : false  
         : false;
};

// Function to delete multiple values from cache
const ca_deletes = (keys: string[]): boolean => {
  console.log("ca_deletes :", keys);
  return cache.del(keys) ? true : false;
};

export {
  ca_get,
  ca_save,
  ca_keys,
  ca_delete,
  ca_deletes,
};