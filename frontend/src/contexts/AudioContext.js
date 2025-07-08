import React, { createContext, useContext, useRef, useEffect } from 'react';
import { Howl } from 'howler';
import { mockAudioFiles } from '../data/mock';

const AudioContext = createContext();

export const AudioProvider = ({ children }) => {
  const audioRefs = useRef({});
  const currentMusic = useRef(null);

  // Initialize audio files
  useEffect(() => {
    // Note: In a real implementation, you'd load actual audio files
    // For now, we'll create mock Howl instances
    const initializeAudio = () => {
      try {
        // Music tracks (mock)
        audioRefs.current.music = {
          menu: new Howl({
            src: ['/audio/menu_ambient.mp3'], // This would be a real file
            loop: true,
            volume: 0.6,
            html5: true, // Use HTML5 audio for better performance
            preload: false // Don't preload for demo
          }),
          level1: new Howl({
            src: ['/audio/level1_minimal.mp3'],
            loop: true,
            volume: 0.5,
            html5: true,
            preload: false
          }),
          level2: new Howl({
            src: ['/audio/level2_floating.mp3'],
            loop: true,
            volume: 0.5,
            html5: true,
            preload: false
          }),
          level3: new Howl({
            src: ['/audio/level3_mystical.mp3'],
            loop: true,
            volume: 0.5,
            html5: true,
            preload: false
          }),
          level4: new Howl({
            src: ['/audio/level4_dark.mp3'],
            loop: true,
            volume: 0.5,
            html5: true,
            preload: false
          }),
          level5: new Howl({
            src: ['/audio/level5_ethereal.mp3'],
            loop: true,
            volume: 0.5,
            html5: true,
            preload: false
          })
        };

        // SFX (mock)
        audioRefs.current.sfx = {
          grab: new Howl({
            src: ['/audio/sfx_grab.mp3'],
            volume: 0.8,
            html5: true,
            preload: false
          }),
          release: new Howl({
            src: ['/audio/sfx_release.mp3'],
            volume: 0.8,
            html5: true,
            preload: false
          }),
          teleport: new Howl({
            src: ['/audio/sfx_teleport.mp3'],
            volume: 0.7,
            html5: true,
            preload: false
          }),
          gravityShift: new Howl({
            src: ['/audio/sfx_gravity_shift.mp3'],
            volume: 0.9,
            html5: true,
            preload: false
          }),
          levelComplete: new Howl({
            src: ['/audio/sfx_level_complete.mp3'],
            volume: 0.8,
            html5: true,
            preload: false
          }),
          achievement: new Howl({
            src: ['/audio/sfx_achievement.mp3'],
            volume: 0.9,
            html5: true,
            preload: false
          })
        };

        // Voiceover (mock)
        audioRefs.current.voiceover = {
          level1: new Howl({
            src: ['/audio/vo_level1.mp3'],
            volume: 0.9,
            html5: true,
            preload: false
          }),
          level2: new Howl({
            src: ['/audio/vo_level2.mp3'],
            volume: 0.9,
            html5: true,
            preload: false
          }),
          level3: new Howl({
            src: ['/audio/vo_level3.mp3'],
            volume: 0.9,
            html5: true,
            preload: false
          }),
          level4: new Howl({
            src: ['/audio/vo_level4.mp3'],
            volume: 0.9,
            html5: true,
            preload: false
          }),
          level5: new Howl({
            src: ['/audio/vo_level5.mp3'],
            volume: 0.9,
            html5: true,
            preload: false
          })
        };
      } catch (error) {
        console.log('Audio initialization skipped (demo mode):', error);
      }
    };

    initializeAudio();
  }, []);

  const playMusic = (trackName) => {
    try {
      if (currentMusic.current) {
        currentMusic.current.stop();
      }
      
      const track = audioRefs.current.music?.[trackName];
      if (track) {
        track.play();
        currentMusic.current = track;
      }
    } catch (error) {
      console.log('Music playback skipped (demo mode):', error);
    }
  };

  const stopMusic = () => {
    try {
      if (currentMusic.current) {
        currentMusic.current.stop();
        currentMusic.current = null;
      }
    } catch (error) {
      console.log('Music stop skipped (demo mode):', error);
    }
  };

  const playSFX = (soundName) => {
    try {
      const sound = audioRefs.current.sfx?.[soundName];
      if (sound) {
        sound.play();
      }
    } catch (error) {
      console.log('SFX playback skipped (demo mode):', error);
    }
  };

  const playVoiceover = (levelId) => {
    try {
      const voiceover = audioRefs.current.voiceover?.[levelId];
      if (voiceover) {
        voiceover.play();
      }
    } catch (error) {
      console.log('Voiceover playback skipped (demo mode):', error);
    }
  };

  const setVolume = (category, volume) => {
    try {
      if (category === 'music' && currentMusic.current) {
        currentMusic.current.volume(volume);
      } else if (category === 'sfx' && audioRefs.current.sfx) {
        Object.values(audioRefs.current.sfx).forEach(sound => {
          sound.volume(volume);
        });
      }
    } catch (error) {
      console.log('Volume adjustment skipped (demo mode):', error);
    }
  };

  const value = {
    playMusic,
    stopMusic,
    playSFX,
    playVoiceover,
    setVolume
  };

  return (
    <AudioContext.Provider value={value}>
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
};