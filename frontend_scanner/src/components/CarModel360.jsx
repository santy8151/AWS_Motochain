import React, { useEffect, useRef } from 'react'
import * as THREE from 'three'

export default function CarModel360() {
  const mountRef = useRef(null)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return undefined

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(34, mount.clientWidth / mount.clientHeight, 0.1, 100)
    camera.position.set(0, 1.35, 5.4)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(mount.clientWidth, mount.clientHeight)
    renderer.outputColorSpace = THREE.SRGBColorSpace
    mount.appendChild(renderer.domElement)

    const car = new THREE.Group()
    scene.add(car)

    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: '#eef4f1',
      metalness: 0.48,
      roughness: 0.24,
    })
    const lowerMaterial = new THREE.MeshStandardMaterial({ color: '#d9e2de', metalness: 0.36, roughness: 0.3 })
    const glassMaterial = new THREE.MeshStandardMaterial({
      color: '#152d34',
      metalness: 0.2,
      roughness: 0.12,
      transparent: true,
      opacity: 0.84,
    })
    const tireMaterial = new THREE.MeshStandardMaterial({ color: '#111816', metalness: 0.12, roughness: 0.58 })
    const rimMaterial = new THREE.MeshStandardMaterial({ color: '#c8d3cf', metalness: 0.7, roughness: 0.22 })
    const lightMaterial = new THREE.MeshStandardMaterial({ color: '#d8ff7a', emissive: '#d8ff7a', emissiveIntensity: 1.4 })
    const tailMaterial = new THREE.MeshStandardMaterial({ color: '#f26b3a', emissive: '#f26b3a', emissiveIntensity: 0.9 })
    const trimMaterial = new THREE.MeshStandardMaterial({ color: '#17201d', metalness: 0.28, roughness: 0.42 })

    const body = new THREE.Mesh(createSedanBodyGeometry(), bodyMaterial)
    body.position.set(0, 0.08, -0.64)
    car.add(body)

    const lowerSkirt = new THREE.Mesh(new THREE.BoxGeometry(3.34, 0.12, 1.2), lowerMaterial)
    lowerSkirt.position.set(0.03, 0.36, 0)
    lowerSkirt.scale.set(1, 0.72, 1)
    car.add(lowerSkirt)

    const cabin = new THREE.Mesh(createCabinGeometry(), glassMaterial)
    cabin.position.set(0.03, 0.2, -0.47)
    car.add(cabin)

    const panoramicRoof = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.035, 0.74), glassMaterial)
    panoramicRoof.position.set(0.1, 1.36, 0)
    panoramicRoof.rotation.z = -0.02
    car.add(panoramicRoof)

    const frontLight = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.055, 0.82), lightMaterial)
    frontLight.position.set(-1.88, 0.64, 0)
    frontLight.rotation.z = -0.12
    car.add(frontLight)

    const rearLight = new THREE.Mesh(new THREE.BoxGeometry(0.075, 0.07, 0.78), tailMaterial)
    rearLight.position.set(1.86, 0.66, 0)
    rearLight.rotation.z = 0.1
    car.add(rearLight)

    const frontBumper = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.18, 1.05), trimMaterial)
    frontBumper.position.set(-1.92, 0.43, 0)
    car.add(frontBumper)

    const rearBumper = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.18, 1.05), trimMaterial)
    rearBumper.position.set(1.92, 0.43, 0)
    car.add(rearBumper)

    const sideTrimLeft = new THREE.Mesh(new THREE.BoxGeometry(2.68, 0.035, 0.035), trimMaterial)
    sideTrimLeft.position.set(0.05, 0.61, -0.69)
    car.add(sideTrimLeft)

    const sideTrimRight = sideTrimLeft.clone()
    sideTrimRight.position.z = 0.69
    car.add(sideTrimRight)

    const wheelPositions = [
      [-1.15, 0.25, -0.72],
      [1.15, 0.25, -0.72],
      [-1.15, 0.25, 0.72],
      [1.15, 0.25, 0.72],
    ]

    wheelPositions.forEach(([x, y, z]) => {
      const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.2, 40), tireMaterial)
      wheel.rotation.x = Math.PI / 2
      wheel.position.set(x, y, z)
      car.add(wheel)

      const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.22, 32), rimMaterial)
      rim.rotation.x = Math.PI / 2
      rim.position.set(x, y, z)
      car.add(rim)

      const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.24, 24), trimMaterial)
      hub.rotation.x = Math.PI / 2
      hub.position.set(x, y, z)
      car.add(hub)

      for (let i = 0; i < 5; i += 1) {
        const spoke = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.018, 0.018), rimMaterial)
        spoke.position.set(x, y, z + (z < 0 ? -0.115 : 0.115))
        spoke.rotation.z = (Math.PI / 5) * i
        car.add(spoke)
      }
    })

    const floor = new THREE.Mesh(
      new THREE.CircleGeometry(2.25, 72),
      new THREE.MeshBasicMaterial({ color: '#66e3c4', transparent: true, opacity: 0.08 })
    )
    floor.rotation.x = -Math.PI / 2
    floor.position.y = -0.05
    scene.add(floor)

    scene.add(new THREE.AmbientLight('#ffffff', 1.2))
    const keyLight = new THREE.DirectionalLight('#ffffff', 2.2)
    keyLight.position.set(3, 4, 4)
    scene.add(keyLight)
    const rimLight = new THREE.DirectionalLight('#66e3c4', 1.6)
    rimLight.position.set(-3, 2, -4)
    scene.add(rimLight)

    let animationId
    let dragging = false
    let previousX = 0

    const pointerDown = (event) => {
      dragging = true
      previousX = event.clientX
      renderer.domElement.setPointerCapture(event.pointerId)
    }

    const pointerMove = (event) => {
      if (!dragging) return
      const delta = event.clientX - previousX
      previousX = event.clientX
      car.rotation.y += delta * 0.015
    }

    const pointerUp = (event) => {
      dragging = false
      if (renderer.domElement.hasPointerCapture(event.pointerId)) {
        renderer.domElement.releasePointerCapture(event.pointerId)
      }
    }

    renderer.domElement.addEventListener('pointerdown', pointerDown)
    renderer.domElement.addEventListener('pointermove', pointerMove)
    renderer.domElement.addEventListener('pointerup', pointerUp)
    renderer.domElement.addEventListener('pointerleave', pointerUp)

    const resize = () => {
      if (!mount.clientWidth || !mount.clientHeight) return
      camera.aspect = mount.clientWidth / mount.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(mount.clientWidth, mount.clientHeight)
    }

    window.addEventListener('resize', resize)

    const animate = () => {
      animationId = requestAnimationFrame(animate)
      if (!dragging) {
        car.rotation.y += 0.006
      }
      renderer.render(scene, camera)
    }

    animate()

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', resize)
      renderer.domElement.removeEventListener('pointerdown', pointerDown)
      renderer.domElement.removeEventListener('pointermove', pointerMove)
      renderer.domElement.removeEventListener('pointerup', pointerUp)
      renderer.domElement.removeEventListener('pointerleave', pointerUp)
      mount.removeChild(renderer.domElement)
      renderer.dispose()
      scene.traverse((object) => {
        if (!object.isMesh) return
        object.geometry?.dispose()
        if (Array.isArray(object.material)) {
          object.material.forEach((material) => material.dispose())
        } else {
          object.material?.dispose()
        }
      })
    }
  }, [])

  return (
    <div className="car-model-card">
      <div className="car-model-viewport" ref={mountRef} aria-label="Modelo 3D tipo Tesla 360" />
      <div className="car-model-caption">
        <strong>Tesla Model 3S</strong>
        <span>360 interactivo</span>
      </div>
    </div>
  )
}

