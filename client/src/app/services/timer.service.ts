import { Injectable } from '@angular/core';
import { DURATION_INTERVAL, DURATION_INTERVAL_PANIC, TIME_ANSWERS_SHOW, TIME_OVER } from '@app/pages/page.constant';
import { GameSocketService } from '@app/services/game-socket.service';

@Injectable({
    providedIn: 'root',
})
export class TimerService {
    interval: number;
    canSkip = false;
    time: number;
    isWaiting: boolean = true;
    constructor(private socketService: GameSocketService) {}

    startQuestionTime(time: number) {
        this.isWaiting = false;
        this.canSkip = false;
        this.time = time;
        this.interval = window.setInterval(() => this.runQuestionTime(), DURATION_INTERVAL);
        return this.interval;
    }

    setTimeOver() {
        this.time = 0;
    }

    startWaitTime(duration: number) {
        this.isWaiting = true;
        this.canSkip = false;
        this.time = TIME_ANSWERS_SHOW;
        this.interval = window.setInterval(() => this.runWaitTime(duration), DURATION_INTERVAL);
        return this.interval;
    }

    pauseTimer() {
        if (!this.isWaiting) clearInterval(this.interval);
    }

    resumeTimer() {
        if (!this.isWaiting && this.time !== TIME_OVER) {
            this.interval = window.setInterval(() => this.runQuestionTime(), DURATION_INTERVAL);
        }
    }

    runQuestionTime() {
        // Sends current chrono value by socket to all players
        if (this.time <= TIME_OVER) {
            this.canSkip = true;
            clearInterval(this.interval);
            this.validateQuestion();
        } else {
            this.socketService.sendChronoValues(--this.time);
        }
    }

    runWaitTime(duration: number) {
        if (this.time <= TIME_OVER) {
            this.canSkip = false;
            this.socketService.orgNextQuestion();
            clearInterval(this.interval);
            this.startQuestionTime(duration);
        } else {
            this.socketService.sendChronoValues(--this.time);
        }
    }
    activatePanicMode() {
        clearInterval(this.interval);
        this.interval = window.setInterval(() => this.runQuestionTime(), DURATION_INTERVAL_PANIC);
    }

    validateQuestion() {
        if (this.canSkip) {
            this.socketService.orgValidateQuestions();
        }
    }
}
