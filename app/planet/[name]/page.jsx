"use client";
import React, { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useRouter } from "next/navigation";
import Planet from "../../../components/Planet";
import PlanetInfoCard from "../../../components/PlanetInfoCard";
import { Html } from "@react-three/drei";
import { motion } from "framer-motion";

const planets = [
  {
    name: "Mercury",
    color: "#a6a6a6",
    radius: 0.6,
    distance: 4,
    type: "Terrestrial",
    temp: "167°C",
    description: "Small and rocky.",
  },
  {
    name: "Venus",
    color: "#c07b4b",
    radius: 0.9,
    distance: 6,
    type: "Terrestrial",
    temp: "464°C",
    description: "Thick toxic atmosphere.",
  },
  {
    name: "Earth",
    color: "#3b82f6",
    radius: 1,
    distance: 9,
    type: "Terrestrial",
    temp: "15°C",
    description: "Our home.",
  },
  {
    name: "Mars",
    color: "#b84a3a",
    radius: 0.8,
    distance: 12,
    type: "Terrestrial",
    temp: "-65°C",
    description: "Red dusty world.",
  },
  {
    name: "Jupiter",
    color: "#d9b27c",
    radius: 1.8,
    distance: 17,
    type: "Gas Giant",
    temp: "-110°C",
    description: "Huge gas giant.",
  },
  {
    name: "Saturn",
    color: "#e8d2a1",
    radius: 1.6,
    distance: 22,
    type: "Gas Giant",
    temp: "-140°C",
    description: "Rings and beauty.",
  },
];

export default function PlanetDetail({ params }) {
  const { name } = params;
  const router = useRouter();
  const planet =
    planets.find((p) => p.name.toLowerCase() === name.toLowerCase()) ||
    planets[2];

  return (
    <div className="w-screen h-screen relative">
      <Canvas camera={{ position: [0, 0, 6], fov: 50 }} className="canvas-fill">
        <ambientLight intensity={0.5} />
        <directionalLight position={[2, 2, 2]} intensity={1} />
        <Suspense fallback={<Html center>Loading Planet...</Html>}>
          <mesh position={[0, 0, 0]}>
            <Planet data={planet} position={[0, 0, 0]} detailView />
          </mesh>
        </Suspense>
        <OrbitControls
          enablePan={false}
          enableZoom={true}
          enableRotate={true}
        />
      </Canvas>

      <motion.div
        initial={{ x: 300 }}
        animate={{ x: 0 }}
        transition={{ type: "spring", stiffness: 80 }}
        className="absolute right-6 top-20 w-96"
      >
        <PlanetInfoCard
          planet={planet}
          onBack={() => router.push("/solar-system")}
        />
      </motion.div>
    </div>
  );
}
