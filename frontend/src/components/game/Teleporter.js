import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useBox } from '@react-three/cannon';
import { useSpring, animated } from '@react-spring/three';
import { useAudio } from '../../contexts/AudioContext';
import * as THREE from 'three';

const Teleporter = ({ teleporterId, position, linkedTo, color, teleporters }) => {
  const teleporterRef = useRef();
  const [isActive, setIsActive] = useState(false);
  const [cooldown, setCooldown] = useState(false);
  const { playSFX } = useAudio();
  
  // Physics body for collision detection
  const [teleporterBody] = useBox(() => ({
    position: position,
    args: [1, 2, 1],
    type: 'Static',
    isTrigger: true,
    onCollisionEnter: (event) => {
      if (!cooldown) {
        handleTeleport(event);
      }
    }
  }));

  // Spring animation for teleporter effects
  const [{ scale, rotation, opacity }, springApi] = useSpring(() => ({
    scale: [1, 1, 1],
    rotation: [0, 0, 0],
    opacity: 0.6,
    config: { tension: 150, friction: 20 }
  }));

  const handleTeleport = (event) => {
    const linkedTeleporter = teleporters.find(t => t.id === linkedTo);
    if (linkedTeleporter) {
      setIsActive(true);
      setCooldown(true);
      playSFX('teleport');
      
      // Teleport animation
      springApi.start({
        scale: [1.5, 1.5, 1.5],
        opacity: 1,
        config: { tension: 300, friction: 15 }
      });
      
      // Reset animation
      setTimeout(() => {
        springApi.start({
          scale: [1, 1, 1],
          opacity: 0.6,
          config: { tension: 200, friction: 20 }
        });
        setIsActive(false);
      }, 500);
      
      // Reset cooldown
      setTimeout(() => {
        setCooldown(false);
      }, 1000);
    }
  };

  // Rotation animation
  useFrame((state) => {
    if (teleporterRef.current) {
      const time = state.clock.elapsedTime;
      teleporterRef.current.rotation.y = time * 0.5;
      
      // Floating animation
      teleporterRef.current.position.y = position[1] + Math.sin(time * 2) * 0.1;
    }
  });

  return (
    <group>
      {/* Physics body */}
      <mesh ref={teleporterBody} visible={false}>
        <boxGeometry args={[1, 2, 1]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      {/* Visual teleporter */}
      <animated.group 
        ref={teleporterRef} 
        position={position}
        scale={scale}
      >
        {/* Main portal ring */}
        <mesh>
          <torusGeometry args={[0.8, 0.1, 16, 100]} />
          <animated.meshPhongMaterial
            color={color}
            transparent
            opacity={opacity}
            emissive={color}
            emissiveIntensity={isActive ? 0.5 : 0.2}
          />
        </mesh>
        
        {/* Inner portal effect */}
        <mesh>
          <circleGeometry args={[0.7, 32]} />
          <animated.meshBasicMaterial
            color={color}
            transparent
            opacity={opacity.to(o => o * 0.3)}
            side={THREE.DoubleSide}
          />
        </mesh>
        
        {/* Portal frame */}
        <mesh>
          <cylinderGeometry args={[0.9, 0.9, 0.1, 16]} />
          <meshStandardMaterial
            color="#333333"
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>
        
        {/* Energy beams */}
        <EnergyBeams 
          color={color} 
          isActive={isActive}
          intensity={cooldown ? 0.3 : 0.8}
        />
      </animated.group>

      {/* Particle effects */}
      <PortalParticles 
        position={position} 
        color={color}
        isActive={isActive}
      />
    </group>
  );
};

// Energy beams effect
const EnergyBeams = ({ color, isActive, intensity }) => {
  const beamsRef = useRef();
  
  useFrame((state) => {
    if (beamsRef.current) {
      const time = state.clock.elapsedTime;
      beamsRef.current.children.forEach((beam, index) => {
        const offset = index * (Math.PI * 2) / 8;
        beam.rotation.y = time * 2 + offset;
        beam.scale.y = 1 + Math.sin(time * 4 + offset) * 0.3;
      });
    }
  });

  return (
    <group ref={beamsRef}>
      {Array.from({ length: 8 }, (_, i) => (
        <mesh key={i} position={[0, 0, 0]}>
          <boxGeometry args={[0.02, 1.5, 0.02]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={intensity * (isActive ? 0.8 : 0.4)}
          />
        </mesh>
      ))}
    </group>
  );
};

// Portal particle system
const PortalParticles = ({ position, color, isActive }) => {
  const particlesRef = useRef();
  const [particles] = useState(() => {
    const temp = [];
    for (let i = 0; i < 50; i++) {
      const angle = (i / 50) * Math.PI * 2;
      const radius = Math.random() * 0.8;
      temp.push({
        position: [
          position[0] + Math.cos(angle) * radius,
          position[1] + (Math.random() - 0.5) * 2,
          position[2] + Math.sin(angle) * radius
        ],
        velocity: [
          Math.cos(angle) * 0.01,
          (Math.random() - 0.5) * 0.02,
          Math.sin(angle) * 0.01
        ],
        life: Math.random(),
        originalLife: Math.random(),
        size: Math.random() * 0.03 + 0.01,
        angle: angle,
        radius: radius
      });
    }
    return temp;
  });

  useFrame((state, delta) => {
    if (particlesRef.current) {
      const time = state.clock.elapsedTime;
      
      particles.forEach((particle, i) => {
        // Spiral motion
        particle.angle += delta * 2;
        particle.radius += delta * 0.1;
        
        // Reset if too far
        if (particle.radius > 1) {
          particle.radius = 0.1;
          particle.angle = Math.random() * Math.PI * 2;
        }
        
        // Update position
        particle.position[0] = position[0] + Math.cos(particle.angle) * particle.radius;
        particle.position[2] = position[2] + Math.sin(particle.angle) * particle.radius;
        particle.position[1] = position[1] + Math.sin(time * 3 + particle.angle) * 0.5;
        
        // Update life
        particle.life -= delta * 0.3;
        if (particle.life <= 0) {
          particle.life = particle.originalLife;
        }
        
        // Update mesh
        const mesh = particlesRef.current.children[i];
        if (mesh) {
          mesh.position.set(...particle.position);
          mesh.material.opacity = particle.life * (isActive ? 0.8 : 0.4);
          mesh.scale.setScalar(particle.size * (1 + (isActive ? 0.5 : 0)));
        }
      });
    }
  });

  return (
    <group ref={particlesRef}>
      {particles.map((particle, i) => (
        <mesh key={i} position={particle.position}>
          <sphereGeometry args={[particle.size, 4, 4]} />
          <meshBasicMaterial 
            color={color}
            transparent
            opacity={particle.life * (isActive ? 0.8 : 0.4)}
          />
        </mesh>
      ))}
    </group>
  );
};

export default Teleporter;