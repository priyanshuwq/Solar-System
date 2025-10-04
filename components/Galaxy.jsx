"use client";
import React, { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export default function Galaxy({ count = 6000, radius = 80 }) {
  const geomRef = useRef();
  const matRef = useRef();
  const spriteTex = useMemo(() => {
    const size = 64;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    const grd = ctx.createRadialGradient(
      size / 2,
      size / 2,
      0,
      size / 2,
      size / 2,
      size / 2
    );
    grd.addColorStop(0, "rgba(255,255,255,1)");
    grd.addColorStop(0.2, "rgba(200,220,255,0.9)");
    grd.addColorStop(0.6, "rgba(120,160,255,0.4)");
    grd.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, size, size);
    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    return tex;
  }, []);

  const { positions, colors } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const color = new THREE.Color();

    for (let i = 0; i < count; i++) {
      const r = radius * (0.2 + Math.random() * 0.8);
      const a = Math.random() * Math.PI * 2;
      const spread = (Math.random() - 0.5) * 6;
      const x = Math.cos(a) * r + spread * 0.2;
      const y = (Math.random() - 0.5) * 2;
      const z = Math.sin(a) * r + spread * 0.2;

      positions[i * 3 + 0] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      color.setHSL(0.55 + Math.random() * 0.2, 0.6, 0.5 + Math.random() * 0.2);
      colors[i * 3 + 0] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    return { positions, colors };
  }, [count, radius]);

  useFrame((state, delta) => {
    if (geomRef.current) geomRef.current.rotation.y += delta * 0.005;
    if (matRef.current)
      matRef.current.size =
        1.2 + Math.sin(state.clock.getElapsedTime() * 0.3) * 0.4;
  });

  return (
    <points ref={geomRef} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={positions}
          count={positions.length / 3}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          array={colors}
          count={colors.length / 3}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        ref={matRef}
        vertexColors
        size={1.6}
        sizeAttenuation={true}
        map={spriteTex}
        alphaTest={0.01}
        depthWrite={false}
        transparent
        opacity={0.95}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
