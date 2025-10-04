"use client";
import React, { useRef, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { useRouter } from "next/navigation";
import usePlanetStore from "../store/usePlanetStore";

export default function Planet({
  data,
  index,
  position = [0, 0, 0],
  onClick,
  detailView = false,
}) {
  const mesh = useRef();
  const [hovered, setHovered] = useState(false);
  const router = useRouter();
  const registerPlanetRef = usePlanetStore((s) => s.registerPlanetRef);

  useEffect(() => {
    if (mesh.current) registerPlanetRef(index, mesh);
  }, [index, registerPlanetRef]);

  useFrame((state, delta) => {
    if (mesh.current) {
      mesh.current.rotation.y += detailView ? 0.02 : 0.003;
      if (!detailView) {
        // slight orbit around origin
        const t = state.clock.getElapsedTime() * 0.2 + index;
        mesh.current.position.x = Math.cos(t) * position[0];
        mesh.current.position.z = Math.sin(t) * position[0];
      }
    }
  });

  async function handleClick() {
    if (detailView) return;
    if (onClick) onClick();
    // wait a short moment to let CameraRig animate (camera tween triggered by store change)
    await new Promise((res) => setTimeout(res, 300));
    router.push(`/planet/${data.name.toLowerCase()}`);
  }

  return (
    <mesh
      ref={mesh}
      onClick={handleClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <sphereGeometry args={[data.radius || 1, 64, 64]} />
      <meshStandardMaterial
        color={data.color}
        metalness={0.15}
        roughness={0.55}
        emissive={data.emissive || "#000000"}
        emissiveIntensity={data.emissiveIntensity || 0.2}
      />

      {/* atmosphere glow */}
      <mesh scale={[1.03, 1.03, 1.03]}>
        <sphereGeometry args={[data.radius * 1.02 || 1.02, 64, 64]} />
        <meshBasicMaterial
          color={data.atmosphereColor || "#88aaff"}
          transparent
          opacity={0.08}
          side={2}
          depthWrite={false}
        />
      </mesh>

      {/* rings for gas giants (optional) */}
      {data.rings && (
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
          <ringGeometry args={[data.radius * 1.5, data.radius * 2.6, 64]} />
          <meshBasicMaterial
            color={data.ringColor || "#c7b38f"}
            transparent
            opacity={0.6}
            side={2}
            depthWrite={false}
          />
        </mesh>
      )}
      {hovered && (
        <Html distanceFactor={8} center className="tooltip">
          {data.name}
        </Html>
      )}
    </mesh>
  );
}
