import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ZERO } from '@app/pages/page.constant';
import { GameSocketService } from '@app/services/game-socket.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-from-waiting-to-play-page',
    templateUrl: './from-waiting-to-play-page.component.html',
    styleUrls: ['./from-waiting-to-play-page.component.scss'],
})
export class FromWaitingToPlayPageComponent implements OnInit, OnDestroy {
    time: number;
    private subscriptions: Subscription[] = [];

    constructor(
        public socketService: GameSocketService,
        private router: Router,
    ) {}
    ngOnInit() {
        this.subscriptions.push(
            this.socketService.receiveChronoValues().subscribe((value: number) => {
                this.time = value;
                if (value === ZERO) {
                    this.router.navigate(['/question']);
                }
            }),
        );
    }

    ngOnDestroy() {
        this.subscriptions.forEach((subscription) => subscription.unsubscribe());
    }
}
