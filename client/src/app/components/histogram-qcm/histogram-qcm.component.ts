import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Question } from '@app/interfaces/game.model';
import { HISTOGRAM_DATA_BASE, PERCENTAGE, TARGET_FONT_FACTOR } from '@app/pages/page.constant';

@Component({
    selector: 'app-hist-qcm',
    templateUrl: './histogram-qcm.component.html',
    styleUrls: ['./histogram-qcm.component.scss'],
})
export class HistogramQCMComponent implements OnChanges {
    @Input() data: number[];
    @Input() question: Question;
    maxValue: number = 0;
    ratio: number;
    constructor() {
        this.data = [...HISTOGRAM_DATA_BASE];
    }
    calculateMaximum() {
        this.maxValue = Math.max(...this.data);
    }
    calculateRatio(value: number): number {
        return (value / this.maxValue) * PERCENTAGE;
    }
    calculateFontSize(value: number): number {
        return this.calculateRatio(value) * TARGET_FONT_FACTOR;
    }
    ngOnChanges(changes: SimpleChanges) {
        if (changes.data) {
            this.calculateMaximum();
        }
    }
}
