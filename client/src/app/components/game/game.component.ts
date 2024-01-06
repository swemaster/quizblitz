import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Game } from '@app/interfaces/game.model';
import { SNACKBAR_DURATION_EXIT } from '@app/pages/page.constant';
import { CommunicationService } from '@app/services/communication.service';
import { GameService } from '@app/services/game.service';
import Ajv from 'ajv';
import AjvFormats from 'ajv-formats';
import { BehaviorSubject } from 'rxjs';

@Component({
    selector: 'app-game',
    templateUrl: './game.component.html',
    styleUrls: ['./game.component.scss'],
})
export class GameComponent {
    @ViewChild('elementToTrack') elementToTrack: ElementRef;
    @Input() game: Game;
    @Output() deleteGameEvent = new EventEmitter<Game>();

    message: BehaviorSubject<string> = new BehaviorSubject<string>('');
    /* eslint-disable-next-line */ // constructor needs more than 3 objects
    constructor(
        public gameService: GameService,
        public communicationService: CommunicationService,
        public router: Router,
        protected ajv: Ajv,
        public snackBar: MatSnackBar,
    ) {
        if (!ajv.formats['date-time']) {
            AjvFormats(ajv);
        }
    }

    exportGame(game: Game) {
        const gameWithoutVisibility = {
            ...game,
            isVisible: undefined,
        };

        const jsonData = JSON.stringify(gameWithoutVisibility, null, 2);

        const blob = new Blob([jsonData], { type: 'application/json' });

        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = 'game.json';
        document.body.appendChild(link);

        link.click();
        document.body.removeChild(link);

        if (link.download) {
            this.snackBar.open('Game exported successfully', 'Close', {
                duration: SNACKBAR_DURATION_EXIT,
            });
        }

        return gameWithoutVisibility;
    }

    toggleVisibility(game: Game): void {
        game.isVisible = !game.isVisible;
        this.communicationService.gamePatch(game).subscribe({
            error: (err: HttpErrorResponse) => {
                const responseString = `Le serveur ne répond pas et a retourné : ${err.message}`;
                this.message.next(responseString);
            },
        });
    }

    deleteGame(game: Game) {
        const confirmation = confirm('Êtes-vous sûr de vouloir supprimer ce jeu ?');
        if (confirmation) {
            this.deleteGameEvent.emit(game);
        }
    }

    goToEditGamePage(gameId: string) {
        sessionStorage.setItem('isAdminAuthenticated', 'true');
        this.router.navigate(['/editgame', gameId]);
    }
}
