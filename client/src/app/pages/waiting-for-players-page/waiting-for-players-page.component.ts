import { HttpErrorResponse } from '@angular/common/http';
import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { Match } from '@app/interfaces/match.model';
import { MATCH_BASE, ORGANIZER, SNACKBAR_DURATION_LOCK } from '@app/pages/page.constant';
import { CommunicationService } from '@app/services/communication.service';
import { GameSocketService } from '@app/services/game-socket.service';
import { BehaviorSubject, Subscription, firstValueFrom, fromEvent } from 'rxjs';

@Component({
    selector: 'app-waiting-for-players-page',
    templateUrl: './waiting-for-players-page.component.html',
    styleUrls: ['./waiting-for-players-page.component.scss'],
})
export class WaitingForPlayersPageComponent implements OnInit, OnDestroy {
    match: Match = MATCH_BASE;
    players: string[] = [];
    accessCode: string;
    viewLocked: boolean = false;
    message: BehaviorSubject<string> = new BehaviorSubject<string>('');
    gameId: string;
    private subscriptions: Subscription[] = [];

    // listen for window popstate event
    // Linting disabled because of lint warns us that our constructor has too many parameters
    // eslint-disable-next-line max-params
    constructor(
        private route: ActivatedRoute,
        public router: Router,
        private communicationService: CommunicationService,
        private gameSocketService: GameSocketService,
        public snackBar: MatSnackBar,
    ) {}
    @HostListener('window:popstate', ['$event'])
    onPopState() {
        this.setupUnloadHandler(this.accessCode);
        this.showConfirmationAlert(this.accessCode);
    }

    async ngOnInit() {
        this.subscriptions.push(
            this.route.params.subscribe((params) => {
                this.accessCode = params['accessCode'];
            }),
        );
        this.match = await firstValueFrom(this.communicationService.getMatchByAccessCode(this.accessCode));
        this.gameSocketService.joinGameRoom(this.accessCode, ORGANIZER);
        for (const player of this.match.players) if (player.name !== ORGANIZER) this.players.push(player.name);

        this.subscriptions.push(
            this.gameSocketService.onNewPlayer().subscribe((player: string) => {
                this.players.push(player);
            }),
            this.gameSocketService.enterInGame().subscribe(() => {
                this.router.navigate(['fromwaitingtoorg', this.accessCode]);
            }),
            this.gameSocketService.onPlayerBanned().subscribe((bannedPlayer: string) => {
                this.players = this.players.filter((player) => player !== bannedPlayer);
            }),
            this.gameSocketService.onPlayerQuit().subscribe((gonePlayer: string) => {
                this.players = this.players.filter((player) => player !== gonePlayer);
            }),
        );
    }

    async toggleViewLock(): Promise<void> {
        this.match = await firstValueFrom(this.communicationService.getMatchByAccessCode(this.accessCode));
        this.match.canBeAccessed = !this.match.canBeAccessed;
        this.communicationService.matchPatch(this.match).subscribe({
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

    async deleteMatch(matchCode: string) {
        this.communicationService.matchDelete(matchCode).subscribe({
            next: async (response) => {
                const responseString = `Le serveur a reçu la requête a retourné un code ${response.status} : ${response.statusText}`;
                this.message.next(responseString);
                this.router.navigate(['/creategame']);
            },
            error: (err: HttpErrorResponse) => {
                const responseString = `Le serveur ne répond pas et a retourné : ${err.message}`;
                this.message.next(responseString);
            },
        });
        this.gameSocketService.quitOrganisator({ username: ORGANIZER, accessCode: this.match.accessCode });
    }

    showConfirmationAlert(accessCode: string): void {
        const confirmMessage = 'Êtes-vous sûr de vouloir revenir à la page de création de jeu ? Cela supprimera la partie en cours.';
        if (confirm(confirmMessage)) {
            this.gameSocketService.orgQuitGame();
            this.deleteMatch(accessCode);
            this.router.navigateByUrl('/creategame');
        }
    }

    showBanConfirmationAlert(playerName: string): void {
        const confirmMessage = `Êtes-vous sûr de vouloir bannir le joueur ${playerName} ?`;
        if (window.confirm(confirmMessage)) {
            this.banPlayer(playerName);
        }
    }

    async banPlayer(playerName: string) {
        this.match = await firstValueFrom(this.communicationService.getMatchByAccessCode(this.accessCode));
        const playerIndex = this.match.players.findIndex((player) => player.name === playerName);
        this.match.players.splice(playerIndex, 1);
        this.players.splice(playerIndex - 1, 1);
        this.match.nomsBannis.push(playerName);
        this.gameSocketService.banPlayer({ username: playerName, accessCode: this.match.accessCode });
        this.communicationService.matchPatch(this.match).subscribe({
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

    startGame() {
        if (!this.match.canBeAccessed && this.match.players.length > 0) {
            this.gameSocketService.startGame();
            this.router.navigateByUrl(`fromwaitingtoorg/${this.accessCode}`);
        } else {
            if (this.match.canBeAccessed) {
                this.snackBar.open('Il faut verrouiller la partie avant de la commencer', 'Dismiss', {
                    duration: SNACKBAR_DURATION_LOCK,
                    verticalPosition: 'top',
                });
            }
            if (this.match.players.length <= 0) {
                this.snackBar.open("Il faut qu'il y ai au moins un joueur avant de commencer la partie", 'Dismiss', {
                    duration: SNACKBAR_DURATION_LOCK,
                    verticalPosition: 'top',
                });
            }
        }
    }

    setupUnloadHandler(accessCode: string) {
        fromEvent(window, 'beforeunload').subscribe(() => {
            this.deleteMatch(accessCode);
        });
    }

    ngOnDestroy() {
        this.subscriptions.forEach((subscription) => subscription.unsubscribe());
    }
}
