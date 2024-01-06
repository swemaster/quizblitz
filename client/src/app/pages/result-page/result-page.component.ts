import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Match } from '@app/interfaces/match.model';
import { Selections } from '@app/interfaces/selections.model';
import { HOME_PAGE_PATH, MATCH_BASE } from '@app/pages/page.constant';
import { ChatService } from '@app/services/chat.service';
import { CommunicationService } from '@app/services/communication.service';
import { GameSocketService } from '@app/services/game-socket.service';
import { HistoryCommunicationService } from '@app/services/history.communication.service';
import { InGameService } from '@app/services/in-game.service';
import { PlayerService } from '@app/services/player.service';
import { SelectionsService } from '@app/services/selections.service';
import { faTrophy } from '@fortawesome/free-solid-svg-icons';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-result-page',
    templateUrl: './result-page.component.html',
    styleUrls: ['./result-page.component.scss'],
})
export class ResultPageComponent implements OnInit, OnDestroy {
    router = inject(Router);
    gameSocketService = inject(GameSocketService);
    inGameService = inject(InGameService);
    chatService = inject(ChatService);
    playerService = inject(PlayerService);
    selectionsService = inject(SelectionsService);
    communicationService = inject(CommunicationService);
    historyCommunicationService = inject(HistoryCommunicationService);

    faTrophy = faTrophy;
    score = this.inGameService.getCurrentPoints();
    match: Match = MATCH_BASE;
    room: string;
    private subscriptions: Subscription[] = [];

    ngOnInit() {
        this.subscriptions.push(
            this.inGameService.getMatch().subscribe((match: Match | null) => {
                if (match) {
                    this.match = match;
                    this.historyCommunicationService.postHistory(this.match);
                    this.inGameService.getMatch().unsubscribe();
                }
            }),

            this.gameSocketService.orderedToQuitTheGame().subscribe(() => {
                this.quitGame();
            }),

            this.chatService.getSelectionsObs().subscribe((selections: Selections) => {
                if (selections.questions[0].selections[0] !== undefined) {
                    this.selectionsService.acknowledgeSelections();
                }
                this.match.game.questions = selections.questions;
            }),
        );

        this.chatService.joinRoom(this.playerService.getRoom());
        this.selectionsService.send(this.playerService.getRoom());
    }

    ngOnDestroy() {
        this.subscriptions.forEach((subscription) => subscription.unsubscribe());
    }

    quitGame() {
        this.router.navigateByUrl(HOME_PAGE_PATH);
    }
}
