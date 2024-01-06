export interface PlayerServer {
    name: string;
    role: string;
    socketId: string;
    isFirstAmount: number;
    score: number;
    selection: number[];
    status: string;
}
