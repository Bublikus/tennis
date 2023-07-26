'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import Spline, { SPEObject } from '@splinetool/react-spline'
import { useChannel } from '@/hooks/useChannel'
import { throttle } from '@/utils/misc'
import { OrientationData } from '@/types/orientation'
import { CHANNEL_NAME } from '@/constants/channel'
import { Application } from '@splinetool/runtime'

export type PlaygroundSceneRef = {
  handlePlaneOrientation(event: DeviceOrientationEvent): void
}

export default function Playground() {
  const racket = useRef<SPEObject>()

  const [isMobile, setIsMobile] = useState(false)
  const [isPermissionGranted, setIsPermissionGranted] = useState(false)

  const onLoad = (spline: Application) => {
    racket.current = spline.findObjectByName('racket')
  }

  const handleRacketOrientation = useCallback((event: OrientationData) => {
    if (!racket.current) return

    const alpha = event.alpha ?? 0
    const beta = event.beta ?? 0
    const gamma = event.gamma ?? 0

    const degreesToRadians = (degrees: number) => degrees * (Math.PI / 180)

    racket.current.rotation.x = degreesToRadians(beta)
    racket.current.rotation.y = degreesToRadians(alpha)
    racket.current.rotation.z = degreesToRadians(-gamma)
  }, [])

  const [channel] = useChannel(CHANNEL_NAME, (event) => {
    if (!event.data) return

    handleRacketOrientation(event.data)
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

      let data: OrientationData = {
        alpha: event.alpha ?? 0,
        beta: event.beta ?? 0,
        gamma: event.gamma ?? 0,
      }

      // Send data to server
      if (isMobile) throttledPublish(data)

      handleRacketOrientation(data)
    },
    [throttledPublish, handleRacketOrientation, isMobile],
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
        <Spline
          scene="https://prod.spline.design/ZSbFjFdOI42Ok8vC/scene.splinecode"
          onLoad={onLoad}
        />
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
