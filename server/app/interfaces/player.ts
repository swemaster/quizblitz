export interface Player {
    name: string;
    socketId: string;
    isFirstAmount: number;
    score: number;
    selection: number[];
    status: string;
    timeLeft: number;
    isCorrect: boolean;
}
