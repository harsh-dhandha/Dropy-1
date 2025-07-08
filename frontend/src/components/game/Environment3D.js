import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useSpring, animated } from '@react-spring/three';
import * as THREE from 'three';

const Environment3D = ({ environment }) => {
  const envRef = useRef();
  
  // Spring animation for environment changes
  const [{ fogColor, fogDensity, lightIntensity }, springApi] = useSpring(() => ({
    fogColor: '#000000',
    fogDensity: 0.01,
    lightIntensity: 0.5,
    config: { tension: 50, friction: 20 }
  }));

  // Environment-specific settings
  React.useEffect(() => {
    const envSettings = {
      minimal: {
        fogColor: '#1a1a1a',
        fogDensity: 0.005,
        lightIntensity: 0.6
      },
      floating: {
        fogColor: '#001133',
        fogDensity: 0.02,
        lightIntensity: 0.4
      },
      mystical: {
        fogColor: '#330066',
        fogDensity: 0.03,
        lightIntensity: 0.3
      },
      dark: {
        fogColor: '#000000',
        fogDensity: 0.05,
        lightIntensity: 0.2
      },
      ethereal: {
        fogColor: '#003366',
        fogDensity: 0.01,
        lightIntensity: 0.7
      }
    };

    const settings = envSettings[environment] || envSettings.minimal;
    springApi.start(settings);
  }, [environment, springApi]);

  // Animated background elements
  useFrame((state) => {
    if (envRef.current) {
      const time = state.clock.elapsedTime;
      
      // Rotate environment elements
      envRef.current.children.forEach((child, index) => {
        if (child.userData.type === 'floatingObject') {
          child.rotation.y = time * 0.1 + index;
          child.position.y = Math.sin(time * 0.5 + index) * 0.5;
        }
      });
    }
  });

  const renderEnvironment = () => {
    switch (environment) {
      case 'minimal':
        return <MinimalEnvironment />;
      case 'floating':
        return <FloatingEnvironment />;
      case 'mystical':
        return <MysticalEnvironment />;
      case 'dark':
        return <DarkEnvironment />;
      case 'ethereal':
        return <EtherealEnvironment />;
      default:
        return <MinimalEnvironment />;
    }
  };

  return (
    <group ref={envRef}>
      {/* Fog effect */}
      <fog
        attach="fog"
        args={[fogColor.get(), 5, 50]}
      />
      
      {/* Environment-specific elements */}
      {renderEnvironment()}
      
      {/* Ambient particles */}
      <AmbientParticles environment={environment} />
    </group>
  );
};

// Minimal environment
const MinimalEnvironment = () => {
  return (
    <group>
      {/* Simple geometric shapes */}
      <mesh position={[-10, 1, -10]}>
        <boxGeometry args={[2, 2, 2]} />
        <meshStandardMaterial color="#333333" />
      </mesh>
      
      <mesh position={[10, 1, -10]}>
        <cylinderGeometry args={[1, 1, 3, 8]} />
        <meshStandardMaterial color="#444444" />
      </mesh>
      
      <mesh position={[0, 1, -15]}>
        <sphereGeometry args={[1.5, 12, 12]} />
        <meshStandardMaterial color="#555555" />
      </mesh>
    </group>
  );
};

// Floating environment
const FloatingEnvironment = () => {
  const floatingRef = useRef();
  
  useFrame((state) => {
    if (floatingRef.current) {
      const time = state.clock.elapsedTime;
      floatingRef.current.children.forEach((child, index) => {
        child.position.y = Math.sin(time * 0.5 + index) * 2;
        child.rotation.y = time * 0.2 + index;
      });
    }
  });

  return (
    <group ref={floatingRef}>
      {/* Floating platforms */}
      <mesh position={[-5, 3, -5]} userData={{ type: 'floatingObject' }}>
        <boxGeometry args={[3, 0.5, 3]} />
        <meshStandardMaterial color="#4a5568" />
      </mesh>
      
      <mesh position={[5, 2, -8]} userData={{ type: 'floatingObject' }}>
        <cylinderGeometry args={[2, 2, 0.5, 16]} />
        <meshStandardMaterial color="#2d3748" />
      </mesh>
      
      <mesh position={[0, 4, -12]} userData={{ type: 'floatingObject' }}>
        <octahedronGeometry args={[1.5]} />
        <meshStandardMaterial color="#1a202c" />
      </mesh>
    </group>
  );
};

