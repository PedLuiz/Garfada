import { useCallback, useEffect, useState } from 'react'

export function useAsyncData(fetcher) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const execute = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const result = await fetcher()
      setData(result)
      return result
    } catch (err) {
      const errorInstance = err instanceof Error ? err : new Error('Erro inesperado.')
      setError(errorInstance)
      return null
    } finally {
      setLoading(false)
    }
  }, [fetcher])

  useEffect(() => {
    execute()
  }, [execute])

  return {
    data,
    setData,
    loading,
    error,
    reload: execute,
  }
}
