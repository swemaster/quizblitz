import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Game } from '@app/interfaces/game.model';
import { DEFAULT_DURATION, GAME_START } from '@app/pages/page.constant';
import { GameService } from '@app/services/game.service';
import { GameValidationService } from '@app/services/game.validation.service';
import { QuestionService } from '@app/services/question.service';
import { BehaviorSubject } from 'rxjs';

@Component({
    selector: 'app-admin-game-page',
    templateUrl: './admin-game-page.component.html',
    styleUrls: ['./admin-game-page.component.scss'],
})
export class AdminGamePageComponent implements OnInit {
    games: Game[] = [];
    message: BehaviorSubject<string> = new BehaviorSubject<string>('');
    /* eslint-disable-next-line */
    constructor(
        public questionService: QuestionService,
        public gameService: GameService,
        public router: Router,
        public gameValidation: GameValidationService,
    ) {}

    async importGame(event: Event) {
        const fileInput = event.target as HTMLInputElement | null;
        if (!fileInput || !fileInput.files || fileInput.files.length === 0) return undefined;
        const file = fileInput.files?.[0];

        const importedGame = await this.gameValidation.parseFile(file, fileInput);
        if (!importedGame) return undefined;

        const validatedGame = await this.gameValidation.validateAndCorrectGame(importedGame, fileInput);
        if (!validatedGame) return undefined;

        await this.gameValidation.saveGame(validatedGame, fileInput);

        return validatedGame;
    }

    deleteGame(game: Game, index: number) {
        this.gameService.deleteGame(game);
        this.games.splice(index, 1);
        this.gameValidation.games.splice(index, 1);
    }

    initNewGame(newGameId: string) {
        const newGame: Game = {
            id: newGameId,
            title: 'New Game',
            isVisible: false,
            lastModification: new Date(),
            duration: DEFAULT_DURATION,
            description: 'Description for New Game',
            questions: [],
        };
        this.games.push(newGame);
    }

    createNewGame(): void {
        const newGameId = this.questionService.generateNewId();
        const newGame = GAME_START;
        newGame.id = newGameId;
        this.gameService.sendGame(newGame);
        sessionStorage.setItem('isAdminAuthenticated', 'true');
        this.gameService.setCurrentPlayGame(newGame);
        this.router.navigate(['/editgame', newGameId]);
        this.initNewGame(newGameId);
    }

    goToHistoryPage() {
        sessionStorage.setItem('isAdminAuthenticated', 'true');
        this.router.navigate(['/history']);
    }

    async ngOnInit() {
        this.gameValidation.importedGame.subscribe((importedGame) => {
            if (importedGame) {
                this.games.push(importedGame);
            }
        });

        this.gameService.getAllGames().subscribe({
            next: (games) => {
                this.games = games;
            },
            error: (err: HttpErrorResponse) => {
                const responseString = `Le serveur ne répond pas et a retourné : ${err.message}`;
                this.message.next(responseString);
            },
        });
    }
}
