export interface gameStartPayload {
  room: string;
  competitionId: string;
  sentenceId: string;
  player1: string;
  player2: string;
  text: string;
}

export interface typingUpdatePayload {
  room: string;
  progress: number;
  wpm: number;
}

export interface opponentProgressPayload {
  room: string;
  wpm: number;
}
export interface gameOverPayload {
  room: string;
  competitionId: string;
  sentenceId: string;
  time: number;
  wpm: number;
  accuracy: number;
  rawWpm: number;
  errorCount: number;
}
export interface abruptDisconnectPayload {
  room: string;
}
export interface runningGames {
  competitionId: string;
  player1: string;
  player2: string;
}
export interface loserFinishedPayload {
  competitionId: string;
  sentenceId: string;
  wpm: number;
  accuracy: number;
  rawWpm: number;
  errorCount: number;
  timeTaken: number;
}

export interface ServerToClientEvents {
  waitingForPlayer: () => void;
  gameStart: (payload: gameStartPayload) => void;
  opponentProgress: (payload: opponentProgressPayload) => void;
  gameOver: (payload: gameOverPayload) => void;
  opponentDisconnected: () => void;
}

// Events the Client sends to the Server
export interface ClientToServerEvents {
  findMatch: () => void;
  typingUpdate: (payload: typingUpdatePayload) => void;
  gameFinished: (payload: {
    room: string;
    time: number;
    competitionId: string;
  }) => void;
  loserFinished: (payload: loserFinishedPayload) => void;
}
export interface SocketData {
  // Not used in this example, but you could store user data here
  // username: string;
  // roomId: string;
}
