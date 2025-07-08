from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List
import uuid
from datetime import datetime

# Import game models and services
from models import (
    StatusCheck, StatusCheckCreate, PlayerGameState, GameLevel, HandSkin, Achievement,
    LevelCompleteRequest, UpdateSettingsRequest, SelectHandSkinRequest,
    StartGameSessionRequest, UpdateGameStatsRequest,
    GameStateResponse, LevelListResponse, HandSkinListResponse, AchievementListResponse,
    GenericResponse
)
from game_service import GameService

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Initialize game service
game_service = GameService(db)

# Create the main app without a prefix
app = FastAPI(title="Hand of Gravity API", description="API for Hand of Gravity 3D Puzzle Game", version="1.0.0")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Initialize game data on startup
@app.on_event("startup")
async def startup_event():
    await game_service.initialize_game_data()
    logging.info("Game data initialized")

# Health check routes
@api_router.get("/")
async def root():
    return {"message": "Hand of Gravity API is running", "version": "1.0.0"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.dict()
    status_obj = StatusCheck(**status_dict)
    _ = await db.status_checks.insert_one(status_obj.dict())
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find().to_list(1000)
    return [StatusCheck(**status_check) for status_check in status_checks]

# Game API Routes
@api_router.get("/game/state", response_model=GameStateResponse)
async def get_game_state(player_id: str = "default"):
    """Get current game state for player"""
    try:
        game_state = await game_service.get_game_state(player_id)
        if not game_state:
            raise HTTPException(status_code=404, detail="Game state not found")
        
        return GameStateResponse(
            success=True,
            data=game_state,
            message="Game state retrieved successfully"
        )
    except Exception as e:
        logging.error(f"Error getting game state: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@api_router.get("/game/levels", response_model=LevelListResponse)
async def get_all_levels():
    """Get all game levels"""
    try:
        levels = await game_service.get_all_levels()
        return LevelListResponse(
            success=True,
            data=levels,
            message="Levels retrieved successfully"
        )
    except Exception as e:
        logging.error(f"Error getting levels: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@api_router.get("/game/levels/{level_id}", response_model=GameLevel)
async def get_level_by_id(level_id: str):
    """Get specific level by ID"""
    try:
        level = await game_service.get_level_by_id(level_id)
        if not level:
            raise HTTPException(status_code=404, detail="Level not found")
        return level
    except Exception as e:
        logging.error(f"Error getting level: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@api_router.get("/game/hand-skins", response_model=HandSkinListResponse)
async def get_all_hand_skins():
    """Get all hand skins"""
    try:
        hand_skins = await game_service.get_all_hand_skins()
        return HandSkinListResponse(
            success=True,
            data=hand_skins,
            message="Hand skins retrieved successfully"
        )
    except Exception as e:
        logging.error(f"Error getting hand skins: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@api_router.get("/game/achievements", response_model=AchievementListResponse)
async def get_all_achievements():
    """Get all achievements"""
    try:
        achievements = await game_service.get_all_achievements()
        return AchievementListResponse(
            success=True,
            data=achievements,
            message="Achievements retrieved successfully"
        )
    except Exception as e:
        logging.error(f"Error getting achievements: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@api_router.post("/game/complete-level", response_model=GenericResponse)
async def complete_level(request: LevelCompleteRequest, player_id: str = "default"):
    """Complete a level"""
    try:
        success = await game_service.complete_level(player_id, request)
        if not success:
            raise HTTPException(status_code=400, detail="Failed to complete level")
        
        return GenericResponse(
            success=True,
            message="Level completed successfully"
        )
    except Exception as e:
        logging.error(f"Error completing level: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@api_router.post("/game/settings", response_model=GenericResponse)
async def update_settings(request: UpdateSettingsRequest, player_id: str = "default"):
    """Update player settings"""
    try:
        success = await game_service.update_settings(player_id, request)
        if not success:
            raise HTTPException(status_code=400, detail="Failed to update settings")
        
        return GenericResponse(
            success=True,
            message="Settings updated successfully"
        )
    except Exception as e:
        logging.error(f"Error updating settings: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@api_router.post("/game/select-hand-skin", response_model=GenericResponse)
async def select_hand_skin(request: SelectHandSkinRequest, player_id: str = "default"):
    """Select a hand skin"""
    try:
        success = await game_service.select_hand_skin(player_id, request.hand_skin_id)
        if not success:
            raise HTTPException(status_code=400, detail="Failed to select hand skin")
        
        return GenericResponse(
            success=True,
            message="Hand skin selected successfully"
        )
    except Exception as e:
        logging.error(f"Error selecting hand skin: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@api_router.post("/game/start-session", response_model=GenericResponse)
async def start_game_session(request: StartGameSessionRequest, player_id: str = "default"):
    """Start a new game session"""
    try:
        session_id = await game_service.start_game_session(player_id, request)
        if not session_id:
            raise HTTPException(status_code=400, detail="Failed to start game session")
        
        return GenericResponse(
            success=True,
            message="Game session started successfully",
            data={"session_id": session_id}
        )
    except Exception as e:
        logging.error(f"Error starting game session: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@api_router.post("/game/update-stats", response_model=GenericResponse)
async def update_game_stats(request: UpdateGameStatsRequest, player_id: str = "default"):
    """Update game statistics"""
    try:
        success = await game_service.update_game_stats(player_id, request)
        if not success:
            raise HTTPException(status_code=400, detail="Failed to update stats")
        
        return GenericResponse(
            success=True,
            message="Game stats updated successfully"
        )
    except Exception as e:
        logging.error(f"Error updating game stats: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
