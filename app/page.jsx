'use client'

import { PositionalAudio } from '@react-three/drei'
import dynamic from 'next/dynamic'
import { Suspense, useRef, useState } from 'react'

const Duck = dynamic(() => import('@/components/canvas/Examples').then((mod) => mod.Duck), { ssr: false })

const View = dynamic(() => import('@/components/canvas/View').then((mod) => mod.View), {
  ssr: false,
  loading: () => (
    <div className='flex h-96 w-full flex-col items-center justify-center'>
      <svg className='-ml-1 mr-3 size-5 animate-spin text-black' fill='none' viewBox='0 0 24 24'>
        <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' />
        <path
          className='opacity-75'
          fill='currentColor'
          d='M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 0 1 4 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
        />
      </svg>
    </div>
  ),
})
const Common = dynamic(() => import('@/components/canvas/View').then((mod) => mod.Common), { ssr: false })

export default function Page() {
  const audioRef = useRef()
  const gunAudio = () => {
    if (audioRef.current) {
      const audio = audioRef.current
      audio.setLoop(false)
      audio.setVolume(1)
      audio.duration = 0.7
      audio.play()
    }
  }
  const meshRef = useRef()
  const [mousePos, setMousePos] = useState([0, 0])

  const handleMouseMove = (event) => {
    setMousePos([(event.clientX / window.innerWidth) * 2 - 1, -(event.clientY / window.innerHeight) * 2 + 1])
  }

  return (
    <>
      <div
        ref={meshRef}
        onMouseMove={handleMouseMove}
        onClick={() => gunAudio()}
        className='grid size-full grid-cols-1 items-center justify-items-center overflow-y-scroll '
      >
        <div className=' size-full '>
          <View className=' grid size-full grid-cols-3 bg-[url("/icons/field.jpg")]  bg-cover '>
            <Suspense fallback={null}>
              <Duck scale={0.02} pos={mousePos} />
              <PositionalAudio
                ref={audioRef}
                url='/shot.mp3' // Path to your audio file
                distance={1}
              />
              <Common />
            </Suspense>
          </View>
        </div>
      </div>
    </>
  )
}
