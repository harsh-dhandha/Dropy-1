import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useGame } from '../contexts/GameContext';
import { useAudio } from '../contexts/AudioContext';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { ArrowLeft, Clock, CheckCircle, Lock } from 'lucide-react';
import LoadingScreen from './LoadingScreen';

const LevelSelect = () => {
  const navigate = useNavigate();
  const { gameState, isLevelUnlocked, isLevelCompleted, dispatch } = useGame();
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
          <h1 className="text-4xl font-bold text-red-400 mb-4">Error Loading Levels</h1>
          <p className="text-gray-300 mb-8">{gameState.error.message}</p>
          <Button onClick={() => navigate('/')} className="bg-purple-600 hover:bg-purple-700">
            Back to Menu
          </Button>
        </div>
      </div>
    );
  }

  const handleBackClick = () => {
    playSFX('release');
    navigate('/');
  };

  const handleLevelClick = (levelId) => {
    if (isLevelUnlocked(levelId)) {
      playSFX('grab');
      dispatch({ type: 'SET_CURRENT_LEVEL', payload: levelId });
      navigate(`/play/${levelId}`);
    } else {
      playSFX('release');
    }
  };

  const formatTime = (milliseconds) => {
    if (!milliseconds) return '--:--';
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getMechanicIcon = (mechanic) => {
    const icons = {
      'basic_movement': '🖐️',
      'grab_release': '✋',
      'gravity_shift': '🌀',
      'teleporters': '🌌',
      'enemy_hands': '👻',
      'time_challenge': '⏱️',
      'deformable_terrain': '🏔️'
    };
    return icons[mechanic] || '✨';
  };

  const getEnvironmentGradient = (environment) => {
    const gradients = {
      'minimal': 'from-gray-700 to-gray-900',
      'floating': 'from-blue-700 to-purple-900',
      'mystical': 'from-purple-700 to-pink-900',
      'dark': 'from-gray-900 to-black',
      'ethereal': 'from-cyan-700 to-blue-900'
    };
    return gradients[environment] || 'from-gray-700 to-gray-900';
  };

  return (
    <div className="level-select min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      {/* Header */}
      <motion.div
        className="flex items-center justify-between mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Button
          onClick={handleBackClick}
          variant="ghost"
          className="text-gray-400 hover:text-white"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Menu
        </Button>
        
        <h1 className="text-4xl font-bold text-white">
          Choose Your
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
            Challenge
          </span>
        </h1>
        
        <div className="text-right">
          <div className="text-sm text-gray-400">Progress</div>
          <div className="text-2xl font-bold text-white">
            {gameState.completedLevels.length}/{gameState.levels.length}
          </div>
        </div>
      </motion.div>

      {/* Level grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
        {mockLevels.map((level, index) => {
          const unlocked = isLevelUnlocked(level.id);
          const completed = isLevelCompleted(level.id);
          
          return (
            <motion.div
              key={level.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ scale: unlocked ? 1.05 : 1 }}
              whileTap={{ scale: unlocked ? 0.95 : 1 }}
            >
              <Card
                className={`
                  relative overflow-hidden cursor-pointer transition-all duration-300 h-80
                  ${unlocked 
                    ? `bg-gradient-to-br ${getEnvironmentGradient(level.environment)} border-purple-500/50 hover:border-purple-400 shadow-lg hover:shadow-xl` 
                    : 'bg-gray-800/50 border-gray-700 opacity-60'
                  }
                `}
                onClick={() => handleLevelClick(level.id)}
              >
                {/* Background pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/20 to-transparent" />
                  <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-white/10 to-transparent rounded-full" />
                </div>

                <CardHeader className="relative z-10">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl text-white flex items-center gap-2">
                      {unlocked ? (
                        completed ? (
                          <CheckCircle className="h-5 w-5 text-green-400" />
                        ) : (
                          <div className="h-5 w-5 rounded-full border-2 border-purple-400" />
                        )
                      ) : (
                        <Lock className="h-5 w-5 text-gray-500" />
                      )}
                      {level.name}
                    </CardTitle>
                    <Badge variant="outline" className="text-xs text-gray-300 border-gray-500">
                      Level {index + 1}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="relative z-10 space-y-4">
                  <p className="text-gray-300 text-sm line-clamp-2">
                    {level.description}
                  </p>

                  {/* Mechanics */}
                  <div className="space-y-2">
                    <div className="text-xs text-gray-400">Mechanics</div>
                    <div className="flex flex-wrap gap-2">
                      {level.mechanics.map(mechanic => (
                        <Badge
                          key={mechanic}
                          variant="secondary"
                          className="text-xs bg-black/30 text-gray-300"
                        >
                          {getMechanicIcon(mechanic)} {mechanic.replace('_', ' ')}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Stats */}
                  {unlocked && (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-400">Best Time</span>
                        <span className="text-xs text-gray-300 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatTime(level.bestTime)}
                        </span>
                      </div>
                      
                      {level.timeLimit && (
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-400">Time Limit</span>
                          <span className="text-xs text-yellow-400">
                            {formatTime(level.timeLimit)}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Voiceover preview */}
                  <div className="mt-4 pt-3 border-t border-gray-700">
                    <p className="text-xs text-gray-400 italic">
                      "{level.voiceover}"
                    </p>
                  </div>

                  {/* Lock overlay */}
                  {!unlocked && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <div className="text-center">
                        <Lock className="h-12 w-12 text-gray-500 mx-auto mb-2" />
                        <p className="text-sm text-gray-400">
                          Complete previous levels to unlock
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Floating elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute top-1/4 right-1/4 w-16 h-16 bg-purple-500/10 rounded-full blur-lg"
          animate={{
            y: [0, -20, 0],
            x: [0, 10, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-1/3 left-1/4 w-24 h-24 bg-pink-500/10 rounded-full blur-lg"
          animate={{
            y: [0, 15, 0],
            x: [0, -8, 0],
            scale: [1.1, 1, 1.1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>
    </div>
  );
};

export default LevelSelect;