import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { Game, Question } from '@app/interfaces/game.model';
import { MAX_POINTS, MIN_POINTS, STEP } from '@app/pages/page.constant';
import { ChoiceService } from '@app/services/choice.service';
@Component({
    selector: 'app-question-eqcm',
    templateUrl: './edit-question-qcm.component.html',
    styleUrls: ['./edit-question-qcm.component.scss'],
})
export class EditQuestionQCMComponent {
    @ViewChild('elementToTrack') elementToTrack: ElementRef;
    @Input() question: Question;
    @Input() game: Game;
    @Input() index: number;
    @Output() deleteQuestionEvent = new EventEmitter<string>();
    @Output() updateQuestionPositionEvent = new EventEmitter<{ direction: boolean; questionIndex: number }>();
    @Output() createChoiceEvent = new EventEmitter<string>();

    clicked = false;

    constructor(public choiceService: ChoiceService) {}

    updateQuestionPosition(direction: boolean, questionIndex: number) {
        this.updateQuestionPositionEvent.emit({ direction, questionIndex });
    }

    createNewChoice(questionId: string): void {
        const newChoice = this.choiceService.createNewChoice(questionId, this.game);
        if (newChoice) {
            this.question.choices.push(newChoice);
            this.choiceService.setChoicesForQuestionGame(this.question.choices, questionId, this.game);
        }
    }

    deleteQuestion(questionId: string) {
        this.deleteQuestionEvent.emit(questionId);
    }

    updateChoiceIndex(eventData: { direction: boolean; questionId: string; choiceIndex: number }) {
        const choices = this.choiceService.getChoicesForQuestionGame(eventData.questionId, this.game);
        if (choices.length === 0) return;
        let newIndex = eventData.choiceIndex;
        if (eventData.direction) {
            newIndex -= 1;
            if (newIndex < 0) return;
        } else {
            newIndex += 1;
            if (newIndex >= choices.length) return;
        }
        const temp = choices[eventData.choiceIndex];
        choices[eventData.choiceIndex] = choices[newIndex];
        choices[newIndex] = temp;
    }

    deleteChoice(eventData: { questionId: string; choiceId: number }) {
        const questionId = eventData.questionId;
        const choiceId = eventData.choiceId;
        this.choiceService.deleteChoicesById(questionId, this.game, choiceId);
    }

    onPointsChanged($event: Event, questionId: string) {
        const multiple = STEP;
        const min = MIN_POINTS;
        const max = MAX_POINTS;
        let newPoints = Number(($event.target as HTMLInputElement).value);
        if (newPoints > max) {
            newPoints = max;
        } else if (newPoints < min) {
            newPoints = min;
        } else if (newPoints % multiple !== 0) {
            newPoints = Math.round(newPoints / multiple) * multiple;
        }
        this.game.questions.filter((question) => question.id === questionId)[0].points = newPoints;
    }
}
