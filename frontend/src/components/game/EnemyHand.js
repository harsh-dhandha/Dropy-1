import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useBox } from '@react-three/cannon';
import { useSpring, animated } from '@react-spring/three';
import * as THREE from 'three';

const EnemyHand = ({ enemyId, initialPosition, behavior, patrolPath }) => {
  const enemyRef = useRef();
  const [currentTarget, setCurrentTarget] = useState(0);
  const [isChasing, setIsChasing] = useState(false);
  const [playerPosition, setPlayerPosition] = useState([0, 0, 0]);
  
  // Physics body
  const [enemyBody, enemyApi] = useBox(() => ({
    position: initialPosition,
    args: [0.4, 0.4, 0.4],
    type: 'Kinematic',
    mass: 0
  }));

  // Spring animation for enemy effects
  const [{ scale, rotation, color }, springApi] = useSpring(() => ({
    scale: [1, 1, 1],
    rotation: [0, 0, 0],
    color: '#ff4444',
    config: { tension: 150, friction: 20 }
  }));

  // AI behavior
  useFrame((state, delta) => {
    if (!enemyRef.current) return;
    
    const time = state.clock.elapsedTime;
    
    if (behavior === 'patrol' && patrolPath) {
      // Patrol behavior
      const target = patrolPath[currentTarget];
      const currentPos = enemyRef.current.position;
      
      // Move towards target
      const direction = new THREE.Vector3(target[0] - currentPos.x, target[1] - currentPos.y, target[2] - currentPos.z);
      const distance = direction.length();
      
      if (distance < 0.5) {
        // Reached target, move to next
        setCurrentTarget((prev) => (prev + 1) % patrolPath.length);
      } else {
        // Move towards target
        direction.normalize();
        const newPos = [
          currentPos.x + direction.x * delta * 2,
          currentPos.y + direction.y * delta * 2,
          currentPos.z + direction.z * delta * 2
        ];
        
        enemyApi.position.set(newPos[0], newPos[1], newPos[2]);
      }
      
      // Menacing animation
      springApi.start({
        scale: [1 + Math.sin(time * 3) * 0.1, 1 + Math.sin(time * 3) * 0.1, 1 + Math.sin(time * 3) * 0.1],
        rotation: [0, time * 0.5, 0],
        color: isChasing ? '#ff0000' : '#ff4444'
      });
    }
  });

  // Detect player proximity
  useFrame(() => {
    if (enemyRef.current && playerPosition) {
      const distance = enemyRef.current.position.distanceTo(new THREE.Vector3(...playerPosition));
      
      if (distance < 3 && !isChasing) {
        setIsChasing(true);
        springApi.start({
          scale: [1.3, 1.3, 1.3],
          color: '#ff0000'
        });
      } else if (distance > 5 && isChasing) {
        setIsChasing(false);
        springApi.start({
          scale: [1, 1, 1],
          color: '#ff4444'
        });
      }
    }
  });

  return (
    <group>
      {/* Physics body */}
      <mesh ref={enemyBody} visible={false}>
        <boxGeometry args={[0.4, 0.4, 0.4]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      {/* Visual enemy hand */}
      <animated.group 
        ref={enemyRef} 
        position={initialPosition}
        scale={scale}
        rotation={rotation}
      >
        <ShadowHandModel color={color} isChasing={isChasing} />
        
        {/* Warning indicator */}
        {isChasing && (
          <WarningIndicator />
        )}
      </animated.group>

      {/* Shadow trail */}
      <ShadowTrail position={initialPosition} isChasing={isChasing} />
    </group>
  );
};

// Shadow hand model
const ShadowHandModel = ({ color, isChasing }) => {
  const handRef = useRef();
  
  useFrame((state) => {
    if (handRef.current) {
      const time = state.clock.elapsedTime;
      // Menacing claw gestures
      handRef.current.rotation.z = Math.sin(time * 4) * 0.3;
      handRef.current.rotation.x = Math.sin(time * 2) * 0.2;
    }
  });

  return (
    <group ref={handRef}>
      {/* Palm */}
      <mesh castShadow>
        <boxGeometry args={[0.6, 0.3, 0.8]} />
        <animated.meshPhongMaterial
          color={color}
          transparent
          opacity={0.8}
          emissive={color}
          emissiveIntensity={isChasing ? 0.3 : 0.1}
        />
      </mesh>
      
      {/* Claws */}
      {[0, 1, 2, 3].map((index) => (
        <ClawFinger
          key={index}
          index={index}
          color={color}
          isChasing={isChasing}
        />
      ))}
      
      {/* Thumb claw */}
      <ClawFinger
        index={4}
        color={color}
        isChasing={isChasing}
        isThumb={true}
      />
    </group>
  );
};

// Individual claw finger
const ClawFinger = ({ index, color, isChasing, isThumb = false }) => {
  const fingerRef = useRef();
  const positions = [
    [-0.3, 0.2, 0.3],
    [-0.1, 0.2, 0.4],
    [0.1, 0.2, 0.4],
    [0.3, 0.2, 0.3],
    [-0.4, 0, 0] // thumb
  ];
  
  useFrame((state) => {
    if (fingerRef.current) {
      const time = state.clock.elapsedTime;
      const offset = index * 0.3;
      
      // Menacing claw animation
      fingerRef.current.children.forEach((segment, segIndex) => {
        const curl = isChasing ? 0.8 : 0.3;
        const movement = Math.sin(time * 3 + offset) * 0.2;
        segment.rotation.z = curl + movement;
      });
    }
  });

  return (
    <group ref={fingerRef} position={positions[index]}>
      {/* Finger segments */}
      {[0, 1, 2].map((segIndex) => (
        <group key={segIndex} position={[0, segIndex * 0.3, 0]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.05, 0.08, 0.3, 6]} />
            <animated.meshPhongMaterial
              color={color}
              transparent
              opacity={0.9}
              emissive={color}
              emissiveIntensity={isChasing ? 0.2 : 0.1}
            />
          </mesh>
          
          {/* Sharp claw tip */}
          {segIndex === 2 && (
            <mesh position={[0, 0.2, 0]} castShadow>
              <coneGeometry args={[0.03, 0.2, 6]} />
              <animated.meshPhongMaterial
                color={color}
                transparent
                opacity={0.9}
                emissive={color}
                emissiveIntensity={isChasing ? 0.4 : 0.2}
              />
            </mesh>
          )}
        </group>
      ))}
    </group>
  );
};

