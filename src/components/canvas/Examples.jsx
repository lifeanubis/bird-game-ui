'use client'

import { Environment, EnvironmentMap, Html, PositionalAudio, useGLTF, useTexture } from '@react-three/drei'
import { useFrame, useThree, Canvas } from '@react-three/fiber'
import * as THREE from 'three'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Line, useCursor, MeshDistortMaterial } from '@react-three/drei'
import { useRouter } from 'next/navigation'
import { io } from 'socket.io-client'

export const Blob = ({ route = '/', ...props }) => {
  const router = useRouter()
  const [hovered, hover] = useState(false)
  useCursor(hovered)
  return (
    <mesh
      onClick={() => router.push(route)}
      onPointerOver={() => hover(true)}
      onPointerOut={() => hover(false)}
      {...props}
    >
      <sphereGeometry args={[1, 64, 64]} />
      <MeshDistortMaterial roughness={0.5} color={hovered ? 'hotpink' : '#1fb2f5'} />
    </mesh>
  )
}

export const Logo = ({ route = '/blob', ...props }) => {
  const mesh = useRef(null)
  const router = useRouter()

  const [hovered, hover] = useState(false)
  const points = useMemo(() => new THREE.EllipseCurve(0, 0, 3, 1.15, 0, 2 * Math.PI, false, 0).getPoints(100), [])

  useCursor(hovered)
  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime()
    mesh.current.rotation.y = Math.sin(t) * (Math.PI / 8)
    mesh.current.rotation.x = Math.cos(t) * (Math.PI / 8)
    mesh.current.rotation.z -= delta / 4
  })

  return (
    <group ref={mesh} {...props}>
      {/* @ts-ignore */}
      <Line worldUnits points={points} color='#1fb2f5' lineWidth={0.15} />
      {/* @ts-ignore */}
      <Line worldUnits points={points} color='#1fb2f5' lineWidth={0.15} rotation={[0, 0, 1]} />
      {/* @ts-ignore */}
      <Line worldUnits points={points} color='#1fb2f5' lineWidth={0.15} rotation={[0, 0, -1]} />
      <mesh onClick={() => router.push(route)} onPointerOver={() => hover(true)} onPointerOut={() => hover(false)}>
        <sphereGeometry args={[0.55, 64, 64]} />
        <meshPhysicalMaterial roughness={0.5} color={hovered ? 'hotpink' : '#1fb2f5'} />
      </mesh>
    </group>
  )
}

