import { HttpErrorResponse } from '@angular/common/http';
import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { Match } from '@app/interfaces/match.model';
import { HOME_PAGE_PATH, MATCH_BASE, ORGANIZER, SNACKBAR_DURATION_EXIT } from '@app/pages/page.constant';
import { CommunicationService } from '@app/services/communication.service';
import { GameSocketService } from '@app/services/game-socket.service';
import { PlayerService } from '@app/services/player.service';
import { BehaviorSubject, Subscription, firstValueFrom } from 'rxjs';

@Component({
    selector: 'app-waiting-for-game-start',
    templateUrl: './waiting-for-game-start.component.html',
    styleUrls: ['./waiting-for-game-start.component.scss'],
})
export class WaitingForGameStartComponent implements OnInit, OnDestroy {
    players: string[] = [];
    accessCode: string;
    viewLocked: boolean = false;
    message: BehaviorSubject<string> = new BehaviorSubject<string>('');
    match: Match = MATCH_BASE;
    gameId: string;
    private subscriptions: Subscription[] = [];

    // Linting disabled because of lint warns us that our constructor has too many parameters
    // eslint-disable-next-line max-params
    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private communicationService: CommunicationService,
        private gameSocketService: GameSocketService,
        private playerService: PlayerService,
        public snackBar: MatSnackBar,
    ) {}

    @HostListener('window:popstate', ['$event'])
    onPopState() {
        this.showConfirmationAlert();
    }

    async ngOnInit() {
        this.subscriptions.push(
            this.route.params.subscribe((params) => {
                this.accessCode = params['accessCode'];
            }),
        );
        this.match = await firstValueFrom(this.communicationService.getMatchByAccessCode(this.accessCode));
        for (const player of this.match.players) if (player.name !== ORGANIZER) this.players.push(player.name);
        this.subscriptions.push(
            this.gameSocketService.onNewPlayer().subscribe((player: string) => {
                this.players.push(player);
            }),
            this.gameSocketService.enterInGame().subscribe(() => {
                this.router.navigate(['fromwaitingtoplay', this.accessCode]);
            }),
            this.gameSocketService.onPlayerBanned().subscribe((bannedPlayer: string) => {
                this.players = this.players.filter((player) => player !== bannedPlayer);
                this.showBanAlertAndRedirect(bannedPlayer);
            }),
            this.gameSocketService.onPlayerQuit().subscribe((gonePlayer: string) => {
                this.players = this.players.filter((player) => player !== gonePlayer);
            }),
            this.gameSocketService.onOrganisatorQuit().subscribe(() => {
                this.showOrganisatorQuitAlert();
            }),
        );
    }

    async showOrganisatorQuitAlert() {
        const orgaQuitMessage = "L'organisateur de la partie a quitter. Vous serez rediriger vers la page d'accueil";
        const snackBarRef = this.snackBar.open(orgaQuitMessage, 'OK', {
            duration: SNACKBAR_DURATION_EXIT,
        });
        snackBarRef.afterDismissed().subscribe(() => {
            this.router.navigateByUrl(HOME_PAGE_PATH);
        });
    }

    showConfirmationAlert(): void {
        const confirmMessage = 'Êtes-vous sûr de vouloir quitter le jeu ?';
        if (confirm(confirmMessage)) {
            this.quitMatch();
        }
    }

    showPlayerName() {
        const playerName = this.playerService.getName();
        return playerName;
    }

    async showBanAlertAndRedirect(playerName: string) {
        if (playerName === this.showPlayerName()) {
            const banMessage = `Vous avez été banni pour avoir utiliser le nom ${playerName}. Vous serez redirigé vers la page d'accueil.`;
            const snackBarRef = this.snackBar.open(banMessage, 'OK', {
                duration: SNACKBAR_DURATION_EXIT,
            });
            snackBarRef.afterDismissed().subscribe(() => {
                this.router.navigate(['/home']);
            });
            this.gameSocketService.quitPlayer({ username: playerName, accessCode: this.match.accessCode });
        }
    }

    async quitMatch() {
        const playerName = this.playerService.getName();
        this.match = await firstValueFrom(this.communicationService.getMatchByAccessCode(this.accessCode));
        const playerIndex = this.match.players.findIndex((player) => player.name === playerName);
        this.match.players.splice(playerIndex, 1);
        this.players.splice(playerIndex - 1, 1);
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
        this.gameSocketService.quitPlayer({ username: playerName, accessCode: this.match.accessCode });
        this.router.navigateByUrl(HOME_PAGE_PATH);
    }

    ngOnDestroy() {
        this.subscriptions.forEach((subscription) => subscription.unsubscribe());
    }
}
