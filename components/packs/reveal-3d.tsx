"use client";

import { useRef, useState, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  Environment,
  Float,
  MeshDistortMaterial,
  Sparkles,
  Text,
  useTexture,
  MeshReflectorMaterial,
} from "@react-three/drei";
import {
  EffectComposer,
  Bloom,
  ChromaticAberration,
} from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import * as THREE from "three";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SerializedProduct } from "@/types/product";
import Link from "next/link";

interface Reveal3DProps {
  product: SerializedProduct;
  tier: string;
  packName: string;
}

const tierConfig: Record<
  string,
  { color: string; emissive: string; label: string }
> = {
  COMMON: { color: "#71717a", emissive: "#404040", label: "Common" },
  UNCOMMON: { color: "#22c55e", emissive: "#166534", label: "Uncommon" },
  RARE: { color: "#3b82f6", emissive: "#1d4ed8", label: "Rare" },
  ULTRA_RARE: { color: "#a855f7", emissive: "#7e22ce", label: "Ultra Rare" },
  SECRET_RARE: { color: "#eab308", emissive: "#a16207", label: "Secret Rare" },
  BANGER: { color: "#f97316", emissive: "#c2410c", label: "Banger 🔥" },
  GRAIL: { color: "#ec4899", emissive: "#be185d", label: "GRAIL 👑" },
};

// Mystery Box Component
function MysteryBox({
  onClick,
  isRevealing,
}: {
  onClick: () => void;
  isRevealing: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (!meshRef.current || isRevealing) return;
    meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    meshRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.1;
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <mesh
        ref={meshRef}
        onClick={onClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        scale={hovered ? 1.1 : 1}
      >
        <boxGeometry args={[2, 2.8, 0.3]} />
        <MeshDistortMaterial
          color="#8b5cf6"
          emissive="#4c1d95"
          emissiveIntensity={hovered ? 1 : 0.5}
          roughness={0.2}
          metalness={0.8}
          distort={hovered ? 0.2 : 0.1}
          speed={2}
        />
      </mesh>

      {/* Question mark */}
      <Text
        position={[0, 0, 0.2]}
        fontSize={1}
        color="white"
        anchorX="center"
        anchorY="middle"
        font="https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGKYAZ9hiA.woff2"
      >
        ?
      </Text>
    </Float>
  );
}

// Revealed Card Component
function RevealedCard({
  imageUrl,
  tierColor,
  isHighTier,
}: {
  imageUrl: string | null;
  tierColor: string;
  isHighTier: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const texture = useTexture(imageUrl || "/placeholder-card.png");
  const [rotationComplete, setRotationComplete] = useState(false);

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    // Spin in animation
    if (!rotationComplete) {
      meshRef.current.rotation.y += delta * 8;
      if (meshRef.current.rotation.y >= Math.PI * 4) {
        meshRef.current.rotation.y = 0;
        setRotationComplete(true);
      }
    } else {
      // Gentle float after reveal
      meshRef.current.rotation.y =
        Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.05;
    }
  });

  return (
    <group>
      <mesh ref={meshRef}>
        <boxGeometry args={[2, 2.8, 0.05]} />
        <meshStandardMaterial
          map={texture}
          emissive={tierColor}
          emissiveIntensity={isHighTier ? 0.3 : 0.1}
          roughness={0.3}
          metalness={0.5}
        />
      </mesh>

      {/* Glow ring for high tier */}
      {isHighTier && (
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -0.1]}>
          <torusGeometry args={[2, 0.05, 16, 100]} />
          <meshBasicMaterial color={tierColor} transparent opacity={0.8} />
        </mesh>
      )}
    </group>
  );
}

// Particles Background
function ParticleField({
  color,
  count = 200,
}: {
  color: string;
  count?: number;
}) {
  return (
    <Sparkles count={count} scale={10} size={2} speed={0.4} color={color} />
  );
}

// Revealing Animation (spinning energy)
function RevealingAnimation({ tierColor }: { tierColor: string }) {
  const ringRef = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (ringRef.current) {
      ringRef.current.rotation.z = state.clock.elapsedTime * 3;
      ringRef.current.scale.setScalar(
        1 + Math.sin(state.clock.elapsedTime * 5) * 0.1
      );
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.z = -state.clock.elapsedTime * 2;
      ring2Ref.current.scale.setScalar(
        1.2 + Math.cos(state.clock.elapsedTime * 5) * 0.1
      );
    }
  });

  return (
    <group>
      <mesh ref={ringRef}>
        <torusGeometry args={[1.5, 0.08, 16, 100]} />
        <meshBasicMaterial color={tierColor} transparent opacity={0.8} />
      </mesh>
      <mesh ref={ring2Ref}>
        <torusGeometry args={[1.8, 0.05, 16, 100]} />
        <meshBasicMaterial color={tierColor} transparent opacity={0.5} />
      </mesh>
      <Sparkles count={100} scale={4} size={4} speed={2} color={tierColor} />
    </group>
  );
}

