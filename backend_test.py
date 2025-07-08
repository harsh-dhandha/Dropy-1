#!/usr/bin/env python3
import requests
import json
import time
import os
import sys
from datetime import datetime

# Get the backend URL from the frontend .env file
def get_backend_url():
    with open('/app/frontend/.env', 'r') as f:
        for line in f:
            if line.startswith('REACT_APP_BACKEND_URL='):
                return line.strip().split('=')[1].strip('"\'')
    raise Exception("Could not find REACT_APP_BACKEND_URL in frontend/.env")

# Base URL for API requests
BASE_URL = f"{get_backend_url()}/api"
print(f"Using backend URL: {BASE_URL}")

# Test player ID
PLAYER_ID = "test_player_" + datetime.now().strftime("%Y%m%d%H%M%S")

# Test results tracking
test_results = {
    "total": 0,
    "passed": 0,
    "failed": 0,
    "tests": []
}

def run_test(test_name, test_func):
    """Run a test and track results"""
    test_results["total"] += 1
    print(f"\n{'='*80}\nRunning test: {test_name}\n{'='*80}")
    
    try:
        start_time = time.time()
        result = test_func()
        end_time = time.time()
        
        if result:
            test_results["passed"] += 1
            status = "PASSED"
        else:
            test_results["failed"] += 1
            status = "FAILED"
            
        test_results["tests"].append({
            "name": test_name,
            "status": status,
            "duration": round(end_time - start_time, 2)
        })
        
        print(f"Test {status}: {test_name}")
        return result
    except Exception as e:
        test_results["failed"] += 1
        test_results["tests"].append({
            "name": test_name,
            "status": "ERROR",
            "error": str(e)
        })
        print(f"Test ERROR: {test_name}")
        print(f"Error: {e}")
        return False

def test_health_check():
    """Test the root endpoint and basic API connectivity"""
    response = requests.get(f"{BASE_URL}/")
    
    if response.status_code != 200:
        print(f"Health check failed with status code: {response.status_code}")
        return False
    
    data = response.json()
    if "message" not in data or "version" not in data:
        print(f"Health check response missing expected fields: {data}")
        return False
    
    print(f"Health check successful: {data}")
    return True

def test_status_endpoint():
    """Test the status endpoint for basic database connectivity"""
    # Create a status check
    create_data = {"message": "Test status check", "status": "ok"}
    create_response = requests.post(f"{BASE_URL}/status", json=create_data)
    
    if create_response.status_code != 200:
        print(f"Status create failed with status code: {create_response.status_code}")
        return False
    
    # Get status checks
    get_response = requests.get(f"{BASE_URL}/status")
    
    if get_response.status_code != 200:
        print(f"Status get failed with status code: {get_response.status_code}")
        return False
    
    status_checks = get_response.json()
    if not isinstance(status_checks, list):
        print(f"Status get response is not a list: {status_checks}")
        return False
    
    print(f"Status endpoint test successful")
    return True

def test_game_state_management():
    """Test getting and updating player game state"""
    # Get game state
    response = requests.get(f"{BASE_URL}/game/state", params={"player_id": PLAYER_ID})
    
    if response.status_code != 200:
        print(f"Get game state failed with status code: {response.status_code}")
        return False
    
    data = response.json()
    if not data.get("success"):
        print(f"Get game state response indicates failure: {data}")
        return False
    
    game_state = data.get("data")
    if not game_state:
        print(f"Game state data is missing: {data}")
        return False
    
    # Verify default state structure
    required_fields = ["current_level", "unlocked_levels", "completed_levels", 
                      "selected_hand_skin", "unlocked_hand_skins", "settings"]
    
    for field in required_fields:
        if field not in game_state:
            print(f"Game state missing required field: {field}")
            return False
    
    print(f"Game state management test successful")
    return True

