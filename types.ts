
export interface PlayerState {
  name: string;
  iman: number; // 0-100
  amal: number; // Points accumulator
  lalai: number; // Negligence counter
  levelIndex: number; // 0-5 (Total 6 levels)
  history: string[]; // Log of choices
  heroId?: string; // Selected character ID
}

export interface Choice {
  id: string;
  text: string;
  type: 'good' | 'neutral' | 'bad';
  impact: {
    iman: number;
    amal: number;
    lalai: number;
  };
  feedback: string; // Immediate short feedback
}

export interface GameLevel {
  id: number;
  title: string;
  scenario: string;
  location: string; // e.g., "Kamar Tidur", "Sekolah"
  choices: Choice[];
}

export interface NPCFeedback {
  dialogue: string;
  wisdom: string;
}

export enum GamePhase {
  START_SCREEN = 'START_SCREEN',
  CHARACTER_SELECT = 'CHARACTER_SELECT', 
  INTRO_STORY = 'INTRO_STORY',
  MAP = 'MAP', // New Phase for Navigation
  GAMEPLAY = 'GAMEPLAY',
  PROCESSING = 'PROCESSING', // Loading AI
  CONSEQUENCE = 'CONSEQUENCE', // Immediate result
  CUTSCENE = 'CUTSCENE', // Ustadz Hasan speaks
  ENDING = 'ENDING',
  ERROR = 'ERROR'
}

export const LEVEL_THEMES = [
  "Subuh & Pribadi (Hubungan dengan Allah)",
  "SMPN 3 Pacet & Akademik (Amanah Ilmu)",
  "Dunia Digital & Gadget (Godaan Maya)",
  "Pergaulan Sosial (Adab Sesama)",
  "Keluarga & Birrul Walidain (Bakti)",
  "Muhasabah Diri (Refleksi Internal)"
];

// --- HERO DEFINITIONS ---
export interface Hero {
  id: string;
  name: string;
  title: string;
  description: string;
  color: string; // Hex code or Tailwind class specific
  stats: {
    keteguhan: number; // Defense/Iman stability
    ilmu: number; // Magic/Knowledge
    amal: number; // Physical/Action
  };
}

// --- ADDED TYPES ---

export interface Question {
  text: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface Flashcard {
  front: string;
  back: string;
}

export interface LearningContent {
  topic: string;
  questions: Question[];
  flashcards: Flashcard[];
}

export interface GameState {
  score: number;
  currentQuestionIndex: number;
  isGameOver: boolean;
  answers: boolean[];
}