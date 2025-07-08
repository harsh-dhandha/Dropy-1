import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useBox } from '@react-three/cannon';
import { useSpring, animated } from '@react-spring/three';
import * as THREE from 'three';

const TargetZone = ({ targetId, position, size }) => {
  const targetRef = useRef();
  const [isActive, setIsActive] = useState(false);
  const [ballsInside, setBallsInside] = useState(0);
  
  // Physics body for collision detection
  const [targetBody] = useBox(() => ({
    position: position,
    args: size,
    type: 'Static',
    isTrigger: true,
    onCollisionEnter: (event) => {
      // Check if a ball entered
      setIsActive(true);
      setBallsInside(prev => prev + 1);
    },
    onCollisionExit: (event) => {
      // Check if a ball exited
      setBallsInside(prev => {
        const newCount = Math.max(0, prev - 1);
        setIsActive(newCount > 0);
        return newCount;
      });
    }
  }));

  // Spring animation for target effects
  const [{ scale, color, opacity }, springApi] = useSpring(() => ({
    scale: [1, 1, 1],
    color: '#4ecdc4',
    opacity: 0.3,
    config: { tension: 150, friction: 20 }
  }));

  // Update animation based on state
  React.useEffect(() => {
    springApi.start({
      scale: isActive ? [1.2, 1.2, 1.2] : [1, 1, 1],
      color: isActive ? '#00ff00' : '#4ecdc4',
      opacity: isActive ? 0.6 : 0.3
    });
  }, [isActive, springApi]);

  // Floating animation
  useFrame((state) => {
    if (targetRef.current) {
      const time = state.clock.elapsedTime;
      targetRef.current.position.y = position[1] + Math.sin(time * 0.5) * 0.1;
      targetRef.current.rotation.y = time * 0.2;
    }
  });

  return (
    <group>
      {/* Physics body (invisible) */}
      <mesh ref={targetBody} visible={false}>
        <boxGeometry args={size} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      {/* Visual target */}
      <animated.group ref={targetRef} position={position} scale={scale}>
        {/* Main target platform */}
        <mesh receiveShadow>
          <cylinderGeometry args={[size[0], size[0], size[1], 16]} />
          <animated.meshPhongMaterial
            color={color}
            transparent
            opacity={opacity}
            emissive={color}
            emissiveIntensity={0.1}
          />
        </mesh>
        
        {/* Target rings */}
        <TargetRings 
          radius={size[0]} 
          height={size[1]} 
          isActive={isActive}
        />
        
        {/* Success indicator */}
        {ballsInside > 0 && (
          <SuccessIndicator count={ballsInside} />
        )}
      </animated.group>

      {/* Particle effects */}
      {isActive && (
        <ParticleSystem 
          position={position} 
          intensity={ballsInside}
          color={isActive ? '#00ff00' : '#4ecdc4'}
        />
      )}
    </group>
  );
};

// Animated target rings
const TargetRings = ({ radius, height, isActive }) => {
  const ringsRef = useRef();
  
  useFrame((state) => {
    if (ringsRef.current) {
      const time = state.clock.elapsedTime;
      ringsRef.current.children.forEach((ring, index) => {
        const offset = index * 0.5;
        ring.rotation.z = time * 0.3 + offset;
        ring.scale.setScalar(1 + Math.sin(time * 2 + offset) * 0.1);
      });
    }
  });

  return (
    <group ref={ringsRef}>
      {[0, 1, 2].map((index) => (
        <mesh key={index} position={[0, height * 0.6, 0]}>
          <ringGeometry args={[radius * 0.8, radius * 1.2, 16]} />
          <meshBasicMaterial
            color={isActive ? '#00ff00' : '#4ecdc4'}
            transparent
            opacity={0.2 - index * 0.05}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
};

// Success indicator
const SuccessIndicator = ({ count }) => {
  const indicatorRef = useRef();
  
  useFrame((state) => {
    if (indicatorRef.current) {
      const time = state.clock.elapsedTime;
      indicatorRef.current.position.y = Math.sin(time * 3) * 0.2;
      indicatorRef.current.rotation.y = time * 2;
    }
  });

  return (
    <group ref={indicatorRef} position={[0, 2, 0]}>
      <mesh>
        <sphereGeometry args={[0.2, 8, 8]} />
        <meshBasicMaterial 
          color="#00ff00"
          transparent
          opacity={0.8}
        />
      </mesh>
      
      {/* Count display */}
      <mesh position={[0, 0.5, 0]}>
        <planeGeometry args={[0.5, 0.3]} />
        <meshBasicMaterial 
          color="#ffffff"
          transparent
          opacity={0.9}
        />
      </mesh>
      
      {/* Checkmark effect */}
      <mesh position={[0, 0, 0.1]}>
        <ringGeometry args={[0.15, 0.25, 16]} />
        <meshBasicMaterial 
          color="#00ff00"
          transparent
          opacity={0.7}
        />
      </mesh>
    </group>
  );
};

// Particle system for target effects
const ParticleSystem = ({ position, intensity, color }) => {
  const particlesRef = useRef();
  const [particles] = useState(() => {
    const temp = [];
    for (let i = 0; i < 30; i++) {
      temp.push({
        position: [
          position[0] + (Math.random() - 0.5) * 4,
          position[1] + Math.random() * 2,
          position[2] + (Math.random() - 0.5) * 4
        ],
        velocity: [
          (Math.random() - 0.5) * 0.02,
          Math.random() * 0.05,
          (Math.random() - 0.5) * 0.02
        ],
        life: Math.random(),
        originalLife: Math.random(),
        size: Math.random() * 0.05 + 0.02
      });
    }
    return temp;
  });

  useFrame((state, delta) => {
    if (particlesRef.current) {
      particles.forEach((particle, i) => {
        // Update position
        particle.position[0] += particle.velocity[0];
        particle.position[1] += particle.velocity[1];
        particle.position[2] += particle.velocity[2];
        
        // Update life
        particle.life -= delta * 0.5;
        
        // Reset particle if dead
        if (particle.life <= 0) {
          particle.position = [
            position[0] + (Math.random() - 0.5) * 2,
            position[1],
            position[2] + (Math.random() - 0.5) * 2
          ];
          particle.life = particle.originalLife;
        }
        
        // Update mesh
        const mesh = particlesRef.current.children[i];
        if (mesh) {
          mesh.position.set(...particle.position);
          mesh.material.opacity = particle.life * intensity * 0.5;
          mesh.scale.setScalar(particle.size * (1 + intensity * 0.5));
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
            opacity={particle.life * intensity * 0.5}
          />
        </mesh>
      ))}
    </group>
  );
};

export default TargetZone;