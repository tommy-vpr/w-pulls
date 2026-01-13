"use client";

import { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface DustCloudProps {
  state: "IDLE" | "CHARGING" | "REVEAL" | "RESULT";
  position?: [number, number, number];
  count?: number;
  color?: string;
}

export default function DustCloud({
  state,
  position = [0, 2, 0],
  count = 200,
  color = "#8888aa",
}: DustCloudProps) {
  const pointsRef = useRef<THREE.Points>(null!);
  const materialRef = useRef<THREE.ShaderMaterial>(null!);

  const particleData = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const randoms = new Float32Array(count);
    const velocities = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = 0;
      positions[i * 3 + 1] = 0;
      positions[i * 3 + 2] = 0;

      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      const speed = 2 + Math.random() * 3;

      velocities[i * 3] = Math.sin(phi) * Math.cos(theta) * speed;
      velocities[i * 3 + 1] =
        Math.sin(phi) * Math.sin(theta) * speed * 0.5 + Math.random() * 2;
      velocities[i * 3 + 2] = Math.cos(phi) * speed;

      sizes[i] = 0.3 + Math.random() * 0.5;
      randoms[i] = Math.random();
    }

    return { positions, sizes, randoms, velocities };
  }, [count]);

  const shaderMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uActive: { value: 0 },
        uColor: { value: new THREE.Color(color) },
        uOrigin: { value: new THREE.Vector3(...position) },
      },
      vertexShader: `
        attribute float aSize;
        attribute float aRandom;
        attribute vec3 aVelocity;
        
        uniform float uTime;
        uniform float uActive;
        uniform vec3 uOrigin;
        
        varying float vAlpha;
        varying float vRandom;
        
        void main() {
          vRandom = aRandom;
          float t = uTime * uActive;
          
          vec3 pos = uOrigin;
          pos += aVelocity * t;
          pos.y -= t * t * 2.0;
          
          pos.x += sin(t * 3.0 + aRandom * 6.28) * 0.3 * t;
          pos.z += cos(t * 2.5 + aRandom * 6.28) * 0.3 * t;
          
          vAlpha = max(0.0, 1.0 - t * 0.8) * uActive;
          
          float scale = aSize * (1.0 + t * 2.0) * max(0.0, 1.0 - t * 0.5);
          
          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_PointSize = scale * (300.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        
        varying float vAlpha;
        varying float vRandom;
        
        void main() {
          vec2 center = gl_PointCoord - vec2(0.5);
          float dist = length(center);
          
          if (dist > 0.5) discard;
          
          float alpha = smoothstep(0.5, 0.0, dist) * vAlpha;
          vec3 col = uColor * (0.8 + vRandom * 0.4);
          
          gl_FragColor = vec4(col, alpha * 0.6);
        }
      `,
      transparent: true,
      blending: THREE.NormalBlending,
      depthWrite: false,
      depthTest: true,
    });
  }, [color, position]);

  useEffect(() => {
    if (state === "REVEAL" && materialRef.current) {
      materialRef.current.uniforms.uTime.value = 0;
      materialRef.current.uniforms.uActive.value = 1;
    }
    if (state === "IDLE" && materialRef.current) {
      materialRef.current.uniforms.uActive.value = 0;
    }
  }, [state]);

  useFrame((_, delta) => {
    if (!materialRef.current) return;

    if (materialRef.current.uniforms.uActive.value > 0) {
      materialRef.current.uniforms.uTime.value += delta;

      if (materialRef.current.uniforms.uTime.value > 1.5) {
        materialRef.current.uniforms.uActive.value = 0;
      }
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
          attach="attributes-aVelocity"
          args={[particleData.velocities, 3]}
        />
      </bufferGeometry>
      <primitive object={shaderMaterial} ref={materialRef} attach="material" />
    </points>
  );
}
