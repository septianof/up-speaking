import { useState, useEffect, useRef, useCallback } from 'react'

export interface PendingSyncItem {
  questionId: string
  selectedOptionId: string | null
}

export interface UseOfflineSyncOptions {
  sessionId?: string
  deviceToken?: string
  getElapsedSeconds?: () => number
  onDeviceConflict?: () => void
  onSessionCompleted?: () => void
}

export interface UseOfflineSyncReturn {
  isOnline: boolean
  isSyncing: boolean
  hasPendingSync: boolean
  deviceConflict: boolean
  syncAnswer: (questionId: string, selectedOptionId: string | null) => void
  flushPendingSync: (finalAnswers?: Record<string, string>) => Promise<boolean>
}

export function useOfflineSync({
  sessionId,
  deviceToken,
  getElapsedSeconds,
  onDeviceConflict,
  onSessionCompleted,
}: UseOfflineSyncOptions): UseOfflineSyncReturn {
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return navigator.onLine
    }
    return true
  })
  const [isSyncing, setIsSyncing] = useState<boolean>(false)
  const [hasPendingSync, setHasPendingSync] = useState<boolean>(false)
  const [deviceConflict, setDeviceConflict] = useState<boolean>(false)

  // In-memory queue map: questionId -> selectedOptionId
  const queueRef = useRef<Map<string, string | null>>(new Map())
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Local storage queue key
  const storageKey = sessionId ? `up_speaking_sync_queue_${sessionId}` : null

  // Load pending queue from localStorage on mount
  useEffect(() => {
    if (!storageKey || typeof window === 'undefined') return

    try {
      const saved = localStorage.getItem(storageKey)
      if (saved) {
        const parsed: Record<string, string | null> = JSON.parse(saved)
        const entries = Object.entries(parsed)
        if (entries.length > 0) {
          entries.forEach(([qId, optId]) => {
            queueRef.current.set(qId, optId)
          })
          setHasPendingSync(true)
        }
      }
    } catch (e) {
      console.error('Failed to load pending sync queue from localStorage:', e)
    }
  }, [storageKey])

  // Persist current queue to localStorage
  const saveQueueToStorage = useCallback(() => {
    if (!storageKey || typeof window === 'undefined') return
    try {
      const obj: Record<string, string | null> = {}
      queueRef.current.forEach((val, key) => {
        obj[key] = val
      })
      if (Object.keys(obj).length === 0) {
        localStorage.removeItem(storageKey)
        setHasPendingSync(false)
      } else {
        localStorage.setItem(storageKey, JSON.stringify(obj))
        setHasPendingSync(true)
      }
    } catch (e) {
      console.error('Failed to save sync queue to localStorage:', e)
    }
  }, [storageKey])

  // Core flush function
  const flushPendingSync = useCallback(
    async (finalAnswers?: Record<string, string>): Promise<boolean> => {
      if (!sessionId || !deviceToken || typeof window === 'undefined') return true

      // If final answers provided, incorporate them into the queue
      if (finalAnswers) {
        Object.entries(finalAnswers).forEach(([qId, optId]) => {
          queueRef.current.set(qId, optId)
        })
        saveQueueToStorage()
      }

      if (queueRef.current.size === 0) {
        return true
      }

      if (!navigator.onLine) {
        setHasPendingSync(true)
        return false
      }

      // Prepare payload
      const responses: PendingSyncItem[] = []
      queueRef.current.forEach((optId, qId) => {
        responses.push({ questionId: qId, selectedOptionId: optId })
      })

      const elapsedSeconds = getElapsedSeconds ? getElapsedSeconds() : undefined

      setIsSyncing(true)
      try {
        const res = await fetch('/api/student/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId,
            deviceToken,
            elapsedSeconds,
            responses,
          }),
          keepalive: true,
        })

        const data = await res.json()

        if (res.status === 403 || data.deviceConflict) {
          setDeviceConflict(true)
          onDeviceConflict?.()
          return false
        }

        if (res.status === 409) {
          if (data.status === 'COMPLETED' || data.status === 'FINALIZED') {
            onSessionCompleted?.()
          }
          return false
        }

        if (res.ok && data.success) {
          // Clear successfully synced items from queue
          responses.forEach((r) => {
            queueRef.current.delete(r.questionId)
          })
          saveQueueToStorage()
          return true
        }

        return false
      } catch (err) {
        console.error('Error syncing student responses:', err)
        return false
      } finally {
        setIsSyncing(false)
      }
    },
    [sessionId, deviceToken, getElapsedSeconds, onDeviceConflict, onSessionCompleted, saveQueueToStorage]
  )

  // Enqueue an answer and trigger debounced sync if online
  const syncAnswer = useCallback(
    (questionId: string, selectedOptionId: string | null) => {
      queueRef.current.set(questionId, selectedOptionId)
      saveQueueToStorage()

      // If offline, wait for network restoration
      if (typeof window !== 'undefined' && !navigator.onLine) {
        return
      }

      // Debounce HTTP call by 500ms
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }

      debounceTimerRef.current = setTimeout(() => {
        flushPendingSync()
      }, 500)
    },
    [flushPendingSync, saveQueueToStorage]
  )

  // Listen to network status & page visibility / pagehide for instant flush
  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleOnline = () => {
      setIsOnline(true)
      // Auto-flush pending items when connection is restored
      if (queueRef.current.size > 0) {
        flushPendingSync()
      }
    }

    const handleOffline = () => {
      setIsOnline(false)
    }

    const handleFlushOnLeave = () => {
      if (queueRef.current.size > 0 && navigator.onLine) {
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current)
        }
        flushPendingSync()
      }
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        handleFlushOnLeave()
      }
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('pagehide', handleFlushOnLeave)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('pagehide', handleFlushOnLeave)
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
        flushPendingSync()
      }
    }
  }, [flushPendingSync])

  return {
    isOnline,
    isSyncing,
    hasPendingSync,
    deviceConflict,
    syncAnswer,
    flushPendingSync,
  }
}
