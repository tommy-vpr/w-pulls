"use client";

import { useEffect, useRef, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Environment, Sparkles } from "@react-three/drei";
import * as THREE from "three";
import gsap from "gsap";
import PackCard from "./Packcard";
import PackWrapper from "./Packwrapper";
import RevealParticles from "./RevealParticles";
import DustCloud from "./Dustcloud";

export type RevealState = "IDLE" | "CHARGING" | "REVEAL" | "RESULT";

interface RevealStageProps {
  state: RevealState;
  cardFrontImageUrl?: string;
  cardBackImageUrl?: string;
  packFrontImageUrl?: string;
  packBackImageUrl?: string;
}

function GlowRing({ state }: { state: RevealState }) {
  const ringRef = useRef<THREE.Mesh>(null!);
  const materialRef = useRef<THREE.ShaderMaterial>(null!);

  const shaderMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uIntensity: { value: 0.5 },
        uColor: { value: new THREE.Color("#4ecdc4") },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform float uIntensity;
        uniform vec3 uColor;
        varying vec2 vUv;
        
        void main() {
          float pulse = sin(uTime * 3.0) * 0.3 + 0.7;
          float ring = smoothstep(0.3, 0.35, vUv.x) * smoothstep(0.7, 0.65, vUv.x);
          float glow = ring * pulse * uIntensity;
          
          vec3 color = uColor * glow;
          float alpha = glow * 0.8;
          
          gl_FragColor = vec4(color, alpha);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
  }, []);

  useFrame((_, delta) => {
    if (!materialRef.current) return;

    materialRef.current.uniforms.uTime.value += delta;

    const targetIntensity =
      state === "CHARGING" ? 2.0 : state === "REVEAL" ? 3.0 : 0.5;
    materialRef.current.uniforms.uIntensity.value = THREE.MathUtils.lerp(
      materialRef.current.uniforms.uIntensity.value,
      targetIntensity,
      0.05
    );

    const targetColor =
      state === "CHARGING"
        ? new THREE.Color("#ff6b6b")
        : state === "REVEAL"
        ? new THREE.Color("#ffe66d")
        : new THREE.Color("#4ecdc4");

    materialRef.current.uniforms.uColor.value.lerp(targetColor, 0.05);

    if (ringRef.current) {
      ringRef.current.rotation.z +=
        delta * (state === "CHARGING" ? 2 : state === "REVEAL" ? 4 : 0.2);
    }
  });

  return (
    <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
      <ringGeometry args={[2.5, 3, 64]} />
      <primitive object={shaderMaterial} ref={materialRef} attach="material" />
    </mesh>
  );
}

function Platform() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <circleGeometry args={[4, 64]} />
        <meshStandardMaterial color="#0a0a12" metalness={0.8} roughness={0.3} />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
        <ringGeometry args={[0, 2.2, 64]} />
        <meshStandardMaterial color="#12121a" metalness={0.9} roughness={0.2} />
      </mesh>
    </group>
  );
}

function RevealFlash({ state }: { state: RevealState }) {
  const lightRef = useRef<THREE.PointLight>(null!);

  useEffect(() => {
    if (state === "REVEAL" && lightRef.current) {
      gsap.fromTo(
        lightRef.current,
        { intensity: 50 },
        { intensity: 0, duration: 0.8, ease: "power2.out" }
      );
    }
  }, [state]);

  return (
    <pointLight
      ref={lightRef}
      position={[0, 1.5, 0]}
      color="#ffffff"
      intensity={0}
      distance={15}
    />
  );
}

