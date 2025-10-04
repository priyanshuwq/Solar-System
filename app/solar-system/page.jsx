"use client";
import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import Planet from "../../components/Planet";
import CameraRig from "../../components/CameraRig";
import Starfield from "../../components/Starfield";
import HUD from "../../components/HUD";
import Sun from "../../components/Sun";
import Moon from "../../components/Moon";
import usePlanetStore from "../../store/usePlanetStore";
import { motion } from "framer-motion";

const planets = [
  {
    name: "Mercury",
    color: "#a6a6a6",
    radius: 0.6,
    distance: 4,
    type: "Terrestrial",
    temp: "167°C",
  },
  {
    name: "Venus",
    color: "#c07b4b",
    radius: 0.9,
    distance: 6,
    type: "Terrestrial",
    temp: "464°C",
  },
  {
    name: "Earth",
    color: "#3b82f6",
    radius: 1,
    distance: 9,
    type: "Terrestrial",
    temp: "15°C",
  },
  {
    name: "Mars",
    color: "#b84a3a",
    radius: 0.8,
    distance: 12,
    type: "Terrestrial",
    temp: "-65°C",
  },
  {
    name: "Jupiter",
    color: "#d9b27c",
    radius: 1.8,
    distance: 17,
    type: "Gas Giant",
    temp: "-110°C",
    rings: false,
    atmosphereColor: "#f6e7d1",
    emissive: "#2b1f12",
    emissiveIntensity: 0.06,
  },
  {
    name: "Saturn",
    color: "#e8d2a1",
    radius: 1.6,
    distance: 22,
    type: "Gas Giant",
    temp: "-140°C",
    rings: true,
    ringColor: "#e8d2b0",
    atmosphereColor: "#efe1c8",
    emissive: "#2a241e",
    emissiveIntensity: 0.05,
  },
];

export default function SolarSystemPage() {
  const setActive = usePlanetStore((s) => s.setActive);

  return (
    <div className="w-screen h-screen relative">
      <Canvas
        camera={{ position: [0, 6, 28], fov: 50 }}
        className="canvas-fill"
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <Suspense fallback={<Html center>Loading Scene...</Html>}>
          <Starfield />
          <group>
            {/* Sun at center */}
            <Sun position={[0, 0, 0]} />

            {planets.map((p, i) => (
              <Planet
                key={p.name}
                data={p}
                index={i}
                position={[p.distance, 0, 0]}
                onClick={() => setActive(i)}
              />
            ))}

            {/* Moon orbiting Earth (Earth is at distance 9) */}
            <Moon earthPos={[9, 0, 0]} distance={1.8} speed={0.9} />
          </group>
          <CameraRig />
        </Suspense>
        <OrbitControls
          enablePan={false}
          enableZoom={false}
          enableRotate={false}
        />
      </Canvas>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="absolute top-6 left-6"
      >
        <HUD />
      </motion.div>

      {/* audio controller removed */}
    </div>
  );
}
