export type SceneTone = 'mysterious' | 'action' | 'suspenseful' | 'somber' | 'calm';

export interface GameState {
  storyText: string;
  choices: string[];
  inventory: string[];
  currentQuest: string;
  imageUrl: string;
  tone: SceneTone;
}

export interface SaveData {
  gameState: GameState;
  storyHistory: string[];
}