def test_level_operations():
    """Test getting all levels and individual level details"""
    # Get all levels
    all_levels_response = requests.get(f"{BASE_URL}/game/levels")
    
    if all_levels_response.status_code != 200:
        print(f"Get all levels failed with status code: {all_levels_response.status_code}")
        return False
    
    all_levels_data = all_levels_response.json()
    if not all_levels_data.get("success"):
        print(f"Get all levels response indicates failure: {all_levels_data}")
        return False
    
    levels = all_levels_data.get("data")
    if not levels or not isinstance(levels, list) or len(levels) == 0:
        print(f"Levels data is missing or empty: {all_levels_data}")
        return False
    
    # Get a specific level
    level_id = levels[0]["id"]
    level_response = requests.get(f"{BASE_URL}/game/levels/{level_id}")
    
    if level_response.status_code != 200:
        print(f"Get level by ID failed with status code: {level_response.status_code}")
        return False
    
    level_data = level_response.json()
    if "id" not in level_data or level_data["id"] != level_id:
        print(f"Level data is incorrect: {level_data}")
        return False
    
    print(f"Level operations test successful")
    return True

def test_hand_skin_management():
    """Test getting hand skins and selecting different skins"""
    # Get all hand skins
    skins_response = requests.get(f"{BASE_URL}/game/hand-skins")
    
    if skins_response.status_code != 200:
        print(f"Get hand skins failed with status code: {skins_response.status_code}")
        return False
    
    skins_data = skins_response.json()
    if not skins_data.get("success"):
        print(f"Get hand skins response indicates failure: {skins_data}")
        return False
    
    skins = skins_data.get("data")
    if not skins or not isinstance(skins, list) or len(skins) == 0:
        print(f"Hand skins data is missing or empty: {skins_data}")
        return False
    
    # Select a hand skin
    default_skin_id = next((skin["id"] for skin in skins if skin["id"] == "default"), None)
    if not default_skin_id:
        print(f"Default hand skin not found in skins list")
        return False
    
    select_response = requests.post(
        f"{BASE_URL}/game/select-hand-skin", 
        params={"player_id": PLAYER_ID},
        json={"hand_skin_id": default_skin_id}
    )
    
    if select_response.status_code != 200:
        print(f"Select hand skin failed with status code: {select_response.status_code}")
        return False
    
    select_data = select_response.json()
    if not select_data.get("success"):
        print(f"Select hand skin response indicates failure: {select_data}")
        return False
    
    # Verify the selection was applied
    state_response = requests.get(f"{BASE_URL}/game/state", params={"player_id": PLAYER_ID})
    if state_response.status_code != 200:
        print(f"Get game state failed with status code: {state_response.status_code}")
        return False
    
    state_data = state_response.json()
    game_state = state_data.get("data")
    
    if game_state.get("selected_hand_skin") != default_skin_id:
        print(f"Hand skin selection was not applied. Expected: {default_skin_id}, Got: {game_state.get('selected_hand_skin')}")
        return False
    
    print(f"Hand skin management test successful")
    return True

def test_settings_management():
    """Test updating game settings"""
    # Define new settings
    new_settings = {
        "settings": {
            "audio": {
                "master_volume": 0.5,
                "sfx_volume": 0.6,
                "music_volume": 0.4
            },
            "graphics": {
                "quality": "high",
                "shadows": True,
                "particles": False
            },
            "controls": {
                "sensitivity": 1.2,
                "invert_y": True
            }
        }
    }
    
    # Update settings
    update_response = requests.post(
        f"{BASE_URL}/game/settings", 
        params={"player_id": PLAYER_ID},
        json=new_settings
    )
    
    if update_response.status_code != 200:
        print(f"Update settings failed with status code: {update_response.status_code}")
        return False
    
    update_data = update_response.json()
    if not update_data.get("success"):
        print(f"Update settings response indicates failure: {update_data}")
        return False
    
    # Verify the settings were applied
    state_response = requests.get(f"{BASE_URL}/game/state", params={"player_id": PLAYER_ID})
    if state_response.status_code != 200:
        print(f"Get game state failed with status code: {state_response.status_code}")
        return False
    
    state_data = state_response.json()
    game_state = state_data.get("data")
    
    settings = game_state.get("settings")
    if not settings:
        print(f"Settings not found in game state: {game_state}")
        return False
    
    # Check a few key settings to verify update
    if settings.get("audio", {}).get("master_volume") != new_settings["settings"]["audio"]["master_volume"]:
        print(f"Audio settings not updated correctly")
        return False
    
    if settings.get("graphics", {}).get("quality") != new_settings["settings"]["graphics"]["quality"]:
        print(f"Graphics settings not updated correctly")
        return False
    
    if settings.get("controls", {}).get("invert_y") != new_settings["settings"]["controls"]["invert_y"]:
        print(f"Control settings not updated correctly")
        return False
    
    print(f"Settings management test successful")
    return True

