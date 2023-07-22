export const isBrowser = typeof window !== 'undefined'

export const isMobile = isBrowser
  ? /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
  : false
