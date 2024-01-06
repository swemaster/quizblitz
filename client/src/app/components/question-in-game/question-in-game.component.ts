import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { Question } from '@app/interfaces/game.model';
import { MAX_QRL_TEXT_LENGTH, QCM_TYPE } from '@app/pages/page.constant';
import { GameSocketService } from '@app/services/game-socket.service';
import { GameService } from '@app/services/game.service';
import { InGameService } from '@app/services/in-game.service';
import { BASIC_MULTIPLIER, EMPTY_TEXT, INITIAL_SCORE_AND_POINTS, INVALID, ONE } from './question-in-game.component.constants';

@Component({
    selector: 'app-question-in-game',
    templateUrl: './question-in-game.component.html',
    styleUrls: ['./question-in-game.component.scss'],
})
export class QuestionInGameComponent {
    @Output() scorerEvent = new EventEmitter<{ score: string; bonuses: number }>();
    @Output() bonusEvent = new EventEmitter<number>();
    @Output() sendSelectionEvent = new EventEmitter<number[]>();
    @Input() showRightAnswersTest: boolean = false;
    @Input() isAllowedToChange: boolean = true;
    @Input() scoreMultiplier: number = BASIC_MULTIPLIER;
    @Output() textEntered = new EventEmitter<string>();
    inputText: string = '';
    maxQRLTextLength = MAX_QRL_TEXT_LENGTH;

    inGameService = inject(InGameService);
    gameSocketService = inject(GameSocketService);
    title: string = EMPTY_TEXT;
    description: string = EMPTY_TEXT;
    score: number = INITIAL_SCORE_AND_POINTS;
    bonuses: number = INITIAL_SCORE_AND_POINTS;
    points: number = INITIAL_SCORE_AND_POINTS;
    choices: string[] = [];
    answers: string[] = [];
    selectedAnswers: string[] = [];
    questionType: string = EMPTY_TEXT;
    isFirst: boolean = false;

    constructor(private gameService: GameService) {
        this.inGameService.reset();
        this.loadQuestion();
    }

    updateScore(value: number, bonuses: number) {
        const score = String(value);
        this.scorerEvent.emit({ score, bonuses });
        this.inGameService.updateScore(this.score);
    }

    selectAnswerFromButtons(targetChoice: string) {
        // Add or remove selected choice into selectedAsnwers
        if (this.isAllowedToChange) {
            const indexInTable: number = this.selectedAnswers.indexOf(targetChoice);
            if (indexInTable !== INVALID) {
                this.selectedAnswers.splice(indexInTable, ONE);
            } else {
                this.selectedAnswers.push(targetChoice);
            }
        }
        const selectedAnswersByIndex = [];
        for (const answer of this.selectedAnswers) {
            selectedAnswersByIndex.push(this.choices.indexOf(answer));
        }
        this.sendSelectionEvent.emit(selectedAnswersByIndex);
    }

    loadQuestion() {
        const question: Question = this.gameService.getCurrentQuestionByIndex(this.inGameService.getCurrentQuestionIndex());
        this.title = question.text;
        this.points = question.points;
        this.questionType = question.type;
        this.isFirst = false;
        if (question.type === QCM_TYPE) {
            this.choices = [];
            this.selectedAnswers = [];
            this.answers = [];

            // Stocking valid choices in answers array
            for (const choice of question.choices) {
                this.choices.push(choice.text);
                if (choice.isCorrect) {
                    this.answers.push(choice.text);
                }
            }
        }
    }

    validateAnswers() {
        if (this.questionType === QCM_TYPE) {
            const correctAnswers: string[] = this.selectedAnswers.filter((value) => this.answers.includes(value));
            const incorrectAnswer: string[] = this.selectedAnswers.filter((value) => !this.answers.includes(value));
            // All good answers chosen and no incorrect answer chosen
            if (correctAnswers.length === this.answers.length && incorrectAnswer.length === 0) {
                if (this.isFirst) {
                    ++this.bonuses;
                }
                this.score += this.points * this.scoreMultiplier;
            }
            this.updateScore(this.score, this.bonuses);
        }
    }

    onClick(event: MouseEvent) {
        if (this.isAllowedToChange) this.selectAnswerFromButtons((event.target as Element).id);
    }

    increaseQuestion() {
        this.inGameService.increaseCurrentQuestionIndex();
    }

    getGameService() {
        return this.gameService;
    }

    showRemainingCaracters() {
        return MAX_QRL_TEXT_LENGTH - this.inputText.length;
    }
    isNotAllowedToWrite() {
        return this.showRemainingCaracters() <= 0;
    }

    textUpdated() {
        this.textEntered.emit(this.inputText);
    }
}
