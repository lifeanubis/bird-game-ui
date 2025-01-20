/* eslint-disable react/jsx-key */
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Canvas, dispose, useFrame, useThree } from '@react-three/fiber'
import { MeshDistortMaterial, OrbitControls } from '@react-three/drei'
import { a, useSpring } from '@react-spring/three'
import { Physics, RigidBody, CuboidCollider, BallCollider } from '@react-three/rapier'

export const Box = (props) => {
  const [mouse, setMouse] = useState({ x: 0, y: 0 })
  const lightRef = useRef()
  const gunRef = useRef()

  const { scene } = useThree()
  // This reference gives us direct access to the THREE.Mesh object
  const ref = useRef()
  const projectileRef = useRef([])
  const targetRef = useRef([])

  // Hold state for hovered and clicked events
  const [hovered, hover] = useState(false)
  const [clicked, SetClicked] = useState(0)
  const [shoot, setShoot] = useState(false)

  const [timer, setTimer] = useState()
  const { scale, position } = useSpring({
    scale: hovered ? 0.02 : 0.015, // Target scale
    config: { duration: 200 }, // Duration in ms (2 seconds)
  })

  const handleMouseMove = (event) => {
    const { clientX, clientY } = event
    const x = (clientX / window.innerWidth) * 2 - 1 // Normalize to [-1, 1]
    const y = -(clientY / window.innerHeight) * 2 + 1 // Invert and normalize to [-1, 1]
    setMouse({ x, y })
  }
  useFrame(() => {
    if (projectileRef.current.length > 0) {
      projectileRef.current.map((ele, index) => {
        const position = ele.translation()
        // ele.setLinvel    (10.0, (ele.wake = true))
        ele.setLinvel({ x: 5, y: gunRef.current.rotation.z * Math.PI * 2, z: 0 }, true)
        // ele.applyForce = 500

        position.x >= 10.0 && scene.getObjectByName(`pro${index}`).clear() // Remove the RigidBody from the physics world

        // ele.setAngvel({ x: 10, y: 10, z: 10 }, true)
      })
    }

    if (targetRef.current.length > 0) {
      targetRef.current.map((ele, index) => {
        const positionT = ele.translation()
        ele.setLinvel({ x: -1, y: Math.random() * 4 - 2, z: 0 }, true)
        if (positionT.x < -5) {
          ele.setTranslation({ x: 10, y: positionT.y, z: 0 }, true)
        }
      })
    }
  })
  useEffect(() => {
    const handleKeyUp = (event) => {
      if (event.code === 'Space') {
        SetClicked(clicked + 1)
      }
    }

    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [clicked])

  useEffect(() => {
    const handleGunpoint = (event) => {
      if (event.code === 'ArrowUp' && gunRef.current) {
        gunRef.current.rotation.z += 0.2
      }
      if (event.code === 'ArrowDown' && gunRef.current) {
        gunRef.current.rotation.z -= 0.2
      }
    }

    window.addEventListener('keydown', handleGunpoint)
    return () => {
      window.removeEventListener('keydown', handleGunpoint)
    }
  }, [])

  useFrame(() => {
    if (lightRef.current) {
      lightRef.current.position.set(gunRef.current.position.x + 1, gunRef.current.position.y, 2) // Scale for 3D space
    }
  })

  // useFrame(({ clock }) => {
  //   const t = clock.getElapsedTime()
  //   ref.current.position.x -= 0.005 // Scale for 3D space
  //   if (ref.current.position.x <= -10) {
  //     ref.current.position.x = 10 + Math.random() * 3 - 1
  //     // ref.current.position.y = Math.random()
  //   }
  //   setTimer(t)
  //   // const r = Math.floor(Math.sin(t) * 127 + 128) // Map -1..1 to 0..255
  //   // const g = Math.floor(Math.sin(t + 2) * 127 + 128) // Add phase shift
  //   // const b = Math.floor(Math.sin(t + 4) * 127 + 128) // Add phase shift

  //   // // if (ref.current) {
  //   // ref.current.color = `rgb(100,10,10)`
  //   // // }
  // })

  const makeProjectile = () => {
    return Array.from({ length: clicked }, (_, index) => {
      return (
        <RigidBody
          mass={5}
          // colliders={'ball'}
          ref={(el) => (projectileRef.current[index] = el)}
          restitution={1}
          name={`pro${index}`}
          position={[-4, 0, 0]}
          scale={0.005}
        >
          <a.mesh
            // {...props}
            onPointerMove={(e) => handleMouseMove(e)}
            // onClick={(event)   => click(!clicked)}
            onPointerOver={(event) => hover(true)}
            onPointerOut={(event) => hover(false)}
          >
            <pointLight ref={lightRef} intensity={1} decay={5} color={'red'} />
            <capsuleGeometry args={[15, 5, 5]} />
            <BallCollider args={[0.5]} />
            <BallCollider args={[0.5]} position={[1, 0, 0]} />
            <MeshDistortMaterial metalness={0.1} color={'orange'} />
          </a.mesh>
        </RigidBody>
      )
    })
  }

  const generateTarget = () => {
    return Array.from({ length: 20 }, (_, index) => {
      return (
        <RigidBody
          ref={(el) => (targetRef.current[index] = el)}
          // colliders={'cuboid'}
          name={`target${index}`}
          restitution={1}
          key={index}
          mass={1}
          position={[0 + 0.5 * index, Math.random() * 2 - 1, 0]}
          scale={0.005}
        >
          <a.mesh>
            <pointLight intensity={1} decay={5} color={'red'} />
            <sphereGeometry args={[15, 5]} />
            <BallCollider args={[0.5]} />
            <BallCollider args={[0.5]} position={[1, 0, 0]} />
            <MeshDistortMaterial metalness={0.1} color={'white'} />
          </a.mesh>
        </RigidBody>
      )
    })
  }

  return (
    <Physics gravity={[0, 0, 0]}>
      <a.mesh
        // {...props}
        ref={gunRef}
        position={[-4, 0, 0]}
        onPointerMove={(e) => handleMouseMove(e)}
        scale={0.01}
        // onClick={(event) => gunPoint()}
        onPointerOver={(event) => hover(true)}
        onPointerOut={(event) => hover(false)}
      >
        <boxGeometry args={[150, 15, 15]} />
        <pointLight
          ref={lightRef}
          intensity={1}
          decay={5}
          // position={[(mouse.x * 2) / 60, (mouse.y * 2) / 60, -6]}
          color={hovered ? 'darkblue' : 'black'}
        />

        <MeshDistortMaterial
          roughness={0.5}
          // distort={hovered ? Math.sin(timer) : 0}
          // color={`rgb(${Math.floor(Math.sin(timer) * 127 + 128)},${Math.floor(Math.sin(timer + 2) * 127 + 128)},${Math.floor(Math.sin(timer + 4) * 127 + 128)})`}
        />
        {/* <meshStandardMaterial color={hovered ? 'blue' : 'orange'} /> */}
        {/* <OrbitControls /> */}
      </a.mesh>

      {makeProjectile()}
      {generateTarget()}
    </Physics>
  )
}