export default function RevealStage({
  state,
  cardFrontImageUrl = "/images/card-front.webp",
  cardBackImageUrl = "/images/card-back.webp",
  packFrontImageUrl = "/images/pack-front.webp",
  packBackImageUrl = "/images/pack-back.webp",
}: RevealStageProps) {
  const camera = useThree((s) => s.camera);

  const chargingSoundRef = useRef<HTMLAudioElement | null>(null);
  const winningSoundRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      chargingSoundRef.current = new Audio("/charging-sound.mp3");
      chargingSoundRef.current.loop = true;
      chargingSoundRef.current.volume = 0.6;

      winningSoundRef.current = new Audio("/winning-sound.mp3");
      winningSoundRef.current.volume = 0.7;
    }

    return () => {
      chargingSoundRef.current?.pause();
      winningSoundRef.current?.pause();
    };
  }, []);

  useEffect(() => {
    const chargingSound = chargingSoundRef.current;
    const winningSound = winningSoundRef.current;

    switch (state) {
      case "IDLE":
        if (chargingSound) {
          chargingSound.pause();
          chargingSound.currentTime = 0;
        }
        break;

      case "CHARGING":
        if (chargingSound) {
          chargingSound.currentTime = 0;
          chargingSound.play().catch(() => {});
        }
        break;

      case "REVEAL":
        if (chargingSound) {
          chargingSound.pause();
          chargingSound.currentTime = 0;
        }
        if (winningSound) {
          winningSound.currentTime = 0;
          winningSound.play().catch(() => {});
        }
        break;

      case "RESULT":
        break;
    }
  }, [state]);

  const showPack = state === "IDLE" || state === "CHARGING";
  const showCard = state === "REVEAL" || state === "RESULT";

  useEffect(() => {
    camera.position.set(0, 3.5, 8);
    camera.lookAt(0, 1, 0);
    camera.updateProjectionMatrix();
  }, []);

  useEffect(() => {
    gsap.killTweensOf(camera.position);
    gsap.killTweensOf(camera.rotation);

    switch (state) {
      case "IDLE":
        gsap.to(camera.position, {
          x: 0,
          y: 3.5,
          z: 8,
          duration: 1.2,
          ease: "power2.out",
        });
        break;

      case "CHARGING":
        gsap.to(camera.position, {
          y: 2.8,
          z: 6.2,
          duration: 1.4,
          ease: "power3.out",
        });
        break;

      case "REVEAL":
        gsap.fromTo(
          camera.position,
          { z: 6.2 },
          {
            z: 5.8,
            duration: 0.15,
            yoyo: true,
            repeat: 1,
            ease: "power1.inOut",
          }
        );
        break;

      case "RESULT":
        gsap.to(camera.position, {
          x: 2.5,
          y: 3.5,
          z: 8,
          duration: 1,
          ease: "sine.inOut",
        });
        break;
    }
  }, [state, camera]);

  useFrame(() => {
    if (state === "IDLE") camera.lookAt(0, 1.2, 0);
    if (state === "CHARGING") camera.lookAt(0, 1.5, 0);
    if (state === "RESULT") camera.lookAt(0, 1.5, 0);
  });

  return (
    <>
      <ambientLight intensity={0.15} />
      <directionalLight
        position={[5, 8, 5]}
        intensity={0.8}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <pointLight position={[-3, 3, -3]} intensity={0.3} color="#4ecdc4" />
      <pointLight position={[3, 3, 3]} intensity={0.3} color="#ff6b6b" />

      <Environment preset="night" />

      <group position={[0, -1, 0]}>
        <RevealFlash state={state} />

        <Platform />
        <GlowRing state={state} />

        {showPack && (
          <PackWrapper
            state={state}
            frontImageUrl={packFrontImageUrl}
            backImageUrl={packBackImageUrl}
            position={[0, 2, 0]}
          />
        )}

        <DustCloud
          state={state}
          position={[0, 2, 0]}
          count={150}
          color="#9999bb"
        />

        {showCard && (
          <PackCard
            state={state}
            frontImageUrl={cardFrontImageUrl}
            backImageUrl={cardBackImageUrl}
            position={[0, 2, 0]}
          />
        )}

        <RevealParticles state={state} count={400} />

        <Sparkles
          count={100}
          scale={8}
          size={2}
          speed={0.4}
          opacity={state === "CHARGING" ? 0.8 : 0.3}
          color={state === "CHARGING" ? "#ff6b6b" : "#4ecdc4"}
        />
      </group>

      <fog attach="fog" args={["#050508", 8, 25]} />
    </>
  );
}
