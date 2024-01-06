import { HttpResponse } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Game } from '@app/interfaces/game.model';
import { Match } from '@app/interfaces/match.model';
import { Player } from '@app/interfaces/player.model';
import { BASE_GAME } from '@app/pages/page.constant';
import { HistoryCommunicationService } from './history.communication.service';

describe('HistoryCommunicationService', () => {
    let httpMock: HttpTestingController;
    let service: HistoryCommunicationService;
    let baseUrl: string;

    const mockGame: Game = BASE_GAME;
    const mockPlayers: Player[] = [
        {
            name: 'Organisateur',
            points: 0,
            status: 'active',
            selection: [],
            bonuses: 0,
        },
        {
            name: 'Player',
            points: 50,
            status: 'active',
            selection: [],
            bonuses: 0,
        },
    ];
    const mockMatch: Match = {
        game: mockGame,
        canBeAccessed: true,
        startDate: new Date(),
        questionId: '',
        players: mockPlayers,
        time: 0,
        messages: [],
        accessCode: '1234',
        creator: 'Organisateur',
        nomsBannis: [],
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
        });
        service = TestBed.inject(HistoryCommunicationService);
        httpMock = TestBed.inject(HttpTestingController);
        // eslint-disable-next-line dot-notation -- baseUrl is private and we need access for the test
        baseUrl = service['baseUrl'];
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should fetch history data', (done: DoneFn) => {
        const mockResponse = [
            {
                id: '1',
                gameName: 'Test Game',
                playDate: new Date(),
                players: 5,
                bestPoints: 100,
            },
        ];

        service.getHistory().subscribe((response) => {
            expect(response).toEqual(mockResponse);
            done();
        });

        const req = httpMock.expectOne(`${baseUrl}/history`);
        expect(req.request.method).toBe('GET');
        req.flush(mockResponse);
    });

    it('should post history data and return a response', () => {
        const mockResponse: string = 'success';

        service.postHistory(mockMatch).subscribe((response: HttpResponse<string>) => {
            expect(response.status).toBe(200);
            expect(response.body).toBe(mockResponse);
        });

        const req = httpMock.expectOne(`${baseUrl}/history`);
        expect(req.request.method).toBe('POST');
        req.flush(mockResponse, { status: 200, statusText: 'OK' });
    });

    it('should delete the history and return a response', () => {
        const mockResponse: string = 'success';

        service.deleteHistory().subscribe((response: HttpResponse<string>) => {
            expect(response.status).toBe(200);
            expect(response.body).toBe(mockResponse);
        });

        const req = httpMock.expectOne(`${baseUrl}/history`);
        expect(req.request.method).toBe('DELETE');
        req.flush(mockResponse, { status: 200, statusText: 'OK' });
    });
});
