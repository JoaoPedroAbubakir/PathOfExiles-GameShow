export interface Question {
  id: string;
  text: string;
  answer: string;
  imageUrl?: string;
}

export interface Player {
  id: string;
  name: string;
  currency: number;
}

export interface GameState {
  currentQuestion: Question | null;
  revealedPanels: boolean[];
  players: Player[];
  gridSize: { rows: number; cols: number };
}
