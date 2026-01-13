"use client";

import { useRef, useMemo, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { shaderMaterial } from "@react-three/drei";
import { extend } from "@react-three/fiber";

// Holographic card shader
const HoloCardMaterial = shaderMaterial(
  {
    uTime: 0,
    uTexture: null,
    uIntensity: 0.3,
    uFresnelPower: 3.0,
    uHoloColor1: new THREE.Color("#ff6b6b"),
    uHoloColor2: new THREE.Color("#4ecdc4"),
    uHoloColor3: new THREE.Color("#ffe66d"),
    uCharging: 0,
  },
  `
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
  `
    uniform float uTime;
    uniform sampler2D uTexture;
    uniform float uIntensity;
    uniform float uFresnelPower;
    uniform vec3 uHoloColor1;
    uniform vec3 uHoloColor2;
    uniform vec3 uHoloColor3;
    uniform float uCharging;
    
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    
    vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
    vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
    
    float snoise(vec3 v) {
      const vec2 C = vec2(1.0/6.0, 1.0/3.0);
      const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
      
      vec3 i = floor(v + dot(v, C.yyy));
      vec3 x0 = v - i + dot(i, C.xxx);
      
      vec3 g = step(x0.yzx, x0.xyz);
      vec3 l = 1.0 - g;
      vec3 i1 = min(g.xyz, l.zxy);
      vec3 i2 = max(g.xyz, l.zxy);
      
      vec3 x1 = x0 - i1 + C.xxx;
      vec3 x2 = x0 - i2 + C.yyy;
      vec3 x3 = x0 - D.yyy;
      
      i = mod289(i);
      vec4 p = permute(permute(permute(
        i.z + vec4(0.0, i1.z, i2.z, 1.0))
        + i.y + vec4(0.0, i1.y, i2.y, 1.0))
        + i.x + vec4(0.0, i1.x, i2.x, 1.0));
      
      float n_ = 0.142857142857;
      vec3 ns = n_ * D.wyz - D.xzx;
      
      vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
      vec4 x_ = floor(j * ns.z);
      vec4 y_ = floor(j - 7.0 * x_);
      
      vec4 x = x_ * ns.x + ns.yyyy;
      vec4 y = y_ * ns.x + ns.yyyy;
      vec4 h = 1.0 - abs(x) - abs(y);
      
      vec4 b0 = vec4(x.xy, y.xy);
      vec4 b1 = vec4(x.zw, y.zw);
      
      vec4 s0 = floor(b0) * 2.0 + 1.0;
      vec4 s1 = floor(b1) * 2.0 + 1.0;
      vec4 sh = -step(h, vec4(0.0));
      
      vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
      vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
      
      vec3 p0 = vec3(a0.xy, h.x);
      vec3 p1 = vec3(a0.zw, h.y);
      vec3 p2 = vec3(a1.xy, h.z);
      vec3 p3 = vec3(a1.zw, h.w);
      
      vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
      p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
      
      vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
      m = m * m;
      return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
    }
    
    void main() {
      vec4 texColor = texture2D(uTexture, vUv);
      vec3 viewDir = normalize(vViewPosition);
      
      float fresnel = pow(1.0 - abs(dot(viewDir, vNormal)), uFresnelPower);
      
      float holoPattern = snoise(vec3(vUv * 8.0, uTime * 0.5));
      holoPattern += snoise(vec3(vUv * 16.0, uTime * 0.3)) * 0.5;
      
      float colorShift = dot(viewDir, vNormal) + holoPattern * 0.2;
      colorShift += vUv.x * 0.3 + vUv.y * 0.2;
      colorShift = fract(colorShift + uTime * 0.08);
      
      vec3 holoColor;
      if (colorShift < 0.33) {
        holoColor = mix(uHoloColor1, uHoloColor2, colorShift * 3.0);
      } else if (colorShift < 0.66) {
        holoColor = mix(uHoloColor2, uHoloColor3, (colorShift - 0.33) * 3.0);
      } else {
        holoColor = mix(uHoloColor3, uHoloColor1, (colorShift - 0.66) * 3.0);
      }
      
      vec3 finalColor = texColor.rgb;
      finalColor += holoColor * fresnel * uIntensity;
      
      float sparkle = pow(max(0.0, snoise(vec3(vUv * 60.0, uTime * 3.0))), 12.0);
      finalColor += vec3(1.0) * sparkle * uIntensity * 2.0;
      
      float chargePulse = sin(uTime * 8.0) * 0.5 + 0.5;
      finalColor += holoColor * uCharging * chargePulse * 0.4;
      finalColor += vec3(1.0) * uCharging * fresnel * chargePulse * 0.5;
      
      float edgeGlow = fresnel * (0.3 + uCharging * 0.7);
      finalColor += holoColor * edgeGlow * 0.3;
      
      gl_FragColor = vec4(finalColor, texColor.a);
    }
  `
);

extend({ HoloCardMaterial });

declare module "@react-three/fiber" {
  interface ThreeElements {
    holoCardMaterial: any;
  }
}

function createRoundedRectShape(
  width: number,
  height: number,
  radius: number
): THREE.Shape {
  const shape = new THREE.Shape();
  const x = -width / 2;
  const y = -height / 2;

  shape.moveTo(x + radius, y);
  shape.lineTo(x + width - radius, y);
  shape.quadraticCurveTo(x + width, y, x + width, y + radius);
  shape.lineTo(x + width, y + height - radius);
  shape.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  shape.lineTo(x + radius, y + height);
  shape.quadraticCurveTo(x, y + height, x, y + height - radius);
  shape.lineTo(x, y + radius);
  shape.quadraticCurveTo(x, y, x + radius, y);

  return shape;
}

// Helper to create fallback texture
function createFallbackTexture(text: string = "?"): THREE.Texture {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 712;
  const ctx = canvas.getContext("2d")!;

  const gradient = ctx.createLinearGradient(0, 0, 512, 712);
  gradient.addColorStop(0, "#1a1a2e");
  gradient.addColorStop(1, "#16213e");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 512, 712);

  ctx.fillStyle = "#8b5cf6";
  ctx.font = "bold 120px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, 256, 356);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

interface PackCardProps {
  state: "IDLE" | "CHARGING" | "REVEAL" | "RESULT";
  frontImageUrl?: string;
  backImageUrl?: string;
  position?: [number, number, number];
  rotation?: [number, number, number];
  width?: number;
  height?: number;
  thickness?: number;
  cornerRadius?: number;
  edgeColor?: string;
}

export default function PackCard({
  state,
  frontImageUrl = "/images/card-front.webp",
  backImageUrl = "/images/card-back.webp",
  position = [0, 1.5, 0],
  rotation = [0, 0, 0],
  width = 2.5,
  height = 3.5,
  thickness = 0.01,
  cornerRadius = 0.15,
  edgeColor = "#ddd",
}: PackCardProps) {
  const groupRef = useRef<THREE.Group>(null!);
  const materialRef = useRef<any>(null!);
  const [frontTexture, setFrontTexture] = useState<THREE.Texture | null>(null);
  const [backTexture, setBackTexture] = useState<THREE.Texture | null>(null);

  // Load textures with CORS support
  useEffect(() => {
    const loader = new THREE.TextureLoader();
    loader.crossOrigin = "anonymous";

    // Load front texture
    loader.load(
      frontImageUrl,
      (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        setFrontTexture(texture);
      },
      undefined,
      () => {
        console.warn("Failed to load front texture, using fallback");
        setFrontTexture(createFallbackTexture("?"));
      }
    );

    // Load back texture
    loader.load(
      backImageUrl,
      (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        setBackTexture(texture);
      },
      undefined,
      () => {
        console.warn("Failed to load back texture, using fallback");
        setBackTexture(createFallbackTexture(""));
      }
    );

    return () => {
      frontTexture?.dispose();
      backTexture?.dispose();
    };
  }, [frontImageUrl, backImageUrl]);

  const { faceGeometry, bodyGeometry } = useMemo(() => {
    const shape = createRoundedRectShape(width, height, cornerRadius);

    const faceGeo = new THREE.ShapeGeometry(shape);
    const uvAttr = faceGeo.attributes.uv;
    for (let i = 0; i < uvAttr.count; i++) {
      const u = (uvAttr.getX(i) + width / 2) / width;
      const v = (uvAttr.getY(i) + height / 2) / height;
      uvAttr.setXY(i, u, v);
    }

    const bodyGeo = new THREE.ExtrudeGeometry(shape, {
      depth: thickness,
      bevelEnabled: false,
    });
    bodyGeo.translate(0, 0, -thickness / 2);

    return { faceGeometry: faceGeo, bodyGeometry: bodyGeo };
  }, [width, height, thickness, cornerRadius]);

  const edgeMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: edgeColor,
      metalness: 0.4,
      roughness: 0.3,
    });
  }, [edgeColor]);

  useFrame((frameState, delta) => {
    if (!materialRef.current) return;

    materialRef.current.uTime += delta;

    switch (state) {
      case "IDLE": {
        materialRef.current.uIntensity = THREE.MathUtils.lerp(
          materialRef.current.uIntensity,
          0.25,
          0.05
        );
        materialRef.current.uCharging = THREE.MathUtils.lerp(
          materialRef.current.uCharging,
          0,
          0.05
        );

        if (groupRef.current) {
          const t = frameState.clock.elapsedTime;
          groupRef.current.position.z = THREE.MathUtils.lerp(
            groupRef.current.position.z,
            -0.35,
            0.05
          );
          groupRef.current.position.y = position[1] + Math.sin(t * 1.2) * 0.06;
          groupRef.current.rotation.x = THREE.MathUtils.lerp(
            groupRef.current.rotation.x,
            Math.sin(t * 0.6) * 0.06,
            0.05
          );
          groupRef.current.rotation.y = THREE.MathUtils.lerp(
            groupRef.current.rotation.y,
            Math.sin(t * 0.8) * 0.1,
            0.05
          );
          groupRef.current.scale.lerp(new THREE.Vector3(1.05, 1.05, 1), 0.05);
        }
        break;
      }

      case "CHARGING":
        materialRef.current.uIntensity = THREE.MathUtils.lerp(
          materialRef.current.uIntensity,
          0.8,
          0.03
        );
        materialRef.current.uCharging = THREE.MathUtils.lerp(
          materialRef.current.uCharging,
          1,
          0.02
        );
        if (groupRef.current) {
          groupRef.current.position.x =
            position[0] + (Math.random() - 0.5) * 0.03;
          groupRef.current.position.y =
            position[1] + Math.sin(frameState.clock.elapsedTime * 3) * 0.1;
        }
        break;

      case "REVEAL":
        materialRef.current.uIntensity = 1.2;
        materialRef.current.uCharging = 0;

        if (groupRef.current) {
          groupRef.current.position.z = THREE.MathUtils.lerp(
            groupRef.current.position.z,
            -0.8,
            0.08
          );
          groupRef.current.rotation.x = THREE.MathUtils.lerp(
            groupRef.current.rotation.x,
            -0.12,
            0.08
          );
          groupRef.current.rotation.y = THREE.MathUtils.lerp(
            groupRef.current.rotation.y,
            Math.sin(frameState.clock.elapsedTime * 0.8) * 0.15,
            0.05
          );
          groupRef.current.scale.lerp(new THREE.Vector3(1.15, 1.15, 1), 0.08);
        }
        break;

      case "RESULT": {
        materialRef.current.uIntensity = THREE.MathUtils.lerp(
          materialRef.current.uIntensity,
          0.25,
          0.05
        );
        materialRef.current.uCharging = THREE.MathUtils.lerp(
          materialRef.current.uCharging,
          0,
          0.05
        );

        if (groupRef.current) {
          groupRef.current.position.z = THREE.MathUtils.lerp(
            groupRef.current.position.z,
            -0.35,
            0.05
          );
          groupRef.current.rotation.y += delta * 0.25;
          groupRef.current.rotation.x = THREE.MathUtils.lerp(
            groupRef.current.rotation.x,
            0,
            0.05
          );
          groupRef.current.scale.lerp(new THREE.Vector3(1.05, 1.05, 1), 0.05);
        }
        break;
      }
    }
  });

  const halfThickness = thickness / 2 + 0.001;

  if (!frontTexture || !backTexture) {
    return null;
  }

  return (
    <group ref={groupRef} position={position} rotation={rotation}>
      <mesh geometry={bodyGeometry} material={edgeMaterial} />

      <mesh geometry={faceGeometry} position={[0, 0, halfThickness]}>
        <holoCardMaterial
          ref={materialRef}
          uTexture={frontTexture}
          transparent={true}
          side={THREE.FrontSide}
        />
      </mesh>

      <mesh
        geometry={faceGeometry}
        position={[0, 0, -halfThickness]}
        rotation={[0, Math.PI, 0]}
      >
        <meshStandardMaterial
          map={backTexture}
          metalness={0.2}
          roughness={0.5}
          side={THREE.FrontSide}
        />
      </mesh>
    </group>
  );
}
