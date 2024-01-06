import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Game, Question } from '@app/interfaces/game.model';
import { BASE_GAME } from '@app/pages/page.constant';
import { BehaviorSubject, Observable } from 'rxjs';
import { CommunicationService } from './communication.service';
@Injectable({
    providedIn: 'root',
})
export class GameService {
    message: BehaviorSubject<string> = new BehaviorSubject<string>('');
    private currentGame: Game = BASE_GAME;

    constructor(public communicationService: CommunicationService) {}

    getCurrentQuestionByIndex(index: number): Question {
        return this.currentGame.questions[index];
    }

    getCurrentGame() {
        return this.currentGame;
    }

    getAllGames(): Observable<Game[]> {
        return this.communicationService.getGames();
    }

    getGameById(id: string) {
        return this.communicationService.getGameById(id);
    }

    sendGame(newGame: Game) {
        this.communicationService.gamePost(newGame).subscribe({
            error: (err: HttpErrorResponse) => {
                const responseString = `Le serveur ne répond pas et a retourné : ${err.message}`;
                this.message.next(responseString);
            },
        });
    }

    modifyGame(game: Game) {
        this.communicationService.gamePatch(game).subscribe({
            error: (err: HttpErrorResponse) => {
                const responseString = `Le serveur ne répond pas et a retourné : ${err.message}`;
                this.message.next(responseString);
            },
        });
    }

    deleteGame(game: Game) {
        this.communicationService.gameDelete(game).subscribe({
            next: (response) => {
                const responseString = `Le serveur a reçu la requête a retourné un code ${response.status} : ${response.statusText}`;
                this.message.next(responseString);
            },
            error: (err: HttpErrorResponse) => {
                const responseString = `Le serveur ne répond pas et a retourné : ${err.message}`;
                this.message.next(responseString);
            },
        });
    }

    getCurrentGameLength() {
        return this.currentGame.questions.length;
    }

    setCurrentPlayGame(game: Game) {
        this.currentGame = game;
    }
}
