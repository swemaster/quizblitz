import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Question } from '@app/interfaces/game.model';
import { PERCENTAGE, QRL_COLORS, QRL_SCORES } from '@app/pages/page.constant';

@Component({
    selector: 'app-hist-resqrl',
    templateUrl: './histogram-qrl-results.component.html',
    styleUrls: ['./histogram-qrl-results.component.scss'],
})
export class HistogramQRLResultsComponent implements OnChanges {
    @Input() question: Question;
    maxValue: number = 0;
    ratio: number;
    scores = QRL_SCORES;
    colors = QRL_COLORS;
    calculateMaximum() {
        if (this.question.selections && this.question.selections.length > 0) {
            this.maxValue = Math.max(...this.question.selections);
        } else {
            this.maxValue = 0;
        }
    }
    calculateRatio(value: number): number {
        return (value / this.maxValue) * PERCENTAGE;
    }
    ngOnChanges(changes: SimpleChanges) {
        if (changes.question) {
            this.calculateMaximum();
        }
    }
}
