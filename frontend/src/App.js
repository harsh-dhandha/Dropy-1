import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { Physics } from '@react-three/cannon';
import { Suspense } from 'react';
import './App.css';

// Components
import MainMenu from './components/MainMenu';
import GameCanvas from './components/GameCanvas';
import LevelSelect from './components/LevelSelect';
import HandCustomization from './components/HandCustomization';
import Settings from './components/Settings';
import GameHUD from './components/GameHUD';
import LoadingScreen from './components/LoadingScreen';
import { GameProvider } from './contexts/GameContext';
import { AudioProvider } from './contexts/AudioContext';

function App() {
  return (
    <div className="App">
      <AudioProvider>
        <GameProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<MainMenu />} />
              <Route path="/levels" element={<LevelSelect />} />
              <Route path="/customization" element={<HandCustomization />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/play/:levelId" element={<GameView />} />
            </Routes>
          </BrowserRouter>
        </GameProvider>
      </AudioProvider>
    </div>
  );
}

// Game view component that wraps the 3D canvas
const GameView = () => {
  return (
    <div className="game-view">
      <Suspense fallback={<LoadingScreen />}>
        <Canvas
          className="game-canvas"
          camera={{ position: [0, 5, 10], fov: 60 }}
          gl={{ antialias: true, alpha: true }}
        >
          <Physics 
            gravity={[0, -9.81, 0]}
            defaultContactMaterial={{ friction: 0.4, restitution: 0.3 }}
          >
            <GameCanvas />
          </Physics>
        </Canvas>
        <GameHUD />
      </Suspense>
    </div>
  );
};

export default App;