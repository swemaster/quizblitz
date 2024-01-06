import { Component, ViewChild, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { QuestionInGameComponent } from '@app/components/question-in-game/question-in-game.component';
import {
    BONUS_MESSAGE,
    CHOICE_BUTTON_SELECTED_CLASS,
    CHOICE_BUTTON_UNSELECTED_CLASS,
    CREATE_GAME_PAGE_PATH,
    DURATION_INTERVAL,
    ENTER_BUTTON_CLASS,
    ENTER_KEY,
    EXIT_GAME,
    INITIAL_SCORE,
    PAGE_BODY_CLASS,
    PERCENT_SCORE,
    SNACKBAR_DURATION_BONUS,
    SNACKBAR_DURATION_EXIT,
    TIME_ANSWERS_SHOW,
} from '@app/pages/page.constant';
import { GameService } from '@app/services/game.service';
import { InGameService } from '@app/services/in-game.service';
import { faStopwatch, faTrophy } from '@fortawesome/free-solid-svg-icons';

@Component({
    selector: 'app-test-page',
    templateUrl: './test-page.component.html',
    styleUrls: ['./test-page.component.scss'],
})
export class TestPageComponent {
    @ViewChild(QuestionInGameComponent) questionComponent: QuestionInGameComponent;
    inGameService = inject(InGameService);
    // Interpolated in HTML file
    faStopwatch = faStopwatch;
    faTrophy = faTrophy;
    score: number = INITIAL_SCORE;
    isShowingAnswers: boolean = false;
    time: number;
    isAllowedToChange: boolean = true;
    interval;

    constructor(
        private snackBar: MatSnackBar,
        private router: Router,
        public gameService: GameService,
    ) {
        this.time = this.gameService.getCurrentGame().duration;
        const interval = DURATION_INTERVAL;
        this.interval = setInterval(() => this.runTimer(), interval);
    }

    runTimer() {
        this.time--;
        if (this.time === 0) {
            this.checkSelectedAnswers();
            if (!this.isShowingAnswers) {
                this.questionComponent.selectedAnswers = [];
                this.time = TIME_ANSWERS_SHOW;
                this.isShowingAnswers = true;
                this.isAllowedToChange = false;
            } else {
                this.validateAnswers();
                this.time = this.gameService.getCurrentGame().duration;
                this.isShowingAnswers = false;
                this.isAllowedToChange = true;
            }
        }
    }

    validateAnswers() {
        if (!this.isShowingAnswers) {
            this.time = TIME_ANSWERS_SHOW;
            this.isShowingAnswers = true;
            this.isAllowedToChange = false;
            return;
        }
        this.inGameService.increaseCurrentQuestionIndex();
        if (this.inGameService.getCurrentQuestionIndex() >= this.gameService.getCurrentGameLength()) {
            clearInterval(this.interval);
            this.router.navigateByUrl(CREATE_GAME_PAGE_PATH);
            this.snackBar.open('The game has ended. Your final score is : ' + this.score, 'Dismiss', {
                duration: SNACKBAR_DURATION_EXIT,
                verticalPosition: 'top',
            });
        } else {
            this.questionComponent.loadQuestion();
        }
    }

    setScore(newScore: string) {
        this.score = Number(newScore);
    }

    checkSelectedAnswers() {
        const correctAnswers: string[] = this.questionComponent.selectedAnswers.filter((value) => this.questionComponent.answers.includes(value));
        const incorrectAnswer: string[] = this.questionComponent.selectedAnswers.filter((value) => !this.questionComponent.answers.includes(value));
        if (correctAnswers.length === this.questionComponent.answers.length && incorrectAnswer.length === 0) {
            this.score += this.questionComponent.points * PERCENT_SCORE;
            this.snackBar.open(BONUS_MESSAGE.toString(), '', {
                duration: SNACKBAR_DURATION_BONUS,
                verticalPosition: 'top',
            });
        }
    }

    quitGame() {
        this.snackBar.open(EXIT_GAME.toString(), '', {
            duration: SNACKBAR_DURATION_EXIT,
            verticalPosition: 'top',
        });
        this.router.navigateByUrl(CREATE_GAME_PAGE_PATH);
    }

    clickEnterButton() {
        if (this.questionComponent.selectedAnswers.length > 0) this.validateAnswers();
    }

    onKeyDown(event: KeyboardEvent) {
        const targetClassName: string = (event.target as HTMLElement).className;
        if (
            targetClassName === PAGE_BODY_CLASS ||
            targetClassName === ENTER_BUTTON_CLASS ||
            targetClassName === CHOICE_BUTTON_SELECTED_CLASS ||
            targetClassName === CHOICE_BUTTON_UNSELECTED_CLASS
        ) {
            if (event.key === ENTER_KEY && this.questionComponent.selectedAnswers.length > 0) {
                this.validateAnswers();
            } else if (Number(event.key) <= this.questionComponent.choices.length) {
                this.questionComponent.selectAnswerFromButtons(this.questionComponent.choices[Number(event.key) - 1]);
            }
        }
    }
}
