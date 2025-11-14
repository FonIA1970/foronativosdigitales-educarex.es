import React, { useState } from 'react';
import type { GameState } from '../types';
import LoadingSpinner from './LoadingSpinner';

interface StoryDisplayProps {
  gameState: GameState | null;
  isLoading: boolean;
  onChoice: (choice: string) => void;
}

const StoryDisplay: React.FC<StoryDisplayProps> = ({ gameState, isLoading, onChoice }) => {
  const [customChoice, setCustomChoice] = useState('');
  const showInitialLoader = isLoading && !gameState;
  const showContinuationLoader = isLoading && gameState;

  const handleCustomChoiceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customChoice.trim() && !isLoading) {
      onChoice(customChoice.trim());
      setCustomChoice('');
    }
  };

  if (showInitialLoader) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!gameState) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-lg text-gray-500">La aventura te espera.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      <div className="relative w-full aspect-video bg-gray-800 rounded-lg shadow-2xl mb-6 overflow-hidden">
        {showContinuationLoader && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-10">
            <LoadingSpinner />
          </div>
        )}
        <img src={gameState.imageUrl} alt="Escena actual" className={`w-full h-full object-cover transition-opacity duration-500 ${showContinuationLoader ? 'opacity-30' : 'opacity-100'}`} />
      </div>

      <div className={`transition-opacity duration-500 ${showContinuationLoader ? 'opacity-50' : 'opacity-100'}`}>
        <p className="text-lg md:text-xl text-gray-300 leading-relaxed mb-8 whitespace-pre-wrap">{gameState.storyText}</p>
        
        <h3 className="text-lg font-semibold text-amber-400 mb-4">¿Qué haces?</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {gameState.choices.map((choice, index) => (
            <button
              key={index}
              onClick={() => onChoice(choice)}
              disabled={isLoading}
              className="w-full text-left p-4 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 hover:border-amber-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {choice}
            </button>
          ))}
        </div>

        <div className="mt-8 pt-6 border-t border-gray-700/50">
           <form onSubmit={handleCustomChoiceSubmit} className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={customChoice}
              onChange={(e) => setCustomChoice(e.target.value)}
              disabled={isLoading}
              className="flex-grow w-full p-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
              placeholder="O describe tu propia acción..."
              aria-label="Describe tu propia acción"
            />
            <button
              type="submit"
              disabled={isLoading || !customChoice.trim()}
              className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors duration-200 disabled:bg-gray-600 disabled:cursor-not-allowed shrink-0"
            >
              Enviar Acción
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default StoryDisplay;