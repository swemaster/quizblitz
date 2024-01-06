import { Component, Input, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { HistogramQCMComponent } from '@app/components/histogram-qcm/histogram-qcm.component';
import { Question } from '@app/interfaces/game.model';
import { Match } from '@app/interfaces/match.model';
import { Player } from '@app/interfaces/player.model';
import { PlayerServer } from '@app/interfaces/player.server.model';
import { BASE_QUESTION, DISCONNECT, HISTOGRAM_DATA_BASE, IDLE, ZERO } from '@app/pages/page.constant';
import { GameSocketService } from '@app/services/game-socket.service';
import { SelectionsService } from '@app/services/selections.service';
import { Subscription } from 'rxjs';
@Component({
    selector: 'app-stats',
    templateUrl: './stats.component.html',
    styleUrls: ['./stats.component.scss'],
})
export class StatsComponent implements OnInit, OnDestroy {
    @ViewChild(HistogramQCMComponent)
    histogramQCMComponent: HistogramQCMComponent;
    @Input() question: Question;
    @Input() match: Match;
    socketService = inject(GameSocketService);
    selectionsService = inject(SelectionsService);
    data: number[];
    private subscriptions: Subscription[] = [];

    constructor() {
        this.data = [...HISTOGRAM_DATA_BASE];
        this.question = BASE_QUESTION;
    }

    ngOnInit() {
        this.data = Array(this.question.choices.length).fill(ZERO);
        this.subscriptions.push(
            this.socketService.receivePlayerData().subscribe((playerList: PlayerServer[]) => {
                this.match.players = [];
                playerList.forEach((playerUpdate) => {
                    const player: Player = {
                        name: playerUpdate.name,
                        points: playerUpdate.score,
                        status: 'active', // slightly wrong string sent 'Idle' instead of 'idle'
                        selection: playerUpdate.selection,
                        bonuses: playerUpdate.isFirstAmount,
                    };
                    this.match.players.push(player);
                });
                this.data = this.updateHist();
            }),
        );
    }

    updateHist() {
        const choices: number[] = Array(this.question.choices.length).fill(ZERO); // might have to make let, gives error thinks never reassigned
        for (const player of this.match.players) {
            if (player && player.status !== DISCONNECT && player.status !== IDLE) {
                player.selection.forEach((index) => {
                    choices[index] += 1;
                });
            }
        }
        this.question.selections = choices;

        const nbOfQuestions: number = this.match.game.questions.length;
        this.selectionsService.updateData(nbOfQuestions, this.question);

        return choices;
    }

    ngOnDestroy() {
        this.subscriptions.forEach((subscription) => subscription.unsubscribe());
    }
}
