import { Component, Input, OnInit, inject } from '@angular/core';
import { Question } from '@app/interfaces/game.model';
import { Match } from '@app/interfaces/match.model';
import {
    HALF_POINTS,
    HALF_POINTS_INDEX,
    MAX_POINTS,
    MAX_POINTS_INDEX,
    SNACKBAR_DURATION_EXIT,
    ZERO_POINTS,
    ZERO_POINTS_INDEX,
} from '@app/pages/page.constant';
import { GameSocketService } from '@app/services/game-socket.service';
import { SnackbarService } from '@app/services/snackbar.service';
import { TimerService } from '@app/services/timer.service';
// eslint-disable-next-line no-restricted-imports
import { SelectionsService } from '@app/services/selections.service';
@Component({
    selector: 'app-org-qrl',
    templateUrl: './org-qrl.component.html',
    styleUrls: ['./org-qrl.component.scss'],
})
export class OrgQrlComponent implements OnInit {
    @Input() qrlMap: Map<string, string>;
    @Input() question: Question;
    @Input() match: Match;
    currentViewingAnswer: string;
    currentPlayer: string;
    currentAnswer: { name: string; text: string };
    currentAnswerIndex: number;
    data: { name: string; text: string }[] = [];
    results: { name: string; scoreMultiplier: number }[] = [];
    selectedValue: number = 0;
    showNextPlayer: boolean = true;
    timerService = inject(TimerService);
    gameSocketService = inject(GameSocketService);
    selectionsService = inject(SelectionsService);
    snackbarService = inject(SnackbarService);

    // first index is the nb of players that had 0 points, second 50 points, third 100 points
    pointsResult = [0, 0, 0];

    ngOnInit(): void {
        setTimeout(() => {
            this.timerService.setTimeOver();
        });
        if (this.qrlMap) {
            this.data = Array.from(this.qrlMap, ([name, text]) => ({ name, text }));
            this.currentAnswerIndex = 0;
            this.sortAnswerListByName(this.data);
            this.loadQuestion();
        }
    }
    sortAnswerListByName(answerList: { name: string; text: string }[]): { name: string; text: string }[] {
        return answerList.sort((a, b) => a.name.localeCompare(b.name));
    }
    nextAnswer() {
        const newResult: { name: string; scoreMultiplier: number } = { name: this.currentPlayer, scoreMultiplier: this.selectedValue };

        switch (this.selectedValue) {
            case ZERO_POINTS:
                ++this.pointsResult[ZERO_POINTS_INDEX];
                break;
            case HALF_POINTS:
                ++this.pointsResult[HALF_POINTS_INDEX];
                break;
            case MAX_POINTS:
                ++this.pointsResult[MAX_POINTS_INDEX];
                break;
        }

        this.results.push(newResult);

        if (this.currentAnswerIndex + 1 >= this.data.length) {
            this.showNextPlayer = false;

            this.question.selections = this.pointsResult;
            this.selectionsService.updateData(this.match.game.questions.length, this.question);

            this.gameSocketService.sendMultiplierToPlayer(this.results);
            this.showSnackBars();
        } else {
            this.currentAnswerIndex++;
            this.loadQuestion();
        }
    }
    loadQuestion() {
        this.currentAnswer = this.data[this.currentAnswerIndex];
        this.currentViewingAnswer = this.currentAnswer.text;
        this.currentPlayer = this.currentAnswer.name;
    }

    showSnackBars() {
        this.results.forEach((result: { name: string; scoreMultiplier: number }, index) => {
            setTimeout(() => {
                this.snackbarService
                    .showSnackbar('Vous avez donné la note de ' + result.scoreMultiplier.toString() + '% à ' + result.name)
                    .subscribe();
            }, index * SNACKBAR_DURATION_EXIT); // Adjust the delay according to your needs
        });
    }
}
