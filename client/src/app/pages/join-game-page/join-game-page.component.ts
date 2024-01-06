import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Player } from '@app/interfaces/player.model';
import { PLAYER_BASE } from '@app/pages/page.constant';
import { CommunicationService } from '@app/services/communication.service';
import { GameSocketService } from '@app/services/game-socket.service';
import { GameService } from '@app/services/game.service';
import { PlayerService } from '@app/services/player.service';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
@Component({
    selector: 'app-join-game-page',
    templateUrl: './join-game-page.component.html',
    styleUrls: ['./join-game-page.component.scss'],
})
export class JoinGamePageComponent {
    inputCode: string = '';
    playerName: string = '';
    errorMessage: string = '';
    isAccessCodeValid: boolean = false;
    isAccessCodeEditable: boolean = true;
    isPlayerValidated: boolean = false;
    newPlayer: Player = PLAYER_BASE[0];
    message: BehaviorSubject<string> = new BehaviorSubject<string>('');

    // Linting disabled because of lint warns us that our constructor has too many parameters
    // eslint-disable-next-line max-params
    constructor(
        private gameSocketService: GameSocketService,
        private router: Router,
        private communicationService: CommunicationService,
        private gameService: GameService,
        private playerService: PlayerService,
    ) {}

    async joinMatch() {
        const match = await firstValueFrom(this.communicationService.getMatchByAccessCode(this.inputCode));
        await this.validatePlayerName();
        if (match.canBeAccessed === false) {
            this.errorMessage = 'La partie est vérouiller vous ne pouvez pas rentrer';
        } else if (this.isPlayerValidated) {
            sessionStorage.setItem('isPlayerAuthenticated', 'true');
            this.gameSocketService.joinGameRoom(match.accessCode, this.playerName);
            this.gameService.setCurrentPlayGame(match.game);
            this.router.navigate(['waitinggame', match.accessCode]);
            this.playerService.setRoom(this.inputCode);
        }
    }

    async validateAccess() {
        if (/^\d{4}$/.test(this.inputCode)) {
            try {
                const match = await firstValueFrom(this.communicationService.getMatchByAccessCode(this.inputCode));
                if (match) {
                    if (match.canBeAccessed) {
                        this.isAccessCodeValid = true;
                        this.isAccessCodeEditable = false;
                        this.errorMessage = '';
                    } else {
                        this.errorMessage = 'La partie est vérouiller vous ne pouvez pas rentrer';
                    }
                } else {
                    this.errorMessage = "Aucune partie n'est reliée au code d'accès que vous avez entré, veuillez saisir un autre code";
                }
            } catch (err) {
                if (err instanceof HttpErrorResponse) {
                    this.errorMessage = `Le serveur ne répond pas et a retourné : ${err.message}`;
                }
            }
        } else {
            this.errorMessage = "Code d'accès invalide, veuillez rentrer 4 chiffres";
        }
    }

    async validatePlayerName() {
        const match = await firstValueFrom(this.communicationService.getMatchByAccessCode(this.inputCode));
        if (this.playerName.toLowerCase() !== 'organisateur' && this.playerName !== '') {
            if (match.nomsBannis.includes(this.playerName.toLowerCase())) {
                this.errorMessage = 'Ce nom est banni. Veuillez en choisir un autre.';
            } else {
                const foundPlayer = match.players.find((player) => player.name.toLowerCase() === this.playerName.toLowerCase());
                if (foundPlayer) {
                    this.errorMessage = "Ce nom d'utilisateur est deja pris veuillez en saisir un autre";
                } else {
                    this.newPlayer = { name: this.playerName, points: 0, status: 'active', selection: [], bonuses: 0 };
                    match.players.push(this.newPlayer);
                    this.communicationService.matchPatch(match).subscribe({
                        next: (response) => {
                            const responseString = `Le serveur a reçu la requête a retourné un code ${response.status} : ${response.statusText}`;
                            this.message.next(responseString);
                        },
                        error: (err: HttpErrorResponse) => {
                            const responseString = `Le serveur ne répond pas et a retourné : ${err.message}`;
                            this.message.next(responseString);
                        },
                    });
                    this.isPlayerValidated = true;
                    this.playerService.setName(this.playerName);
                }
            }
        } else {
            this.errorMessage = "Ce nom d'utilisateur n'est pas valide.";
        }
    }

    resetAccessCode() {
        this.isAccessCodeValid = false;
        this.isAccessCodeEditable = true;
        this.isPlayerValidated = false;
        this.errorMessage = '';
        this.inputCode = '';
        this.playerName = '';
    }
}