// Warning indicator
const WarningIndicator = () => {
  const warningRef = useRef();
  
  useFrame((state) => {
    if (warningRef.current) {
      const time = state.clock.elapsedTime;
      warningRef.current.rotation.z = time * 4;
      warningRef.current.scale.setScalar(1 + Math.sin(time * 8) * 0.2);
    }
  });

  return (
    <group ref={warningRef} position={[0, 1, 0]}>
      <mesh>
        <ringGeometry args={[0.3, 0.5, 3]} />
        <meshBasicMaterial 
          color="#ff0000"
          transparent
          opacity={0.8}
        />
      </mesh>
    </group>
  );
};

// Shadow trail effect
const ShadowTrail = ({ position, isChasing }) => {
  const trailRef = useRef();
  const [trailPoints, setTrailPoints] = useState([]);
  
  useFrame(() => {
    if (trailRef.current) {
      // Add new trail point
      setTrailPoints(prev => {
        const newPoints = [...prev, { pos: [...position], time: Date.now() }];
        // Keep only recent points
        return newPoints.filter(point => Date.now() - point.time < 1000);
      });
    }
  });

  return (
    <group ref={trailRef}>
      {trailPoints.map((point, index) => {
        const alpha = 1 - (Date.now() - point.time) / 1000;
        const size = 0.1 * alpha;
        
        return (
          <mesh key={point.time} position={[point.pos[0], point.pos[1], point.pos[2] - 0.3]}>
            <sphereGeometry args={[size, 6, 6]} />
            <meshBasicMaterial
              color={isChasing ? "#ff0000" : "#ff4444"}
              transparent
              opacity={alpha * 0.3}
            />
          </mesh>
        );
      })}
    </group>
  );
};

export default EnemyHand;