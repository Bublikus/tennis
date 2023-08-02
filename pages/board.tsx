import Spline, { SPEObject } from '@splinetool/react-spline'
import React, { useCallback, useRef, useState } from 'react'
import { Application } from '@splinetool/runtime'
import { OrientationData } from '@/types/orientation'
import { degToRad } from '@/utils/math'

export default function Board() {
  const board = useRef<SPEObject>()

  const [isPermissionGranted, setIsPermissionGranted] = useState(false)

  const onLoad = (spline: Application) => {
    board.current = spline.findObjectByName('Board')
  }

  const handleBoardOrientation = (data: OrientationData) => {
    if (!board.current) return

    const alpha = data.alpha
    const beta = data.beta
    const gamma = data.gamma

    // Apply rotations to the plane
    board.current.rotation.x = degToRad(beta)
    board.current.rotation.y = degToRad(alpha)
    board.current.rotation.z = degToRad(-gamma)
  }

  const handleOrientation = useCallback(
    (event: DeviceOrientationEvent) => {
      if (!event) return

      let data: OrientationData = {
        alpha: event.alpha ?? 0,
        beta: event.beta ?? 0,
        gamma: event.gamma ?? 0,
      }

      handleBoardOrientation(data)
    },
    [handleBoardOrientation],
  )

  const onStartGame = useCallback(() => {
    ;(DeviceMotionEvent as any).requestPermission().then((response: string) => {
      if (response === 'granted') {
        setIsPermissionGranted(true)
        window.addEventListener('deviceorientation', handleOrientation, true)
      }
    })
  }, [handleOrientation])

  return (
    <div className="fixed inset-0 overflow-hidden flex-auto flex flex-col items-center justify-center">
      <Spline
        scene="https://prod.spline.design/ib-sWb7Cf67RjSoX/scene.splinecode"
        onLoad={onLoad}
      />

      {!isPermissionGranted && (
        <button
          type="button"
          className="text-4xl p-4 rounded-3xl border-2 border-orange-600"
          onClick={onStartGame}
        >
          Start Game
        </button>
      )}
    </div>
  )
}
