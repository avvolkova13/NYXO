import { useEffect, useRef, useState } from 'react'

import {
  RIFLE_BASE_YAW,
  cameraSafetyMargin,
  rifleMotionAt,
  safeCameraDistance,
  type MotionBounds,
} from './rifleMotion'

type RifleModelProps = {
  active: boolean
  inspecting: boolean
}

const rifleAsset = (fileName: string) => `${import.meta.env.BASE_URL}assets/hero/m4a1/${fileName}`

export function RifleModel({ active, inspecting }: RifleModelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || import.meta.env.MODE === 'test') return

    let cancelled = false
    let frame = 0
    let stop = () => undefined

    void import('./threeRifleRuntime').then(({ THREE, FBXLoader }) => {
      if (cancelled) return

      let renderer: InstanceType<typeof THREE.WebGLRenderer>
      try {
        renderer = new THREE.WebGLRenderer({
          canvas,
          alpha: true,
          antialias: true,
          powerPreference: 'high-performance',
        })
      } catch {
        return
      }

      renderer.setClearColor(0x000000, 0)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.65))
      renderer.outputColorSpace = THREE.SRGBColorSpace
      renderer.toneMapping = THREE.ACESFilmicToneMapping
      renderer.toneMappingExposure = 1.2

      const scene = new THREE.Scene()
      const camera = new THREE.PerspectiveCamera(26, 1, 0.1, 100)
      camera.position.set(0, 0, 16)
      camera.lookAt(0, 0, 0)

      const rig = new THREE.Group()
      rig.rotation.set(0.06, RIFLE_BASE_YAW, -0.055)
      const content = new THREE.Group()
      rig.add(content)
      scene.add(rig)

      const skinCanvas = document.createElement('canvas')
      skinCanvas.width = 2048
      skinCanvas.height = 2048
      const skin = skinCanvas.getContext('2d')

      if (skin) {
        skin.fillStyle = '#151018'
        skin.fillRect(0, 0, 2048, 2048)

        const wash = skin.createLinearGradient(0, 0, 2048, 2048)
        wash.addColorStop(0, '#f0e9ed')
        wash.addColorStop(0.3, '#d6c9d5')
        wash.addColorStop(0.31, '#35143f')
        wash.addColorStop(0.58, '#160f1b')
        wash.addColorStop(0.77, '#f7f1f2')
        wash.addColorStop(1, '#2b1731')
        skin.fillStyle = wash
        skin.fillRect(0, 0, 2048, 2048)

        skin.save()
        skin.translate(1024, 1024)
        skin.rotate(-0.28)
        const bands = [
          { y: -760, height: 155, color: '#ff4a00' },
          { y: -555, height: 92, color: '#ebff3f' },
          { y: -410, height: 240, color: '#b11465' },
          { y: 32, height: 310, color: '#24112d' },
          { y: 430, height: 115, color: '#ff4a00' },
          { y: 610, height: 205, color: '#8d165e' },
        ]
        bands.forEach(({ y, height, color }, index) => {
          skin.fillStyle = color
          skin.fillRect(-1600 + index * 95, y, 3200, height)
        })
        skin.restore()

        skin.strokeStyle = 'rgba(255,255,255,.72)'
        skin.lineWidth = 18
        for (let index = 0; index < 11; index += 1) {
          const y = 180 + index * 148
          skin.beginPath()
          skin.moveTo(110 + (index % 3) * 84, y)
          skin.lineTo(420 + (index % 4) * 135, y)
          skin.stroke()
        }

        skin.fillStyle = '#0a0610'
        skin.font = '700 72px sans-serif'
        skin.fillText('NYXO / RARE', 1160, 310)
        skin.font = '600 38px sans-serif'
        skin.fillText('INSPECT // 01', 1180, 372)
      }

      const colorMap = new THREE.CanvasTexture(skinCanvas)
      colorMap.colorSpace = THREE.SRGBColorSpace
      colorMap.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy())
      colorMap.flipY = false

      const textureLoader = new THREE.TextureLoader()
      const normalMap = textureLoader.load(rifleAsset('M4A1_Normal.png'))
      const roughnessMap = textureLoader.load(rifleAsset('M4A1_Roughness.png'))
      const metalnessMap = textureLoader.load(rifleAsset('M4A1_Metallic.png'))
      const detailMaps = [normalMap, roughnessMap, metalnessMap]
      detailMaps.forEach((texture) => {
        texture.flipY = false
        texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy())
      })

      const finish = new THREE.MeshPhysicalMaterial({
        map: colorMap,
        normalMap,
        normalScale: new THREE.Vector2(0.72, 0.72),
        roughnessMap,
        roughness: 0.38,
        metalnessMap,
        metalness: 0.62,
        clearcoat: 0.52,
        clearcoatRoughness: 0.18,
      })
      const suppressorFinish = new THREE.MeshPhysicalMaterial({
        color: 0x17131b,
        metalness: 0.86,
        roughness: 0.25,
        clearcoat: 0.34,
        clearcoatRoughness: 0.2,
      })

      const loader = new FBXLoader()
      loader.setResourcePath(`${import.meta.env.BASE_URL}assets/hero/m4a1/`)
      let model: InstanceType<typeof THREE.Group> | null = null
      let revealed = false
      let localBounds: MotionBounds | null = null

      const fitCamera = () => {
        if (!localBounds) return
        const distance = safeCameraDistance(
          localBounds,
          camera.fov,
          camera.aspect,
          cameraSafetyMargin(camera.aspect),
        )
        camera.position.set(0, 0, distance)
        camera.lookAt(0, 0, 0)
        camera.updateProjectionMatrix()
      }

      const centerAssemblyAndFit = () => {
        const savedRotation = rig.rotation.clone()
        rig.rotation.set(0, 0, 0)
        rig.updateMatrixWorld(true)

        const assemblyBox = new THREE.Box3().setFromObject(content)
        const assemblyCenter = assemblyBox.getCenter(new THREE.Vector3())
        content.position.sub(assemblyCenter)
        rig.updateMatrixWorld(true)

        const centeredBox = new THREE.Box3().setFromObject(content)
        localBounds = {
          min: {
            x: centeredBox.min.x,
            y: centeredBox.min.y,
            z: centeredBox.min.z,
          },
          max: {
            x: centeredBox.max.x,
            y: centeredBox.max.y,
            z: centeredBox.max.z,
          },
        }

        rig.rotation.copy(savedRotation)
        rig.updateMatrixWorld(true)
        fitCamera()
      }

      // CC0 M4A1 base mesh by nisu / 3dmodelscc0.com, distributed via OpenGameArt.
      loader.load(
        rifleAsset('M4A1.fbx'),
        (loaded) => {
          if (cancelled) return

          model = loaded
          loaded.traverse((object) => {
            if (object instanceof THREE.Mesh) {
              object.material = finish
              object.castShadow = true
              object.receiveShadow = true
              object.geometry.computeVertexNormals()
            }
          })

          loaded.updateMatrixWorld(true)
          const initialBox = new THREE.Box3().setFromObject(loaded)
          const size = initialBox.getSize(new THREE.Vector3())
          const longestSide = Math.max(size.x, size.y, size.z)
          loaded.scale.setScalar(8.8 / Math.max(longestSide, 0.001))
          loaded.updateMatrixWorld(true)

          const normalizedBox = new THREE.Box3().setFromObject(loaded)
          const center = normalizedBox.getCenter(new THREE.Vector3())
          loaded.position.sub(center)
          loaded.rotation.y = Math.PI
          content.add(loaded)

          const suppressor = new THREE.Group()
          const suppressorBody = new THREE.Mesh(
            new THREE.CylinderGeometry(0.25, 0.28, 1.62, 32, 1, false),
            suppressorFinish,
          )
          suppressorBody.rotation.x = Math.PI / 2
          suppressorBody.castShadow = true
          suppressor.add(suppressorBody)

          for (let index = 0; index < 5; index += 1) {
            const ring = new THREE.Mesh(
              new THREE.TorusGeometry(0.273, 0.018, 8, 28),
              suppressorFinish,
            )
            ring.position.z = -0.58 + index * 0.29
            suppressor.add(ring)
          }

          const muzzle = new THREE.Mesh(
            new THREE.CylinderGeometry(0.16, 0.16, 0.025, 30),
            suppressorFinish,
          )
          muzzle.rotation.x = Math.PI / 2
          muzzle.position.z = 0.82
          suppressor.add(muzzle)
          suppressor.position.set(0, 0.48, 5.02)
          content.add(suppressor)
          centerAssemblyAndFit()
        },
        undefined,
        () => {
          model = null
        },
      )

      scene.add(new THREE.HemisphereLight(0xffe5dc, 0x120718, 2.3))

      const key = new THREE.DirectionalLight(0xff9c69, 5.4)
      key.position.set(-4, 7, 9)
      scene.add(key)

      const coralFill = new THREE.PointLight(0xff4a00, 42, 22, 1.55)
      coralFill.position.set(5.5, -0.5, 5.5)
      scene.add(coralFill)

      const magentaFill = new THREE.PointLight(0xd51b75, 34, 20, 1.6)
      magentaFill.position.set(-5, -2, 5)
      scene.add(magentaFill)

      const acidRim = new THREE.DirectionalLight(0xebff3f, 3.8)
      acidRim.position.set(2, 5, -8)
      scene.add(acidRim)

      const plumBack = new THREE.PointLight(0x761b85, 30, 18, 1.7)
      plumBack.position.set(-4, 0, -6)
      scene.add(plumBack)

      const startedAt = performance.now()
      const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
      let reducedMotion = motionQuery.matches
      let visible = true

      const resize = () => {
        const bounds = canvas.getBoundingClientRect()
        const width = Math.max(1, bounds.width)
        const height = Math.max(1, bounds.height)
        renderer.setSize(width, height, false)
        camera.aspect = width / height
        camera.updateProjectionMatrix()
        fitCamera()
      }

      resize()
      const resizeObserver = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(resize)
      resizeObserver?.observe(canvas)
      window.addEventListener('resize', resize)
      const updateMotionPreference = () => {
        reducedMotion = motionQuery.matches
      }
      motionQuery.addEventListener('change', updateMotionPreference)

      const intersectionObserver = typeof IntersectionObserver === 'undefined'
        ? null
        : new IntersectionObserver(([entry]) => {
            visible = entry?.isIntersecting ?? true
          })
      intersectionObserver?.observe(canvas)

      const render = () => {
        const elapsed = (performance.now() - startedAt) / 1000
        if (visible) {
          const motion = rifleMotionAt(elapsed, reducedMotion)
          rig.rotation.set(0.06, motion.angle, -0.055)
          rig.position.set(0, 0, 0)
          rig.scale.setScalar(1)
          renderer.render(scene, camera)
          if (model && !revealed) {
            revealed = true
            setReady(true)
          }
        }
        frame = window.requestAnimationFrame(render)
      }

      render()

      stop = () => {
        window.cancelAnimationFrame(frame)
        resizeObserver?.disconnect()
        intersectionObserver?.disconnect()
        window.removeEventListener('resize', resize)
        motionQuery.removeEventListener('change', updateMotionPreference)
        rig.traverse((object) => {
          if (object instanceof THREE.Mesh) object.geometry.dispose()
        })
        colorMap.dispose()
        detailMaps.forEach((texture) => texture.dispose())
        finish.dispose()
        suppressorFinish.dispose()
        renderer.dispose()
        renderer.forceContextLoss()
      }
    })

    return () => {
      cancelled = true
      stop()
    }
  }, [])

  return (
    <span
      className={`rifle-3d${ready ? ' is-ready' : ''}`}
      data-rifle-renderer="webgl"
      data-inspecting={inspecting}
      data-active={active}
      role="img"
      aria-label="M4A1-S «Поток информации», винтовка"
    >
      <img
        className="rifle-3d__fallback"
        src="/assets/hero/m4a1s-printstream.png"
        alt=""
        aria-hidden="true"
      />
      <canvas ref={canvasRef} className="rifle-3d__canvas" aria-hidden="true" />
    </span>
  )
}