export function Duck(props) {
  const SOCKET_SERVER_URL = 'http://localhost:4000'
  const playerObject = {
    player_score: '',
    player_name: '',
    player_id: '',
  }

  const { scene, animations, materials } = useGLTF('/bird_flight_animation.glb') // Load model and animations
  const mixer = useRef()
  const duckAudioRef = useRef()
  const texture = useTexture('/icons/duck_2.png') // Load the texture
  const [hovered, setHovered] = useState(false)
  const [colorState, setColorState] = useState('')
  const [random, setRandom] = useState(0)
  const [playerStats, setPlayerStats] = useState([])
  const [showInput, setShowInput] = useState(true)
  const [hitCount, setHitCount] = useState(0)

  const circleRef = useRef()
  const shake = useRef(0) // Track the shake intensity
  const { camera, viewport } = useThree()

  const socket = useRef() // Track the shake intensity

  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh) {
        // Change the color of the material
        // child.material.color = new THREE.Color('blue') // Example color
        // child.material.emissive = new THREE.Color('green') // Example color
        child.material.color = new THREE.Color(colorState) // Example color
        child.material.map = texture // Set the texture
        child.material.needsUpdate = true
      }
    })

    if (animations && animations.length > 0 && colorState !== 'red') {
      mixer.current = new THREE.AnimationMixer(scene)
      animations.forEach((clip) => {
        const action = mixer.current.clipAction(clip)
        action.play()
      })
    }
    //   return () => {
    //     // Clean up the mixer on component unmount
    //     // mixer.current?.stopAllAction()
    //     // mixer.current?.dispose()
    //   }
  }, [colorState])
  let targetX = 0
  let targetY = 0
  let currentX = 0
  let currentY = 0
  const smoothness = 0.05 // Adjust f

  useEffect(() => {
    socket.current = io('http://localhost:4000')
    socket.current.on('message', (msg) => {
      if (socket.current.id === msg.player_id) {
        setShowInput(false)
        return
      } else {
        setPlayerStats((prevMessages) => [...prevMessages, msg])
      }
    })

    return () => {
      socket.current.disconnect()
    }
  }, [])

  useEffect(() => {
    socket.current.on('hit', (msg) => {
      if (msg?.player_id) {
        let updatedPlayers = playerStats?.map(
          (item) =>
            item?.player_id === msg?.player_id
              ? { ...item, player_score: msg?.player_score } // Update only the score
              : item, // Keep the rest unchanged
        )
        setPlayerStats(updatedPlayers)
        setColorState('red')
        setTimeout(() => {
          setColorState('')
        }, 5000)
        // console.log(msg, '-------p')
        // console.log(playerStats, 'playerStats-------p')
      }
    })
  }, [playerStats])

  const sendMessage = () => {
    // setPlayerStats([...playerStats, msg])
    return socket.current.emit('message', playerStats)

    // return  // Send message to the server
  }

  useFrame((state, delta) => {
    circleRef.current.position.x = ((props.pos[0] + 0.012) * viewport.width) / 2
    circleRef.current.position.y = ((props.pos[1] - 0.01) * viewport.height) / 2

    if (colorState !== 'red') {
      // scene.position.x = Math.sin(state.clock.getElapsedTime()) * 5
      // scene.rotation.x = Math.cos(state.clock.getElapsedTime())
      // scene.position.z = Math.sin(state.clock.getElapsedTime()) * 3
      // scene.rotation.z = Math.sin(state.clock.getElapsedTime()) * 2
      // scene.rotation.y = Math.sin(state.clock.getElapsedTime())
      scene.position.x = Math.sin(state.clock.getElapsedTime()) * random
      scene.position.y = Math.cos(state.clock.getElapsedTime()) * -(random - 1)
      scene.position.z = Math.tan(state.clock.getElapsedTime())

      // scene.position.x = Math.random()
      // scene.rotation.x = Math.cos(state.clock.getElapsedTime())
      // scene.position.z = Math.sin(state.clock.getElapsedTime()) * 3
      // scene.rotation.y = Math.sin(state.clock.getElapsedTime())
      scene.rotation.z = Math.sin(state.clock.getElapsedTime())

      // setInterval(() => {
      //   scene.rotation.z = Math.sin(state.clock.getElapsedTime())
      // }, 5000)
    } else {
      // if (colorState === 'red') {
      // scene.position.set(0, -150, -10)
      scene.position.y = Math.tan(state.clock.getElapsedTime()) * -6

      // rotation={[0, setColorState === 'red' ?  : 0, 0]}
      // meshRef.current.rotation.y = -Math.PI * 0.5
      if (duckAudioRef.current) {
        setRandom(Math.random() * 4 - 1)
        // console.log(random)
        duckAudioRef.current.play()
        duckAudioRef.current.setLoop(false)
      }
      setTimeout(() => {
        setColorState('')
      }, 5000)
    }
    // }

    if (mixer.current) {
      mixer.current.update(delta)
    }
  })

  // }, [])
  const handleClick = () => {
    setColorState('red')
    setHitCount(hitCount + 1)
    // setPlayerStats([...playerStats  ]  )

    // sendMessage()
  }

  useEffect(() => {
    socket.current.emit('hit', {
      player_id: socket.current.id,
      player_score: hitCount,
      // player_name: playerObject.player_name,
    })
  }, [hitCount])

  const handleName = (e) => {
    setPlayerStats([...playerStats, { player_name: e.target.value, player_id: socket.current.id, player_score: '0' }])
    playerObject.player_name = e.target.value
    playerObject.player_id = socket.current.id
    playerObject.player_score = 0

    socket.current.emit('message', { player_name: e.target.value, player_id: socket.current.id, player_score: '0' })
  }

  return (
    <>
      <mesh
        onClick={() => handleClick()}
        onPointerOver={() => colorState !== 'red' && setColorState('orange')}
        onPointerOut={() => colorState !== 'red' && setColorState('')}
      >
        <Html position={[0, 2, 0]} distanceFactor={10}>
          <div className=' min-w-max bg-gray-900 p-5 text-xl uppercase text-green-950  '>
            {playerStats?.length > 0 &&
              playerStats?.map((player, index) => {
                return (
                  <h2 className='text-white' key={index}>
                    {player?.player_name}- {player?.player_score}
                  </h2>
                )
              })}

            {/* <h2>{playerStats.player_name}</h2> */}
            {showInput && (
              <input
                type='text'
                title='enter player name'
                placeholder='press enter after typing'
                onKeyDown={(e) => e.key === 'Enter' && handleName(e)}
              />
            )}
            {/* <button onClick={() => alert('Button Clicked!')}>Click Me</button> */}
          </div>
        </Html>
        <primitive object={scene} {...props} />
        <PositionalAudio
          ref={duckAudioRef}
          url='/quack.mp3' // Path to your audio file
          distance={1}
        />
      </mesh>
      <mesh ref={circleRef}>
        {/* <circleGeometry args={[0.1, 32, 32]} /> */}
        <ringGeometry args={[0.07, 0.1, 32]} />
        <meshBasicMaterial color={colorState === '' ? 'green' : 'red'} />
      </mesh>
      {/* <EnvironmentMap files='/icons/field.jpg' background /> */}
    </>
  )
}
export function Dog(props) {
  const { scene } = useGLTF('/dog.glb')

  return <primitive object={scene} {...props} />
}
