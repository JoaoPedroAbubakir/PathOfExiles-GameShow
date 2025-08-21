export interface Question {
  id: string;
  text: string;
  answer: string;
  imageUrl?: string;
  tileNumber?: number; // Optional now since questions can be in a pool
  poolId?: string; // Which pool this question belongs to
}

export interface QuestionPool {
  id: string;
  name: string;
  questions: Question[];
}

export interface Round {
  id: string;
  name: string;
  tileCount: number;
  backgroundImage: string;
  order: number;
  questionPoolId: string; // Reference to the pool instead of direct questions
  activeQuestions: Question[]; // Questions actually used in this round
  pointsPerQuestion: number; // Points value for questions in this round
}



export interface Settings {
  pointsName: string;
  currentRound: string; // Round ID
  rounds: Round[];
}

export interface Player {
  id: string;
  name: string;
  score: number;
  icon: string;
}
