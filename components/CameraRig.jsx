"use client";
import React, { useEffect, useRef } from "react";
import { useThree } from "@react-three/fiber";
import { useFrame } from "@react-three/fiber";
import { gsap } from "gsap";
import usePlanetStore from "../store/usePlanetStore";

export default function CameraRig() {
  const { camera } = useThree();
  const active = usePlanetStore((s) => s.active);
  const getPlanetRef = usePlanetStore((s) => s.getPlanetRef);
  const lastActive = useRef(active);

  useEffect(() => {
    // initial camera setup
    camera.position.set(0, 6, 28);
  }, [camera]);

  useFrame(() => {
    // subtle idle movement
    camera.position.x +=
      (Math.sin(Date.now() * 0.0005) * 0.01 - camera.position.x) * 0.02;
  });

  useEffect(() => {
    if (lastActive.current === active) return;
    lastActive.current = active;
    const ref = getPlanetRef(active);
    if (ref && ref.current) {
      const targetPos = ref.current.getWorldPosition(
        new window.THREE.Vector3()
      );
      // animate camera to a point offset from the planet and look at it
      const newPos = {
        x: targetPos.x + 0.0,
        y: targetPos.y + 1.5,
        z: targetPos.z + 4.5,
      };
      gsap.to(camera.position, {
        x: newPos.x,
        y: newPos.y,
        z: newPos.z,
        duration: 1.4,
        ease: "power2.inOut",
      });
      gsap.to(
        {},
        {
          duration: 1.4,
          onUpdate: () => camera.lookAt(targetPos.x, targetPos.y, targetPos.z),
        }
      );
    }
  }, [active, camera, getPlanetRef]);

  return null;
}
