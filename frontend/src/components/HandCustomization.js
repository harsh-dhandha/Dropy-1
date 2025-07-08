import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useGame } from '../contexts/GameContext';
import { useAudio } from '../contexts/AudioContext';
import { mockHandSkins } from '../data/mock';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { ArrowLeft, Lock, Check } from 'lucide-react';

const HandCustomization = () => {
  const navigate = useNavigate();
  const { gameState, dispatch, isHandSkinUnlocked } = useGame();
  const { playSFX } = useAudio();
  const [selectedSkin, setSelectedSkin] = useState(gameState.selectedHandSkin);

  const handleBack = () => {
    playSFX('release');
    navigate('/');
  };

  const handleSkinSelect = (skinId) => {
    if (isHandSkinUnlocked(skinId)) {
      setSelectedSkin(skinId);
      playSFX('grab');
    } else {
      playSFX('release');
    }
  };

  const handleApply = () => {
    if (selectedSkin !== gameState.selectedHandSkin) {
      dispatch({ type: 'SELECT_HAND_SKIN', payload: selectedSkin });
      playSFX('levelComplete');
    }
    navigate('/');
  };

  const selectedSkinData = mockHandSkins.find(skin => skin.id === selectedSkin);

  return (
    <div className="hand-customization min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      {/* Header */}
      <motion.div
        className="flex items-center justify-between mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Button
          onClick={handleBack}
          variant="ghost"
          className="text-gray-400 hover:text-white"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Menu
        </Button>
        
        <h1 className="text-4xl font-bold text-white">
          Hand
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
            Customization
          </span>
        </h1>
        
        <div className="text-right">
          <div className="text-sm text-gray-400">Unlocked Skins</div>
          <div className="text-2xl font-bold text-white">
            {gameState.unlockedHandSkins.length}/{mockHandSkins.length}
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {/* Hand Preview */}
        <motion.div
          className="lg:col-span-1"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-purple-500/50 h-96">
            <CardHeader>
              <CardTitle className="text-white text-center">Preview</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="h-64 w-full">
                <Canvas camera={{ position: [0, 0, 3], fov: 60 }}>
                  <ambientLight intensity={0.6} />
                  <directionalLight position={[5, 5, 5]} intensity={0.8} />
                  <HandPreview skinData={selectedSkinData} />
                  <OrbitControls 
                    enableZoom={true}
                    enablePan={false}
                    maxDistance={5}
                    minDistance={1}
                  />
                </Canvas>
              </div>
            </CardContent>
          </Card>

          {/* Selected skin info */}
          <motion.div
            className="mt-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card className="bg-black/50 border-purple-500/50">
              <CardContent className="p-4">
                <h3 className="text-xl font-bold text-white mb-2">
                  {selectedSkinData?.name}
                </h3>
                <p className="text-gray-300 text-sm mb-3">
                  {selectedSkinData?.description}
                </p>
                <div className="flex items-center justify-between">
                  <Badge 
                    variant={isHandSkinUnlocked(selectedSkin) ? 'default' : 'secondary'}
                    className={isHandSkinUnlocked(selectedSkin) ? 'bg-green-600' : 'bg-gray-600'}
                  >
                    {isHandSkinUnlocked(selectedSkin) ? (
                      <>
                        <Check className="h-3 w-3 mr-1" />
                        Unlocked
                      </>
                    ) : (
                      <>
                        <Lock className="h-3 w-3 mr-1" />
                        Locked
                      </>
                    )}
                  </Badge>
                  
                  <Button
                    onClick={handleApply}
                    disabled={!isHandSkinUnlocked(selectedSkin)}
                    className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600"
                  >
                    {selectedSkin === gameState.selectedHandSkin ? 'Current' : 'Apply'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Skin Selection Grid */}
        <motion.div
          className="lg:col-span-2"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {mockHandSkins.map((skin, index) => {
              const unlocked = isHandSkinUnlocked(skin.id);
              const isSelected = selectedSkin === skin.id;
              const isCurrent = skin.id === gameState.selectedHandSkin;
              
              return (
                <motion.div
                  key={skin.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  whileHover={{ scale: unlocked ? 1.05 : 1 }}
                  whileTap={{ scale: unlocked ? 0.95 : 1 }}
                >
                  <Card
                    className={`
                      relative cursor-pointer transition-all duration-300 h-48
                      ${unlocked 
                        ? `bg-gradient-to-br from-gray-700 to-gray-800 border-purple-500/50 hover:border-purple-400 shadow-lg hover:shadow-xl` 
                        : 'bg-gray-800/50 border-gray-700 opacity-60'
                      }
                      ${isSelected ? 'ring-2 ring-purple-500' : ''}
                      ${isCurrent ? 'ring-2 ring-green-500' : ''}
                    `}
                    onClick={() => handleSkinSelect(skin.id)}
                  >
                    {/* Skin preview */}
                    <div className="h-24 w-full mb-2">
                      <Canvas camera={{ position: [0, 0, 2], fov: 60 }}>
                        <ambientLight intensity={0.6} />
                        <directionalLight position={[2, 2, 2]} intensity={0.8} />
                        <HandPreview skinData={skin} scale={0.8} />
                      </Canvas>
                    </div>

                    <CardContent className="p-3">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold text-white">
                          {skin.name}
                        </h3>
                        {isCurrent && (
                          <Badge className="bg-green-600 text-xs">
                            Current
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-gray-300 text-xs mb-3 line-clamp-2">
                        {skin.description}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <Badge 
                          variant={unlocked ? 'default' : 'secondary'}
                          className={`text-xs ${unlocked ? 'bg-green-600' : 'bg-gray-600'}`}
                        >
                          {unlocked ? (
                            <>
                              <Check className="h-3 w-3 mr-1" />
                              Unlocked
                            </>
                          ) : (
                            <>
                              <Lock className="h-3 w-3 mr-1" />
                              Locked
                            </>
                          )}
                        </Badge>
                      </div>
                    </CardContent>

                    {/* Selection indicator */}
                    {isSelected && (
                      <div className="absolute top-2 right-2">
                        <div className="w-4 h-4 bg-purple-500 rounded-full flex items-center justify-center">
                          <Check className="h-2 w-2 text-white" />
                        </div>
                      </div>
                    )}

                    {/* Lock overlay */}
                    {!unlocked && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <div className="text-center">
                          <Lock className="h-8 w-8 text-gray-500 mx-auto mb-2" />
                          <p className="text-xs text-gray-400">
                            Complete levels to unlock
                          </p>
                        </div>
                      </div>
                    )}
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Floating background elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute top-1/4 left-1/4 w-20 h-20 bg-purple-500/5 rounded-full blur-xl"
          animate={{
            y: [0, -30, 0],
            x: [0, 20, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-32 h-32 bg-pink-500/5 rounded-full blur-xl"
          animate={{
            y: [0, 20, 0],
            x: [0, -15, 0],
            scale: [1.2, 1, 1.2],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>
    </div>
  );
};

// Hand preview component for 3D canvas
const HandPreview = ({ skinData, scale = 1 }) => {
  const handRef = React.useRef();
  
  React.useEffect(() => {
    if (handRef.current && skinData) {
      // Apply skin properties
      handRef.current.material.color.setHex(skinData.color.replace('#', '0x'));
      handRef.current.material.metalness = skinData.metallic || 0;
      handRef.current.material.roughness = skinData.roughness || 0.5;
      handRef.current.material.transparent = skinData.opacity !== undefined;
      handRef.current.material.opacity = skinData.opacity || 1;
    }
  }, [skinData]);

  return (
    <group scale={[scale, scale, scale]}>
      {/* Simplified hand model for preview */}
      <mesh ref={handRef} rotation={[0, 0, 0.3]}>
        <boxGeometry args={[0.6, 0.3, 0.8]} />
        <meshPhongMaterial 
          color={skinData?.color || '#fdbcb4'}
          metalness={skinData?.metallic || 0}
          roughness={skinData?.roughness || 0.5}
          transparent={skinData?.opacity !== undefined}
          opacity={skinData?.opacity || 1}
        />
      </mesh>
      
      {/* Simplified fingers */}
      {[0, 1, 2, 3].map((index) => (
        <mesh 
          key={index}
          position={[
            -0.25 + index * 0.15,
            0.2,
            0.3
          ]}
          rotation={[0, 0, -0.3 + index * 0.2]}
        >
          <cylinderGeometry args={[0.04, 0.06, 0.4, 8]} />
          <meshPhongMaterial 
            color={skinData?.color || '#fdbcb4'}
            metalness={skinData?.metallic || 0}
            roughness={skinData?.roughness || 0.5}
            transparent={skinData?.opacity !== undefined}
            opacity={skinData?.opacity || 1}
          />
        </mesh>
      ))}
      
      {/* Thumb */}
      <mesh position={[-0.35, 0, 0]} rotation={[0, 0, -0.8]}>
        <cylinderGeometry args={[0.04, 0.06, 0.3, 8]} />
        <meshPhongMaterial 
          color={skinData?.color || '#fdbcb4'}
          metalness={skinData?.metallic || 0}
          roughness={skinData?.roughness || 0.5}
          transparent={skinData?.opacity !== undefined}
          opacity={skinData?.opacity || 1}
        />
      </mesh>
    </group>
  );
};

export default HandCustomization;