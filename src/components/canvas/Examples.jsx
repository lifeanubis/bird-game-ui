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
  const [roomName, setRoomName] = useState('')
  const [roomCache, setRoomCache] = useState([])
  const [roomChats, setRoomChats] = useState([])
  const [chatText, setChatText] = useState('')

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
    // if (window) {
    // socket.current = io('http://localhost:4000')
    socket.current = io('https://game-server-production-bbd8.up.railway.app')
    socket.current.on('chats', (msg) => {
      // console.log(msg, 'hehehehe')
      roomChats.length > 4 && document.getElementById(`bottom`).scrollIntoView()
      setRoomChats((chats) => [...chats, msg])
    })
    socket.current.on('add_player', (msg) => {
      setRoomCache((roomCache) => [...roomCache, msg])
      if (msg.room_name === roomName) {
        if (socket.current.id === msg.player_id) {
          setShowInput(false)
        } else {
          setPlayerStats((prevMessages) => [...prevMessages, msg])
        }
      }
      if (msg.room_name !== roomName) {
        return
      }
    })

    return () => {
      socket.current.disconnect()
    }
    // }
  }, [roomName])

  useEffect(() => {
    const uniqueArray = [...new Set(roomCache.filter((item) => item.room_name === roomName))]
    setPlayerStats(uniqueArray)
  }, [roomCache, roomName])

  useEffect(() => {
    socket.current.on('hit', (msg) => {
      if (msg?.player_id) {
        let updatedPlayers = playerStats?.map((item) =>
          item?.player_id === msg?.player_id ? { ...item, player_score: msg?.player_score } : item,
        )
        setPlayerStats(updatedPlayers)
        setColorState('red')
        setTimeout(() => {
          setColorState('')
        }, 5000)
      }
    })
  }, [playerStats])

  useFrame((state, delta) => {
    circleRef.current.position.x = ((props.pos[0] + 0.012) * viewport.width) / 2
    circleRef.current.position.y = ((props.pos[1] - 0.01) * viewport.height) / 2

    if (colorState !== 'red') {
      scene.position.x = Math.sin(state.clock.getElapsedTime()) * random
      scene.position.y = Math.cos(state.clock.getElapsedTime()) * -(random - 1)
      scene.position.z = Math.tan(state.clock.getElapsedTime())

      scene.rotation.z = Math.sin(state.clock.getElapsedTime())
    } else {
      scene.position.y = Math.tan(state.clock.getElapsedTime()) * -6

      if (duckAudioRef.current) {
        setRandom(Math.random() * 4 - 1)
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
  }

  useEffect(() => {
    socket.current.emit('hit', {
      player_id: socket.current.id,
      player_score: hitCount,
    })
  }, [hitCount])

  const handleName = (e) => {
    let random_player = `RANDOM_PLAYER ${Math.floor(Math.random() * 100)}`
    setPlayerStats([
      ...playerStats,
      {
        player_name: e.target.value || random_player,
        player_id: socket.current.id,
        player_score: '0',
        room_name: roomName || 'GLOBAL_ROOM',
      },
    ])
    socket.current.emit('add_player', {
      player_name: e.target.value || random_player,
      player_id: socket.current.id,
      player_score: '0',
      room_name: roomName || 'GLOBAL_ROOM',
    })
  }

  const handleRoom = (e) => {
    setRoomName(e.target.value.toString().toUpperCase())
  }

  const handleChats = (e) => {
    socket.current.emit('chats', {
      player_chat: chatText,
      player_id: socket.current.id,
      room_name: roomName,
    })
    roomChats.length > 4 && document.getElementById(`bottom`).scrollIntoView()
    setChatText('')
  }

  return (
    <>
      <mesh
        onClick={() => handleClick()}
        onPointerOver={() => colorState !== 'red' && setColorState('orange')}
        onPointerOut={() => colorState !== 'red' && setColorState('')}
      >
        <Html position={[-4, 2, 0]}>
          <div className='max-w-max  bg-gray-900/50  p-5 text-xl uppercase text-green-950  '>
            <div className='grid gap-y-10'>
              <input
                type='text'
                className='text-center uppercase'
                title='enter player name'
                placeholder='enter room'
                onKeyDown={(e) => e.key === 'Enter' && handleRoom(e)}
              />

              {roomName && showInput && (
                <input
                  className='text-center uppercase'
                  type='text'
                  title='enter player name'
                  placeholder='enter player name'
                  onKeyDown={(e) => e.key === 'Enter' && handleName(e)}
                />
              )}
            </div>
            {playerStats &&
              playerStats?.map((player, index) => {
                return (
                  <h2
                    className={`text-black ${socket.current.id === player?.player_id ? 'bg-blue-400' : 'bg-orange-400 '} p-2 `}
                    key={index}
                  >
                    {player?.player_name}- {player?.player_score}
                  </h2>
                )
              })}
          </div>
          <div className='max-h-[70vh] min-h-[70vh] overflow-y-scroll bg-slate-950/50 overflow-hidden '>
            <div className=' relative  grid gap-y-5 p-4   right-0 text-center  uppercase'>
              {roomChats?.map((item, index) => {
                return (
                  <p
                    key={index}
                    id={`ele${index}`}
                    className={`text-white text-center justify-between  font-semibold p-2 ${socket.current.id === item?.player_id ? 'bg-blue-400/60' : 'bg-lime-400/60'}`}
                  >
                    <p className='text-xs bg-black text-white  rounded-full   w-full p-2 text-nowrap text-ellipsis '>
                      {playerStats.find((player) => player.player_id === item.player_id)?.player_name}
                    </p>
                    {item.player_chat}
                  </p>
                )
              })}
              <p id={`bottom`} className='h-32 opacity-0'>
                bottom
              </p>
            </div>
            <div>
              <input
                className='bg-teal-500/80 text-white placeholder:text-black p-4 w-full  absolute bottom-0  text-center  uppercase'
                type='text'
                title='chats'
                placeholder='player chat'
                onKeyDown={(e) => e.key === 'Enter' && handleChats(e)}
                defaultValue={chatText}
                value={chatText}
                onChange={(e) => setChatText(e.target.value)}
              />
            </div>
          </div>
        </Html>
        <primitive object={scene} {...props} />
        <PositionalAudio ref={duckAudioRef} url='/quack.mp3' distance={1} />
      </mesh>
      <mesh ref={circleRef}>
        <ringGeometry args={[0.07, 0.1, 32]} />
        <meshBasicMaterial color={colorState === '' ? 'green' : 'red'} />
      </mesh>
    </>
  )
}
export function Dog(props) {
  const { scene } = useGLTF('/dog.glb')

  return <primitive object={scene} {...props} />
}
