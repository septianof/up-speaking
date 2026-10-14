import { useState, useEffect, useCallback, useMemo } from 'react'

export interface UseElapsedTimerOptions {
  initialSeconds?: number
  onTick?: (seconds: number) => void
  isPaused?: boolean
}

export interface UseElapsedTimerReturn {
  seconds: number
  formattedTime: string
  setSeconds: React.Dispatch<React.SetStateAction<number>>
  reset: () => void
}

export function useElapsedTimer({
  initialSeconds = 0,
  onTick,
  isPaused = false,
}: UseElapsedTimerOptions = {}): UseElapsedTimerReturn {
  const [seconds, setSeconds] = useState(initialSeconds)

  useEffect(() => {
    setSeconds(initialSeconds)
  }, [initialSeconds])

  useEffect(() => {
    if (isPaused) return

    const timer = setInterval(() => {
      setSeconds((prev) => {
        const next = prev + 1
        if (onTick) {
          onTick(next)
        }
        return next
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isPaused, onTick])

  const formattedTime = useMemo(() => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${mins
        .toString()
        .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${mins.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`
  }, [seconds])

  const reset = useCallback(() => {
    setSeconds(0)
  }, [])

  return {
    seconds,
    formattedTime,
    setSeconds,
    reset,
  }
}
