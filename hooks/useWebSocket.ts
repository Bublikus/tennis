import { useEffect, useRef } from 'react'
import { isMobile } from '@/utils/browser'
import { OrientationData } from '@/types/orientation'

const SOCKET_BASE_URL = String(process.env.NEXT_PUBLIC_SOCKET_BASE_URL)

type UseWebSocket = (props?: {
  onParsedMessage?: (data: OrientationData, isMobile: boolean) => void
}) => {
  socket: WebSocket | null
}

export const useWebSocket: UseWebSocket = ({ onParsedMessage } = {}) => {
  const socketRef = useRef<WebSocket | null>(null)
  const cbRef = useRef(onParsedMessage)
  cbRef.current = onParsedMessage

  useEffect(() => {
    const SOCKET_URL = `${SOCKET_BASE_URL}?isMobile=${isMobile}`

    // Socket
    socketRef.current = new WebSocket(SOCKET_URL)
    socketRef.current.binaryType = 'blob'

    // Socket events
    socketRef.current.onopen = function (e) {
      console.log('[open] Connection established')
    }

    socketRef.current.onerror = function (error) {
      const message = error instanceof Error ? error.message : error
      console.log(`[error] `, message)
    }

    socketRef.current.onmessage = function (event) {
      if (event.data instanceof Blob) {
        const reader = new FileReader()

        reader.onload = () => {
          const data =
            typeof reader.result === 'string'
              ? JSON.parse(reader.result)
              : reader.result
          cbRef.current?.(data, isMobile)
        }

        reader.readAsText(event.data)
      } else {
        const data = JSON.parse(event.data)
        cbRef.current?.(data, isMobile)
      }
    }
  }, [])

  return { socket: socketRef.current }
}
