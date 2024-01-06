import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { PERCENTAGE } from '@app/pages/page.constant';

@Component({
    selector: 'app-hist-qrl',
    templateUrl: './histogram-qrl.component.html',
    styleUrls: ['./histogram-qrl.component.scss'],
})
export class HistogramQRLComponent implements OnChanges {
    @Input() playerStatusArray: number[] = [];
    widthActive: number = 0;
    widthUnactive: number = 0;

    ngOnChanges(changes: SimpleChanges) {
        if (changes.playerStatusArray) {
            this.widthActive = (this.playerStatusArray[0] / Math.max(...this.playerStatusArray)) * PERCENTAGE;
            this.widthUnactive = (this.playerStatusArray[1] / Math.max(...this.playerStatusArray)) * PERCENTAGE;
        }
    }
}
