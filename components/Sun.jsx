"use client";
import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// A procedural, shader-driven sun with animated surface turbulence and an additive corona.
// Uses a vertex displacement + fragment palette blend for a more convincing solar surface.
export default function Sun({ position = [0, 0, 0], radius = 2.5 }) {
  const meshRef = useRef();
  const lightRef = useRef();
  const spriteRef = useRef();

  const uniforms = useMemo(() => ({
    time: { value: 0 },
    noiseScale: { value: 1.6 },
    displacement: { value: 0.35 },
    color1: { value: new THREE.Color("#fff9d6") },
    color2: { value: new THREE.Color("#ffd36a") },
    color3: { value: new THREE.Color("#ff6a2e") },
    color4: { value: new THREE.Color("#8b0000") },
  }), []);

  // Simple 3D noise (classic simplex-like) implemented inline for the shader.
  const vertexShader = `
    varying vec2 vUv;
    varying float vNoise;
    uniform float time;
    uniform float noiseScale;
    uniform float displacement;

    // Classic 3D noise from Ashima (webgl-noise) — simple and compact
    vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);} 
    vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;} 
    float snoise(vec3 v){
      const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
      const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);
      vec3 i  = floor(v + dot(v, C.yyy) );
      vec3 x0 =   v - i + dot(i, C.xxx) ;
      vec3 g = step(x0.yzx, x0.xyz);
      vec3 l = 1.0 - g;
      vec3 i1 = min( g.xyz, l.zxy );
      vec3 i2 = max( g.xyz, l.zxy );
      vec3 x1 = x0 - i1 + C.xxx;
      vec3 x2 = x0 - i2 + C.yyy;
      vec3 x3 = x0 - D.yyy;
      i = mod(i, 289.0 );
      vec4 p = permute( permute( permute(
                 i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
               + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
               + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
      vec4 j = p - 49.0 * floor(p * 0.02040816326530612);
      vec4 x_ = floor(j * 0.14285714285714285);
      vec4 y_ = floor(j - 7.0 * x_ );
      vec4 x = (x_ *2.0 + 0.5)/7.0 - 1.0;
      vec4 y = (y_ *2.0 + 0.5)/7.0 - 1.0;
      vec4 h = 1.0 - abs(x) - abs(y);
      vec4 b0 = vec4( x.xy, y.xy );
      vec4 b1 = vec4( x.zw, y.zw );
      vec4 s0 = floor(b0)*2.0 + 1.0;
      vec4 s1 = floor(b1)*2.0 + 1.0;
      vec4 sh = -step(h, vec4(0.0));
      vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
      vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
      vec3 g0 = vec3(a0.x, a0.y, h.x);
      vec3 g1 = vec3(a0.z, a0.w, h.y);
      vec3 g2 = vec3(a1.x, a1.y, h.z);
      vec3 g3 = vec3(a1.z, a1.w, h.w);
      vec4 norm = taylorInvSqrt(vec4(dot(g0,g0), dot(g1,g1), dot(g2,g2), dot(g3,g3)));
      g0 *= norm.x; g1 *= norm.y; g2 *= norm.z; g3 *= norm.w;
      vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
      m = m * m;
      return 42.0 * dot( m*m, vec4( dot(g0,x0), dot(g1,x1), dot(g2,x2), dot(g3,x3) ) );
    }

    void main(){
      vUv = uv;
      // sample noise in object space to displace vertices slightly
      float n = snoise(normalize(position) * noiseScale + vec3(time * 0.35));
      vNoise = n;
      vec3 displaced = position + normal * n * displacement;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
    }
  `;

  const fragmentShader = `
    varying vec2 vUv;
    varying float vNoise;
    uniform float time;
    uniform vec3 color1;
    uniform vec3 color2;
    uniform vec3 color3;
    uniform vec3 color4;

    void main(){
      // amplify and bias noise for color mixing
      float n = smoothstep(-0.6, 0.8, vNoise * 1.2);
      // layered radial darkening to simulate limb darkening
      float r = length(vUv - 0.5) * 1.6;
      float rim = smoothstep(0.8, 0.4, r);
      vec3 c = mix(color1, color2, n);
      c = mix(c, color3, pow(n, 2.0));
      // add darker patches
      c = mix(c, color4, smoothstep(0.6, 0.95, n));
      // modulate by rim to get brighter center
      c *= mix(1.0, 1.25, rim);
      gl_FragColor = vec4(c, 1.0);
    }
  `;

  // build an additive corona sprite texture using a canvas radial gradient
  const coronaMap = useMemo(() => {
    const size = 512;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    grad.addColorStop(0, "rgba(255,243,200,0.95)");
    grad.addColorStop(0.25, "rgba(255,200,120,0.7)");
    grad.addColorStop(0.5, "rgba(255,120,40,0.35)");
    grad.addColorStop(1, "rgba(255,120,40,0.0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);
    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    return tex;
  }, []);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    uniforms.time.value = t;
    // subtle continuous rotation for visual interest
    if (meshRef.current) meshRef.current.rotation.y = t * 0.04;
    if (lightRef.current) {
      // flicker intensity slightly like a real star surface
      lightRef.current.intensity = 3.0 + Math.sin(t * 1.7) * 0.35 + Math.cos(t * 0.37) * 0.12;
      lightRef.current.distance = 250;
    }
    if (spriteRef.current) {
      // gently pulse the corona scale for a breathing effect
      const s = 1.6 + Math.sin(t * 0.6) * 0.08 + Math.sin(t * 1.7) * 0.03;
      spriteRef.current.scale.set(radius * 3.4 * s, radius * 3.4 * s, 1);
    }
  });

  return (
    <group position={position} dispose={null}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[radius, 128, 128]} />
        <shaderMaterial
          uniforms={uniforms}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          toneMapped={false}
          // ensure glow-like rendering when combined with postprocessing bloom
          emissiveIntensity={1.0}
        />
      </mesh>

      {/* bright point light for scene illumination */}
      <pointLight ref={lightRef} color={new THREE.Color("#ffd27a")} intensity={3.0} decay={2} />

      {/* additive corona sprite */}
      <sprite ref={spriteRef} renderOrder={-1}>
        <spriteMaterial map={coronaMap} blending={THREE.AdditiveBlending} depthWrite={false} transparent />
      </sprite>
    </group>
  );
}
