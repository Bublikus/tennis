'use client'

import { OrientationData } from '@/types/orientation'
import { useWebSocket } from '@/hooks/useWebSocket'

export default function Home() {
  const onSocketMessage = (data: OrientationData, isMobile: boolean) => {
    console.log(data, isMobile)
  }

  useWebSocket({ onParsedMessage: onSocketMessage })

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      Something
    </main>
  )
}
