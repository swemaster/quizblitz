import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Historic } from '@app/interfaces/historic.model';
import { Match } from '@app/interfaces/match.model';
import { Message } from '@app/interfaces/message';
import { BASE_HISTORY } from '@app/pages/page.constant';
import { PlayerService } from '@app/services/player.service';
import { environment } from '@src/environments/environment';
import { Observable, map } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class HistoryCommunicationService {
    history: Historic = BASE_HISTORY;
    private readonly baseUrl: string = environment.serverUrl;
    constructor(
        private readonly http: HttpClient,
        private readonly playerService: PlayerService,
    ) {}

    postHistory(match: Match): Observable<HttpResponse<string>> {
        this.history.id = match.accessCode;
        this.history.gameName = match.game.title;
        this.history.players = match.players.length - 1;
        this.history.playDate = match.startDate;
        this.history.bestPoints = this.playerService.getHighestPoints(match.players);
        return this.http.post(`${this.baseUrl}/history`, this.history, { observe: 'response', responseType: 'text' });
    }

    deleteHistory(): Observable<HttpResponse<string>> {
        return this.http.delete(`${this.baseUrl}/history`, { observe: 'response', responseType: 'text' });
    }

    getHistory(): Observable<Historic[]> {
        return this.http.get<Message>(`${this.baseUrl}/history`).pipe(map((response) => this.mapResponseToHistory(response)));
    }
    // we're using any type because response.map says message doesn't have the .map method
    // disabling this line because otherwise, any will change to unknown after linting, and unknown causes issues
    // eslint-disable-next-line
    private mapResponseToHistory(response: any): Historic[] {
        return response.map((historyData: Historic) => {
            const history: Historic = {
                id: historyData.id,
                gameName: historyData.gameName,
                playDate: historyData.playDate,
                players: historyData.players,
                bestPoints: historyData.bestPoints,
            };
            return history;
        });
    }
}