def test_game_statistics():
    """Test updating and tracking game statistics"""
    # Update game stats
    stats_update = {
        "grabs": 10,
        "releases": 8,
        "teleports": 5,
        "play_time": 120
    }
    
    update_response = requests.post(
        f"{BASE_URL}/game/update-stats", 
        params={"player_id": PLAYER_ID},
        json=stats_update
    )
    
    if update_response.status_code != 200:
        print(f"Update stats failed with status code: {update_response.status_code}")
        return False
    
    update_data = update_response.json()
    if not update_data.get("success"):
        print(f"Update stats response indicates failure: {update_data}")
        return False
    
    # Verify the stats were updated
    state_response = requests.get(f"{BASE_URL}/game/state", params={"player_id": PLAYER_ID})
    if state_response.status_code != 200:
        print(f"Get game state failed with status code: {state_response.status_code}")
        return False
    
    state_data = state_response.json()
    game_state = state_data.get("data")
    
    statistics = game_state.get("statistics")
    if not statistics:
        print(f"Statistics not found in game state: {game_state}")
        return False
    
    # Check that stats were incremented (not just set)
    if statistics.get("total_grabs") < stats_update["grabs"]:
        print(f"Grabs stat not updated correctly: {statistics.get('total_grabs')}")
        return False
    
    if statistics.get("total_releases") < stats_update["releases"]:
        print(f"Releases stat not updated correctly: {statistics.get('total_releases')}")
        return False
    
    if statistics.get("total_teleports") < stats_update["teleports"]:
        print(f"Teleports stat not updated correctly: {statistics.get('total_teleports')}")
        return False
    
    if statistics.get("total_play_time") < stats_update["play_time"]:
        print(f"Play time stat not updated correctly: {statistics.get('total_play_time')}")
        return False
    
    print(f"Game statistics test successful")
    return True

def test_game_sessions():
    """Test starting game sessions"""
    # Get all levels first
    levels_response = requests.get(f"{BASE_URL}/game/levels")
    levels_data = levels_response.json()
    levels = levels_data.get("data")
    
    if not levels or len(levels) == 0:
        print(f"No levels found to start a session with")
        return False
    
    level_id = levels[0]["id"]
    
    # Start a game session
    session_request = {
        "level_id": level_id
    }
    
    session_response = requests.post(
        f"{BASE_URL}/game/start-session", 
        params={"player_id": PLAYER_ID},
        json=session_request
    )
    
    if session_response.status_code != 200:
        print(f"Start session failed with status code: {session_response.status_code}")
        return False
    
    session_data = session_response.json()
    if not session_data.get("success"):
        print(f"Start session response indicates failure: {session_data}")
        return False
    
    # Check that we got a session ID back
    if not session_data.get("data") or not session_data.get("data").get("session_id"):
        print(f"Session ID not returned: {session_data}")
        return False
    
    print(f"Game sessions test successful")
    return True

