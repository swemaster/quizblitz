import { HttpErrorResponse } from '@angular/common/http';
import { AfterViewInit, Component, HostListener, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { PlayerListComponent } from '@app/components/player-list/player-list.component';
import { ONE } from '@app/components/question-in-game/question-in-game.component.constants';
import { StatsComponent } from '@app/components/stats/stats.component';
import { Match } from '@app/interfaces/match.model';
import { Player } from '@app/interfaces/player.model';
import { PlayerServer } from '@app/interfaces/player.server.model';
import {
    ACTIVE_STATUS,
    CREATE_GAME_PAGE_PATH,
    DURATION_INTERVAL_PANIC,
    EMPTY_STRING,
    INITIAL_INDEX,
    MATCH_BASE,
    MATCH_ID_BASE,
    MAX_DURATION,
    ORGANIZER,
    PLAYER_BASE,
    QCM_TYPE,
    QRL_TYPE,
    RESULT_PAGE_PATH,
    SNACKBAR_DURATION_BONUS,
    TIME_LEFT_QCM,
    TIME_LEFT_QRL,
    UNAVAILABLE_MESSAGE,
} from '@app/pages/page.constant';
import { ChatService } from '@app/services/chat.service';
import { CommunicationService } from '@app/services/communication.service';
import { GameSocketService } from '@app/services/game-socket.service';
import { PlayerService } from '@app/services/player.service';
import { SelectionsService } from '@app/services/selections.service';
import { TimerService } from '@app/services/timer.service';
import { faTrophy } from '@fortawesome/free-solid-svg-icons';
import { BehaviorSubject, Subscription } from 'rxjs';
@Component({
    selector: 'app-org-editgame-page',
    templateUrl: './org-game-page.component.html',
    styleUrls: ['./org-game-page.component.scss'],
})
export class OrgGamePageComponent implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild(StatsComponent)
    statsComponent: StatsComponent;
    @ViewChild(PlayerListComponent)
    playerListComponent: PlayerListComponent;
    socketService = inject(GameSocketService);
    timerService = inject(TimerService);
    selectionsService = inject(SelectionsService);
    accessCode = MATCH_ID_BASE;
    message: BehaviorSubject<string> = new BehaviorSubject<string>('');
    match = MATCH_BASE;
    blinking = false;
    path = CREATE_GAME_PAGE_PATH;
    qstIndex = INITIAL_INDEX;
    faTrophy = faTrophy;
    currentQuestionType = EMPTY_STRING;
    players: Player[] = PLAYER_BASE;
    bonuses: number[];
    playerAmount: number = 0;
    private subscriptions: Subscription[] = [];

    // eslint-disable-next-line max-params
    constructor(
        public communicationService: CommunicationService,
        private playerService: PlayerService,
        private chatService: ChatService,
        private snack: MatSnackBar,
        private router: Router,
    ) {}

    @HostListener('window:beforeunload', ['$event'])
    beforeUnloadHandler(): void {
        this.closeGame();
    }

    getMatchId() {
        const url = window.location.href;
        const parts = url.split('/');
        const id = parts[parts.length - ONE];
        return id;
    }

    ngOnInit() {
        this.accessCode = this.getMatchId();
        this.subscriptions.push(
            this.communicationService.getMatchByAccessCode(this.accessCode).subscribe({
                next: (match: Match) => {
                    this.match = match;
                    this.match.questionId = this.match.game.questions[this.qstIndex].id;
                    this.currentQuestionType = this.match.game.questions[this.qstIndex].type;
                    if (this.currentQuestionType === QCM_TYPE) this.timerService.startQuestionTime(this.match.game.duration);
                    else this.timerService.startQuestionTime(MAX_DURATION);
                },
            }),
        );
        this.playerService.setRoom(this.accessCode);
        this.playerService.setName(ORGANIZER);

        this.players = this.match.players.filter((player) => player.name !== 'Organisateur');

        this.subscriptions.push(
            this.socketService.receivePlayerData().subscribe({
                next: (playerList: PlayerServer[]) => {
                    this.match.players = [];
                    playerList.forEach((playerUpdate) => {
                        const player: Player = {
                            name: playerUpdate.name,
                            points: playerUpdate.score,
                            status: playerUpdate.status,
                            selection: playerUpdate.selection,
                            bonuses: playerUpdate.isFirstAmount,
                        };
                        this.match.players.push(player);
                    });
                    this.players = this.match.players.filter((player) => player.name !== 'Organisateur');
                    this.playerAmount = playerList.length - ONE;

                    const type = this.match.game?.questions[this.qstIndex].type;
                    if (this.timerService.time < TIME_LEFT_QCM && type === QCM_TYPE) {
                        let allAnswersReceived = true;
                        for (const player of this.players) {
                            if (player.status !== ACTIVE_STATUS) {
                                allAnswersReceived = false;
                            }
                        }
                        if (allAnswersReceived) {
                            this.timerService.setTimeOver();
                        }
                    }
                },
            }),
        );
    }

    ngAfterViewInit() {
        this.socketService.askForPlayerData();
    }

    playSound() {
        const audio = document.getElementById('soundEffect') as HTMLAudioElement;
        audio.play();
    }
    blinkSurroundings() {
        this.blinking = true;
        setTimeout(() => {
            this.blinking = false;
        }, this.timerService.time * DURATION_INTERVAL_PANIC);
    }

    pause() {
        this.timerService.pauseTimer();
    }

    resume() {
        this.timerService.resumeTimer();
    }
    showResults() {
        this.socketService.sendToResultView(this.match);
        this.router.navigateByUrl(RESULT_PAGE_PATH);
    }
    startPanic() {
        const type = this.match.game?.questions[this.qstIndex].type;
        if (
            ((this.timerService.time < TIME_LEFT_QCM && type === QCM_TYPE) || (this.timerService.time < TIME_LEFT_QRL && type === QRL_TYPE)) &&
            !this.timerService.isWaiting &&
            this.timerService.time > 0
        ) {
            this.socketService.panic();
            this.timerService.activatePanicMode();
            this.playSound();
            this.blinkSurroundings();
        } else {
            this.snack.open(UNAVAILABLE_MESSAGE, '', {
                duration: SNACKBAR_DURATION_BONUS,
                verticalPosition: 'top',
            });
        }
    }

    closeGame() {
        this.deleteMatch(this.getMatchId());
        this.socketService.orgQuitGame();
        this.chatService.leaveRoom(this.playerService.getRoom());
    }

    // This forces the other players to go to the next question
    // Only when chrono is at 0

    nextQuestion() {
        if (this.timerService.canSkip) {
            this.selectionsService.addQuestion();
            if (this.qstIndex < this.match.game?.questions.length - ONE) {
                this.match.questionId = this.match.game?.questions[++this.qstIndex].id;
                this.currentQuestionType = this.match.game?.questions[this.qstIndex].type;
                if (this.currentQuestionType === QCM_TYPE) this.timerService.startWaitTime(this.match.game.duration);
                else {
                    this.timerService.startWaitTime(MAX_DURATION);
                }
            } else {
                this.showResults();
            }
        }
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
    }

    ngOnDestroy() {
        this.subscriptions.forEach((subscription) => subscription.unsubscribe());
    }
}
