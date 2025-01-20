import { Box, MeshDistortMaterial, Torus } from '@react-three/drei'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Physics, RigidBody, CuboidCollider } from '@react-three/rapier'
import { Suspense, useRef } from 'react'
import { animated, useSpring } from '@react-spring/three'

export const PhysicsWorld = () => {
  const refTorus = useRef()
  const refBall = useRef()
  const { scene } = useThree()

  //   useFrame(() => {
  //     // if (refTorus.current) {
  //     // refTorus.current.position.y -= 0.05
  //     //   console.log(Quaternion.vmult(refTorus.current.position.y), '------------')
  //     // }
  //     // if (projectileRef.current.length > 0) {
  //     //   projectileRef.current.map((ele, index) => {
  //     //     ele.position.x >= 10.0
  //     //       ? (ele.geometry.dispose(), ele.material.dispose(), scene.remove(ele), (ele.isvisible = false))
  //     //       : (ele.position.x += 0.05)
  //     //   })
  //     // }
  //     // if (targetRef.current.length > 0) {
  //     //   targetRef.current.map((ele, index) => {
  //     //     ele.position.x < -4 ? (ele.position.x = 10) : (ele.position.x -= 0.005),
  //     //       (ele.position.y += Math.random() * 0.05 - 0.025)
  //     //   })
  //     // }
  //   })
  useFrame(() => {
    if (refTorus.current) {
      const position = refTorus.current.translation() // Get the RigidBody's position

      if (position.y < -20) {
        scene.getObjectByName('ioipoioopi-----------------').clear() // Remove the RigidBody from the physics world

        //   scene visible

        // scene.matrixAutoUpdate = true
      }
      //   console.log(scene)
    }
  })

  return (
    // <Suspense fallback={null}>
    <Physics>
      <RigidBody ref={refTorus} colliders={'hull'} restitution={1} name='ioipoioopi-----------------'>
        <animated.mesh position={[0, 20, 0]}>
          <capsuleGeometry args={[1, 1, 1]} />
          <pointLight
            // ref={lightRef}
            intensity={1}
            decay={5}
            // position={[(mouse.x * 2) / 60, (mouse.y * 2) / 60, -6]}
            color={'red'}
          />
          <MeshDistortMaterial
            metalness={0.1}
            color={'orange'}
            // dispose={() => scene.remove(projectileRef.current[index])}
          />
          {/* <Torus ref={refTorus} /> */}
        </animated.mesh>
      </RigidBody>
      <RigidBody colliders={'hull'} restitution={1}>
        <Torus ref={refBall} position={[2, 0, 0]} />
      </RigidBody>
      <RigidBody colliders={'hull'} restitution={1}>
        <Torus ref={refBall} position={[3, 0, 0]} />
      </RigidBody>
      <CuboidCollider position={[0, -2, 0]} args={[20, 0.5, 20]} />
    </Physics>
    // </Suspense>
  )
}
