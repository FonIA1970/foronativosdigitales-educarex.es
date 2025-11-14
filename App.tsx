import React, { useState, useEffect, useCallback } from 'react';
import type { GameState, SaveData } from './types';
import { getNextStoryPart } from './services/geminiService';
import Sidebar from './components/Sidebar';
import StoryDisplay from './components/StoryDisplay';
import ErrorDisplay from './components/ErrorDisplay';
import MusicPlayer from './components/MusicPlayer';

const VolumeUpIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
  </svg>
);

const VolumeOffIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.718 5.282A1 1 0 0112 6v12a1 1 0 01-1.707.707L6.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.425-.01zM16 9.013l4 4.013m0-4.013l-4 4.013" />
  </svg>
);


const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [storyHistory, setStoryHistory] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string>('');

  const fetchInitialStory = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const initialState = await getNextStoryPart('start_game', [], [], '');
      setGameState(initialState);
      setStoryHistory([initialState.storyText]);
    } catch (err) {
      console.error(err);
      setError('No se pudo iniciar la aventura. Por favor, comprueba tu clave de API e inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const loadGame = () => {
      try {
        const savedDataString = localStorage.getItem('infiniteAdventureSaveData');
        if (savedDataString) {
          const savedData: SaveData = JSON.parse(savedDataString);
          if (savedData.gameState && savedData.storyHistory) {
            setGameState(savedData.gameState);
            setStoryHistory(savedData.storyHistory);
            setIsLoading(false); // Partida cargada, detener la carga.
          } else {
            throw new Error("Los datos guardados están malformados.");
          }
        } else {
          fetchInitialStory(); // No se encontró partida guardada, empezar una nueva.
        }
      } catch (err) {
        console.error("No se pudo cargar la partida guardada, se iniciará una nueva.", err);
        localStorage.removeItem('infiniteAdventureSaveData');
        fetchInitialStory(); // Error al cargar, empezar una nueva.
      }
    };
    loadGame();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChoice = async (choice: string) => {
    if (!gameState) return;

    setIsLoading(true);
    setError(null);
    
    const currentInventory = gameState.inventory;
    const currentQuest = gameState.currentQuest;

    try {
      const nextState = await getNextStoryPart(choice, storyHistory, currentInventory, currentQuest);
      setGameState(nextState);
      setStoryHistory(prev => [...prev, nextState.storyText]);
    } catch (err) {
      console.error(err);
      setError('La historia dio un giro inesperado y no pudo continuar. Intenta tomar una decisión diferente o reiniciar.');
      // Keep the old game state on error so the user can try again
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleRestart = () => {
    localStorage.removeItem('infiniteAdventureSaveData');
    setGameState(null);
    setStoryHistory([]);
    fetchInitialStory();
  };

  const handleSave = () => {
    if (!gameState || storyHistory.length === 0) return;

    try {
      const saveData: SaveData = { gameState, storyHistory };
      localStorage.setItem('infiniteAdventureSaveData', JSON.stringify(saveData));
      setSaveMessage('¡Guardado!');
      setTimeout(() => setSaveMessage(''), 2000);
    } catch (err) {
      console.error("Error al guardar la partida:", err);
      setError("No se pudo guardar el progreso. Es posible que el almacenamiento de tu navegador esté lleno.");
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-900 text-gray-200">
      <MusicPlayer currentTone={gameState?.tone} isMuted={isMuted} />
      <main className="flex-1 p-4 md:p-8 flex flex-col overflow-y-auto">
        <header className="flex justify-between items-center mb-6">
           <h1 className="text-3xl md:text-4xl font-bold text-amber-400 font-serif tracking-wider">Aventura Infinita</h1>
           <div className="flex items-center space-x-4">
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors duration-200 disabled:bg-gray-500 disabled:cursor-not-allowed"
              disabled={isLoading || !gameState}
            >
              {saveMessage || 'Guardar'}
            </button>
            <button 
              onClick={handleRestart}
              className="px-4 py-2 bg-amber-600 text-white font-semibold rounded-lg hover:bg-amber-700 transition-colors duration-200 disabled:bg-gray-500"
              disabled={isLoading}
            >
              Reiniciar
            </button>
            <button
                onClick={() => setIsMuted(prev => !prev)}
                className="p-2 rounded-full hover:bg-gray-700 transition-colors"
                aria-label={isMuted ? "Activar sonido" : "Silenciar"}
              >
                {isMuted ? <VolumeOffIcon /> : <VolumeUpIcon />}
              </button>
           </div>
        </header>

        {error && <ErrorDisplay message={error} />}
        
        <StoryDisplay 
          gameState={gameState} 
          isLoading={isLoading} 
          onChoice={handleChoice} 
        />
      </main>
      
      <Sidebar 
        inventory={gameState?.inventory ?? []} 
        currentQuest={gameState?.currentQuest ?? ''} 
        isLoading={isLoading}
      />
    </div>
  );
};

export default App;