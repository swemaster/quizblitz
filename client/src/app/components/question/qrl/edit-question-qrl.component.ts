import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { Game, Question } from '@app/interfaces/game.model';
import { MAX_POINTS, MIN_POINTS, STEP } from '@app/pages/page.constant';
import { ChoiceService } from '@app/services/choice.service';
@Component({
    selector: 'app-question-eqrl',
    templateUrl: './edit-question-qrl.component.html',
    styleUrls: ['./edit-question-qrl.component.scss'],
})
export class EditQuestionQRLComponent {
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
    deleteQuestion(questionId: string) {
        this.deleteQuestionEvent.emit(questionId);
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
