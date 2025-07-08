import React, { useRef, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useSpring, animated } from '@react-spring/three';
import { Text } from '@react-three/drei';
import { useBox } from '@react-three/cannon';
import { useGame } from '../../contexts/GameContext';
import { useAudio } from '../../contexts/AudioContext';
import * as THREE from 'three';

const HandController = ({ onGameStart, gameStarted, gravity }) => {
  const { gameState, getHandSkin } = useGame();
  const { playSFX } = useAudio();
  const { camera, mouse, viewport } = useThree();
  
  const handRef = useRef();
  const [mousePos, setMousePos] = useState([0, 0]);
  const [isGrabbing, setIsGrabbing] = useState(false);
  const [grabbedObject, setGrabbedObject] = useState(null);
  const [showInstructions, setShowInstructions] = useState(true);
  
  const handSkin = getHandSkin(gameState.selectedHandSkin);
  
  // Hand physics body (invisible collision box)
  const [handBody, handApi] = useBox(() => ({
    mass: 0,
    position: [0, 2, 0],
    args: [0.3, 0.3, 0.3],
    type: 'Kinematic'
  }));

  // Smooth hand movement with spring animation
  const [{ position, rotation, scale }, springApi] = useSpring(() => ({
    position: [0, 2, 0],
    rotation: [0, 0, 0],
    scale: isGrabbing ? [1.2, 1.2, 1.2] : [1, 1, 1],
    config: { mass: 1, tension: 150, friction: 20 }
  }));

  // Mouse tracking
  useFrame((state) => {
    if (!gameStarted && !showInstructions) return;
    
    // Convert mouse position to world coordinates
    const vector = new THREE.Vector3(mouse.x, mouse.y, 0.5);
    vector.unproject(camera);
    
    const dir = vector.sub(camera.position).normalize();
    const distance = -camera.position.z / dir.z;
    const pos = camera.position.clone().add(dir.multiplyScalar(distance));
    
    // Smooth hand movement
    const targetX = pos.x;
    const targetY = Math.max(pos.y, 0.5); // Keep hand above ground
    const targetZ = 0;
    
    // Update physics body position
    handApi.position.set(targetX, targetY, targetZ);
    
    // Update visual hand position with spring animation
    springApi.start({
      position: [targetX, targetY, targetZ],
      rotation: [
        -mouse.y * 0.3,
        mouse.x * 0.3,
        isGrabbing ? 0.2 : 0
      ],
      scale: isGrabbing ? [1.3, 1.3, 1.3] : [1, 1, 1]
    });
    
    setMousePos([targetX, targetY]);
  });

  // Handle mouse events
  useEffect(() => {
    const handleMouseDown = (e) => {
      if (e.button === 0) { // Left click
        setIsGrabbing(true);
        playSFX('grab');
        
        if (!gameStarted) {
          onGameStart();
          setShowInstructions(false);
        }
      }
    };

    const handleMouseUp = (e) => {
      if (e.button === 0) { // Left click
        setIsGrabbing(false);
        playSFX('release');
        
        if (grabbedObject) {
          setGrabbedObject(null);
        }
      }
    };

    const handleContextMenu = (e) => {
      e.preventDefault(); // Prevent right-click menu
    };

    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('contextmenu', handleContextMenu);

    return () => {
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [gameStarted, onGameStart, playSFX, grabbedObject]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        setIsGrabbing(!isGrabbing);
        playSFX(isGrabbing ? 'release' : 'grab');
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isGrabbing, playSFX]);

  // Idle animation
  const idleAnimation = useSpring({
    rotation: isGrabbing ? [0, 0, 0] : [
      Math.sin(Date.now() * 0.001) * 0.1,
      Math.cos(Date.now() * 0.0008) * 0.1,
      Math.sin(Date.now() * 0.0012) * 0.05
    ],
    config: { mass: 1, tension: 50, friction: 10 },
    loop: !isGrabbing
  });

  return (
    <group>
      {/* Invisible physics body */}
      <mesh ref={handBody} visible={false}>
        <boxGeometry args={[0.3, 0.3, 0.3]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      {/* Visual hand */}
      <animated.group
        ref={handRef}
        position={position}
        rotation={rotation}
        scale={scale}
      >
        <DetailedHandModel
          handSkin={handSkin}
          isGrabbing={isGrabbing}
          mousePos={mousePos}
        />
      </animated.group>

      {/* Instructions */}
      {showInstructions && (
        <Text
          position={[0, 4, 0]}
          fontSize={0.6}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          maxWidth={8}
        >
          Click and drag to control your hand
          {'\n'}
          Left click to grab, release to drop
          {'\n'}
          Use spacebar for grab/release
        </Text>
      )}

      {/* Hand trail effect */}
      <HandTrail mousePos={mousePos} isGrabbing={isGrabbing} />
    </group>
  );
};

// Detailed hand model with finger articulation
const DetailedHandModel = ({ handSkin, isGrabbing, mousePos }) => {
  const groupRef = useRef();
  
  useFrame((state) => {
    if (groupRef.current) {
      // Subtle idle movements
      groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.05;
    }
  });

  const getHandMaterial = () => {
    const material = new THREE.MeshPhongMaterial({
      color: handSkin.color,
      transparent: handSkin.opacity !== undefined,
      opacity: handSkin.opacity || 1,
      metalness: handSkin.metallic || 0,
      roughness: handSkin.roughness || 0.5
    });
    
    // Add texture effects based on skin type
    if (handSkin.texture === 'metal') {
      material.metalness = 0.9;
      material.roughness = 0.1;
    } else if (handSkin.texture === 'glass') {
      material.transparent = true;
      material.opacity = 0.7;
      material.refractionRatio = 0.98;
    } else if (handSkin.texture === 'wood') {
      material.roughness = 0.9;
      material.metalness = 0;
    }
    
    return material;
  };

  return (
    <group ref={groupRef}>
      {/* Palm */}
      <mesh position={[0, 0, 0]} castShadow>
        <boxGeometry args={[0.6, 0.3, 0.8]} />
        <primitive object={getHandMaterial()} />
      </mesh>
      
      {/* Fingers */}
      <FingerGroup
        isGrabbing={isGrabbing}
        handSkin={handSkin}
        fingerIndex={0}
        position={[-0.3, 0.2, 0.3]}
        rotation={[0, 0, -0.3]}
      />
      <FingerGroup
        isGrabbing={isGrabbing}
        handSkin={handSkin}
        fingerIndex={1}
        position={[-0.1, 0.2, 0.4]}
        rotation={[0, 0, -0.1]}
      />
      <FingerGroup
        isGrabbing={isGrabbing}
        handSkin={handSkin}
        fingerIndex={2}
        position={[0.1, 0.2, 0.4]}
        rotation={[0, 0, 0.1]}
      />
      <FingerGroup
        isGrabbing={isGrabbing}
        handSkin={handSkin}
        fingerIndex={3}
        position={[0.3, 0.2, 0.3]}
        rotation={[0, 0, 0.3]}
      />
      
      {/* Thumb */}
      <FingerGroup
        isGrabbing={isGrabbing}
        handSkin={handSkin}
        fingerIndex={4}
        position={[-0.4, 0, 0]}
        rotation={[0, 0, -0.8]}
        isThumb={true}
      />
      
      {/* Wrist */}
      <mesh position={[0, -0.3, 0]} castShadow>
        <cylinderGeometry args={[0.25, 0.3, 0.4, 12]} />
        <primitive object={getHandMaterial()} />
      </mesh>
    </group>
  );
};

// Individual finger with segments
const FingerGroup = ({ isGrabbing, handSkin, fingerIndex, position, rotation, isThumb = false }) => {
  const fingerRef = useRef();
  const segments = isThumb ? 2 : 3;
  
  const getHandMaterial = () => {
    return new THREE.MeshPhongMaterial({
      color: handSkin.color,
      transparent: handSkin.opacity !== undefined,
      opacity: handSkin.opacity || 1,
      metalness: handSkin.metallic || 0,
      roughness: handSkin.roughness || 0.5
    });
  };

  useFrame((state) => {
    if (fingerRef.current) {
      // Finger curl animation based on grab state
      const curlAmount = isGrabbing ? 0.8 : 0.2;
      const time = state.clock.elapsedTime;
      const fingerOffset = fingerIndex * 0.1;
      
      fingerRef.current.children.forEach((segment, index) => {
        const segmentCurl = curlAmount * (index + 1) / segments;
        const idleMovement = Math.sin(time * 0.5 + fingerOffset) * 0.1;
        segment.rotation.z = segmentCurl + idleMovement;
      });
    }
  });

  return (
    <group ref={fingerRef} position={position} rotation={rotation}>
      {Array.from({ length: segments }, (_, i) => (
        <group key={i} position={[0, i * 0.3, 0]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.06, 0.08, 0.3, 8]} />
            <primitive object={getHandMaterial()} />
          </mesh>
          {/* Finger joint */}
          <mesh position={[0, 0.15, 0]} castShadow>
            <sphereGeometry args={[0.05, 8, 8]} />
            <primitive object={getHandMaterial()} />
          </mesh>
        </group>
      ))}
    </group>
  );
};

// Hand trail effect
const HandTrail = ({ mousePos, isGrabbing }) => {
  const trailRef = useRef();
  const [trailPoints, setTrailPoints] = useState([]);
  
  useFrame(() => {
    if (mousePos && trailRef.current) {
      // Add new point to trail
      setTrailPoints(prev => {
        const newPoints = [...prev, { pos: [...mousePos], time: Date.now() }];
        // Keep only recent points
        return newPoints.filter(point => Date.now() - point.time < 500);
      });
    }
  });

  return (
    <group ref={trailRef}>
      {trailPoints.map((point, index) => {
        const alpha = 1 - (Date.now() - point.time) / 500;
        const size = 0.02 + (isGrabbing ? 0.05 : 0.02) * alpha;
        
        return (
          <mesh key={point.time} position={[point.pos[0], point.pos[1], -0.5]}>
            <sphereGeometry args={[size, 6, 6]} />
            <meshBasicMaterial
              color={isGrabbing ? "#ff6b6b" : "#4ecdc4"}
              transparent
              opacity={alpha * 0.6}
            />
          </mesh>
        );
      })}
    </group>
  );
};

export default HandController;