// Floor with reflection
function Floor() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
      <planeGeometry args={[50, 50]} />
      <MeshReflectorMaterial
        blur={[300, 100]}
        resolution={1024}
        mixBlur={1}
        mixStrength={50}
        roughness={1}
        depthScale={1.2}
        minDepthThreshold={0.4}
        maxDepthThreshold={1.4}
        color="#101010"
        metalness={0.5}
        mirror={0.5}
      />
    </mesh>
  );
}

// Main 3D Scene
function Scene({
  stage,
  product,
  tier,
  onRevealClick,
}: {
  stage: "mystery" | "revealing" | "revealed";
  product: SerializedProduct;
  tier: string;
  onRevealClick: () => void;
}) {
  const tierStyle = tierConfig[tier] || tierConfig.COMMON;
  const isHighTier = ["ULTRA_RARE", "SECRET_RARE", "BANGER", "GRAIL"].includes(
    tier
  );

  return (
    <>
      <ambientLight intensity={0.2} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight
        position={[-10, -10, -10]}
        intensity={0.5}
        color={tierStyle.color}
      />
      <spotLight
        position={[0, 10, 0]}
        angle={0.3}
        penumbra={1}
        intensity={2}
        color={tierStyle.color}
      />

      <ParticleField
        color={tierStyle.color}
        count={stage === "revealed" && isHighTier ? 500 : 200}
      />

      {stage === "mystery" && (
        <MysteryBox onClick={onRevealClick} isRevealing={false} />
      )}

      {stage === "revealing" && (
        <RevealingAnimation tierColor={tierStyle.color} />
      )}

      {stage === "revealed" && (
        <RevealedCard
          imageUrl={product.imageUrl}
          tierColor={tierStyle.color}
          isHighTier={isHighTier}
        />
      )}

      <Floor />
      <Environment preset="city" />

      <EffectComposer>
        <Bloom
          luminanceThreshold={0.2}
          luminanceSmoothing={0.9}
          intensity={stage === "revealing" ? 2 : 1}
        />
        {stage === "revealing" ? (
          <EffectComposer>
            <Bloom
              luminanceThreshold={0.2}
              luminanceSmoothing={0.9}
              intensity={2}
            />
            <ChromaticAberration
              blendFunction={BlendFunction.NORMAL}
              offset={new THREE.Vector2(0.002, 0.002)}
            />
          </EffectComposer>
        ) : (
          <EffectComposer>
            <Bloom
              luminanceThreshold={0.2}
              luminanceSmoothing={0.9}
              intensity={1}
            />
          </EffectComposer>
        )}
      </EffectComposer>
    </>
  );
}

// Main Component
export function Reveal3D({ product, tier, packName }: Reveal3DProps) {
  const [stage, setStage] = useState<"mystery" | "revealing" | "revealed">(
    "mystery"
  );
  const tierStyle = tierConfig[tier] || tierConfig.COMMON;

  const handleReveal = () => {
    setStage("revealing");
    setTimeout(() => {
      setStage("revealed");
    }, 2500);
  };

  return (
    <div className="relative w-full h-screen">
      {/* 3D Canvas */}
      <Canvas
        camera={{ position: [0, 0, 6], fov: 50 }}
        className="absolute inset-0"
        gl={{ antialias: true, alpha: true }}
      >
        <Suspense fallback={null}>
          <Scene
            stage={stage}
            product={product}
            tier={tier}
            onRevealClick={handleReveal}
          />
        </Suspense>
      </Canvas>

      {/* UI Overlay */}
      <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-between p-8">
        {/* Top */}
        <div className="text-center">
          <p className="text-zinc-400 mb-2">{packName}</p>
          {stage === "mystery" && (
            <p className="text-xl font-bold text-white">
              Click the card to reveal!
            </p>
          )}
          {stage === "revealing" && (
            <p className="text-xl font-bold text-white animate-pulse">
              Revealing...
            </p>
          )}
          {stage === "revealed" && (
            <Badge
              className="text-lg px-4 py-1 border-0"
              style={{ backgroundColor: tierStyle.color }}
            >
              {tierStyle.label}
            </Badge>
          )}
        </div>

        {/* Bottom */}
        {stage === "revealed" && (
          <div className="pointer-events-auto text-center">
            <h2 className="text-3xl font-bold text-white mb-2">
              {product.title}
            </h2>
            <p
              className="text-2xl font-bold mb-6"
              style={{ color: tierStyle.color }}
            >
              ${Number(product.price).toFixed(2)}
            </p>
            <div className="flex gap-4 justify-center">
              <Button asChild variant="outline">
                <Link href="/packs">Open Another</Link>
              </Button>
              <Button asChild>
                <Link href={`/dashboard/products/${product.id}`}>
                  View Details
                </Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
