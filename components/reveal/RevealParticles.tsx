"use client";

import { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface RevealParticlesProps {
  state: "IDLE" | "CHARGING" | "REVEAL" | "RESULT";
  count?: number;
}

export default function RevealParticles({
  state,
  count = 500,
}: RevealParticlesProps) {
  const pointsRef = useRef<THREE.Points>(null!);
  const materialRef = useRef<THREE.ShaderMaterial>(null!);

  const particleData = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const randoms = new Float32Array(count);

    const colorPalette = [
      new THREE.Color("#ff6b6b"),
      new THREE.Color("#4ecdc4"),
      new THREE.Color("#ffe66d"),
      new THREE.Color("#a855f7"),
      new THREE.Color("#ffffff"),
    ];

    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const radius = 2 + Math.random() * 3;

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = 1.5 + radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);

      const color =
        colorPalette[Math.floor(Math.random() * colorPalette.length)];
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;

      sizes[i] = Math.random() * 0.5 + 0.1;
      randoms[i] = Math.random();
    }

    return { positions, colors, sizes, randoms };
  }, [count]);

  const shaderMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uState: { value: 0 },
        uOpacity: { value: 0.6 },
        uScale: { value: 1.0 },
      },
      vertexShader: `
        attribute float aSize;
        attribute float aRandom;
        attribute vec3 aColor;
        
        uniform float uTime;
        uniform float uState;
        uniform float uScale;
        
        varying vec3 vColor;
        varying float vRandom;
        varying float vOpacity;
        
        void main() {
          vColor = aColor;
          vRandom = aRandom;
          vOpacity = 1.0;
          
          vec3 pos = position;
          
          if (uState < 0.5) {
            float angle = uTime * 0.3 + aRandom * 6.28;
            float orbitRadius = length(pos.xz);
            pos.x = cos(angle) * orbitRadius;
            pos.z = sin(angle) * orbitRadius;
            pos.y += sin(uTime + aRandom * 10.0) * 0.2;
            vOpacity = 0.3;
          }
          else if (uState < 1.5) {
            float chargeProgress = fract(uTime * 0.5 + aRandom);
            float spiralAngle = chargeProgress * 6.28 * 3.0 + aRandom * 6.28;
            float spiralRadius = mix(4.0, 0.3, chargeProgress);
            pos.x = cos(spiralAngle) * spiralRadius;
            pos.z = sin(spiralAngle) * spiralRadius;
            pos.y = 1.5 + sin(chargeProgress * 3.14) * 2.0 + aRandom;
            vOpacity = mix(0.3, 1.0, chargeProgress);
          }
          else if (uState < 2.5) {
            float explodeTime = uTime * 2.0;
            vec3 direction = normalize(vec3(
              cos(aRandom * 6.28) * sin(aRandom * 3.14),
              sin(aRandom * 6.28) * sin(aRandom * 3.14) + 0.5,
              cos(aRandom * 3.14)
            ));
            pos = vec3(0.0, 1.5, 0.0) + direction * explodeTime * (1.0 + aRandom);
            vOpacity = max(0.0, 1.0 - explodeTime * 0.3);
          }
          else {
            float angle = uTime * 0.2 + aRandom * 6.28;
            float radius = 1.5 + sin(uTime * 0.5 + aRandom * 10.0) * 0.5;
            pos.x = cos(angle) * radius;
            pos.z = sin(angle) * radius;
            pos.y = 1.5 + sin(uTime + aRandom * 5.0) * 0.5;
            vOpacity = 0.5;
          }
          
          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_PointSize = aSize * uScale * (200.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        varying float vRandom;
        varying float vOpacity;
        
        uniform float uOpacity;
        
        void main() {
          vec2 center = gl_PointCoord - vec2(0.5);
          float dist = length(center);
          if (dist > 0.5) discard;
          
          float alpha = smoothstep(0.5, 0.1, dist) * vOpacity * uOpacity;
          vec3 glowColor = vColor + vec3(0.3) * (1.0 - dist * 2.0);
          
          gl_FragColor = vec4(glowColor, alpha);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
  }, []);

  useEffect(() => {
    if (!materialRef.current) return;

    const stateMap = { IDLE: 0, CHARGING: 1, REVEAL: 2, RESULT: 3 };
    materialRef.current.uniforms.uState.value = stateMap[state];

    if (state === "REVEAL") {
      materialRef.current.uniforms.uTime.value = 0;
    }
  }, [state]);

  useFrame((_, delta) => {
    if (!materialRef.current) return;

    materialRef.current.uniforms.uTime.value += delta;

    switch (state) {
      case "IDLE":
        materialRef.current.uniforms.uScale.value = THREE.MathUtils.lerp(
          materialRef.current.uniforms.uScale.value,
          0.8,
          0.05
        );
        materialRef.current.uniforms.uOpacity.value = THREE.MathUtils.lerp(
          materialRef.current.uniforms.uOpacity.value,
          0.4,
          0.05
        );
        break;
      case "CHARGING":
        materialRef.current.uniforms.uScale.value = THREE.MathUtils.lerp(
          materialRef.current.uniforms.uScale.value,
          1.5,
          0.03
        );
        materialRef.current.uniforms.uOpacity.value = THREE.MathUtils.lerp(
          materialRef.current.uniforms.uOpacity.value,
          1.0,
          0.05
        );
        break;
      case "REVEAL":
        materialRef.current.uniforms.uScale.value = 2.0;
        materialRef.current.uniforms.uOpacity.value = 1.0;
        break;
      case "RESULT":
        materialRef.current.uniforms.uScale.value = THREE.MathUtils.lerp(
          materialRef.current.uniforms.uScale.value,
          1.0,
          0.05
        );
        materialRef.current.uniforms.uOpacity.value = THREE.MathUtils.lerp(
          materialRef.current.uniforms.uOpacity.value,
          0.6,
          0.05
        );
        break;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[particleData.positions, 3]}
        />
        <bufferAttribute
          attach="attributes-aSize"
          args={[particleData.sizes, 1]}
        />
        <bufferAttribute
          attach="attributes-aRandom"
          args={[particleData.randoms, 1]}
        />
        <bufferAttribute
          attach="attributes-aColor"
          args={[particleData.colors, 3]}
        />
      </bufferGeometry>
      <primitive object={shaderMaterial} ref={materialRef} attach="material" />
    </points>
  );
}
