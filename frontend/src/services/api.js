import axios from 'axios';

// Determine backend URL
// Always use local backend when running the UI on localhost to avoid CORS issues
const isLocalhost = window?.location?.hostname === 'localhost' || window?.location?.hostname === '127.0.0.1';
// 1. Use explicit env var if provided.
// 2. Otherwise, when running locally on port 3000, default to http://localhost:8000 (matching backend default).
// 3. Fallback to same-origin for production builds served by the backend itself.
const BACKEND_URL = isLocalhost
  ? 'http://localhost:8000'
  : (process.env.REACT_APP_BACKEND_URL || window.location.origin);

const API_BASE = `${BACKEND_URL}/api`;

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE,
  timeout: 20000, // allow slower local dev responses
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('API Response Error:', error);
    if (error.response) {
      console.error('Error Status:', error.response.status);
      console.error('Error Data:', error.response.data);
    }
    return Promise.reject(error);
  }
);

// Game API Service
export class GameApiService {
  
  // Game State Management
  static async getGameState(playerId = 'default') {
    try {
      const response = await api.get(`/game/state?player_id=${playerId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get game state:', error);
      throw error;
    }
  }

  // Level Management
  static async getAllLevels() {
    try {
      const response = await api.get('/game/levels');
      return response.data;
    } catch (error) {
      console.error('Failed to get levels:', error);
      throw error;
    }
  }

  static async getLevelById(levelId) {
    try {
      const response = await api.get(`/game/levels/${levelId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get level:', error);
      throw error;
    }
  }

  static async completeLevel(levelData, playerId = 'default') {
    try {
      const response = await api.post(`/game/complete-level?player_id=${playerId}`, levelData);
      return response.data;
    } catch (error) {
      console.error('Failed to complete level:', error);
      throw error;
    }
  }

  // Hand Skin Management
  static async getAllHandSkins() {
    try {
      const response = await api.get('/game/hand-skins');
      return response.data;
    } catch (error) {
      console.error('Failed to get hand skins:', error);
      throw error;
    }
  }

  static async selectHandSkin(handSkinId, playerId = 'default') {
    try {
      const response = await api.post(`/game/select-hand-skin?player_id=${playerId}`, {
        hand_skin_id: handSkinId
      });
      return response.data;
    } catch (error) {
      console.error('Failed to select hand skin:', error);
      throw error;
    }
  }

  // Achievement Management
  static async getAllAchievements() {
    try {
      const response = await api.get('/game/achievements');
      return response.data;
    } catch (error) {
      console.error('Failed to get achievements:', error);
      throw error;
    }
  }

  // Settings Management
  static async updateSettings(settings, playerId = 'default') {
    try {
      const response = await api.post(`/game/settings?player_id=${playerId}`, {
        settings: settings
      });
      return response.data;
    } catch (error) {
      console.error('Failed to update settings:', error);
      throw error;
    }
  }

  // Game Session Management
  static async startGameSession(levelId, playerId = 'default') {
    try {
      const response = await api.post(`/game/start-session?player_id=${playerId}`, {
        level_id: levelId
      });
      return response.data;
    } catch (error) {
      console.error('Failed to start game session:', error);
      throw error;
    }
  }

  static async updateGameStats(stats, playerId = 'default') {
    try {
      const response = await api.post(`/game/update-stats?player_id=${playerId}`, stats);
      return response.data;
    } catch (error) {
      console.error('Failed to update game stats:', error);
      throw error;
    }
  }

  // Health Check
  static async healthCheck() {
    try {
      const response = await api.get('/');
      return response.data;
    } catch (error) {
      console.error('Health check failed:', error);
      throw error;
    }
  }
}

// Data transformation utilities
export class DataTransformer {
  
  static transformGameState(apiData) {
    if (!apiData || !apiData.data) return null;
    
    const data = apiData.data;
    return {
      currentLevel: data.current_level,
      unlockedLevels: data.unlocked_levels,
      completedLevels: data.completed_levels,
      selectedHandSkin: data.selected_hand_skin,
      unlockedHandSkins: data.unlocked_hand_skins,
      unlockedAchievements: data.unlocked_achievements,
      statistics: {
        totalGrabs: data.statistics.total_grabs,
        totalReleases: data.statistics.total_releases,
        totalTeleports: data.statistics.total_teleports,
        fastestTime: data.statistics.fastest_time,
        levelsCompleted: data.statistics.levels_completed,
        totalPlayTime: data.statistics.total_play_time
      },
      settings: {
        audio: data.settings.audio,
        graphics: data.settings.graphics,
        controls: data.settings.controls
      }
    };
  }

  static transformLevels(apiData) {
    if (!apiData || !apiData.data) return [];
    
    return apiData.data.map(level => ({
      id: level.id,
      name: level.name,
      description: level.description,
      unlocked: true, // Will be determined by game state
      completed: false, // Will be determined by game state
      bestTime: null, // Will be determined by game state
      mechanics: level.mechanics,
      balls: level.balls,
      targets: level.targets,
      gravity: level.gravity,
      teleporters: level.teleporters,
      enemyHands: level.enemy_hands,
      gravityShiftTrigger: level.gravity_shift_trigger,
      timeLimit: level.time_limit,
      voiceover: level.voiceover,
      environment: level.environment,
      order: level.order
    }));
  }

  static transformHandSkins(apiData) {
    if (!apiData || !apiData.data) return [];
    
    return apiData.data.map(skin => ({
      id: skin.id,
      name: skin.name,
      description: skin.description,
      unlocked: true, // Will be determined by game state
      texture: skin.texture,
      color: skin.color,
      metallic: skin.metallic,
      roughness: skin.roughness,
      opacity: skin.opacity,
      unlockRequirement: skin.unlock_requirement
    }));
  }

  static transformAchievements(apiData) {
    if (!apiData || !apiData.data) return [];
    
    return apiData.data.map(achievement => ({
      id: achievement.id,
      name: achievement.name,
      description: achievement.description,
      unlocked: false, // Will be determined by game state
      icon: achievement.icon,
      unlockCondition: achievement.unlock_condition
    }));
  }
}

// Error handling utilities
export class ApiErrorHandler {
  static handleError(error, context = '') {
    console.error(`API Error in ${context}:`, error);
    
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      
      switch (status) {
        case 400:
          return {
            type: 'validation',
            message: data.detail || 'Invalid request data',
            status
          };
        case 404:
          return {
            type: 'not_found',
            message: data.detail || 'Resource not found',
            status
          };
        case 500:
          return {
            type: 'server',
            message: 'Internal server error. Please try again.',
            status
          };
        default:
          return {
            type: 'unknown',
            message: data.detail || 'An unexpected error occurred',
            status
          };
      }
    } else if (error.request) {
      // Request was made but no response received
      return {
        type: 'network',
        message: 'Unable to connect to server. Please check your connection.',
        status: 0
      };
    } else {
      // Something else happened
      return {
        type: 'client',
        message: 'An error occurred while processing your request.',
        status: 0
      };
    }
  }
}

// Cache utilities for better performance
export class ApiCache {
  static cache = new Map();
  static cacheExpiry = new Map();
  
  static set(key, data, ttl = 300000) { // 5 minutes default TTL
    this.cache.set(key, data);
    this.cacheExpiry.set(key, Date.now() + ttl);
  }
  
  static get(key) {
    if (this.cacheExpiry.has(key) && Date.now() > this.cacheExpiry.get(key)) {
      this.cache.delete(key);
      this.cacheExpiry.delete(key);
      return null;
    }
    return this.cache.get(key) || null;
  }
  
  static clear() {
    this.cache.clear();
    this.cacheExpiry.clear();
  }
}

export default api;