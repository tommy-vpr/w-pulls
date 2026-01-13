"use client";

import { shaderMaterial } from "@react-three/drei";
import { extend } from "@react-three/fiber";
import * as THREE from "three";

const HolographicMaterial = shaderMaterial(
  {
    uTime: 0,
    uTexture: new THREE.Texture(),
    uColor: new THREE.Color("#8b5cf6"),
  },
  // Vertex Shader
  `
    varying vec2 vUv;
    varying vec3 vPosition;
    varying vec3 vNormal;
    
    void main() {
      vUv = uv;
      vPosition = position;
      vNormal = normal;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  // Fragment Shader
  `
    uniform float uTime;
    uniform sampler2D uTexture;
    uniform vec3 uColor;
    
    varying vec2 vUv;
    varying vec3 vPosition;
    varying vec3 vNormal;
    
    void main() {
      vec4 texColor = texture2D(uTexture, vUv);
      
      // Rainbow holographic effect
      float holo = sin(vUv.x * 20.0 + uTime) * 0.5 + 0.5;
      holo *= sin(vUv.y * 20.0 - uTime * 0.5) * 0.5 + 0.5;
      
      vec3 rainbow = vec3(
        sin(holo * 6.28 + 0.0) * 0.5 + 0.5,
        sin(holo * 6.28 + 2.09) * 0.5 + 0.5,
        sin(holo * 6.28 + 4.18) * 0.5 + 0.5
      );
      
      // Fresnel effect
      vec3 viewDir = normalize(cameraPosition - vPosition);
      float fresnel = pow(1.0 - dot(viewDir, vNormal), 3.0);
      
      vec3 finalColor = mix(texColor.rgb, rainbow, fresnel * 0.5);
      finalColor += uColor * fresnel * 0.3;
      
      gl_FragColor = vec4(finalColor, texColor.a);
    }
  `
);

extend({ HolographicMaterial });

export { HolographicMaterial };
