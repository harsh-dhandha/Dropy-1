import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useGame } from '../contexts/GameContext';
import { useAudio } from '../contexts/AudioContext';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import LoadingScreen from './LoadingScreen';

const MainMenu = () => {
  const navigate = useNavigate();
  const { gameState, getLevelProgress } = useGame();
  const { playMusic, playSFX } = useAudio();

  useEffect(() => {
    if (gameState.dataLoaded) {
      playMusic('menu');
    }
  }, [playMusic, gameState.dataLoaded]);

  // Show loading screen while data is loading
  if (gameState.loading || !gameState.dataLoaded) {
    return <LoadingScreen />;
  }

  // Show error state if there's an error
  if (gameState.error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-red-400 mb-4">Connection Error</h1>
          <p className="text-gray-300 mb-8">{gameState.error.message}</p>
          <Button onClick={() => window.location.reload()} className="bg-purple-600 hover:bg-purple-700">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const handlePlayClick = () => {
    playSFX('grab');
    navigate('/levels');
  };

  const handleCustomizationClick = () => {
    playSFX('grab');
    navigate('/customization');
  };

  const handleSettingsClick = () => {
    playSFX('grab');
    navigate('/settings');
  };

  const progressPercentage = getLevelProgress();

  return (
    <div className="main-menu min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-1/4 left-1/4 w-32 h-32 bg-purple-500/20 rounded-full blur-xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-blue-500/20 rounded-full blur-xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 w-24 h-24 bg-pink-500/20 rounded-full blur-xl"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.4, 0.8, 0.4],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      <motion.div
        className="relative z-10 text-center space-y-8"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        {/* Title */}
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          <h1 className="text-7xl font-bold text-white mb-2 tracking-tight">
            Hand of
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              Gravity
            </span>
          </h1>
          <p className="text-xl text-gray-300 max-w-md mx-auto">
            Reach through the void and bend reality with your touch
          </p>
        </motion.div>

        {/* Progress indicator */}
        {progressPercentage > 0 && (
          <motion.div
            className="w-64 mx-auto"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 1 }}
          >
            <Card className="bg-black/30 border-purple-500/50">
              <CardContent className="p-4">
                <div className="text-sm text-gray-300 mb-2">Progress</div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {Math.round(progressPercentage)}% Complete
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Menu buttons */}
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.5 }}
        >
          <Button
            onClick={handlePlayClick}
            className="w-64 h-14 text-lg font-semibold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            {gameState.completedLevels.length > 0 ? 'Continue' : 'Start Journey'}
          </Button>

          <Button
            onClick={handleCustomizationClick}
            variant="outline"
            className="w-64 h-12 text-lg border-purple-500 text-purple-400 hover:bg-purple-500/10 transform hover:scale-105 transition-all duration-200"
          >
            Customize Hand
          </Button>

          <Button
            onClick={handleSettingsClick}
            variant="outline"
            className="w-64 h-12 text-lg border-gray-500 text-gray-400 hover:bg-gray-500/10 transform hover:scale-105 transition-all duration-200"
          >
            Settings
          </Button>
        </motion.div>

        {/* Floating hand indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          animate={{
            y: [0, -10, 0],
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <div className="text-6xl opacity-60 select-none">
            🖐️
          </div>
        </motion.div>

        {/* Mysterious quote */}
        <motion.p
          className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-gray-500 text-sm italic"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2, delay: 2 }}
        >
          "Every touch leaves a mark on reality..."
        </motion.p>
      </motion.div>
    </div>
  );
};

export default MainMenu;