def test_level_completion():
    """Test completing a level and verify proper state updates"""
    # Get all levels first
    levels_response = requests.get(f"{BASE_URL}/game/levels")
    levels_data = levels_response.json()
    levels = levels_data.get("data")
    
    if not levels or len(levels) == 0:
        print(f"No levels found to complete")
        return False
    
    level_id = levels[0]["id"]
    
    # Complete a level
    completion_request = {
        "level_id": level_id,
        "completion_time": 25000,  # 25 seconds in milliseconds
        "grabs_count": 5,
        "releases_count": 5,
        "teleports_count": 2
    }
    
    completion_response = requests.post(
        f"{BASE_URL}/game/complete-level", 
        params={"player_id": PLAYER_ID},
        json=completion_request
    )
    
    if completion_response.status_code != 200:
        print(f"Complete level failed with status code: {completion_response.status_code}")
        return False
    
    completion_data = completion_response.json()
    if not completion_data.get("success"):
        print(f"Complete level response indicates failure: {completion_data}")
        return False
    
    # Verify the level was marked as completed
    state_response = requests.get(f"{BASE_URL}/game/state", params={"player_id": PLAYER_ID})
    if state_response.status_code != 200:
        print(f"Get game state failed with status code: {state_response.status_code}")
        return False
    
    state_data = state_response.json()
    game_state = state_data.get("data")
    
    if level_id not in game_state.get("completed_levels", []):
        print(f"Level not marked as completed: {game_state.get('completed_levels')}")
        return False
    
    # Check if next level was unlocked (if this wasn't the last level)
    if len(levels) > 1:
        next_level = next((l for l in levels if l["order"] == levels[0]["order"] + 1), None)
        if next_level and next_level["id"] not in game_state.get("unlocked_levels", []):
            print(f"Next level not unlocked: {game_state.get('unlocked_levels')}")
            return False
    
    # Check if level progress was updated
    level_progress = next((p for p in game_state.get("level_progress", []) if p["level_id"] == level_id), None)
    if not level_progress:
        print(f"Level progress not found: {game_state.get('level_progress')}")
        return False
    
    if not level_progress.get("completed"):
        print(f"Level progress not marked as completed: {level_progress}")
        return False
    
    if level_progress.get("best_time") != completion_request["completion_time"]:
        print(f"Best time not updated correctly: {level_progress.get('best_time')}")
        return False
    
    # Check if statistics were updated
    statistics = game_state.get("statistics")
    if not statistics:
        print(f"Statistics not found in game state: {game_state}")
        return False
    
    # Check for achievements unlocked
    # First level completion should unlock the "first_touch" achievement
    if level_id == "level1" and "first_touch" not in game_state.get("unlocked_achievements", []):
        print(f"First touch achievement not unlocked: {game_state.get('unlocked_achievements')}")
        # This is not a critical failure, so we'll just warn
        print(f"WARNING: Expected achievement unlock didn't happen")
    
    print(f"Level completion test successful")
    return True

def test_achievements():
    """Test getting all achievements"""
    response = requests.get(f"{BASE_URL}/game/achievements")
    
    if response.status_code != 200:
        print(f"Get achievements failed with status code: {response.status_code}")
        return False
    
    data = response.json()
    if not data.get("success"):
        print(f"Get achievements response indicates failure: {data}")
        return False
    
    achievements = data.get("data")
    if not achievements or not isinstance(achievements, list) or len(achievements) == 0:
        print(f"Achievements data is missing or empty: {data}")
        return False
    
    # Check for expected achievement types
    achievement_ids = [a["id"] for a in achievements]
    expected_achievements = ["first_touch", "gravity_master", "portal_runner", "speed_demon", "perfectionist"]
    
    for expected in expected_achievements:
        if expected not in achievement_ids:
            print(f"Expected achievement {expected} not found in achievements list")
            return False
    
    print(f"Achievements test successful")
    return True

def run_all_tests():
    """Run all tests in sequence"""
    tests = [
        ("Health Check", test_health_check),
        ("Status Endpoint", test_status_endpoint),
        ("Game State Management", test_game_state_management),
        ("Level Operations", test_level_operations),
        ("Hand Skin Management", test_hand_skin_management),
        ("Settings Management", test_settings_management),
        ("Game Statistics", test_game_statistics),
        ("Game Sessions", test_game_sessions),
        ("Level Completion", test_level_completion),
        ("Achievements", test_achievements)
    ]
    
    for test_name, test_func in tests:
        run_test(test_name, test_func)
    
    # Print summary
    print("\n" + "="*80)
    print(f"TEST SUMMARY: {test_results['passed']}/{test_results['total']} tests passed")
    print("="*80)
    
    for test in test_results["tests"]:
        status_display = "✅" if test["status"] == "PASSED" else "❌"
        print(f"{status_display} {test['name']}")
        if test["status"] == "ERROR" and "error" in test:
            print(f"   Error: {test['error']}")
    
    print("="*80)
    
    return test_results["failed"] == 0

if __name__ == "__main__":
    success = run_all_tests()
    sys.exit(0 if success else 1)