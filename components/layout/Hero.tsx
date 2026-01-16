"use client";

import * as THREE from "three";
import { useRef, useState, Suspense, useMemo, type ReactNode } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  Environment,
  ScrollControls,
  useScroll,
  useTexture,
  RoundedBox,
} from "@react-three/drei";
import { easing } from "maath";

// Types
interface RigProps {
  rotation?: [number, number, number];
  children?: ReactNode;
}

interface CarouselProps {
  radius?: number;
  count?: number;
  images?: string[];
  cardBack?: string;
}

interface CardProps {
  url: string;
  cardBack: string;
  position?: [number, number, number];
  rotation?: [number, number, number];
}

interface Carousel3DProps {
  images?: string[];
  cardBack?: string;
  bannerTexture?: string;
  fogColor?: string;
  radius?: number;
  environment?:
    | "sunset"
    | "dawn"
    | "night"
    | "warehouse"
    | "forest"
    | "apartment"
    | "studio"
    | "city"
    | "park"
    | "lobby";
  className?: string;
}

// Holographic shimmer shader
const HoloShader = {
  uniforms: {
    time: { value: 0 },
    opacity: { value: 0.3 },
  },
  vertexShader: `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    
    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      vViewPosition = -mvPosition.xyz;
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  fragmentShader: `
    uniform float time;
    uniform float opacity;
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    
    void main() {
      vec3 red = vec3(1.0, 0.4, 0.4);
      vec3 green = vec3(0.4, 1.0, 0.4);
      vec3 blue = vec3(0.4, 0.4, 1.0);
      
      float t = vUv.x + vUv.y + time * 0.2;
      vec3 rainbow = mix(red, green, smoothstep(0.2, 0.5, fract(t)));
      rainbow = mix(rainbow, blue, smoothstep(0.5, 0.8, fract(t)));
      
      vec3 viewDir = normalize(vViewPosition);
      float fresnel = pow(1.0 - abs(dot(viewDir, vNormal)), 2.0);
      
      float streak = smoothstep(0.4, 0.5, sin((vUv.x * 0.5 + vUv.y) * 3.14159 - time * 0.5)) * 0.4;
      
      vec3 color = rainbow * 0.3 + vec3(1.0) * streak;
      float alpha = (fresnel * 0.2 + streak * 0.5 + 0.05) * opacity;
      
      gl_FragColor = vec4(color, alpha);
    }
  `,
};

function Rig({ rotation = [0, 0, 0.15], children }: RigProps) {
  const ref = useRef<THREE.Group>(null!);
  const scroll = useScroll();

  useFrame((state, delta) => {
    if (!ref.current) return;

    const offset = Number.isFinite(scroll.offset) ? scroll.offset : 0;
    ref.current.rotation.y = -offset * Math.PI * 2;

    easing.damp3(
      state.camera.position,
      [-state.pointer.x * 2, state.pointer.y + 1.5, 10],
      0.3,
      delta
    );
    state.camera.lookAt(0, 0, 0);
  });

  return (
    <group ref={ref} rotation={rotation}>
      {children}
    </group>
  );
}

function Carousel({
  radius = 1.4,
  count = 8,
  images,
  cardBack = "/images/card-back.png",
}: CarouselProps) {
  if (!images || images.length === 0) return null;

  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <Card
          key={i}
          url={images[i % images.length]}
          cardBack={cardBack}
          position={[
            Math.sin((i / count) * Math.PI * 2) * radius,
            0,
            Math.cos((i / count) * Math.PI * 2) * radius,
          ]}
          rotation={[0, Math.PI + (i / count) * Math.PI * 2, 0]}
        />
      ))}
    </>
  );
}

// Simplified plastic case
function PlasticCase({
  hovered,
  cardWidth,
  cardHeight,
}: {
  hovered: boolean;
  cardWidth: number;
  cardHeight: number;
}) {
  const holoRef = useRef<THREE.ShaderMaterial>(null);

  const casePadding = 0.04;
  const caseWidth = cardWidth + casePadding;
  const caseHeight = cardHeight + casePadding;
  const caseDepth = 0.006;
  const cornerRadius = 0.035;

  const holoUniforms = useMemo(
    () => ({
      time: { value: 0 },
      opacity: { value: 0.25 },
    }),
    []
  );

  useFrame((state, delta) => {
    if (holoRef.current) {
      holoRef.current.uniforms.time.value = state.clock.elapsedTime;
      easing.damp(
        holoRef.current.uniforms.opacity,
        "value",
        hovered ? 0.5 : 0.25,
        0.3,
        delta
      );
    }
  });

  return (
    <group>
      <RoundedBox
        args={[caseWidth, caseHeight, caseDepth]}
        radius={cornerRadius}
        smoothness={8}
      >
        <meshPhysicalMaterial
          color="#ffffff"
          transparent
          opacity={0.1}
          roughness={0.05}
          metalness={0.1}
          clearcoat={1}
          clearcoatRoughness={0}
          transmission={0.9}
          thickness={0.3}
          ior={1.5}
          envMapIntensity={1}
          side={THREE.DoubleSide}
        />
      </RoundedBox>

      <mesh
        position={[0, 0, -caseDepth / 2 - 0.001]}
        rotation={[0, Math.PI, 0]}
      >
        <planeGeometry args={[caseWidth * 0.92, caseHeight * 0.92]} />
        <shaderMaterial
          ref={holoRef}
          transparent
          uniforms={holoUniforms}
          vertexShader={HoloShader.vertexShader}
          fragmentShader={HoloShader.fragmentShader}
          blending={THREE.AdditiveBlending}
          side={THREE.FrontSide}
          depthWrite={false}
        />
      </mesh>

      <mesh
        position={[0, caseHeight / 4, -caseDepth / 2 - 0.002]}
        rotation={[0, Math.PI, 0]}
      >
        <planeGeometry args={[caseWidth * 0.8, caseHeight / 4]} />
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={0.08}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

// Card component with texture error handling
function Card({ url, cardBack, ...props }: CardProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  // Load textures with error handling
  const frontTexture = useTexture(url, (texture) => {
    console.log("Front texture loaded:", url);
    texture.colorSpace = THREE.SRGBColorSpace;
  });

  const backTexture = useTexture(cardBack, (texture) => {
    console.log("Back texture loaded:", cardBack);
    texture.colorSpace = THREE.SRGBColorSpace;
  });

  const cardWidth = 0.7;
  const cardHeight = 0.98;
  const cardThickness = 0.002;
  const cornerRadius = 0.03;

  useFrame((_state, delta) => {
    if (!groupRef.current) return;

    easing.damp3(
      groupRef.current.scale,
      hovered ? [1.15, 1.15, 1.15] : [1, 1, 1],
      0.2,
      delta
    );

    easing.damp(groupRef.current.position, "z", hovered ? 0.3 : 0, 0.2, delta);
  });

  return (
    <group {...props}>
      <group
        ref={groupRef}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = "auto";
        }}
      >
        <PlasticCase
          hovered={hovered}
          cardWidth={cardWidth}
          cardHeight={cardHeight}
        />

        <RoundedBox
          args={[cardWidth, cardHeight, cardThickness]}
          radius={cornerRadius}
          smoothness={8}
        >
          <meshStandardMaterial
            color="#1a1a1a"
            metalness={0.2}
            roughness={0.6}
          />
        </RoundedBox>

        {/* Front face - using DoubleSide to ensure visibility */}
        <mesh position={[0, 0, -cardThickness / 2 - 0.0005]}>
          <planeGeometry args={[cardWidth - 0.02, cardHeight - 0.02]} />
          <meshStandardMaterial
            map={frontTexture}
            side={THREE.DoubleSide}
            metalness={0.1}
            roughness={0.4}
          />
        </mesh>

        {/* Back face */}
        <mesh
          position={[0, 0, cardThickness / 2 + 0.0005]}
          rotation={[0, Math.PI, 0]}
        >
          <planeGeometry args={[cardWidth - 0.02, cardHeight - 0.02]} />
          <meshStandardMaterial
            map={backTexture}
            side={THREE.DoubleSide}
            metalness={0.1}
            roughness={0.4}
          />
        </mesh>

        <mesh position={[0.02, -0.02, 0.02]} renderOrder={-1}>
          <planeGeometry args={[cardWidth, cardHeight]} />
          <meshBasicMaterial
            color="#000000"
            transparent
            opacity={0.2}
            depthWrite={false}
          />
        </mesh>
      </group>
    </group>
  );
}

function Scene({
  images,
  cardBack,
  radius,
}: {
  images?: string[];
  cardBack?: string;
  radius?: number;
}) {
  return (
    <ScrollControls pages={4} infinite>
      <Rig rotation={[0, 0, 0.15]}>
        <Carousel images={images} cardBack={cardBack} radius={radius} />
      </Rig>
    </ScrollControls>
  );
}

// Loading fallback that's visible
function LoadingFallback() {
  return (
    <mesh>
      <boxGeometry args={[0.5, 0.5, 0.5]} />
      <meshStandardMaterial color="red" />
    </mesh>
  );
}

export function Carousel3D({
  images,
  cardBack = "/images/card-back.png",
  fogColor = "#0a0a12",
  radius = 1.4,
  environment = "city", // Changed from 'night' - more reliable
}: Carousel3DProps) {
  return (
    <Canvas
      camera={{ position: [0, 0, 10], fov: 15 }}
      style={{ width: "100%", height: "100%", background: fogColor }}
      gl={{
        antialias: true,
        alpha: false,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.5, // Increased brightness
      }}
      dpr={[1, 2]}
      onCreated={() => console.log("Canvas created")}
    >
      <color attach="background" args={[fogColor]} />
      <fog attach="fog" args={[fogColor, 8, 18]} /> {/* Pushed fog back */}
      {/* Brighter lighting */}
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 5, 5]} intensity={1.5} />
      <spotLight
        position={[5, 8, 5]}
        angle={0.4}
        penumbra={1}
        intensity={2}
        color="#ffffff"
      />
      <pointLight position={[-5, 3, -5]} intensity={0.8} color="#4488ff" />
      <pointLight position={[5, -3, 5]} intensity={0.5} color="#ff4488" />
      <Suspense fallback={<LoadingFallback />}>
        <Scene images={images} cardBack={cardBack} radius={radius} />
        <Environment preset={environment} />
      </Suspense>
    </Canvas>
  );
}

export default Carousel3D;
export type { Carousel3DProps, CarouselProps, CardProps, RigProps };