// Mystical environment
const MysticalEnvironment = () => {
  const mysticalRef = useRef();
  
  useFrame((state) => {
    if (mysticalRef.current) {
      const time = state.clock.elapsedTime;
      mysticalRef.current.children.forEach((child, index) => {
        child.material.emissiveIntensity = 0.1 + Math.sin(time * 2 + index) * 0.05;
      });
    }
  });

  return (
    <group ref={mysticalRef}>
      {/* Mystical crystals */}
      <mesh position={[-3, 1.5, -6]}>
        <octahedronGeometry args={[1]} />
        <meshStandardMaterial 
          color="#9f7aea" 
          emissive="#9f7aea"
          emissiveIntensity={0.1}
        />
      </mesh>
      
      <mesh position={[4, 2, -8]}>
        <coneGeometry args={[0.8, 3, 6]} />
        <meshStandardMaterial 
          color="#667eea" 
          emissive="#667eea"
          emissiveIntensity={0.1}
        />
      </mesh>
      
      <mesh position={[0, 0.5, -10]}>
        <dodecahedronGeometry args={[1.2]} />
        <meshStandardMaterial 
          color="#f093fb" 
          emissive="#f093fb"
          emissiveIntensity={0.1}
        />
      </mesh>
    </group>
  );
};

// Dark environment
const DarkEnvironment = () => {
  return (
    <group>
      {/* Dark monoliths */}
      <mesh position={[-8, 2, -8]}>
        <boxGeometry args={[1, 4, 1]} />
        <meshStandardMaterial color="#111111" />
      </mesh>
      
      <mesh position={[6, 1.5, -12]}>
        <boxGeometry args={[0.8, 3, 0.8]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      
      <mesh position={[0, 3, -15]}>
        <boxGeometry args={[1.2, 6, 1.2]} />
        <meshStandardMaterial color="#0a0a0a" />
      </mesh>
    </group>
  );
};

// Ethereal environment
const EtherealEnvironment = () => {
  const etherealRef = useRef();
  
  useFrame((state) => {
    if (etherealRef.current) {
      const time = state.clock.elapsedTime;
      etherealRef.current.children.forEach((child, index) => {
        child.material.opacity = 0.3 + Math.sin(time + index) * 0.2;
        child.scale.setScalar(1 + Math.sin(time * 0.5 + index) * 0.1);
      });
    }
  });

  return (
    <group ref={etherealRef}>
      {/* Ethereal shapes */}
      <mesh position={[-4, 2, -6]}>
        <torusGeometry args={[1.5, 0.3, 16, 100]} />
        <meshStandardMaterial 
          color="#e1f5fe" 
          transparent
          opacity={0.4}
        />
      </mesh>
      
      <mesh position={[5, 1, -10]}>
        <torusKnotGeometry args={[1, 0.3, 100, 16]} />
        <meshStandardMaterial 
          color="#f3e5f5" 
          transparent
          opacity={0.5}
        />
      </mesh>
      
      <mesh position={[0, 3, -14]}>
        <icosahedronGeometry args={[1.5]} />
        <meshStandardMaterial 
          color="#e8f5e8" 
          transparent
          opacity={0.3}
        />
      </mesh>
    </group>
  );
};

// Ambient particles
const AmbientParticles = ({ environment }) => {
  const particlesRef = useRef();
  const [particles] = React.useState(() => {
    const temp = [];
    for (let i = 0; i < 100; i++) {
      temp.push({
        position: [
          (Math.random() - 0.5) * 40,
          Math.random() * 10,
          (Math.random() - 0.5) * 40
        ],
        velocity: [
          (Math.random() - 0.5) * 0.01,
          Math.random() * 0.005,
          (Math.random() - 0.5) * 0.01
        ],
        life: Math.random(),
        originalLife: Math.random(),
        size: Math.random() * 0.02 + 0.005
      });
    }
    return temp;
  });

  const getParticleColor = () => {
    const colors = {
      minimal: '#666666',
      floating: '#4a9eff',
      mystical: '#9f7aea',
      dark: '#333333',
      ethereal: '#e1f5fe'
    };
    return colors[environment] || '#666666';
  };

  useFrame((state, delta) => {
    if (particlesRef.current) {
      particles.forEach((particle, i) => {
        // Update position
        particle.position[0] += particle.velocity[0];
        particle.position[1] += particle.velocity[1];
        particle.position[2] += particle.velocity[2];
        
        // Update life
        particle.life -= delta * 0.1;
        
        // Reset particle if dead
        if (particle.life <= 0) {
          particle.position = [
            (Math.random() - 0.5) * 40,
            Math.random() * 10,
            (Math.random() - 0.5) * 40
          ];
          particle.life = particle.originalLife;
        }
        
        // Update mesh
        const mesh = particlesRef.current.children[i];
        if (mesh) {
          mesh.position.set(...particle.position);
          mesh.material.opacity = particle.life * 0.3;
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
            color={getParticleColor()}
            transparent
            opacity={particle.life * 0.3}
          />
        </mesh>
      ))}
    </group>
  );
};

export default Environment3D;