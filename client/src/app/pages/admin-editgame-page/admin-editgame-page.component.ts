import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Game, Question } from '@app/interfaces/game.model';
import { TextBubble } from '@app/interfaces/text-bubble.model';
import {
    DEFAULT_GAME_ID,
    GAME_START,
    INVALID_MESSAGE,
    NO_TITLE_MESSAGE,
    QCM_TYPE,
    SNACKBAR_DURATION_BONUS,
    TAKEN_MESSAGE,
} from '@app/pages/page.constant';
import { ChoiceService } from '@app/services/choice.service';
import { GameService } from '@app/services/game.service';
import { QuestionService } from '@app/services/question.service';
import { BehaviorSubject } from 'rxjs';

@Component({
    selector: 'app-admin-editgame-page',
    templateUrl: './admin-editgame-page.component.html',
    styleUrls: ['./admin-editgame-page.component.scss'],
})
export class AdminEditgamePageComponent implements OnInit {
    currentDate = new Date();
    gameId = DEFAULT_GAME_ID;
    game: Game = GAME_START;
    showTextBubble: TextBubble = {
        game: false,
        description: false,
        duration: false,
    };
    newText = '';
    private isTakenSubject = new BehaviorSubject<boolean>(false);

    // Lint disabled because of the max parmaters rule warning
    /* eslint-disable-next-line */
    constructor(
        public gameService: GameService,
        public questionService: QuestionService,
        public choiceService: ChoiceService,
        private snackBar: MatSnackBar,
    ) {}

    editGameTitle() {
        this.showTextBubble.game = true;
        this.newText = this.game.title;
    }

    saveGameTitle() {
        this.gameService.getAllGames().subscribe((games) => {
            const isTaken = !!games?.find((game) => game.title === this.newText);
            this.isTakenSubject.next(isTaken);

            if (isTaken) {
                this.snackBar.open(TAKEN_MESSAGE, '', {
                    duration: SNACKBAR_DURATION_BONUS,
                    verticalPosition: 'top',
                });
            } else {
                this.game.title = this.newText;
                this.showTextBubble.game = false;
            }
        });
    }

    editGameDescription() {
        this.showTextBubble.description = true;
        this.newText = this.game.description;
    }

    saveGameDescription() {
        this.game.description = this.newText;
        this.showTextBubble.description = false;
    }

    updateQuestionPosition(eventData: { direction: boolean; questionIndex: number }) {
        const direction = eventData.direction;
        const questionIndex = eventData.questionIndex;
        const questions = this.questionService.getQuestionsForGame(this.game);
        let newIndex = questionIndex;
        if (direction) {
            newIndex -= 1;
            if (newIndex < 0) return;
        } else {
            newIndex += 1;
            if (newIndex >= questions.length) return;
        }
        const temp = questions[questionIndex];
        questions[questionIndex] = questions[newIndex];
        questions[newIndex] = temp;
    }

    deleteQuestion(questionId: string) {
        const choices = this.choiceService.getChoicesForQuestionGame(questionId, this.game);
        if (choices) {
            this.choiceService.setChoicesForQuestionGame([], questionId, this.game);
        }
        this.questionService.deleteQuestionsById(questionId, this.game);
    }

    createNewQCMQuestion(): void {
        const newQuestion = this.questionService.createNewQCMQuestion();
        this.game.questions.push(newQuestion);
        this.choiceService.initChoicesNewQuestion(newQuestion.id, this.game);
    }
    createNewQRLQuestion(): void {
        const newQuestion = this.questionService.createNewQRLQuestion();
        this.game.questions.push(newQuestion);
    }

    validateQCMQuestions(): boolean {
        let validRule = true;
        const qcmQuestions = this.game.questions.filter((question) => question.type === QCM_TYPE);
        for (const question of qcmQuestions) {
            const hasCorrectChoice = question.choices.some((choice) => choice.isCorrect);
            const hasIncorrectChoice = question.choices.some((choice) => !choice.isCorrect);
            if (!hasCorrectChoice || !hasIncorrectChoice) {
                validRule = false;
                break;
            }
        }
        return validRule;
    }

    isEmpty(question: Question) {
        return question.text === '';
    }

    validateTitles(): boolean {
        let validRule = true;
        for (const question of this.game.questions) {
            if (this.isEmpty(question)) {
                validRule = false;
                break;
            }
        }
        return validRule;
    }

    onDurationChanged($event: Event) {
        this.game.duration = Number(($event.target as HTMLInputElement).value);
    }

    onSaveAndReturn() {
        if (!this.validateQCMQuestions()) {
            this.snackBar.open(INVALID_MESSAGE, '', {
                duration: SNACKBAR_DURATION_BONUS,
                verticalPosition: 'top',
            });
        }
        if (!this.validateTitles()) {
            this.snackBar.open(NO_TITLE_MESSAGE, '', {
                duration: SNACKBAR_DURATION_BONUS,
                verticalPosition: 'top',
            });
        }
        sessionStorage.setItem('isAdminAuthenticated', 'true');
        this.game.lastModification = this.currentDate;
        this.gameService.modifyGame(this.game);
    }

    getGameId() {
        const url = window.location.href;
        const parts = url.split('/');
        const id = parts[parts.length - 1];
        return id;
    }

    ngOnInit() {
        this.gameId = this.getGameId();
        this.gameService.getGameById(this.gameId).subscribe((game) => {
            this.game = game;
        });
    }
}
