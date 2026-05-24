import { useState, useEffect, useCallback } from 'react'

const cache = new Map()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

async function safeJson(response) {
  const text = await response.text()
  if (!text || !text.trim()) throw new Error('Empty response from server (API not available in dev mode — deploy to Vercel or run `vercel dev`)')
  try {
    return JSON.parse(text)
  } catch {
    throw new Error('API not available in local dev mode. Deploy to Vercel to use live data.')
  }
}

export function useSheetData(endpoint, options = {}) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastFetched, setLastFetched] = useState(null)

  const { enabled = true } = options

  const fetchData = useCallback(async (forceRefresh = false) => {
    if (!enabled) return

    const cacheKey = endpoint
    const cached = cache.get(cacheKey)
    const isStale = !cached || (Date.now() - cached.timestamp > CACHE_DURATION)

    if (!forceRefresh && cached && !isStale) {
      setData(cached.data)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const response = await fetch(`/api/${endpoint}`)
      const result = await safeJson(response)
      if (!response.ok) throw new Error(result.error || 'Request failed')
      cache.set(cacheKey, { data: result, timestamp: Date.now() })
      setData(result)
      setLastFetched(new Date())
    } catch (err) {
      setError(err.message)
      // use stale data on error if available
      if (cached) setData(cached.data)
    } finally {
      setLoading(false)
    }
  }, [endpoint, enabled])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const refetch = useCallback(() => fetchData(true), [fetchData])
  const invalidate = useCallback(() => cache.delete(endpoint), [endpoint])

  return { data, loading, error, refetch, invalidate, lastFetched }
}

export async function apiPost(endpoint, body) {
  const response = await fetch(`/api/${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  let result
  try {
    result = await safeJson(response)
  } catch (err) {
    throw new Error(err.message)
  }
  if (!response.ok) throw new Error(result.error || 'Request failed')
  return result
}

export function invalidateCache(endpoint) {
  cache.delete(endpoint)
}

export function invalidateAll() {
  cache.clear()
}
