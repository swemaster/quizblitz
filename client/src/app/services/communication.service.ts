import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Game, Question } from '@app/interfaces/game.model';
import { Match } from '@app/interfaces/match.model';
import { Message } from '@app/interfaces/message';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class CommunicationService {
    private readonly baseUrl: string = environment.serverUrl;

    constructor(private readonly http: HttpClient) {}

    basicGet(): Observable<Message> {
        return this.http.get<Message>(`${this.baseUrl}/example`).pipe(catchError(this.handleError<Message>('basicGet')));
    }

    basicPost(message: Message): Observable<HttpResponse<string>> {
        return this.http.post(`${this.baseUrl}/example/send`, message, { observe: 'response', responseType: 'text' });
    }

    gamePost(game: Game): Observable<HttpResponse<string>> {
        return this.http.post(`${this.baseUrl}/editgame`, game, { observe: 'response', responseType: 'text' });
    }

    matchPost(match: Match): Observable<HttpResponse<string>> {
        return this.http.post(`${this.baseUrl}/waitingplayers`, match, { observe: 'response', responseType: 'text' });
    }

    gameDelete(game: Game): Observable<HttpResponse<string>> {
        return this.http.delete(`${this.baseUrl}/editgame/${game.id}`, { observe: 'response', responseType: 'text' });
    }

    matchDelete(matchCode: string): Observable<HttpResponse<string>> {
        return this.http.delete(`${this.baseUrl}/waitingplayers/${matchCode}`, { observe: 'response', responseType: 'text' });
    }

    gamePatch(game: Game): Observable<HttpResponse<string>> {
        return this.http.patch(`${this.baseUrl}/editgame/${game.id}`, game, { observe: 'response', responseType: 'text' });
    }

    getMatchByAccessCode(accessCode: string): Observable<Match> {
        const url = `${this.baseUrl}/waitingplayers/${accessCode}`;
        return this.http.get<Match>(url).pipe(catchError(this.handleError<Match>('getMatch')));
    }

    getGameById(id: string): Observable<Game> {
        const url = `${this.baseUrl}/editgame/${id}`;
        return this.http.get<Game>(url).pipe(catchError(this.handleError<Game>('getGame')));
    }

    getGames(): Observable<Game[]> {
        return this.http.get<Message>(`${this.baseUrl}/editgame`).pipe(map((response) => this.mapResponseToGames(response)));
    }

    getMatches(): Observable<Match[]> {
        return this.http.get<Message>(`${this.baseUrl}/waitingplayers`).pipe(map((response) => this.mapResponseToMatch(response)));
    }

    matchPatch(match: Match): Observable<HttpResponse<string>> {
        return this.http.patch(`${this.baseUrl}/waitingplayers/${match.accessCode}`, match, { observe: 'response', responseType: 'text' });
    }

    private handleError<T>(request: string, result?: T): (error: Error) => Observable<T> {
        return () => of(result as T);
    }
    // we're using any type because response.map says message doesn't have the .map method
    // disabling this line because otherwise, any will change to unknown after linting, and unknown causes issues
    // eslint-disable-next-line
    private mapResponseToGames(response: any): Game[] {
        return response.map((gameData: Game) => {
            const game: Game = {
                id: gameData.id,
                title: gameData.title,
                isVisible: gameData.isVisible,
                lastModification: new Date(gameData.lastModification),
                duration: gameData.duration,
                description: gameData.description,
                questions: gameData.questions.map((questionData: Question) => {
                    const question: Question = {
                        id: questionData.id,
                        type: questionData.type,
                        text: questionData.text,
                        points: questionData.points,
                        choices: questionData.choices,
                        textZone: questionData.textZone,
                        selections: questionData.selections,
                    };
                    return question;
                }),
            };
            return game;
        });
    }

    // we're using any type because new Date() seems to be incompatible with string type, which causes issues
    // eslint-disable-next-line
    private mapResponseToMatch(response: any): Match[] {
        if (!Array.isArray(response)) {
            return [];
        }
        // we're using any type because new Date() seems to be incompatible with string type, which causes issues
        // eslint-disable-next-line
        return response.map((matchData: any) => {
            const match: Match = {
                accessCode: matchData.accessCode,
                canBeAccessed: matchData.canBeAccessed,
                startDate: matchData.startDate,
                game: this.mapGame(matchData.game),
                players: matchData.players,
                time: matchData.time,
                questionId: matchData.questionId,
                messages: matchData.messages,
                creator: matchData.creator,
                nomsBannis: matchData.nomsBannis,
            };
            return match;
        });
    }
    // we're using any type because new Date() seems to be incompatible with string type, which causes issues
    // eslint-disable-next-line
    private mapGame(gameData: any): Game {
        if (!gameData) {
            return {
                id: '',
                title: '',
                isVisible: false,
                lastModification: new Date(),
                duration: 0,
                description: '',
                questions: [],
            };
        }
        const game: Game = {
            id: gameData.id || '',
            title: gameData.title || '',
            isVisible: gameData.isVisible || false,
            lastModification: gameData.lastModification ? new Date(gameData.lastModification) : new Date(),
            duration: gameData.duration || 0,
            description: gameData.description || '',
            questions: gameData.questions || [],
        };
        return game;
    }
}
