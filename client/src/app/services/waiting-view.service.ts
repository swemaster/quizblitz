import { Injectable } from '@angular/core';
import { Game } from '@app/interfaces/game.model';
import { Match } from '@app/interfaces/match.model';
import { Player } from '@app/interfaces/player.model';
import { MAX_RANDOM_CODE, MIN_RANDOM_CODE } from '@app/pages/page.constant';

@Injectable({
    providedIn: 'root',
})
export class WaitingViewService {
    isViewLocked: boolean = false;
    match: Match;
    game: Game = {
        id: '',
        title: '',
        isVisible: false,
        lastModification: new Date(),
        duration: 0,
        description: '',
        questions: [],
    };

    constructor() {
        this.match = {
            accessCode: '',
            canBeAccessed: true,
            startDate: new Date(),
            game: this.game,
            players: [],
            time: 0,
            questionId: '',
            messages: [],
            creator: '',
            nomsBannis: [],
        };
    }

    generateAccessCode(): string {
        this.match.accessCode = Math.floor(MIN_RANDOM_CODE + Math.random() * MAX_RANDOM_CODE).toString();
        return this.match.accessCode;
    }

    getAccessCode(): string {
        return this.match.accessCode;
    }

    addPlayer(player: Player) {
        if (!this.match.players.find((p) => p.name === player.name)) {
            this.match.players.push(player);
        }
    }
}
