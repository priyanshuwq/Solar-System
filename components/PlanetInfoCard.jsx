"use client";
import React from "react";
import { motion } from "framer-motion";

export default function PlanetInfoCard({ planet, onBack }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      className="glass p-6"
    >
      <button onClick={onBack} className="mb-4 px-3 py-2 bg-white/6 rounded">
        Back
      </button>
      <h2 className="text-2xl font-bold mb-2">{planet.name}</h2>
      <p className="text-sm text-white/80 mb-3">
        {planet.type} • {planet.temp}
      </p>
      <p className="mb-4">{planet.description}</p>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="p-2 bg-white/3 rounded">
          Distance: {planet.distance} AU
        </div>
        <div className="p-2 bg-white/3 rounded">
          Radius: {planet.radius} Earths
        </div>
      </div>
    </motion.div>
  );
}
