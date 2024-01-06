import { Game } from './game.model';
import { Player } from './player.model';

export interface Match {
    accessCode: string;
    canBeAccessed: boolean;
    startDate: Date;
    game: Game;
    players: Player[];
    time: number;
    questionId: string;
    messages: string[];
    creator: string;
    nomsBannis: string[];
}
