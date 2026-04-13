const DEFAULT_TTL_MS = 5 * 60 * 1000

export function readCache(key, ttlMs = DEFAULT_TTL_MS) {
  try {
    const raw = sessionStorage.getItem(key)
    if (!raw) return null

    const parsed = JSON.parse(raw)
    if (!parsed?.timestamp || !parsed?.data) return null

    if (Date.now() - parsed.timestamp > ttlMs) {
      sessionStorage.removeItem(key)
      return null
    }

    return parsed.data
  } catch {
    return null
  }
}

export function writeCache(key, data) {
  try {
    sessionStorage.setItem(
      key,
      JSON.stringify({
        timestamp: Date.now(),
        data,
      }),
    )
  } catch {}
}

export function clearCache(key) {
  try {
    sessionStorage.removeItem(key)
  } catch {}
}
