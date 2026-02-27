"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Environment, PerspectiveCamera, ContactShadows } from "@react-three/drei";
import * as THREE from "three";

function FloatingMilkBottle(props: any) {
    const meshRef = useRef<THREE.Group>(null);

    useFrame((state) => {
        if (!meshRef.current) return;
        const t = state.clock.getElapsedTime();
        meshRef.current.rotation.y = Math.sin(t / 4) / 2;
        meshRef.current.rotation.x = Math.cos(t / 4) / 2;
        meshRef.current.position.y = Math.sin(t / 1.5) / 4;
    });

    return (
        <group ref={meshRef} {...props}>
            {/* Bottle Body */}
            <mesh position={[0, 0, 0]} castShadow receiveShadow>
                <cylinderGeometry args={[0.8, 0.8, 2.5, 32]} />
                <meshPhysicalMaterial
                    color="#ffffff"
                    roughness={0.2}
                    metalness={0.1}
                    transmission={0.6}
                    thickness={1.5}
                    clearcoat={1}
                />
            </mesh>

            {/* Bottle Neck */}
            <mesh position={[0, 1.5, 0]} castShadow receiveShadow>
                <cylinderGeometry args={[0.3, 0.8, 0.5, 32]} />
                <meshPhysicalMaterial
                    color="#ffffff"
                    roughness={0.2}
                    metalness={0.1}
                    transmission={0.6}
                    thickness={1.5}
                    clearcoat={1}
                />
            </mesh>

            {/* Cap */}
            <mesh position={[0, 1.85, 0]}>
                <cylinderGeometry args={[0.35, 0.35, 0.2, 32]} />
                <meshStandardMaterial color="#0F2C59" />
            </mesh>

            {/* Label */}
            <mesh position={[0, 0, 0.81]}>
                <planeGeometry args={[1, 1.2]} />
                <meshStandardMaterial color="#43A047" transparent opacity={0.9} />
            </mesh>
        </group>
    );
}

export default function Scene3D() {
    return (
        <div className="w-full h-full absolute inset-0 -z-10">
            <Canvas shadows dpr={[1, 2]}>
                <PerspectiveCamera makeDefault position={[0, 0, 6]} fov={45} />
                <ambientLight intensity={0.5} />
                <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />

                <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
                    <FloatingMilkBottle position={[2, 0, 0]} rotation={[0, -0.5, 0]} />
                </Float>

                <Environment preset="city" />
                <ContactShadows position={[0, -2, 0]} opacity={0.5} scale={10} blur={2.5} far={4} />
            </Canvas>
        </div>
    );
}
