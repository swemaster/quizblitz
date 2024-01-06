import { Injectable } from '@angular/core';
import { Match } from '@app/interfaces/match.model';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class InGameService {
    private currentQuestionIndex: number = 0;
    private score: number = 0;

    private matchSubject = new BehaviorSubject<Match | null>(null);

    sendMatch(match: Match) {
        this.matchSubject.next(match);
    }

    getMatch() {
        return this.matchSubject;
    }

    getCurrentQuestionIndex(): number {
        return this.currentQuestionIndex;
    }

    getCurrentPoints(): number {
        return this.score;
    }

    increaseCurrentQuestionIndex() {
        this.currentQuestionIndex += 1;
    }

    decreaseCurrentQuestionIndex() {
        --this.currentQuestionIndex;
    }

    updateScore(newPoints: number) {
        this.score = newPoints;
    }

    reset() {
        this.score = 0;
        this.currentQuestionIndex = 0;
    }
}
