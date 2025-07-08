import React, { createContext, useContext, useReducer, useEffect, useState } from 'react';
import { GameApiService, DataTransformer, ApiErrorHandler } from '../services/api';
import { useToast } from '../hooks/use-toast';

const GameContext = createContext();

const gameReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    
    case 'LOAD_GAME_DATA':
      return { 
        ...state, 
        ...action.payload, 
        loading: false, 
        error: null,
        dataLoaded: true 
      };
    
    case 'SET_CURRENT_LEVEL':
      return { ...state, currentLevel: action.payload };
    
    case 'COMPLETE_LEVEL':
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
    
    case 'REFRESH_GAME_STATE':
      return { ...state, ...action.payload };
    
    default:
      return state;
  }
};

const initialState = {
  loading: true,
  error: null,
  dataLoaded: false,
  currentLevel: 'level1',
  unlockedLevels: ['level1'],
  completedLevels: [],
  selectedHandSkin: 'default',
  unlockedHandSkins: ['default'],
  unlockedAchievements: [],
  statistics: {
    totalGrabs: 0,
    totalReleases: 0,
    totalTeleports: 0,
    fastestTime: null,
    levelsCompleted: 0,
    totalPlayTime: 0
  },
  settings: {
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
  },
  // Game data
  levels: [],
  handSkins: [],
  achievements: []
};

