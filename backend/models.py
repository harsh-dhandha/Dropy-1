from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
import uuid

# Base Models
class BaseDocument(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

# Hand Skin Models
class HandSkin(BaseDocument):
    name: str
    description: str
    texture: str
    color: str
    metallic: float = 0.0
    roughness: float = 0.5
    opacity: Optional[float] = None
    unlock_requirement: Optional[str] = None  # e.g., "complete_level_2"

# Level Models
class BallData(BaseModel):
    id: str
    position: List[float]
    color: str

class TargetData(BaseModel):
    id: str
    position: List[float]
    size: List[float]

class TeleporterData(BaseModel):
    id: str
    position: List[float]
    linked_to: str
    color: str

class EnemyHandData(BaseModel):
    id: str
    position: List[float]
    behavior: str
    patrol_path: Optional[List[List[float]]] = None

class GravityShiftTrigger(BaseModel):
    time: int  # milliseconds
    new_gravity: List[float]

class GameLevel(BaseDocument):
    name: str
    description: str
    mechanics: List[str]
    balls: List[BallData]
    targets: List[TargetData]
    gravity: List[float]
    teleporters: Optional[List[TeleporterData]] = None
    enemy_hands: Optional[List[EnemyHandData]] = None
    gravity_shift_trigger: Optional[GravityShiftTrigger] = None
    time_limit: Optional[int] = None  # milliseconds
    voiceover: str
    environment: str
    order: int  # Level order

# Achievement Models
class Achievement(BaseDocument):
    name: str
    description: str
    icon: str
    unlock_condition: str  # e.g., "complete_level_1", "complete_all_levels"

# Game State Models
class LevelProgress(BaseModel):
    level_id: str
    completed: bool = False
    best_time: Optional[int] = None
    attempts: int = 0
    last_played: Optional[datetime] = None

class GameStatistics(BaseModel):
    total_grabs: int = 0
    total_releases: int = 0
    total_teleports: int = 0
    fastest_time: Optional[int] = None
    levels_completed: int = 0
    total_play_time: int = 0  # seconds

class GameSettings(BaseModel):
    audio: Dict[str, float] = {
        "master_volume": 0.7,
        "sfx_volume": 0.8,
        "music_volume": 0.6
    }
    graphics: Dict[str, Any] = {
        "quality": "medium",
        "shadows": True,
        "particles": True
    }
    controls: Dict[str, Any] = {
        "sensitivity": 1.0,
        "invert_y": False
    }

class PlayerGameState(BaseDocument):
    player_id: str = Field(default="default")  # For demo, using single player
    current_level: str = "level1"
    unlocked_levels: List[str] = ["level1"]
    completed_levels: List[str] = []
    selected_hand_skin: str = "default"
    unlocked_hand_skins: List[str] = ["default"]
    level_progress: List[LevelProgress] = []
    unlocked_achievements: List[str] = []
    statistics: GameStatistics = GameStatistics()
    settings: GameSettings = GameSettings()

# Game Session Models
class GameSession(BaseDocument):
    player_id: str
    level_id: str
    start_time: datetime
    end_time: Optional[datetime] = None
    completed: bool = False
    completion_time: Optional[int] = None  # milliseconds
    grabs_count: int = 0
    releases_count: int = 0
    teleports_count: int = 0

# API Request/Response Models
class LevelCompleteRequest(BaseModel):
    level_id: str
    completion_time: int
    grabs_count: int = 0
    releases_count: int = 0
    teleports_count: int = 0

class UpdateSettingsRequest(BaseModel):
    settings: GameSettings

class UnlockAchievementRequest(BaseModel):
    achievement_id: str

class SelectHandSkinRequest(BaseModel):
    hand_skin_id: str

class StartGameSessionRequest(BaseModel):
    level_id: str

class UpdateGameStatsRequest(BaseModel):
    grabs: int = 0
    releases: int = 0
    teleports: int = 0
    play_time: int = 0  # seconds

# Response Models
class GameStateResponse(BaseModel):
    success: bool
    data: Optional[PlayerGameState] = None
    message: str = ""

class LevelListResponse(BaseModel):
    success: bool
    data: Optional[List[GameLevel]] = None
    message: str = ""

class HandSkinListResponse(BaseModel):
    success: bool
    data: Optional[List[HandSkin]] = None
    message: str = ""

class AchievementListResponse(BaseModel):
    success: bool
    data: Optional[List[Achievement]] = None
    message: str = ""

class GenericResponse(BaseModel):
    success: bool
    message: str = ""
    data: Optional[Any] = None