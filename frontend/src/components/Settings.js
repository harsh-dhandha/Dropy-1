import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useGame } from '../contexts/GameContext';
import { useAudio } from '../contexts/AudioContext';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Slider } from './ui/slider';
import { Switch } from './ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ArrowLeft, Volume2, Mouse, Monitor, Gamepad2, RotateCcw } from 'lucide-react';

const Settings = () => {
  const navigate = useNavigate();
  const { gameState, dispatch } = useGame();
  const { playSFX, setVolume } = useAudio();
  
  const [settings, setSettings] = useState(gameState.settings);
  const [hasChanges, setHasChanges] = useState(false);

  const handleBack = () => {
    if (hasChanges) {
      dispatch({ type: 'UPDATE_SETTINGS', payload: settings });
    }
    playSFX('release');
    navigate('/');
  };

  const handleSettingChange = (category, setting, value) => {
    const newSettings = {
      ...settings,
      [category]: {
        ...settings[category],
        [setting]: value
      }
    };
    setSettings(newSettings);
    setHasChanges(true);
    playSFX('grab');
    
    // Apply audio changes immediately
    if (category === 'audio') {
      setVolume(setting, value);
    }
  };

  const handleReset = () => {
    const defaultSettings = {
      audio: {
        masterVolume: 0.7,
        sfxVolume: 0.8,
        musicVolume: 0.6
      },
      graphics: {
        quality: 'medium',
        shadows: true,
        particles: true
      },
      controls: {
        sensitivity: 1.0,
        invertY: false
      }
    };
    setSettings(defaultSettings);
    setHasChanges(true);
    playSFX('release');
  };

  return (
    <div className="settings min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
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
          Game
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
            Settings
          </span>
        </h1>
        
        <Button
          onClick={handleReset}
          variant="outline"
          className="border-yellow-500 text-yellow-400 hover:bg-yellow-500/10"
        >
          <RotateCcw className="mr-2 h-4 w-4" />
          Reset to Default
        </Button>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
        {/* Audio Settings */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-purple-500/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Volume2 className="h-5 w-5" />
                Audio Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Master Volume */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm text-gray-300">Master Volume</label>
                  <span className="text-sm text-gray-400">
                    {Math.round(settings.audio.masterVolume * 100)}%
                  </span>
                </div>
                <Slider
                  value={[settings.audio.masterVolume]}
                  onValueChange={(value) => handleSettingChange('audio', 'masterVolume', value[0])}
                  max={1}
                  min={0}
                  step={0.1}
                  className="w-full"
                />
              </div>

              {/* SFX Volume */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm text-gray-300">Sound Effects</label>
                  <span className="text-sm text-gray-400">
                    {Math.round(settings.audio.sfxVolume * 100)}%
                  </span>
                </div>
                <Slider
                  value={[settings.audio.sfxVolume]}
                  onValueChange={(value) => handleSettingChange('audio', 'sfxVolume', value[0])}
                  max={1}
                  min={0}
                  step={0.1}
                  className="w-full"
                />
              </div>

              {/* Music Volume */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm text-gray-300">Music</label>
                  <span className="text-sm text-gray-400">
                    {Math.round(settings.audio.musicVolume * 100)}%
                  </span>
                </div>
                <Slider
                  value={[settings.audio.musicVolume]}
                  onValueChange={(value) => handleSettingChange('audio', 'musicVolume', value[0])}
                  max={1}
                  min={0}
                  step={0.1}
                  className="w-full"
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Graphics Settings */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-purple-500/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Monitor className="h-5 w-5" />
                Graphics Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Quality */}
              <div className="space-y-2">
                <label className="text-sm text-gray-300">Graphics Quality</label>
                <Select
                  value={settings.graphics.quality}
                  onValueChange={(value) => handleSettingChange('graphics', 'quality', value)}
                >
                  <SelectTrigger className="w-full bg-gray-700 border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Shadows */}
              <div className="flex items-center justify-between">
                <label className="text-sm text-gray-300">Shadows</label>
                <Switch
                  checked={settings.graphics.shadows}
                  onCheckedChange={(checked) => handleSettingChange('graphics', 'shadows', checked)}
                />
              </div>

              {/* Particles */}
              <div className="flex items-center justify-between">
                <label className="text-sm text-gray-300">Particle Effects</label>
                <Switch
                  checked={settings.graphics.particles}
                  onCheckedChange={(checked) => handleSettingChange('graphics', 'particles', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Controls Settings */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-purple-500/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Mouse className="h-5 w-5" />
                Controls Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Sensitivity */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm text-gray-300">Mouse Sensitivity</label>
                  <span className="text-sm text-gray-400">
                    {settings.controls.sensitivity.toFixed(1)}x
                  </span>
                </div>
                <Slider
                  value={[settings.controls.sensitivity]}
                  onValueChange={(value) => handleSettingChange('controls', 'sensitivity', value[0])}
                  max={3}
                  min={0.1}
                  step={0.1}
                  className="w-full"
                />
              </div>

              {/* Invert Y */}
              <div className="flex items-center justify-between">
                <label className="text-sm text-gray-300">Invert Y-Axis</label>
                <Switch
                  checked={settings.controls.invertY}
                  onCheckedChange={(checked) => handleSettingChange('controls', 'invertY', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Game Info */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-purple-500/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Gamepad2 className="h-5 w-5" />
                Game Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300">Version</span>
                <span className="text-sm text-gray-400">1.0.0</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300">Levels Completed</span>
                <span className="text-sm text-gray-400">
                  {gameState.completedLevels.length}/5
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300">Hand Skins Unlocked</span>
                <span className="text-sm text-gray-400">
                  {gameState.unlockedHandSkins.length}/5
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300">Total Play Time</span>
                <span className="text-sm text-gray-400">
                  {Math.floor(gameState.totalPlayTime / 60)}m {gameState.totalPlayTime % 60}s
                </span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Controls Guide */}
      <motion.div
        className="mt-8 max-w-4xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-purple-500/50">
          <CardHeader>
            <CardTitle className="text-white text-center">Controls Guide</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-300">Mouse Controls</h4>
                <div className="space-y-1 text-gray-400">
                  <p>Move mouse: Control hand position</p>
                  <p>Left click: Grab/Release objects</p>
                  <p>Right click: Camera rotation</p>
                  <p>Scroll wheel: Zoom in/out</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-300">Keyboard Controls</h4>
                <div className="space-y-1 text-gray-400">
                  <p>Spacebar: Grab/Release objects</p>
                  <p>ESC: Pause game</p>
                  <p>R: Restart level</p>
                  <p>M: Toggle music</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Floating background elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute top-1/3 right-1/4 w-16 h-16 bg-purple-500/5 rounded-full blur-xl"
          animate={{
            y: [0, -25, 0],
            x: [0, 15, 0],
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-1/3 left-1/4 w-24 h-24 bg-pink-500/5 rounded-full blur-xl"
          animate={{
            y: [0, 18, 0],
            x: [0, -12, 0],
            scale: [1.1, 1, 1.1],
          }}
          transition={{
            duration: 13,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>
    </div>
  );
};

export default Settings;