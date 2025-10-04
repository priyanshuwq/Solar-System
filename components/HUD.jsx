"use client";
import React from "react";
import { motion } from "framer-motion";
import usePlanetStore from "../store/usePlanetStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function HUD() {
  const active = usePlanetStore((s) => s.active);
  const setActive = usePlanetStore((s) => s.setActive);
  const audio = usePlanetStore((s) => s.audio);
  const setAudioVolume = usePlanetStore((s) => s.setAudioVolume);
  const setAudioMuted = usePlanetStore((s) => s.setAudioMuted);
  const router = useRouter();
  const total = 6;

  function goNext() {
    const next = (active + 1) % total;
    setActive(next);
    router.push(
      `/planet/${
        ["mercury", "venus", "earth", "mars", "jupiter", "saturn"][next]
      }`
    );
  }
  function goPrev() {
    const prev = (active - 1 + total) % total;
    setActive(prev);
    router.push(
      `/planet/${
        ["mercury", "venus", "earth", "mars", "jupiter", "saturn"][prev]
      }`
    );
  }

  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="glass p-3 flex gap-3 items-center"
    >
      <button
        onClick={() => router.push("/")}
        className="px-3 py-2 bg-white/6 rounded"
      >
        Home
      </button>
      <button onClick={goPrev} className="px-3 py-2 bg-white/6 rounded">
        Prev
      </button>
      <button onClick={goNext} className="px-3 py-2 bg-white/6 rounded">
        Next
      </button>
      <div className="ml-3 text-sm text-white/80">Active: {active + 1}</div>
      <div className="ml-3 flex items-center gap-2">
        <button
          onClick={() => setAudioMuted(!audio?.muted)}
          className="px-2 py-1 bg-white/6 rounded"
        >
          {audio?.muted ? "🔈" : "🔊"}
        </button>
        <input
          aria-label="hud-volume"
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={audio?.volume ?? 0.25}
          onChange={(e) => setAudioVolume(parseFloat(e.target.value))}
        />
      </div>
    </motion.div>
  );
}
