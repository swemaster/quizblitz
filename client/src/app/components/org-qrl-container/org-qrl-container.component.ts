import { Component, Input, OnDestroy, OnInit, inject } from '@angular/core';
import { Question } from '@app/interfaces/game.model';
import { Match } from '@app/interfaces/match.model';
import { GameSocketService } from '@app/services/game-socket.service';
import { TimerService } from '@app/services/timer.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-org-qrl-container',
    templateUrl: './org-qrl-container.component.html',
    styleUrls: ['./org-qrl-container.component.scss'],
})
export class OrgQrlContainerComponent implements OnInit, OnDestroy {
    @Input() playerAmount: number;
    @Input() question: Question;
    @Input() match: Match;
    timerService = inject(TimerService);
    socketService = inject(GameSocketService);
    qrlMap = new Map<string, string>();
    private subscriptions: Subscription[] = [];

    ngOnInit() {
        this.subscriptions.push(
            this.socketService.onQRLText().subscribe({
                next: (data: { username: string; text: string }) => {
                    this.qrlMap.set(data.username, data.text);
                },
            }),
        );
    }

    ngOnDestroy() {
        this.subscriptions.forEach((subscription) => subscription.unsubscribe());
    }
}
