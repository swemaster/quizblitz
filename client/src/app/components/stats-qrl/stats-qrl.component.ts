import { Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild, inject } from '@angular/core';
import { HistogramQRLComponent } from '@app/components/histogram-qrl/histogram-qrl.component';
import { Match } from '@app/interfaces/match.model';
import { GameSocketService } from '@app/services/game-socket.service';

@Component({
    selector: 'app-stats-qrl',
    templateUrl: './stats-qrl.component.html',
    styleUrls: ['./stats-qrl.component.scss'],
})
export class StatsQRLComponent implements OnInit, OnChanges {
    @Input() match: Match;
    @ViewChild(HistogramQRLComponent)
    histogramQRLComponent: HistogramQRLComponent;
    socketService = inject(GameSocketService);
    data: { name: string; isActive: boolean };
    playerActivityMap: Map<string, boolean> = new Map();
    playerStatusArray = [1, 2];

    ngOnInit() {
        this.playerActivityMap.set('Player1', true);
        this.playerActivityMap.set('Player2', false);
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.data) {
            this.playerActivityMap.set(this.data.name, this.data.isActive);
            let activeCount = 0;
            let unactiveCount = 0;
            for (const [, value] of this.playerActivityMap) {
                if (value === true) {
                    activeCount++;
                } else {
                    unactiveCount++;
                }
            }
            this.playerStatusArray[0] = activeCount;
            this.playerStatusArray[1] = unactiveCount;
        }
    }
}
