from typing import List, Optional, Dict, Any
from datetime import datetime
from motor.motor_asyncio import AsyncIOMotorDatabase
from models import (
    PlayerGameState, GameLevel, HandSkin, Achievement, GameSession,
    LevelProgress, GameStatistics, LevelCompleteRequest,
    UpdateSettingsRequest, StartGameSessionRequest, UpdateGameStatsRequest
)
import logging

logger = logging.getLogger(__name__)

class GameService:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        
    async def initialize_game_data(self):
        """Initialize the game with default data if not exists"""
        await self._create_default_levels()
        await self._create_default_hand_skins()
        await self._create_default_achievements()
        await self._ensure_player_game_state()
        
    async def _create_default_levels(self):
        """Create default game levels"""
        existing_levels = await self.db.levels.count_documents({})
        if existing_levels > 0:
            return
            
        levels = [
            {
                "id": "level1",
                "name": "First Touch",
                "description": "Learn to grasp and release",
                "mechanics": ["basic_movement", "grab_release"],
                "balls": [{"id": "ball1", "position": [0, 2, 0], "color": "#ff6b6b"}],
                "targets": [{"id": "target1", "position": [3, 0, 0], "size": [1, 0.5, 1]}],
                "gravity": [0, -9.81, 0],
                "voiceover": "A hand... reaches through the void...",
                "environment": "minimal",
                "order": 1,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            },
            {
                "id": "level2",
                "name": "Gravity Shift",
                "description": "Gravity changes direction",
                "mechanics": ["basic_movement", "grab_release", "gravity_shift"],
                "balls": [
                    {"id": "ball1", "position": [-2, 2, 0], "color": "#4ecdc4"},
                    {"id": "ball2", "position": [2, 2, 0], "color": "#45b7d1"}
                ],
                "targets": [{"id": "target1", "position": [0, 3, 0], "size": [1, 0.5, 1]}],
                "gravity": [0, -9.81, 0],
                "gravity_shift_trigger": {"time": 10000, "new_gravity": [0, 9.81, 0]},
                "voiceover": "Reality bends... up becomes down...",
                "environment": "floating",
                "order": 2,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            },
            {
                "id": "level3",
                "name": "Portal Maze",
                "description": "Navigate through teleporters",
                "mechanics": ["basic_movement", "grab_release", "teleporters"],
                "balls": [{"id": "ball1", "position": [0, 2, 0], "color": "#96ceb4"}],
                "targets": [{"id": "target1", "position": [8, 0, 0], "size": [1, 0.5, 1]}],
                "teleporters": [
                    {"id": "portal1", "position": [2, 0, 0], "linked_to": "portal2", "color": "#ff9ff3"},
                    {"id": "portal2", "position": [6, 0, 0], "linked_to": "portal1", "color": "#ff9ff3"}
                ],
                "gravity": [0, -9.81, 0],
                "voiceover": "Tears in space... pathways between worlds...",
                "environment": "mystical",
                "order": 3,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            },
            {
                "id": "level4",
                "name": "Shadow Dance",
                "description": "Avoid the shadow hands",
                "mechanics": ["basic_movement", "grab_release", "enemy_hands"],
                "balls": [{"id": "ball1", "position": [0, 2, 0], "color": "#ffeaa7"}],
                "targets": [{"id": "target1", "position": [5, 0, 0], "size": [1, 0.5, 1]}],
                "enemy_hands": [
                    {
                        "id": "shadow1",
                        "position": [2, 1, 0],
                        "behavior": "patrol",
                        "patrol_path": [[2, 1, 0], [2, 1, 2], [2, 1, -2]]
                    }
                ],
                "gravity": [0, -9.81, 0],
                "voiceover": "Others have come before... they guard jealously...",
                "environment": "dark",
                "order": 4,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            },
            {
                "id": "level5",
                "name": "Final Grasp",
                "description": "Master all abilities",
                "mechanics": ["basic_movement", "grab_release", "gravity_shift", "teleporters", "time_challenge"],
                "balls": [
                    {"id": "ball1", "position": [-3, 2, 0], "color": "#fd79a8"},
                    {"id": "ball2", "position": [3, 2, 0], "color": "#6c5ce7"}
                ],
                "targets": [{"id": "target1", "position": [0, 5, 0], "size": [2, 0.5, 2]}],
                "teleporters": [
                    {"id": "portal1", "position": [-1, 0, 0], "linked_to": "portal2", "color": "#a29bfe"},
                    {"id": "portal2", "position": [1, 0, 0], "linked_to": "portal1", "color": "#a29bfe"}
                ],
                "gravity": [0, -9.81, 0],
                "gravity_shift_trigger": {"time": 15000, "new_gravity": [9.81, 0, 0]},
                "time_limit": 60000,
                "voiceover": "The hand knows its purpose... one final reach...",
                "environment": "ethereal",
                "order": 5,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
        ]
        
        await self.db.levels.insert_many(levels)
        logger.info("Created default game levels")
        
    async def _create_default_hand_skins(self):
        """Create default hand skins"""
        existing_skins = await self.db.hand_skins.count_documents({})
        if existing_skins > 0:
            return
            
        hand_skins = [
            {
                "id": "default",
                "name": "Human",
                "description": "The original hand",
                "texture": "human",
                "color": "#fdbcb4",
                "metallic": 0.1,
                "roughness": 0.8,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            },
            {
                "id": "robotic",
                "name": "Cybernetic",
                "description": "Steel and circuits",
                "texture": "metal",
                "color": "#8c9eff",
                "metallic": 0.9,
                "roughness": 0.1,
                "unlock_requirement": "complete_level_2",
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            },
            {
                "id": "ethereal",
                "name": "Ethereal",
                "description": "Translucent and mystical",
                "texture": "glass",
                "color": "#e1f5fe",
                "metallic": 0.0,
                "roughness": 0.0,
                "opacity": 0.7,
                "unlock_requirement": "complete_level_3",
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            },
            {
                "id": "wooden",
                "name": "Wooden",
                "description": "Carved from ancient oak",
                "texture": "wood",
                "color": "#8d6e63",
                "metallic": 0.0,
                "roughness": 0.9,
                "unlock_requirement": "complete_level_4",
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            },
            {
                "id": "shadow",
                "name": "Shadow",
                "description": "Darkness incarnate",
                "texture": "shadow",
                "color": "#424242",
                "metallic": 0.0,
                "roughness": 0.3,
                "unlock_requirement": "complete_all_levels",
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
        ]
        
        await self.db.hand_skins.insert_many(hand_skins)
        logger.info("Created default hand skins")
        
    async def _create_default_achievements(self):
        """Create default achievements"""
        existing_achievements = await self.db.achievements.count_documents({})
        if existing_achievements > 0:
            return
            
        achievements = [
            {
                "id": "first_touch",
                "name": "First Touch",
                "description": "Complete your first level",
                "icon": "👋",
                "unlock_condition": "complete_level_1",
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            },
            {
                "id": "gravity_master",
                "name": "Gravity Master",
                "description": "Complete a level with gravity shift",
                "icon": "🌀",
                "unlock_condition": "complete_level_2",
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            },
            {
                "id": "portal_runner",
                "name": "Portal Runner",
                "description": "Use teleporters 10 times",
                "icon": "🌌",
                "unlock_condition": "teleports_10",
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            },
            {
                "id": "speed_demon",
                "name": "Speed Demon",
                "description": "Complete any level in under 30 seconds",
                "icon": "⚡",
                "unlock_condition": "fast_completion_30s",
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            },
            {
                "id": "perfectionist",
                "name": "Perfectionist",
                "description": "Complete all levels",
                "icon": "✨",
                "unlock_condition": "complete_all_levels",
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
        ]
        
        await self.db.achievements.insert_many(achievements)
        logger.info("Created default achievements")
        
    async def _ensure_player_game_state(self):
        """Ensure player game state exists"""
        existing_state = await self.db.player_game_state.find_one({"player_id": "default"})
        if not existing_state:
            default_state = {
                "id": "default_state",
                "player_id": "default",
                "current_level": "level1",
                "unlocked_levels": ["level1"],
                "completed_levels": [],
                "selected_hand_skin": "default",
                "unlocked_hand_skins": ["default"],
                "level_progress": [],
                "unlocked_achievements": [],
                "statistics": {
                    "total_grabs": 0,
                    "total_releases": 0,
                    "total_teleports": 0,
                    "fastest_time": None,
                    "levels_completed": 0,
                    "total_play_time": 0
                },
                "settings": {
                    "audio": {
                        "master_volume": 0.7,
                        "sfx_volume": 0.8,
                        "music_volume": 0.6
                    },
                    "graphics": {
                        "quality": "medium",
                        "shadows": True,
                        "particles": True
                    },
                    "controls": {
                        "sensitivity": 1.0,
                        "invert_y": False
                    }
                },
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
            await self.db.player_game_state.insert_one(default_state)
            logger.info("Created default player game state")
    
    async def get_game_state(self, player_id: str = "default") -> Optional[PlayerGameState]:
        """Get current game state for player"""
        state_doc = await self.db.player_game_state.find_one({"player_id": player_id})
        if state_doc:
            return PlayerGameState(**state_doc)
        return None
    
    async def get_all_levels(self) -> List[GameLevel]:
        """Get all game levels"""
        levels = await self.db.levels.find().sort("order", 1).to_list(length=None)
        return [GameLevel(**level) for level in levels]
    
    async def get_level_by_id(self, level_id: str) -> Optional[GameLevel]:
        """Get specific level by ID"""
        level_doc = await self.db.levels.find_one({"id": level_id})
        if level_doc:
            return GameLevel(**level_doc)
        return None
    
    async def get_all_hand_skins(self) -> List[HandSkin]:
        """Get all hand skins"""
        skins = await self.db.hand_skins.find().to_list(length=None)
        return [HandSkin(**skin) for skin in skins]
    
    async def get_all_achievements(self) -> List[Achievement]:
        """Get all achievements"""
        achievements = await self.db.achievements.find().to_list(length=None)
        return [Achievement(**achievement) for achievement in achievements]
    
    async def complete_level(self, player_id: str, request: LevelCompleteRequest) -> bool:
        """Complete a level and update game state"""
        try:
            # Get current game state
            game_state = await self.get_game_state(player_id)
            if not game_state:
                return False
            
            # Update level progress
            level_progress = None
            for progress in game_state.level_progress:
                if progress.level_id == request.level_id:
                    level_progress = progress
                    break
            
            if not level_progress:
                level_progress = LevelProgress(level_id=request.level_id)
                game_state.level_progress.append(level_progress)
            
            # Update progress
            level_progress.completed = True
            level_progress.attempts += 1
            level_progress.last_played = datetime.utcnow()
            
            if not level_progress.best_time or request.completion_time < level_progress.best_time:
                level_progress.best_time = request.completion_time
            
            # Add to completed levels if not already there
            if request.level_id not in game_state.completed_levels:
                game_state.completed_levels.append(request.level_id)
            
            # Update statistics
            game_state.statistics.total_grabs += request.grabs_count
            game_state.statistics.total_releases += request.releases_count
            game_state.statistics.total_teleports += request.teleports_count
            game_state.statistics.levels_completed = len(game_state.completed_levels)
            
            if not game_state.statistics.fastest_time or request.completion_time < game_state.statistics.fastest_time:
                game_state.statistics.fastest_time = request.completion_time
            
            # Unlock next level
            await self._unlock_next_level(game_state, request.level_id)
            
            # Check for unlocks
            await self._check_unlocks(game_state, request.level_id, request.completion_time)
            
            # Save game state
            game_state.updated_at = datetime.utcnow()
            await self.db.player_game_state.replace_one(
                {"player_id": player_id},
                game_state.dict()
            )
            
            return True
            
        except Exception as e:
            logger.error(f"Error completing level: {e}")
            return False
    
    async def _unlock_next_level(self, game_state: PlayerGameState, completed_level_id: str):
        """Unlock the next level in sequence"""
        levels = await self.get_all_levels()
        current_level = next((l for l in levels if l.id == completed_level_id), None)
        
        if current_level:
            next_level = next((l for l in levels if l.order == current_level.order + 1), None)
            if next_level and next_level.id not in game_state.unlocked_levels:
                game_state.unlocked_levels.append(next_level.id)
    
    async def _check_unlocks(self, game_state: PlayerGameState, level_id: str, completion_time: int):
        """Check for hand skin and achievement unlocks"""
        # Check hand skin unlocks
        hand_skins = await self.get_all_hand_skins()
        for skin in hand_skins:
            if skin.unlock_requirement and skin.id not in game_state.unlocked_hand_skins:
                if await self._check_unlock_condition(game_state, skin.unlock_requirement):
                    game_state.unlocked_hand_skins.append(skin.id)
        
        # Check achievement unlocks
        achievements = await self.get_all_achievements()
        for achievement in achievements:
            if achievement.id not in game_state.unlocked_achievements:
                if await self._check_unlock_condition(game_state, achievement.unlock_condition, completion_time):
                    game_state.unlocked_achievements.append(achievement.id)
    
    async def _check_unlock_condition(self, game_state: PlayerGameState, condition: str, completion_time: int = None) -> bool:
        """Check if unlock condition is met"""
        if condition == "complete_level_1":
            return "level1" in game_state.completed_levels
        elif condition == "complete_level_2":
            return "level2" in game_state.completed_levels
        elif condition == "complete_level_3":
            return "level3" in game_state.completed_levels
        elif condition == "complete_level_4":
            return "level4" in game_state.completed_levels
        elif condition == "complete_all_levels":
            return len(game_state.completed_levels) >= 5
        elif condition == "teleports_10":
            return game_state.statistics.total_teleports >= 10
        elif condition == "fast_completion_30s":
            return completion_time and completion_time < 30000
        
        return False
    
    async def update_settings(self, player_id: str, request: UpdateSettingsRequest) -> bool:
        """Update player settings"""
        try:
            result = await self.db.player_game_state.update_one(
                {"player_id": player_id},
                {
                    "$set": {
                        "settings": request.settings.dict(),
                        "updated_at": datetime.utcnow()
                    }
                }
            )
            return result.modified_count > 0
        except Exception as e:
            logger.error(f"Error updating settings: {e}")
            return False
    
    async def select_hand_skin(self, player_id: str, hand_skin_id: str) -> bool:
        """Select a hand skin"""
        try:
            result = await self.db.player_game_state.update_one(
                {"player_id": player_id},
                {
                    "$set": {
                        "selected_hand_skin": hand_skin_id,
                        "updated_at": datetime.utcnow()
                    }
                }
            )
            return result.modified_count > 0
        except Exception as e:
            logger.error(f"Error selecting hand skin: {e}")
            return False
    
    async def start_game_session(self, player_id: str, request: StartGameSessionRequest) -> str:
        """Start a new game session"""
        try:
            session = GameSession(
                player_id=player_id,
                level_id=request.level_id,
                start_time=datetime.utcnow()
            )
            
            await self.db.game_sessions.insert_one(session.dict())
            return session.id
            
        except Exception as e:
            logger.error(f"Error starting game session: {e}")
            return None
    
    async def update_game_stats(self, player_id: str, request: UpdateGameStatsRequest) -> bool:
        """Update game statistics"""
        try:
            result = await self.db.player_game_state.update_one(
                {"player_id": player_id},
                {
                    "$inc": {
                        "statistics.total_grabs": request.grabs,
                        "statistics.total_releases": request.releases,
                        "statistics.total_teleports": request.teleports,
                        "statistics.total_play_time": request.play_time
                    },
                    "$set": {
                        "updated_at": datetime.utcnow()
                    }
                }
            )
            return result.modified_count > 0
        except Exception as e:
            logger.error(f"Error updating game stats: {e}")
            return False