/**
 * Safe localStorage helper functions with defensive checks
 */

export function safeGetItem(key, defaultValue = null) {
  try {
    const item = localStorage.getItem(key)
    if (item === null || item === undefined) {
      return defaultValue
    }
    return item
  } catch (err) {
    console.error(`Error reading localStorage key "${key}":`, err)
    return defaultValue
  }
}

export function safeGetJSON(key, defaultValue = null) {
  try {
    const item = localStorage.getItem(key)
    if (item === null || item === undefined) {
      return defaultValue
    }
    const parsed = JSON.parse(item)
    return parsed
  } catch (err) {
    console.error(`Error parsing localStorage key "${key}":`, err)
    return defaultValue
  }
}

export function safeGetArray(key, defaultValue = []) {
  const result = safeGetJSON(key, defaultValue)
  return Array.isArray(result) ? result : defaultValue
}

export function safeSetItem(key, value) {
  try {
    localStorage.setItem(key, value)
    return true
  } catch (err) {
    console.error(`Error setting localStorage key "${key}":`, err)
    return false
  }
}

export function safeSetJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch (err) {
    console.error(`Error setting localStorage key "${key}":`, err)
    return false
  }
}
