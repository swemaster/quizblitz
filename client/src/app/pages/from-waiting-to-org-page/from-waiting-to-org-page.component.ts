import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DURATION_INTERVAL, TIME_OVER, TIME_WAITING_GAME } from '@app/pages/page.constant';
import { GameSocketService } from '@app/services/game-socket.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-from-waiting-to-org-page',
    templateUrl: './from-waiting-to-org-page.component.html',
    styleUrls: ['./from-waiting-to-org-page.component.scss'],
})
export class FromWaitingToOrgPageComponent implements OnInit, OnDestroy {
    time: number;
    interval: number;
    accessCode: string;
    private subscriptions: Subscription[] = [];

    constructor(
        public socketService: GameSocketService,
        private router: ActivatedRoute,
        public route: Router,
    ) {}
    ngOnInit() {
        this.router.params.subscribe((params) => {
            this.accessCode = params['accessCode'];
        });
        this.startTimer();
    }
    startTimer() {
        this.time = TIME_WAITING_GAME;
        this.interval = window.setInterval(() => this.runTimer(), DURATION_INTERVAL);
    }
    runTimer() {
        // Sends current chrono value by socket to all players
        this.time--;
        this.socketService.sendChronoValues(this.time);
        if (this.time === TIME_OVER) {
            clearInterval(this.interval);
            this.route.navigate(['/orggame', this.accessCode]);
        }
    }

    ngOnDestroy() {
        this.subscriptions.forEach((subscription) => subscription.unsubscribe());
    }
}
