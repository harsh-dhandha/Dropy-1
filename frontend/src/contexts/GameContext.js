import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { mockGameState, mockLevels, mockHandSkins, unlockLevel, completeLevel, unlockHandSkin, unlockAchievement } from '../data/mock';

const GameContext = createContext();

const gameReducer = (state, action) => {
  switch (action.type) {
    case 'SET_CURRENT_LEVEL':
      return { ...state, currentLevel: action.payload };
    
    case 'UNLOCK_LEVEL':
      unlockLevel(action.payload);
      return { ...state, unlockedLevels: [...state.unlockedLevels, action.payload] };
    
    case 'COMPLETE_LEVEL':
      completeLevel(action.payload.levelId, action.payload.time);
      return { 
        ...state, 
        completedLevels: [...state.completedLevels, action.payload.levelId],
        statistics: {
          ...state.statistics,
          levelsCompleted: state.statistics.levelsCompleted + 1
        }
      };
    
    case 'SELECT_HAND_SKIN':
      return { ...state, selectedHandSkin: action.payload };
    
    case 'UNLOCK_HAND_SKIN':
      unlockHandSkin(action.payload);
      return { ...state, unlockedHandSkins: [...state.unlockedHandSkins, action.payload] };
    
    case 'UNLOCK_ACHIEVEMENT':
      unlockAchievement(action.payload);
      return { ...state };
    
    case 'UPDATE_STATISTICS':
      return { 
        ...state, 
        statistics: { ...state.statistics, ...action.payload }
      };
    
    case 'UPDATE_SETTINGS':
      return { 
        ...state, 
        settings: { ...state.settings, ...action.payload }
      };
    
    case 'RESET_GAME':
      return { ...mockGameState };
    
    default:
      return state;
  }
};

export const GameProvider = ({ children }) => {
  const [gameState, dispatch] = useReducer(gameReducer, mockGameState);

  // Auto-unlock next level when current is completed
  useEffect(() => {
    const checkLevelProgression = () => {
      const currentLevelIndex = mockLevels.findIndex(l => l.id === gameState.currentLevel);
      const nextLevel = mockLevels[currentLevelIndex + 1];
      
      if (nextLevel && gameState.completedLevels.includes(gameState.currentLevel)) {
        if (!gameState.unlockedLevels.includes(nextLevel.id)) {
          dispatch({ type: 'UNLOCK_LEVEL', payload: nextLevel.id });
        }
      }
    };

    checkLevelProgression();
  }, [gameState.completedLevels, gameState.currentLevel]);

  // Achievement checking
  useEffect(() => {
    const checkAchievements = () => {
      // First Touch
      if (gameState.statistics.levelsCompleted >= 1 && !gameState.achievements.find(a => a.id === 'first_touch')?.unlocked) {
        dispatch({ type: 'UNLOCK_ACHIEVEMENT', payload: 'first_touch' });
      }

      // Perfectionist
      if (gameState.completedLevels.length === mockLevels.length && !gameState.achievements.find(a => a.id === 'perfectionist')?.unlocked) {
        dispatch({ type: 'UNLOCK_ACHIEVEMENT', payload: 'perfectionist' });
      }
    };

    checkAchievements();
  }, [gameState.statistics, gameState.completedLevels]);

  const value = {
    gameState,
    dispatch,
    getCurrentLevel: () => mockLevels.find(l => l.id === gameState.currentLevel),
    getHandSkin: (skinId) => mockHandSkins.find(s => s.id === skinId),
    isLevelUnlocked: (levelId) => gameState.unlockedLevels.includes(levelId),
    isLevelCompleted: (levelId) => gameState.completedLevels.includes(levelId),
    isHandSkinUnlocked: (skinId) => gameState.unlockedHandSkins.includes(skinId),
    getLevelProgress: () => (gameState.completedLevels.length / mockLevels.length) * 100
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};