function createSedanBodyGeometry() {
  const shape = new THREE.Shape()
  shape.moveTo(-1.95, 0.34)
  shape.bezierCurveTo(-1.82, 0.58, -1.55, 0.68, -1.16, 0.72)
  shape.bezierCurveTo(-0.76, 0.78, -0.5, 1.12, -0.1, 1.26)
  shape.bezierCurveTo(0.42, 1.45, 0.92, 1.16, 1.2, 0.86)
  shape.bezierCurveTo(1.5, 0.74, 1.8, 0.65, 1.96, 0.5)
  shape.lineTo(1.82, 0.3)
  shape.bezierCurveTo(1.25, 0.16, -1.25, 0.16, -1.88, 0.3)
  shape.closePath()

  return new THREE.ExtrudeGeometry(shape, {
    depth: 1.28,
    bevelEnabled: true,
    bevelThickness: 0.08,
    bevelSize: 0.08,
    bevelSegments: 6,
    curveSegments: 24,
  })
}

function createCabinGeometry() {
  const shape = new THREE.Shape()
  shape.moveTo(-0.72, 0.78)
  shape.bezierCurveTo(-0.45, 1.16, -0.1, 1.32, 0.34, 1.3)
  shape.bezierCurveTo(0.68, 1.28, 0.98, 1.03, 1.16, 0.78)
  shape.lineTo(0.82, 0.72)
  shape.bezierCurveTo(0.28, 0.67, -0.28, 0.68, -0.72, 0.78)
  shape.closePath()

  return new THREE.ExtrudeGeometry(shape, {
    depth: 0.94,
    bevelEnabled: true,
    bevelThickness: 0.04,
    bevelSize: 0.04,
    bevelSegments: 4,
    curveSegments: 20,
  })
}
