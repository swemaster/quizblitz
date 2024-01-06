import { Component, HostListener, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { Router } from '@angular/router';
import { QuestionInGameComponent } from '@app/components/question-in-game/question-in-game.component';
import { GameService } from '@app/services/game.service';
import { PlayerService } from '@app/services/player.service';

import { BASIC_MULTIPLIER } from '@app/components/question-in-game/question-in-game.component.constants';
import { Match } from '@app/interfaces/match.model';
import { Message } from '@app/interfaces/message';
import {
    BONUS_MULTIPLIER,
    CHOICE_BUTTON_SELECTED_CLASS,
    CHOICE_BUTTON_UNSELECTED_CLASS,
    DURATION_INTERVAL_PANIC,
    EMPTY_STRING,
    ENTER_BUTTON_CLASS,
    ENTER_KEY,
    HOME_PAGE_PATH,
    INITIAL_SCORE,
    PAGE_BODY_CLASS,
    QRL_TYPE,
    RESULT_PAGE_PATH,
} from '@app/pages/page.constant';
import { ChatService } from '@app/services/chat.service';
import { GameSocketService } from '@app/services/game-socket.service';
import { InGameService } from '@app/services/in-game.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-player-page',
    templateUrl: './player-page.component.html',
    styleUrls: ['./player-page.component.scss'],
})
export class PlayerPageComponent implements OnInit, OnDestroy {
    @ViewChild(QuestionInGameComponent) questionComponent: QuestionInGameComponent;
    socketService = inject(GameSocketService);
    isShowingAnswers: boolean = false;
    isAllowedToChange: boolean = true;
    score: number = INITIAL_SCORE;
    time: number;
    scoreMultiplier: number = BASIC_MULTIPLIER;
    match: Match;
    blinking = false;
    textEntered = EMPTY_STRING; // property for a QRL.
    private subscriptions: Subscription[] = [];

    // eslint-disable-next-line max-params
    constructor(
        private router: Router,
        private gameService: GameService,
        private inGameService: InGameService,
        public chatService: ChatService,
        public playerService: PlayerService,
    ) {}

    @HostListener('window:beforeunload', ['$event'])
    beforeUnloadHandler(): void {
        this.playerQuitGame();
    }

    ngOnInit() {
        this.subscriptions.push(
            this.socketService.receiveChronoValues().subscribe((value: number) => {
                this.time = value;
            }),

            this.socketService.playerValidateQuestions().subscribe(() => {
                this.questionComponent.validateAnswers();
                this.isShowingAnswers = true;
            }),

            this.socketService.onPanic().subscribe(() => {
                this.playSound();
                this.blinkSurroundings();
            }),

            this.socketService.playerNextQuestion().subscribe(() => {
                if (this.inGameService.getCurrentQuestionIndex() < this.gameService.getCurrentGameLength()) {
                    this.questionComponent.increaseQuestion();
                    this.questionComponent.loadQuestion();
                    this.isShowingAnswers = false;
                    this.isAllowedToChange = true;
                    this.scoreMultiplier = BASIC_MULTIPLIER;
                }
            }),

            this.socketService.goToResultView().subscribe((match: Match) => {
                this.inGameService.sendMatch(match);
                this.router.navigateByUrl(RESULT_PAGE_PATH);
            }),

            this.socketService.orderedToQuitTheGame().subscribe(() => {
                this.playerQuitGame();
            }),

            this.socketService.isFirst().subscribe(() => {
                this.scoreMultiplier = BONUS_MULTIPLIER;
                this.questionComponent.isFirst = true;
            }),

            this.socketService.receiveMultiplier().subscribe((scoreMultiplier: number) => {
                // TODO: Complete function
                // Temporary for now since I have a lint error for not using scoreMultiplier
                // eslint-disable-next-line no-console
                console.log(scoreMultiplier);
            }),
        );
    }
    playSound() {
        const audio = document.getElementById('soundEffect') as HTMLAudioElement;
        audio.play();
    }
    blinkSurroundings() {
        this.blinking = true;
        setTimeout(() => {
            this.blinking = false;
        }, this.time * DURATION_INTERVAL_PANIC);
    }
    // Send ready to Server by socket
    validateAnswers() {
        if (this.questionComponent.questionType === QRL_TYPE) {
            this.socketService.sendQRLText(this.textEntered);
        } else {
            this.socketService.playerReadyQuestion(this.time);
        }
        this.isAllowedToChange = false;
    }

    updateScoreTimer(eventData: { score: string; bonuses: number }) {
        this.score = Number(eventData.score);
        this.socketService.sendPlayerScore(eventData);
    }

    playerQuitGame() {
        const text = ` ${this.playerService.getName()} a quitté la partie.`;
        const message: Message = { room: this.playerService.getRoom(), name: 'Système', time: '', text };
        this.chatService.sendMessage(message);
        this.socketService.playerQuitGame();
        this.chatService.leaveRoom(this.playerService.getRoom());
        this.router.navigateByUrl(HOME_PAGE_PATH);
    }
    clickEnterButton() {
        if (this.isAllowedToChange) {
            if (this.questionComponent.questionType === QRL_TYPE || this.questionComponent.selectedAnswers.length > 0) this.validateAnswers();
        }
    }

    sendSelection(selection: number[]) {
        this.socketService.sendPlayerSelection(selection);
    }

    onKeyDown(event: KeyboardEvent) {
        const targetClassName: string = (event.target as HTMLElement).className;
        if (
            (targetClassName === PAGE_BODY_CLASS ||
                targetClassName === ENTER_BUTTON_CLASS ||
                targetClassName === CHOICE_BUTTON_SELECTED_CLASS ||
                targetClassName === CHOICE_BUTTON_UNSELECTED_CLASS) &&
            this.isAllowedToChange
        ) {
            if (event.key === ENTER_KEY) {
                this.clickEnterButton();
            } else if (Number(event.key) <= this.questionComponent.choices.length) {
                this.questionComponent.selectAnswerFromButtons(this.questionComponent.choices[Number(event.key) - 1]);
            }
        }
    }

    ngOnDestroy() {
        this.subscriptions.forEach((subscription) => subscription.unsubscribe());
    }

    onQRLText(textEnteredForQRL: string) {
        this.textEntered = textEnteredForQRL;
    }
}
