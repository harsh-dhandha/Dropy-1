import React, { useRef, useEffect, useState } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { useParams } from 'react-router-dom';
import { OrbitControls, Environment, Text } from '@react-three/drei';
import { useGame } from '../contexts/GameContext';
import { useAudio } from '../contexts/AudioContext';

// Game Components
import HandController from './game/HandController';
import GameBall from './game/GameBall';
import TargetZone from './game/TargetZone';
import Teleporter from './game/Teleporter';
import EnemyHand from './game/EnemyHand';
import Environment3D from './game/Environment3D';

const GameCanvas = () => {
  const { levelId } = useParams();
  const { gameState, completeLevel, startGameSession } = useGame();
  const { playMusic, playSFX, playVoiceover } = useAudio();
  const { camera, scene } = useThree();
  
  const [gameStarted, setGameStarted] = useState(false);
  const [gameTime, setGameTime] = useState(0);
  const [currentGravity, setCurrentGravity] = useState([0, -9.81, 0]);
  const [ballsInTargets, setBallsInTargets] = useState(new Set());
  const [levelComplete, setLevelComplete] = useState(false);
  const [showVoiceover, setShowVoiceover] = useState(true);
  const [sessionId, setSessionId] = useState(null);
  
  const gameStartTime = useRef(null);
  const gravityShiftTimer = useRef(null);
  const voiceoverTimer = useRef(null);
  
  const currentLevel = gameState.levels.find(l => l.id === levelId);

  // Initialize level
  useEffect(() => {
    if (currentLevel) {
      setCurrentGravity(currentLevel.gravity || [0, -9.81, 0]);
      setGameStarted(false);
      setGameTime(0);
      setBallsInTargets(new Set());
      setLevelComplete(false);
      setShowVoiceover(true);
      
      // Play level music
      playMusic(levelId);
      
      // Start game session
      startGameSession(levelId).then(id => {
        setSessionId(id);
      });
      
      // Show voiceover
      if (currentLevel.voiceover) {
        playVoiceover(levelId);
        voiceoverTimer.current = setTimeout(() => {
          setShowVoiceover(false);
        }, 4000);
      }
      
      // Setup gravity shift timer
      if (currentLevel.gravityShiftTrigger) {
        gravityShiftTimer.current = setTimeout(() => {
          setCurrentGravity(currentLevel.gravityShiftTrigger.newGravity);
          playSFX('gravityShift');
        }, currentLevel.gravityShiftTrigger.time);
      }
    }

    return () => {
      if (gravityShiftTimer.current) {
        clearTimeout(gravityShiftTimer.current);
      }
      if (voiceoverTimer.current) {
        clearTimeout(voiceoverTimer.current);
      }
    };
  }, [currentLevel, levelId, playMusic, playVoiceover, playSFX, startGameSession]);

  // Game timer
  useFrame((state, delta) => {
    if (gameStarted && !levelComplete) {
      const newTime = gameTime + delta * 1000;
      setGameTime(newTime);
      
      // Check time limit
      if (currentLevel.timeLimit && newTime >= currentLevel.timeLimit) {
        // Time's up - restart level
        handleRestart();
      }
    }
  });

  // Check win condition
  useEffect(() => {
    if (currentLevel && ballsInTargets.size === currentLevel.balls.length && !levelComplete) {
      setLevelComplete(true);
      playSFX('levelComplete');
      
      // Record completion
      const gameStats = {
        grabs: 10, // These would be tracked during gameplay
        releases: 8,
        teleports: 2
      };
      
      completeLevel(currentLevel.id, gameTime, gameStats);
    }
  }, [ballsInTargets, currentLevel, levelComplete, gameTime, completeLevel, playSFX]);

  const handleGameStart = () => {
    setGameStarted(true);
    gameStartTime.current = Date.now();
  };

  const handleRestart = () => {
    setGameStarted(false);
    setGameTime(0);
    setBallsInTargets(new Set());
    setLevelComplete(false);
    setCurrentGravity(currentLevel.gravity || [0, -9.81, 0]);
    gameStartTime.current = null;
    
    // Reset gravity shift timer
    if (gravityShiftTimer.current) {
      clearTimeout(gravityShiftTimer.current);
    }
    if (currentLevel.gravityShiftTrigger) {
      gravityShiftTimer.current = setTimeout(() => {
        setCurrentGravity(currentLevel.gravityShiftTrigger.newGravity);
        playSFX('gravityShift');
      }, currentLevel.gravityShiftTrigger.time);
    }
  };

  const handleBallInTarget = (ballId, targetId) => {
    setBallsInTargets(prev => new Set([...prev, ballId]));
  };

  const handleBallOutTarget = (ballId, targetId) => {
    setBallsInTargets(prev => {
      const newSet = new Set(prev);
      newSet.delete(ballId);
      return newSet;
    });
  };

  if (!currentLevel) {
    return (
      <mesh>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="red" />
      </mesh>
    );
  }

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={0.8}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <pointLight position={[0, 5, 0]} intensity={0.5} />

      {/* Environment */}
      <Environment preset="sunset" />
      <Environment3D environment={currentLevel.environment} />

      {/* Camera controls */}
      <OrbitControls
        enablePan={false}
        enableZoom={true}
        enableRotate={true}
        maxPolarAngle={Math.PI / 2}
        minDistance={5}
        maxDistance={20}
      />

      {/* Voiceover text */}
      {showVoiceover && currentLevel.voiceover && (
        <Text
          position={[0, 8, 0]}
          fontSize={0.5}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          maxWidth={10}
        >
          {currentLevel.voiceover}
        </Text>
      )}

      {/* Game elements */}
      <HandController
        onGameStart={handleGameStart}
        gameStarted={gameStarted}
        gravity={currentGravity}
      />

      {/* Balls */}
      {currentLevel.balls.map(ball => (
        <GameBall
          key={ball.id}
          ballId={ball.id}
          initialPosition={ball.position}
          color={ball.color}
          gravity={currentGravity}
          onTargetEnter={handleBallInTarget}
          onTargetExit={handleBallOutTarget}
        />
      ))}

      {/* Targets */}
      {currentLevel.targets.map(target => (
        <TargetZone
          key={target.id}
          targetId={target.id}
          position={target.position}
          size={target.size}
        />
      ))}

      {/* Teleporters */}
      {currentLevel.teleporters?.map(teleporter => (
        <Teleporter
          key={teleporter.id}
          teleporterId={teleporter.id}
          position={teleporter.position}
          linkedTo={teleporter.linkedTo}
          color={teleporter.color}
          teleporters={currentLevel.teleporters}
        />
      ))}

      {/* Enemy hands */}
      {currentLevel.enemyHands?.map(enemy => (
        <EnemyHand
          key={enemy.id}
          enemyId={enemy.id}
          initialPosition={enemy.position}
          behavior={enemy.behavior}
          patrolPath={enemy.patrolPath}
        />
      ))}

      {/* Ground plane */}
      <mesh position={[0, -1, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#2a2a2a" />
      </mesh>

      {/* Win condition display */}
      {levelComplete && (
        <Text
          position={[0, 6, 0]}
          fontSize={1}
          color="#00ff00"
          anchorX="center"
          anchorY="middle"
        >
          LEVEL COMPLETE!
        </Text>
      )}
    </>
  );
};

export default GameCanvas;