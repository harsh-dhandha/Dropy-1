// Mock data for Hand of Gravity game

export const mockHandSkins = [
  {
    id: 'default',
    name: 'Human',
    description: 'The original hand',
    unlocked: true,
    texture: 'human',
    color: '#fdbcb4',
    metallic: 0.1,
    roughness: 0.8
  },
  {
    id: 'robotic',
    name: 'Cybernetic',
    description: 'Steel and circuits',
    unlocked: false,
    texture: 'metal',
    color: '#8c9eff',
    metallic: 0.9,
    roughness: 0.1
  },
  {
    id: 'ethereal',
    name: 'Ethereal',
    description: 'Translucent and mystical',
    unlocked: false,
    texture: 'glass',
    color: '#e1f5fe',
    metallic: 0.0,
    roughness: 0.0,
    opacity: 0.7
  },
  {
    id: 'wooden',
    name: 'Wooden',
    description: 'Carved from ancient oak',
    unlocked: false,
    texture: 'wood',
    color: '#8d6e63',
    metallic: 0.0,
    roughness: 0.9
  },
  {
    id: 'shadow',
    name: 'Shadow',
    description: 'Darkness incarnate',
    unlocked: false,
    texture: 'shadow',
    color: '#424242',
    metallic: 0.0,
    roughness: 0.3
  }
];

export const mockLevels = [
  {
    id: 'level1',
    name: 'First Touch',
    description: 'Learn to grasp and release',
    unlocked: true,
    completed: false,
    bestTime: null,
    mechanics: ['basic_movement', 'grab_release'],
    balls: [
      { id: 'ball1', position: [0, 2, 0], color: '#ff6b6b' }
    ],
    targets: [
      { id: 'target1', position: [3, 0, 0], size: [1, 0.5, 1] }
    ],
    gravity: [0, -9.81, 0],
    voiceover: 'A hand... reaches through the void...',
    environment: 'minimal'
  },
  {
    id: 'level2',
    name: 'Gravity Shift',
    description: 'Gravity changes direction',
    unlocked: false,
    completed: false,
    bestTime: null,
    mechanics: ['basic_movement', 'grab_release', 'gravity_shift'],
    balls: [
      { id: 'ball1', position: [-2, 2, 0], color: '#4ecdc4' },
      { id: 'ball2', position: [2, 2, 0], color: '#45b7d1' }
    ],
    targets: [
      { id: 'target1', position: [0, 3, 0], size: [1, 0.5, 1] }
    ],
    gravity: [0, -9.81, 0],
    gravityShiftTrigger: { time: 10000, newGravity: [0, 9.81, 0] },
    voiceover: 'Reality bends... up becomes down...',
    environment: 'floating'
  },
  {
    id: 'level3',
    name: 'Portal Maze',
    description: 'Navigate through teleporters',
    unlocked: false,
    completed: false,
    bestTime: null,
    mechanics: ['basic_movement', 'grab_release', 'teleporters'],
    balls: [
      { id: 'ball1', position: [0, 2, 0], color: '#96ceb4' }
    ],
    targets: [
      { id: 'target1', position: [8, 0, 0], size: [1, 0.5, 1] }
    ],
    teleporters: [
      { 
        id: 'portal1', 
        position: [2, 0, 0], 
        linkedTo: 'portal2',
        color: '#ff9ff3'
      },
      { 
        id: 'portal2', 
        position: [6, 0, 0], 
        linkedTo: 'portal1',
        color: '#ff9ff3'
      }
    ],
    gravity: [0, -9.81, 0],
    voiceover: 'Tears in space... pathways between worlds...',
    environment: 'mystical'
  },
  {
    id: 'level4',
    name: 'Shadow Dance',
    description: 'Avoid the shadow hands',
    unlocked: false,
    completed: false,
    bestTime: null,
    mechanics: ['basic_movement', 'grab_release', 'enemy_hands'],
    balls: [
      { id: 'ball1', position: [0, 2, 0], color: '#ffeaa7' }
    ],
    targets: [
      { id: 'target1', position: [5, 0, 0], size: [1, 0.5, 1] }
    ],
    enemyHands: [
      { 
        id: 'shadow1', 
        position: [2, 1, 0], 
        behavior: 'patrol',
        patrolPath: [[2, 1, 0], [2, 1, 2], [2, 1, -2]]
      }
    ],
    gravity: [0, -9.81, 0],
    voiceover: 'Others have come before... they guard jealously...',
    environment: 'dark'
  },
  {
    id: 'level5',
    name: 'Final Grasp',
    description: 'Master all abilities',
    unlocked: false,
    completed: false,
    bestTime: null,
    mechanics: ['basic_movement', 'grab_release', 'gravity_shift', 'teleporters', 'time_challenge'],
    balls: [
      { id: 'ball1', position: [-3, 2, 0], color: '#fd79a8' },
      { id: 'ball2', position: [3, 2, 0], color: '#6c5ce7' }
    ],
    targets: [
      { id: 'target1', position: [0, 5, 0], size: [2, 0.5, 2] }
    ],
    teleporters: [
      { 
        id: 'portal1', 
        position: [-1, 0, 0], 
        linkedTo: 'portal2',
        color: '#a29bfe'
      },
      { 
        id: 'portal2', 
        position: [1, 0, 0], 
        linkedTo: 'portal1',
        color: '#a29bfe'
      }
    ],
    gravity: [0, -9.81, 0],
    gravityShiftTrigger: { time: 15000, newGravity: [9.81, 0, 0] },
    timeLimit: 60000,
    voiceover: 'The hand knows its purpose... one final reach...',
    environment: 'ethereal'
  }
];

