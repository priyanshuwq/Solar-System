"use client";
import React from "react";
import { Stars } from "@react-three/drei";
import Galaxy from "./Galaxy";
import { useThree, useFrame } from "@react-three/fiber";
import { useRef } from "react";

export default function Starfield() {
  const group = useRef();
  const { mouse } = useThree();

  useFrame(() => {
    if (group.current) {
      group.current.rotation.x = mouse.y * 0.05;
      group.current.rotation.y = mouse.x * 0.1;
    }
  });

  return (
    <group ref={group}>
      <Galaxy count={7000} radius={140} />
      <Stars
        radius={120}
        depth={80}
        count={1200}
        factor={6}
        saturation={0}
        fade
        speed={0.1}
      />
    </group>
  );
}
