"use client";
import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";

export default function Moon({ earthPos = [9, 0, 0], distance = 1.8, speed = 0.8 }) {
  const ref = useRef();
  // angle state handled in frame

  useFrame((state, delta) => {
    if (!ref.current) return;
    // orbit around earthPos
    const t = state.clock.elapsedTime * speed;
    const x = earthPos[0] + Math.cos(t) * distance;
    const z = earthPos[2] + Math.sin(t) * distance;
    ref.current.position.set(x, earthPos[1] + 0.2, z);
    // moon rotation on axis
    ref.current.rotation.y += delta * 0.6;
  });

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.27, 24, 24]} />
      <meshStandardMaterial color="#cfcfcf" metalness={0.1} roughness={0.9} />
    </mesh>
  );
}
