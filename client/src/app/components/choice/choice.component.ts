import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { Choice, Game, Question } from '@app/interfaces/game.model';
import { ChoiceService } from '@app/services/choice.service';
@Component({
    selector: 'app-choice',
    templateUrl: './choice.component.html',
    styleUrls: ['./choice.component.scss'],
})
export class ChoiceComponent {
    @ViewChild('elementToTrack') elementToTrack: ElementRef;
    @Input() question: Question;
    @Input() game: Game;
    @Input() choice: Choice;
    @Input() index: number;
    @Output() deleteChoiceEvent = new EventEmitter<{ questionId: string; choiceId: number }>();
    @Output() updateChoiceIndexEvent = new EventEmitter<{ direction: boolean; questionId: string; choiceIndex: number }>();
    clicked = false;
    constructor(public choiceService: ChoiceService) {}

    updateValue() {
        this.choiceService.updateIsCorrect(this.choice);
    }

    updateChoiceIndex(direction: boolean, choiceIndex: number) {
        const questionId = this.question.id;
        this.updateChoiceIndexEvent.emit({ direction, questionId, choiceIndex });
    }

    deleteChoice(choiceId: number) {
        const questionId = this.question.id;
        this.deleteChoiceEvent.emit({ questionId, choiceId });
    }
}