export const GameProvider = ({ children }) => {
  const [gameState, dispatch] = useReducer(gameReducer, initialState);
  const { toast } = useToast();

  // Load all game data on initialization
  useEffect(() => {
    loadGameData();
  }, []);

  const loadGameData = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      // Load all data in parallel
      const [gameStateRes, levelsRes, handSkinsRes, achievementsRes] = await Promise.all([
        GameApiService.getGameState(),
        GameApiService.getAllLevels(),
        GameApiService.getAllHandSkins(),
        GameApiService.getAllAchievements()
      ]);

      // Transform the data
      const transformedGameState = DataTransformer.transformGameState(gameStateRes);
      const transformedLevels = DataTransformer.transformLevels(levelsRes);
      const transformedHandSkins = DataTransformer.transformHandSkins(handSkinsRes);
      const transformedAchievements = DataTransformer.transformAchievements(achievementsRes);

      // Update levels and hand skins with unlock status
      const updatedLevels = transformedLevels.map(level => ({
        ...level,
        unlocked: transformedGameState.unlockedLevels.includes(level.id),
        completed: transformedGameState.completedLevels.includes(level.id),
        bestTime: getBestTimeForLevel(transformedGameState, level.id)
      }));

      const updatedHandSkins = transformedHandSkins.map(skin => ({
        ...skin,
        unlocked: transformedGameState.unlockedHandSkins.includes(skin.id)
      }));

      const updatedAchievements = transformedAchievements.map(achievement => ({
        ...achievement,
        unlocked: transformedGameState.unlockedAchievements.includes(achievement.id)
      }));

      // Dispatch all data
      dispatch({
        type: 'LOAD_GAME_DATA',
        payload: {
          ...transformedGameState,
          levels: updatedLevels,
          handSkins: updatedHandSkins,
          achievements: updatedAchievements
        }
      });

    } catch (error) {
      const errorInfo = ApiErrorHandler.handleError(error, 'loadGameData');
      dispatch({ type: 'SET_ERROR', payload: errorInfo });
      
      toast({
        title: "Error Loading Game",
        description: errorInfo.message,
        variant: "destructive"
      });
    }
  };

  const getBestTimeForLevel = (gameState, levelId) => {
    // This would typically come from level progress data
    // For now, we'll return null and implement this when we have level progress
    return null;
  };

  const completeLevel = async (levelId, completionTime, gameStats = {}) => {
    try {
      const levelData = {
        level_id: levelId,
        completion_time: completionTime,
        grabs_count: gameStats.grabs || 0,
        releases_count: gameStats.releases || 0,
        teleports_count: gameStats.teleports || 0
      };

      await GameApiService.completeLevel(levelData);
      
      dispatch({
        type: 'COMPLETE_LEVEL',
        payload: { levelId, time: completionTime }
      });

      // Refresh game state to get updated unlocks
      await refreshGameState();

      toast({
        title: "Level Complete!",
        description: `You completed ${levelId} in ${Math.round(completionTime / 1000)}s`,
        variant: "default"
      });

    } catch (error) {
      const errorInfo = ApiErrorHandler.handleError(error, 'completeLevel');
      toast({
        title: "Error Completing Level",
        description: errorInfo.message,
        variant: "destructive"
      });
    }
  };

  const selectHandSkin = async (handSkinId) => {
    try {
      await GameApiService.selectHandSkin(handSkinId);
      
      dispatch({
        type: 'SELECT_HAND_SKIN',
        payload: handSkinId
      });

      toast({
        title: "Hand Skin Selected",
        description: `Changed to ${handSkinId}`,
        variant: "default"
      });

    } catch (error) {
      const errorInfo = ApiErrorHandler.handleError(error, 'selectHandSkin');
      toast({
        title: "Error Selecting Hand Skin",
        description: errorInfo.message,
        variant: "destructive"
      });
    }
  };

  const updateSettings = async (newSettings) => {
    try {
      await GameApiService.updateSettings(newSettings);
      
      dispatch({
        type: 'UPDATE_SETTINGS',
        payload: newSettings
      });

      toast({
        title: "Settings Updated",
        description: "Your settings have been saved",
        variant: "default"
      });

    } catch (error) {
      const errorInfo = ApiErrorHandler.handleError(error, 'updateSettings');
      toast({
        title: "Error Updating Settings",
        description: errorInfo.message,
        variant: "destructive"
      });
    }
  };

  const updateGameStats = async (stats) => {
    try {
      await GameApiService.updateGameStats(stats);
      
      dispatch({
        type: 'UPDATE_STATISTICS',
        payload: stats
      });

    } catch (error) {
      const errorInfo = ApiErrorHandler.handleError(error, 'updateGameStats');
      // Don't show toast for stats updates to avoid spam
      console.error('Failed to update game stats:', error);
    }
  };

  const refreshGameState = async () => {
    try {
      const gameStateRes = await GameApiService.getGameState();
      const transformedGameState = DataTransformer.transformGameState(gameStateRes);
      
      dispatch({
        type: 'REFRESH_GAME_STATE',
        payload: transformedGameState
      });

    } catch (error) {
      const errorInfo = ApiErrorHandler.handleError(error, 'refreshGameState');
      console.error('Failed to refresh game state:', error);
    }
  };

  const startGameSession = async (levelId) => {
    try {
      const response = await GameApiService.startGameSession(levelId);
      return response.data?.session_id;
    } catch (error) {
      const errorInfo = ApiErrorHandler.handleError(error, 'startGameSession');
      console.error('Failed to start game session:', error);
      return null;
    }
  };

  // Helper functions
  const getCurrentLevel = () => {
    return gameState.levels.find(l => l.id === gameState.currentLevel);
  };

  const getHandSkin = (skinId) => {
    return gameState.handSkins.find(s => s.id === skinId);
  };

  const isLevelUnlocked = (levelId) => {
    return gameState.unlockedLevels.includes(levelId);
  };

  const isLevelCompleted = (levelId) => {
    return gameState.completedLevels.includes(levelId);
  };

  const isHandSkinUnlocked = (skinId) => {
    return gameState.unlockedHandSkins.includes(skinId);
  };

  const getLevelProgress = () => {
    if (gameState.levels.length === 0) return 0;
    return (gameState.completedLevels.length / gameState.levels.length) * 100;
  };

  const value = {
    gameState,
    dispatch,
    // Actions
    completeLevel,
    selectHandSkin,
    updateSettings,
    updateGameStats,
    refreshGameState,
    startGameSession,
    loadGameData,
    // Helpers
    getCurrentLevel,
    getHandSkin,
    isLevelUnlocked,
    isLevelCompleted,
    isHandSkinUnlocked,
    getLevelProgress
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