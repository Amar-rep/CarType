export interface RegisterUserData {
  name: string;
  email?: string;
  password: string;
}
export interface LoginUserData {
  email: string;
  password: string;
}

export interface statesData {
  wpm: number;
  acc: number;
  totalTypedChars: number;
  incorrect: number;
  timeTaken: number;
}

export interface sentenceData {
  category: SentenceCategory;
  id: string;
  createdAt: Date;
  text: string;
  wordCount: number;
  updatedAt: Date;
}
export interface createResultInput {
  userId: string;
  sentenceId: string;
  competitionId?: string | null;
  wpm: number;
  accuracy: number;
  rawWpm: number;
  errorCount: number;
  timeTaken: number;
}

enum SentenceCategory {
  FIFTEEN,
  TWENTY_FIVE,
  FIFTY,
}
