'use client'

import React, {
  forwardRef,
  Suspense,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'
import { Canvas, extend, Object3DNode, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import {
  BoxGeometry,
  DoubleSide,
  Mesh,
  MeshBasicMaterial,
  PlaneGeometry,
  SphereGeometry,
  Vector3,
} from 'three'
import { PlaygroundSceneRef } from '@/components/Playground/Playground'

class VelocityMesh extends Mesh {
  velocity: Vector3 = new Vector3(0, 0, 0.1)
}

// Add types to ThreeElements elements so primitives pick up on it
declare module '@react-three/fiber' {
  interface ThreeElements {
    velocityMesh: Object3DNode<VelocityMesh, typeof VelocityMesh>
  }
}

extend({ VelocityMesh })

// Component for Plane
const Plane = forwardRef<Mesh | null>((props, ref) => {
  const mesh = useRef<Mesh | null>(null)

  useImperativeHandle(ref, () => mesh.current as Mesh, [mesh.current])

  useEffect(() => {
    const handlePlaneOrientation = (event: DeviceOrientationEvent) => {
      var alpha = event.alpha || 0
      var beta = event.beta || 0
      var gamma = event.gamma || 0

      // rotate the plane based on device orientation
      mesh.current?.rotation.set(
        (beta * Math.PI) / 180,
        (alpha * Math.PI) / 180,
        (-gamma * Math.PI) / 180,
      )
    }

    window.addEventListener('deviceorientation', handlePlaneOrientation)

    return () =>
      window.removeEventListener('deviceorientation', handlePlaneOrientation)
  }, [])

  return (
    <mesh
      ref={mesh}
      geometry={new PlaneGeometry(1, 2)}
      material={new MeshBasicMaterial({ color: 0x00aa00, side: DoubleSide })}
    />
  )
})

// Component for Wall
const Wall = forwardRef<Mesh | null>((props, ref) => {
  return (
    <mesh
      ref={ref}
      position={[0, 0, -5]}
      geometry={new BoxGeometry(10, 10, 1)}
      material={new MeshBasicMaterial({ color: 0xff0000 })}
    />
  )
})

interface BallProps {
  position: [number, number, number]
  onUpdate: (mesh: VelocityMesh | null) => void
}

// Component for Ball
const Ball: React.FC<BallProps> = (props) => {
  const mesh = useRef<VelocityMesh | null>(null)
  const [velocity] = useState(new Vector3(0, 0, 0.1))

  useFrame(() => {
    if (mesh.current) {
      mesh.current.position.add(velocity)
      props.onUpdate(mesh.current)
    }
  })

  return (
    <velocityMesh
      ref={mesh}
      {...props}
      geometry={new SphereGeometry(0.2, 32, 32)}
      material={new MeshBasicMaterial({ color: 0x0000ff })}
    />
  )
}

// Main scene
type SceneRefs = { plane: Mesh | null; wall: Mesh | null }

interface SceneProps {
  getRefs?(refs: SceneRefs): void
}

const Scene: React.FC<SceneProps> = ({ getRefs }) => {
  const [balls, setBalls] = useState<number[]>([])
  const plane = useRef<Mesh>(null)
  const wall = useRef<Mesh>(null)

  // Fires a ball every 2 seconds
  useEffect(() => {
    getRefs?.({ plane: plane.current, wall: wall.current })

    const intervalId = setInterval(() => {
      const id = Math.random()
      setBalls((balls) => [...balls, id])
      setTimeout(() => {
        setBalls((balls) => balls.filter((ballId) => ballId !== id))
      }, 5000)
    }, 2000)

    return () => clearInterval(intervalId)
  }, [getRefs])

  // Handles collision with plane and wall
  const handleCollision = (mesh: VelocityMesh | null) => {
    if (mesh && plane.current && wall.current) {
      const planeBox = new THREE.Box3().setFromObject(plane.current)
      // const wallBox = new THREE.Box3().setFromObject(wall.current)
      const ballSphere = new THREE.Sphere(mesh.position, 0.2)

      if (planeBox.intersectsSphere(ballSphere)) {
        console.log(plane.current.quaternion)
        let normal = new Vector3(0, 0, 1)
        normal.applyQuaternion(plane.current.quaternion)
        mesh.velocity.reflect(normal)
      }

      // if (wallBox.intersectsSphere(ballSphere)) {
      //   let normal = new Vector3(0, 0, -1)
      //   normal.applyQuaternion(wall.current.quaternion)
      //   mesh.velocity.reflect(normal)
      // }
    }
  }

  return (
    <>
      <Plane ref={plane} />
      <Wall ref={wall} />
      {balls.map((id) => (
        <Ball key={id} position={[0, 0, -4.8]} onUpdate={handleCollision} />
      ))}
    </>
  )
}

// Canvas component
const PlaygroundScene = forwardRef<PlaygroundSceneRef>((props, ref) => {
  const planeRef = useRef<Mesh | null>(null)

  const handlePlaneOrientation = useCallback(
    (event: DeviceOrientationEvent) => {
      const alpha = event.alpha ?? 0
      const beta = event.beta ?? 0
      const gamma = event.gamma ?? 0

      // rotate the plane based on device orientation
      planeRef.current?.rotation.set(
        (beta * Math.PI) / 180,
        (alpha * Math.PI) / 180,
        (-gamma * Math.PI) / 180,
      )
    },
    [],
  )

  const getRefs = useCallback((refs: SceneRefs) => {
    planeRef.current = refs.plane
  }, [])

  useImperativeHandle(
    ref,
    () => ({
      handlePlaneOrientation,
    }),
    [handlePlaneOrientation],
  )

  return (
    <Canvas
      style={{ position: 'fixed', inset: '0', pointerEvents: 'none' }}
      camera={{ position: [-5, 5, 5], fov: 75 }}
    >
      <color attach="background" args={[0, 0, 0]} />
      <Suspense fallback={null}>
        <Scene getRefs={getRefs} />
      </Suspense>
    </Canvas>
  )
})
export default PlaygroundScene
