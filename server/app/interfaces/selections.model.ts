import { Question } from '@app/interfaces/game.model';

export interface Selections {
    room: string;
    questions: Question[];
    acknowledged: boolean;
}
