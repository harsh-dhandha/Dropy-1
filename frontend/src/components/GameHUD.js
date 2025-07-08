import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../contexts/GameContext';
import { useAudio } from '../contexts/AudioContext';
import { mockLevels } from '../data/mock';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Home, 
  Settings, 
  Clock, 
  Target,
  Hand,
  Volume2,
  VolumeX
} from 'lucide-react';

const GameHUD = () => {
  const { levelId } = useParams();
  const navigate = useNavigate();
  const { gameState, dispatch } = useGame();
  const { playMusic, stopMusic, playSFX } = useAudio();
  
  const [isPaused, setIsPaused] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [gameTime, setGameTime] = useState(0);
  const [ballsInTarget, setBallsInTarget] = useState(0);
  
  const currentLevel = mockLevels.find(l => l.id === levelId);

  const handlePause = () => {
    setIsPaused(!isPaused);
    playSFX('grab');
    if (isPaused) {
      playMusic(levelId);
    } else {
      stopMusic();
    }
  };

  const handleRestart = () => {
    playSFX('release');
    // Restart logic would be handled by the game canvas
    window.location.reload();
  };

  const handleHome = () => {
    playSFX('release');
    navigate('/');
  };

  const handleSettings = () => {
    setShowSettings(!showSettings);
    playSFX('grab');
  };

  const handleMute = () => {
    setIsMuted(!isMuted);
    playSFX('grab');
    if (isMuted) {
      playMusic(levelId);
    } else {
      stopMusic();
    }
  };

  const formatTime = (milliseconds) => {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getTimeColor = () => {
    if (!currentLevel?.timeLimit) return 'text-white';
    const remaining = currentLevel.timeLimit - gameTime;
    if (remaining < 10000) return 'text-red-400';
    if (remaining < 30000) return 'text-yellow-400';
    return 'text-white';
  };

  if (!currentLevel) return null;

  return (
    <>
      {/* Top HUD */}
      <div className="absolute top-0 left-0 right-0 z-50 p-4">
        <div className="flex items-center justify-between">
          {/* Left side - Level info */}
          <Card className="bg-black/70 border-purple-500/50 backdrop-blur-sm">
            <CardContent className="p-3">
              <div className="flex items-center gap-4">
                <div>
                  <h3 className="text-lg font-bold text-white">{currentLevel.name}</h3>
                  <p className="text-sm text-gray-300">{currentLevel.description}</p>
                </div>
                <div className="flex gap-2">
                  {currentLevel.mechanics.slice(0, 3).map(mechanic => (
                    <Badge key={mechanic} variant="secondary" className="text-xs">
                      {mechanic.replace('_', ' ')}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Right side - Controls */}
          <div className="flex items-center gap-2">
            <Button
              onClick={handleMute}
              variant="outline"
              size="sm"
              className="bg-black/70 border-gray-500/50 backdrop-blur-sm"
            >
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>
            
            <Button
              onClick={handleSettings}
              variant="outline"
              size="sm"
              className="bg-black/70 border-gray-500/50 backdrop-blur-sm"
            >
              <Settings className="h-4 w-4" />
            </Button>
            
            <Button
              onClick={handlePause}
              variant="outline"
              size="sm"
              className="bg-black/70 border-purple-500/50 backdrop-blur-sm"
            >
              {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Bottom HUD */}
      <div className="absolute bottom-0 left-0 right-0 z-50 p-4">
        <div className="flex items-center justify-between">
          {/* Left side - Stats */}
          <Card className="bg-black/70 border-purple-500/50 backdrop-blur-sm">
            <CardContent className="p-3">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span className={`font-mono text-sm ${getTimeColor()}`}>
                    {formatTime(gameTime)}
                  </span>
                  {currentLevel.timeLimit && (
                    <span className="text-xs text-gray-400">
                      / {formatTime(currentLevel.timeLimit)}
                    </span>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-white">
                    {ballsInTarget} / {currentLevel.balls.length}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Hand className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-white">
                    {gameState.selectedHandSkin}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Right side - Actions */}
          <div className="flex items-center gap-2">
            <Button
              onClick={handleRestart}
              variant="outline"
              size="sm"
              className="bg-black/70 border-yellow-500/50 backdrop-blur-sm text-yellow-400 hover:bg-yellow-500/10"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Restart
            </Button>
            
            <Button
              onClick={handleHome}
              variant="outline"
              size="sm"
              className="bg-black/70 border-gray-500/50 backdrop-blur-sm"
            >
              <Home className="h-4 w-4 mr-2" />
              Menu
            </Button>
          </div>
        </div>
      </div>

      {/* Pause overlay */}
      <AnimatePresence>
        {isPaused && (
          <motion.div
            className="absolute inset-0 z-40 bg-black/80 backdrop-blur-sm flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="text-center space-y-6"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
            >
              <h2 className="text-4xl font-bold text-white">Game Paused</h2>
              <p className="text-gray-300">Click anywhere to continue</p>
              
              <div className="flex gap-4 justify-center">
                <Button
                  onClick={handlePause}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Resume
                </Button>
                
                <Button
                  onClick={handleRestart}
                  variant="outline"
                  className="border-yellow-500 text-yellow-400 hover:bg-yellow-500/10"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Restart
                </Button>
                
                <Button
                  onClick={handleHome}
                  variant="outline"
                  className="border-gray-500 text-gray-400 hover:bg-gray-500/10"
                >
                  <Home className="h-4 w-4 mr-2" />
                  Menu
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settings overlay */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            className="absolute inset-0 z-40 bg-black/80 backdrop-blur-sm flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-gray-900 border border-purple-500/50 rounded-lg p-6 max-w-md w-full mx-4"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
            >
              <h3 className="text-xl font-bold text-white mb-4">Game Settings</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Master Volume</span>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    defaultValue="0.7"
                    className="w-20"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Mouse Sensitivity</span>
                  <input
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.1"
                    defaultValue="1"
                    className="w-20"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Graphics Quality</span>
                  <select className="bg-gray-800 text-white px-2 py-1 rounded">
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                  </select>
                </div>
              </div>
              
              <div className="flex gap-2 mt-6">
                <Button
                  onClick={handleSettings}
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                >
                  Close
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default GameHUD;