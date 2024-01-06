import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Game } from '@app/interfaces/game.model';
import { BASE_GAME, MATCH_BASE, PLAYER_BASE } from '@app/pages/page.constant';
import { CommunicationService } from '@app/services/communication.service';
import { GameService } from '@app/services/game.service';
import { WaitingViewService } from '@app/services/waiting-view.service';
import { BehaviorSubject } from 'rxjs';
@Component({
    selector: 'app-create-game-page',
    templateUrl: './create-game-page.component.html',
    styleUrls: ['./create-game-page.component.scss'],
})
export class CreateGamePageComponent implements OnInit {
    createGame: string;
    testGame: string;
    // map qui associe un jeu avec une variable booleene specifiant si le jeu a été selectionné par
    // l'utilisateur. Si c'est le cas, on affiche les proprietes specifique au jeu selectionné.
    gameIsSelected = new Map<string, boolean>();
    gameList: Game[] = [BASE_GAME, BASE_GAME];
    message: BehaviorSubject<string> = new BehaviorSubject<string>('');
    selectedGame: Game;
    /* eslint-disable-next-line */ // Need 4 paramters in constructor
    constructor(
        private gameService: GameService,
        private waitingViewService: WaitingViewService,
        private router: Router,
        private communicationService: CommunicationService,
    ) {
        this.createGame = 'créer une partie';
        this.testGame = 'tester le jeu';
    }

    gameSelection(id: string) {
        const game = this.gameList.find((g) => g.id === id);
        if (!game) {
            throw new Error(`Game with ID ${id} not found.`);
        }
        this.selectedGame = game;

        for (const key of this.gameIsSelected.keys()) {
            if (key === id) this.gameIsSelected.set(key, true);
            else this.gameIsSelected.set(key, false);
        }
    }

    // permet de charger le jeu correspondant dans la Vue Tester Jeu
    sendCurrentGame(game: Game) {
        this.gameService.setCurrentPlayGame(game);
        this.router.navigateByUrl('/test');
    }

    createNewMatch(): void {
        sessionStorage.setItem('isPlayerAuthenticated', 'true');
        const newMatchId = this.waitingViewService.generateAccessCode();
        const currentGame = this.selectedGame;
        const newMatch = MATCH_BASE;
        newMatch.accessCode = newMatchId;
        newMatch.startDate = new Date();
        newMatch.game = currentGame;
        newMatch.players = PLAYER_BASE;
        this.communicationService.matchPost(newMatch).subscribe({
            next: (response) => {
                const responseString = `Le serveur a reçu la requête a retourné un code ${response.status} : ${response.statusText}`;
                this.message.next(responseString);
                this.router.navigate(['/waitingplayers', newMatchId]);
            },
            error: (err: HttpErrorResponse) => {
                const responseString = `Le serveur ne répond pas et a retourné : ${err.message}`;
                this.message.next(responseString);
            },
        });
    }

    ngOnInit() {
        this.communicationService.getGames().subscribe((games: Game[]) => {
            this.gameList = games;
            // Initialisation du tableau gameIsSelected en fonction de la visibilité des jeux.
            // lors du chargement de la page ils sont tous initialisé a false car aucun n'a ete selectionné
            for (const game of this.gameList) {
                if (game.isVisible === true) this.gameIsSelected.set(game.id, false);
            }
        });
    }
}