export const mockGameSettings = {
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

export const mockAchievements = [
  {
    id: 'first_touch',
    name: 'First Touch',
    description: 'Complete your first level',
    unlocked: false,
    icon: '👋'
  },
  {
    id: 'gravity_master',
    name: 'Gravity Master',
    description: 'Complete a level with gravity shift',
    unlocked: false,
    icon: '🌀'
  },
  {
    id: 'portal_runner',
    name: 'Portal Runner',
    description: 'Use teleporters 10 times',
    unlocked: false,
    icon: '🌌'
  },
  {
    id: 'speed_demon',
    name: 'Speed Demon',
    description: 'Complete any level in under 30 seconds',
    unlocked: false,
    icon: '⚡'
  },
  {
    id: 'perfectionist',
    name: 'Perfectionist',
    description: 'Complete all levels',
    unlocked: false,
    icon: '✨'
  }
];

// Game state management
export const mockGameState = {
  currentLevel: 'level1',
  unlockedLevels: ['level1'],
  completedLevels: [],
  selectedHandSkin: 'default',
  unlockedHandSkins: ['default'],
  totalPlayTime: 0,
  achievements: mockAchievements,
  settings: mockGameSettings,
  statistics: {
    totalGrabs: 0,
    totalReleases: 0,
    totalTeleports: 0,
    fastestTime: null,
    levelsCompleted: 0
  }
};

// Audio files (mock paths)
export const mockAudioFiles = {
  music: {
    menu: '/audio/menu_ambient.mp3',
    level1: '/audio/level1_minimal.mp3',
    level2: '/audio/level2_floating.mp3',
    level3: '/audio/level3_mystical.mp3',
    level4: '/audio/level4_dark.mp3',
    level5: '/audio/level5_ethereal.mp3'
  },
  sfx: {
    grab: '/audio/sfx_grab.mp3',
    release: '/audio/sfx_release.mp3',
    teleport: '/audio/sfx_teleport.mp3',
    gravityShift: '/audio/sfx_gravity_shift.mp3',
    levelComplete: '/audio/sfx_level_complete.mp3',
    achievement: '/audio/sfx_achievement.mp3'
  },
  voiceover: {
    level1: '/audio/vo_level1.mp3',
    level2: '/audio/vo_level2.mp3',
    level3: '/audio/vo_level3.mp3',
    level4: '/audio/vo_level4.mp3',
    level5: '/audio/vo_level5.mp3'
  }
};

// Helper functions for mock data
export const unlockLevel = (levelId) => {
  const level = mockLevels.find(l => l.id === levelId);
  if (level) {
    level.unlocked = true;
    mockGameState.unlockedLevels.push(levelId);
  }
};

export const completeLevel = (levelId, time) => {
  const level = mockLevels.find(l => l.id === levelId);
  if (level) {
    level.completed = true;
    if (!level.bestTime || time < level.bestTime) {
      level.bestTime = time;
    }
    if (!mockGameState.completedLevels.includes(levelId)) {
      mockGameState.completedLevels.push(levelId);
    }
  }
};

export const unlockHandSkin = (skinId) => {
  const skin = mockHandSkins.find(s => s.id === skinId);
  if (skin) {
    skin.unlocked = true;
    mockGameState.unlockedHandSkins.push(skinId);
  }
};

export const unlockAchievement = (achievementId) => {
  const achievement = mockAchievements.find(a => a.id === achievementId);
  if (achievement) {
    achievement.unlocked = true;
  }
};