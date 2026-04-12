'use client'

import { useCallback } from 'react'

/**
 * useLocalStorage 훅
 * 
 * ESLint 규칙(no-restricted-syntax)에 따라 localStorage에 직접 접근하지 않고
 * 전용 훅을 통해 안전하게 데이터를 읽고 쓰기 위해 사용합니다.
 */
export function useLocalStorage() {
  const getItem = useCallback((key: string): string | null => {
    if (typeof window === 'undefined') return null
    try {
      return localStorage.getItem(key)
    } catch {
      return null
    }
  }, [])

  const setItem = useCallback((key: string, value: string): void => {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem(key, value)
    } catch (e) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('[LocalStorage] setItem failed:', e)
      }
    }
  }, [])

  const removeItem = useCallback((key: string): void => {
    if (typeof window === 'undefined') return
    try {
      localStorage.removeItem(key)
    } catch (e) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('[LocalStorage] removeItem failed:', e)
      }
    }
  }, [])

  return { getItem, setItem, removeItem }
}
