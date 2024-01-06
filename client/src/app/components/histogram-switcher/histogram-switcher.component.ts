import { Component, Input, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { HistogramQCMComponent } from '@app/components/histogram-qcm/histogram-qcm.component';
import { HistogramQRLResultsComponent } from '@app/components/histogram-qrl-results/histogram-qrl-results.component';
import { Game } from '@app/interfaces/game.model';

@Component({
    selector: 'app-hist-switch',
    templateUrl: './histogram-switcher.component.html',
    styleUrls: ['./histogram-switcher.component.scss'],
})
export class HistogramSwitcherComponent {
    @ViewChild(HistogramQCMComponent)
    histogramQCMComponent: HistogramQCMComponent;
    @ViewChildren(HistogramQRLResultsComponent) histogramQRLResultsComponents: QueryList<HistogramQRLResultsComponent>;
    @Input() game: Game;

    currentIndex = 0;

    next() {
        if (this.currentIndex < this.game.questions.length - 1) {
            this.currentIndex++;
        }
    }

    previous() {
        if (this.currentIndex > 0) {
            this.currentIndex--;
        }
    }
}
