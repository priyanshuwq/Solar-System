"use client";
import React, { useEffect, useRef, useState } from "react";
import { usePlanetStore } from "../store/usePlanetStore";

export default function AudioController() {
  const audioRef = useRef();
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.25);
  const [ready, setReady] = useState(false);

  // connect to global audio state in store
  const audioState = usePlanetStore((s) => s.audio);
  const setAudioVolume = usePlanetStore((s) => s.setAudioVolume);
  const setAudioMuted = usePlanetStore((s) => s.setAudioMuted);

  // sync audio element with store state
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = audioState?.volume ?? volume;
      audioRef.current.muted = audioState?.muted ?? false;
    }
  }, [audioState, volume]);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    const onCanPlay = () => setReady(true);
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onError = () => {
      // switch to WebAudio fallback if audio file missing or CORS error
      initWebAudioFallback();
    };
    a.addEventListener("canplay", onCanPlay);
    a.addEventListener("play", onPlay);
    a.addEventListener("pause", onPause);
    a.addEventListener("error", onError);
    return () => {
      a.removeEventListener("canplay", onCanPlay);
      a.removeEventListener("play", onPlay);
      a.removeEventListener("pause", onPause);
      a.removeEventListener("error", onError);
    };
  }, []);

  // Try to autoplay on mount; if blocked, play on first user interaction
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    let tried = false;
    const tryPlay = async () => {
      if (tried) return;
      tried = true;
      try {
        await a.play();
      } catch (e) {
        // autoplay blocked or file missing; try fallback
        initWebAudioFallback();
      }
    };
    tryPlay();

    const onUser = async () => {
      if (a.paused) {
        try {
          await a.play();
        } catch (e) {}
      }
      document.removeEventListener("pointerdown", onUser);
    };
    document.addEventListener("pointerdown", onUser);
    return () => document.removeEventListener("pointerdown", onUser);
  }, []);

  // Synthesizer fallback: soft pad + gentle arpeggio
  const audioCtxRef = useRef(null);
  const masterGainRef = useRef(null);
  const synthNodesRef = useRef([]);
  const arpIntervalRef = useRef(null);
  const [isSynth, setIsSynth] = useState(false);

  function initSynth() {
    if (isSynth) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioContext();

      const master = ctx.createGain();
      master.gain.value = audioState?.muted ? 0 : audioState?.volume ?? 0.25;
      master.connect(ctx.destination);

      // pad: two detuned oscillators through a lowpass
      const padFilter = ctx.createBiquadFilter();
      padFilter.type = "lowpass";
      padFilter.frequency.value = 1200;
      padFilter.Q.value = 0.7;
      padFilter.connect(master);

      const oscA = ctx.createOscillator();
      oscA.type = "sine";
      const oscB = ctx.createOscillator();
      oscB.type = "sawtooth";
      // detune oscB slightly
      oscB.detune.value = 10;

      const padGain = ctx.createGain();
      padGain.gain.value = 0.12;
      padGain.connect(padFilter);

      oscA.connect(padGain);
      oscB.connect(padGain);

      // start pad on a low chord
      const baseFreq = 110; // A2
      oscA.frequency.setValueAtTime(baseFreq, ctx.currentTime);
      oscB.frequency.setValueAtTime(baseFreq * 1.498, ctx.currentTime);
      oscA.start();
      oscB.start();

      // arpeggio: simple pluck using short gain envelope
      const arpGain = ctx.createGain();
      arpGain.gain.value = 0;
      const arpFilter = ctx.createBiquadFilter();
      arpFilter.type = "lowpass";
      arpFilter.frequency.value = 1600;
      arpFilter.connect(master);
      arpGain.connect(arpFilter);

      const arpOsc = ctx.createOscillator();
      arpOsc.type = "triangle";
      arpOsc.connect(arpGain);
      arpOsc.start();

      // schedule an arpeggio sequence
      const arpNotes = [220, 196, 165, 196]; // A3, G3, E3, G3
      let arpIndex = 0;
      arpIntervalRef.current = setInterval(() => {
        const now = ctx.currentTime;
        const f = arpNotes[arpIndex % arpNotes.length];
        arpOsc.frequency.cancelScheduledValues(now);
        arpOsc.frequency.setValueAtTime(f, now);
        // short pluck envelope
        arpGain.gain.cancelScheduledValues(now);
        arpGain.gain.setValueAtTime(0.0001, now);
        arpGain.gain.exponentialRampToValueAtTime(0.08, now + 0.02);
        arpGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.8);
        arpIndex++;
      }, 600);

      audioCtxRef.current = ctx;
      masterGainRef.current = master;
      synthNodesRef.current = {
        oscA,
        oscB,
        padGain,
        padFilter,
        arpOsc,
        arpGain,
        arpFilter,
      };
      setIsSynth(true);
      setReady(true);
      setPlaying(true);
    } catch (e) {
      console.error("Synth init failed", e);
    }
  }

  // Sync synth/master gain with store mute/volume
  useEffect(() => {
    if (masterGainRef.current) {
      masterGainRef.current.gain.value = audioState?.muted
        ? 0
        : audioState?.volume ?? 0.25;
    }
    if (audioRef.current && !isSynth) {
      audioRef.current.muted = audioState?.muted || false;
      audioRef.current.volume = audioState?.volume ?? 0.25;
    }
  }, [audioState, isSynth]);

  // resume audio context on user interaction if suspended
  useEffect(() => {
    const onUser = async () => {
      if (audioCtxRef.current && audioCtxRef.current.state === "suspended") {
        try {
          await audioCtxRef.current.resume();
        } catch (e) {}
      }
      document.removeEventListener("pointerdown", onUser);
    };
    document.addEventListener("pointerdown", onUser);
    return () => document.removeEventListener("pointerdown", onUser);
  }, []);

  return (
    <div className="glass p-3 flex items-center gap-3">
      <audio
        ref={audioRef}
        loop
        crossOrigin="anonymous"
        src="https://cdn.freesound.org/previews/553/553128_11178011-lq.mp3"
      />
      {/* play/pause button intentionally removed; autoplay attempted on mount and on first interaction */}
      <button
        className="px-2 py-1 bg-white/6 rounded"
        onClick={() => setAudioMuted(!audioState?.muted)}
        aria-label="mute-toggle"
      >
        {audioState?.muted ? "🔈" : "🔊"}
      </button>
      <label className="text-sm text-white/80">Vol</label>
      <input
        aria-label="volume"
        type="range"
        min={0}
        max={1}
        step={0.01}
        value={audioState?.volume ?? volume}
        onChange={(e) => {
          const v = parseFloat(e.target.value);
          setVolume(v);
          setAudioVolume(v);
        }}
      />
    </div>
  );
}
