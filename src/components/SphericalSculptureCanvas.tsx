import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

interface SphericalSculptureCanvasProps {
  pointerX: number;
  pointerY: number;
  reducedMotion: boolean;
}

const _targetRot = { x: 0, y: 0 };

function detectSoftwareWebGL(): boolean {
  try {
    const testCanvas = document.createElement('canvas');
    const gl = testCanvas.getContext('webgl2') || testCanvas.getContext('webgl');
    if (!gl) return true;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param) || '');
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
  } catch {
    return true;
  }
}

export const SphericalSculptureCanvas: React.FC<SphericalSculptureCanvasProps> = ({
  pointerX,
  pointerY,
  reducedMotion,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [webglUnavailable, setWebglUnavailable] = useState(false);

  useEffect(() => {
    _targetRot.x = pointerY * 0.14;
    _targetRot.y = pointerX * 0.22;
  }, [pointerX, pointerY]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Probe WebGL availability safely (essential for jsdom tests and software environments)
    let hasWebGL = false;
    try {
      const probe = document.createElement('canvas');
      hasWebGL = !!(probe.getContext('webgl2') || probe.getContext('webgl'));
    } catch {
      hasWebGL = false;
    }

    if (!hasWebGL) {
      setWebglUnavailable(true);
      return;
    }

    const isSoftwareGl = detectSoftwareWebGL();
    const width = container.clientWidth || 720;
    const height = container.clientHeight || 640;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !isSoftwareGl,
        alpha: true,
        powerPreference: 'high-performance',
      });
    } catch {
      setWebglUnavailable(true);
      return;
    }

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const canvasEl = renderer.domElement;
    canvasEl.style.width = '100%';
    canvasEl.style.height = '100%';
    canvasEl.style.display = 'block';
    container.appendChild(canvasEl);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050507, 0.038);

    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    camera.position.set(0, 0.15, 8.2);

    // Studio IBL environment map for authentic metallic & glass reflections
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const roomEnv = new RoomEnvironment();
    const envTarget = pmremGenerator.fromScene(roomEnv, 0.04);
    scene.environment = envTarget.texture;
    roomEnv.dispose();
    pmremGenerator.dispose();

    // 3-Point Gallery Studio Lighting
    const hemiLight = new THREE.HemisphereLight(0xdce2ee, 0x101218, 0.75);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfff8ee, 2.4);
    keyLight.position.set(5, 6, 5);
    keyLight.castShadow = !isSoftwareGl;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xa5b4fc, 1.35);
    rimLight.position.set(-6, -3, -4);
    scene.add(rimLight);

    const accentPoint = new THREE.PointLight(0xffffff, 4.5, 18, 1.8);
    accentPoint.position.set(-2.6, 2.4, 3.8);
    scene.add(accentPoint);

    // Sculpture Group Composition
    const sculptureGroup = new THREE.Group();
    scene.add(sculptureGroup);

    const highSphereGeo = new THREE.SphereGeometry(1.48, 64, 64);
    const medSphereGeo = new THREE.SphereGeometry(0.68, 48, 48);
    const smallSphereGeo = new THREE.SphereGeometry(0.36, 36, 36);
    const microSphereGeo = new THREE.SphereGeometry(0.22, 32, 32);
    const ringGeo = new THREE.TorusGeometry(2.35, 0.014, 16, 128);

    // 1. Primary Mirror-Polished Liquid Chrome Sphere
    const chromeMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xe6e9ef,
      metalness: 1.0,
      roughness: 0.04,
      clearcoat: 1.0,
      clearcoatRoughness: 0.02,
      envMapIntensity: 1.55,
    });
    const mainSphere = new THREE.Mesh(highSphereGeo, chromeMaterial);
    mainSphere.position.set(-0.2, 0.05, 0);
    mainSphere.castShadow = true;
    mainSphere.receiveShadow = true;
    sculptureGroup.add(mainSphere);

    // 2. Optical Glass Translucent Sphere
    const glassMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xf4f6fa,
      metalness: 0.0,
      roughness: 0.05,
      transmission: isSoftwareGl ? 0 : 0.92,
      transparent: true,
      opacity: isSoftwareGl ? 0.38 : 1.0,
      ior: 1.52,
      thickness: 1.4,
      clearcoat: 1.0,
      clearcoatRoughness: 0.04,
      envMapIntensity: 1.35,
    });
    const glassSphere = new THREE.Mesh(medSphereGeo, glassMaterial);
    glassSphere.position.set(1.75, 0.95, 0.9);
    sculptureGroup.add(glassSphere);

    // 3. Brushed Obsidian Graphite Sphere
    const obsidianMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x1a1d24,
      metalness: 0.92,
      roughness: 0.18,
      clearcoat: 0.6,
      clearcoatRoughness: 0.14,
      envMapIntensity: 1.25,
    });
    const obsidianSphere = new THREE.Mesh(smallSphereGeo, obsidianMaterial);
    obsidianSphere.position.set(-1.95, -0.9, 0.75);
    sculptureGroup.add(obsidianSphere);

    // 4. Brushed Platinum Satellite Sphere
    const platinumMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xcbd0da,
      metalness: 0.96,
      roughness: 0.14,
      anisotropy: 0.75,
      envMapIntensity: 1.3,
    });
    const platinumSphere = new THREE.Mesh(microSphereGeo, platinumMaterial);
    platinumSphere.position.set(1.45, -1.35, -0.45);
    sculptureGroup.add(platinumSphere);

    // 5. Hairline Orbital Chrome Ring
    const ringMaterial = new THREE.MeshStandardMaterial({
      color: 0xbec5d1,
      metalness: 0.95,
      roughness: 0.2,
      transparent: true,
      opacity: 0.45,
    });
    const orbitalRing = new THREE.Mesh(ringGeo, ringMaterial);
    orbitalRing.rotation.set(Math.PI * 0.36, Math.PI * 0.12, 0);
    sculptureGroup.add(orbitalRing);

    const handleContextLost = (event: Event) => {
      event.preventDefault();
      setWebglUnavailable(true);
    };
    canvasEl.addEventListener('webglcontextlost', handleContextLost);

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || 720;
      const h = container.clientHeight || 640;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Pre-compile shaders on GPU
    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    const clock = new THREE.Clock();
    let frameId: number | null = null;
    let timeoutId: number | null = null;
    let isDisposed = false;
    let isVisible = false;
    let visibilityObserver: IntersectionObserver | null = null;

    const stopAnimation = () => {
      if (frameId !== null) {
        cancelAnimationFrame(frameId);
        frameId = null;
      }
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
    };

    let renderFrame: () => void;

    const scheduleNextFrame = () => {
      if (isDisposed || !isVisible || reducedMotion) return;

      if (isSoftwareGl) {
        // Pace software WebGL rendering to avoid starving the main thread.
        timeoutId = window.setTimeout(() => {
          timeoutId = null;
          if (!isDisposed && isVisible) {
            frameId = requestAnimationFrame(renderFrame);
          }
        }, 80);
      } else {
        frameId = requestAnimationFrame(renderFrame);
      }
    };

    renderFrame = () => {
      frameId = null;
      if (isDisposed || !isVisible) return;

      const delta = Math.min(clock.getDelta(), 0.05);
      const elapsed = clock.getElapsedTime();

      // Gentle museum-grade floating choreography
      mainSphere.position.y = 0.05 + Math.sin(elapsed * 0.55) * 0.08;
      glassSphere.position.y = 0.95 + Math.cos(elapsed * 0.7) * 0.11;
      obsidianSphere.position.y = -0.9 + Math.sin(elapsed * 0.65 + 1.2) * 0.09;
      platinumSphere.position.y = -1.35 + Math.cos(elapsed * 0.8 + 0.6) * 0.07;
      orbitalRing.rotation.z = elapsed * 0.06;

      // Smooth camera/group parallax response
      sculptureGroup.rotation.x = THREE.MathUtils.damp(
        sculptureGroup.rotation.x,
        _targetRot.x,
        3.5,
        delta
      );
      sculptureGroup.rotation.y = THREE.MathUtils.damp(
        sculptureGroup.rotation.y,
        _targetRot.y + Math.sin(elapsed * 0.25) * 0.06,
        3.5,
        delta
      );

      renderer.render(scene, camera);
      scheduleNextFrame();
    };

    if (reducedMotion) {
      // Preserve a single static render for reduced-motion preference.
      renderer.render(scene, camera);
    } else if ('IntersectionObserver' in window) {
      visibilityObserver = new IntersectionObserver((entries) => {
        const entry = entries[0];
        if (!entry || isDisposed) return;

        if (entry.isIntersecting) {
          if (!isVisible) {
            isVisible = true;
            renderFrame();
          }
        } else if (isVisible) {
          isVisible = false;
          stopAnimation();
        }
      }, { threshold: 0.01 });

      visibilityObserver.observe(container);
    } else {
      // Fallback for environments without IntersectionObserver.
      isVisible = true;
      renderFrame();
    }

    return () => {
      isDisposed = true;
      isVisible = false;
      stopAnimation();
      visibilityObserver?.disconnect();
      window.removeEventListener('resize', handleResize);
      canvasEl.removeEventListener('webglcontextlost', handleContextLost);

      highSphereGeo.dispose();
      medSphereGeo.dispose();
      smallSphereGeo.dispose();
      microSphereGeo.dispose();
      ringGeo.dispose();

      chromeMaterial.dispose();
      glassMaterial.dispose();
      obsidianMaterial.dispose();
      platinumMaterial.dispose();
      ringMaterial.dispose();
      envTarget.dispose();

      renderer.dispose();
      if (canvasEl.parentNode === container) {
        container.removeChild(canvasEl);
      }
    };
  }, [reducedMotion]);

  return (
    <div
      ref={mountRef}
      aria-hidden="true"
      className="relative w-full h-full pointer-events-none select-none"
    >
      {webglUnavailable && (
        /* Refined Fallback Spherical Composition when WebGL is unavailable */
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
          <div
            className="w-72 h-72 sm:w-96 sm:h-96 rounded-full opacity-80"
            style={{
              background:
                'radial-gradient(circle at 32% 28%, #ffffff 0%, #c6cbd6 22%, #4c5261 58%, #0c0e14 88%, #050507 100%)',
              boxShadow:
                'inset -24px -24px 60px rgba(0,0,0,0.85), 0 30px 90px rgba(255,255,255,0.06)',
            }}
          />
          <div
            className="absolute top-[18%] right-[16%] w-24 h-24 rounded-full border border-white/25"
            style={{
              background:
                'radial-gradient(circle at 30% 25%, rgba(255,255,255,0.6) 0%, rgba(210,218,232,0.18) 45%, rgba(12,14,20,0.65) 100%)',
            }}
          />
          <div
            className="absolute bottom-[20%] left-[18%] w-14 h-14 rounded-full"
            style={{
              background:
                'radial-gradient(circle at 35% 30%, #646b7d 0%, #1d2029 65%, #07080b 100%)',
            }}
          />
        </div>
      )}
    </div>
  );
};
