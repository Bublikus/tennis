'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useChannel } from '@/hooks/useChannel'
import { throttle } from '@/utils/misc'
import { OrientationData } from '@/types/orientation'
import { CHANNEL_NAME } from '@/constants/channel'
import PlaygroundScene from './PlaygroundScene'

export type PlaygroundSceneRef = {
  handlePlaneOrientation(event: DeviceOrientationEvent): void
}

export default function Playground() {
  const sceneRef = useRef<PlaygroundSceneRef>(null)

  const [isMobile, setIsMobile] = useState(false)
  const [isPermissionGranted, setIsPermissionGranted] = useState(false)

  const [channel] = useChannel(CHANNEL_NAME, (event) => {
    if (!event.data) return

    // Display data on screen
    sceneRef.current?.handlePlaneOrientation(event.data)
  })

  const throttledPublish = useCallback(
    throttle(
      (data: OrientationData) => channel.publish(CHANNEL_NAME, data),
      100,
    ),
    [channel],
  )

  const handleOrientation = useCallback(
    (event: DeviceOrientationEvent) => {
      if (!event) return

      if (isMobile) {
        // Send data to server
        let data: OrientationData = {
          alpha: event.alpha ?? 0,
          beta: event.beta ?? 0,
          gamma: event.gamma ?? 0,
        }
        throttledPublish(data)
      }

      // Display data on screen
      sceneRef.current?.handlePlaneOrientation(event)
    },
    [throttledPublish, isMobile],
  )

  const onStartRacket = useCallback(() => {
    ;(DeviceMotionEvent as any).requestPermission().then((response: string) => {
      if (response === 'granted') {
        setIsPermissionGranted(true)
        // Add a listener to get smartphone orientation
        // in the alpha-beta-gamma axes (units in degrees)
        window.addEventListener('deviceorientation', handleOrientation, true)
      }
    })
  }, [handleOrientation])

  useEffect(() => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
    setIsMobile(isMobile)
  }, [])

  return (
    <div className="flex-auto flex flex-col items-center justify-center">
      {(!isMobile || (isMobile && isPermissionGranted)) && (
        <PlaygroundScene ref={sceneRef} />
      )}

      {isMobile && !isPermissionGranted && (
        <button
          type="button"
          className="text-4xl p-4 rounded-3xl border-2 border-orange-600"
          onClick={onStartRacket}
        >
          🏓 Start racket 🏓
        </button>
      )}
    </div>
  )
}
