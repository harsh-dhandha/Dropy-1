import React, { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useSphere } from '@react-three/cannon';
import { useSpring, animated } from '@react-spring/three';
import * as THREE from 'three';

const GameBall = ({ ballId, initialPosition, color, gravity, onTargetEnter, onTargetExit }) => {
  const ballRef = useRef();
  const [isGrabbed, setIsGrabbed] = useState(false);
  const [isInTarget, setIsInTarget] = useState(false);
  const [ballBody, ballApi] = useSphere(() => ({
    mass: 1,
    position: initialPosition,
    args: [0.3], // radius
    material: { friction: 0.4, restitution: 0.6 }
  }));

  // Visual ball with spring animation
  const [{ scale, rotation }, springApi] = useSpring(() => ({
    scale: [1, 1, 1],
    rotation: [0, 0, 0],
    config: { mass: 1, tension: 150, friction: 20 }
  }));

  // Update gravity when it changes
  useEffect(() => {
    if (ballApi.velocity) {
      ballApi.velocity.set(0, 0, 0);
    }
  }, [gravity, ballApi]);

  // Handle grab/release interactions
  useEffect(() => {
    const handleGrab = () => {
      setIsGrabbed(true);
      ballApi.mass.set(0); // Make kinematic when grabbed
      springApi.start({
        scale: [1.2, 1.2, 1.2],
        config: { tension: 300, friction: 15 }
      });
    };

    const handleRelease = () => {
      setIsGrabbed(false);
      ballApi.mass.set(1); // Return to dynamic
      springApi.start({
        scale: [1, 1, 1],
        config: { tension: 200, friction: 20 }
      });
    };

    // Listen for grab events (would be triggered by hand controller)
    const handleMouseDown = (event) => {
      if (event.button === 0) { // Left click
        // Check if mouse is near ball (simplified interaction)
        const rect = event.target.getBoundingClientRect();
        const mouseX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        const mouseY = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        
        // This is a simplified grab detection - in a real game,
        // you'd use proper raycasting or collision detection
        if (ballRef.current) {
          const ballPos = ballRef.current.position;
          const distance = Math.sqrt(
            Math.pow(mouseX * 10 - ballPos.x, 2) + 
            Math.pow(mouseY * 10 - ballPos.y, 2)
          );
          
          if (distance < 2) {
            handleGrab();
          }
        }
      }
    };

    const handleMouseUp = (event) => {
      if (event.button === 0 && isGrabbed) {
        handleRelease();
      }
    };

    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isGrabbed, ballApi, springApi]);

  // Target detection
  useFrame(() => {
    if (ballRef.current) {
      const ballPos = ballRef.current.position;
      
      // Check if ball is in target zone (simplified)
      // In a real implementation, you'd use proper collision detection
      const targetDistance = Math.sqrt(
        Math.pow(ballPos.x - 3, 2) + 
        Math.pow(ballPos.y - 0.5, 2) + 
        Math.pow(ballPos.z - 0, 2)
      );
      
      if (targetDistance < 1.5 && !isInTarget) {
        setIsInTarget(true);
        onTargetEnter(ballId, 'target1');
      } else if (targetDistance >= 1.5 && isInTarget) {
        setIsInTarget(false);
        onTargetExit(ballId, 'target1');
      }
    }
  });

  // Spinning animation
  useFrame((state) => {
    if (ballRef.current && !isGrabbed) {
      ballRef.current.rotation.x += 0.01;
      ballRef.current.rotation.y += 0.005;
    }
  });

  // Particle effects
  const ParticleEffect = ({ color, intensity }) => {
    const particlesRef = useRef();
    const [particles] = useState(() => {
      const temp = [];
      for (let i = 0; i < 20; i++) {
        temp.push({
          position: [
            (Math.random() - 0.5) * 2,
            (Math.random() - 0.5) * 2,
            (Math.random() - 0.5) * 2
          ],
          velocity: [
            (Math.random() - 0.5) * 0.1,
            (Math.random() - 0.5) * 0.1,
            (Math.random() - 0.5) * 0.1
          ],
          life: Math.random()
        });
      }
      return temp;
    });

    useFrame((state, delta) => {
      if (particlesRef.current) {
        particles.forEach((particle, i) => {
          particle.position[0] += particle.velocity[0];
          particle.position[1] += particle.velocity[1];
          particle.position[2] += particle.velocity[2];
          particle.life -= delta;
          
          if (particle.life <= 0) {
            particle.position = [
              (Math.random() - 0.5) * 0.5,
              (Math.random() - 0.5) * 0.5,
              (Math.random() - 0.5) * 0.5
            ];
            particle.life = 1;
          }
        });
      }
    });

    return (
      <group ref={particlesRef}>
        {particles.map((particle, i) => (
          <mesh key={i} position={particle.position}>
            <sphereGeometry args={[0.02, 4, 4]} />
            <meshBasicMaterial 
              color={color}
              transparent
              opacity={particle.life * intensity}
            />
          </mesh>
        ))}
      </group>
    );
  };

  return (
    <group>
      {/* Physics body */}
      <animated.mesh
        ref={ballBody}
        castShadow
        receiveShadow
        scale={scale}
        rotation={rotation}
        onClick={(e) => {
          e.stopPropagation();
          // Handle click interaction
        }}
      >
        <sphereGeometry args={[0.3, 32, 32]} />
        <meshPhongMaterial 
          color={color}
          transparent
          opacity={0.9}
          emissive={isGrabbed ? color : '#000000'}
          emissiveIntensity={isGrabbed ? 0.1 : 0}
        />
      </animated.mesh>
      
      {/* Visual reference for physics body */}
      <mesh ref={ballRef} position={initialPosition} visible={false}>
        <sphereGeometry args={[0.3]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      {/* Glow effect when grabbed */}
      {isGrabbed && (
        <mesh position={initialPosition}>
          <sphereGeometry args={[0.4, 16, 16]} />
          <meshBasicMaterial 
            color={color}
            transparent
            opacity={0.3}
            side={THREE.BackSide}
          />
        </mesh>
      )}

      {/* Particle effects */}
      {isGrabbed && (
        <ParticleEffect color={color} intensity={0.6} />
      )}
      
      {isInTarget && (
        <ParticleEffect color="#00ff00" intensity={0.4} />
      )}
    </group>
  );
};

export default GameBall;