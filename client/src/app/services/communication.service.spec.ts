import { HttpResponse } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Game, Question } from '@app/interfaces/game.model';
import { Match } from '@app/interfaces/match.model';
import { Message } from '@app/interfaces/message';
import { BASE_GAME, PLAYER_BASE, QCM_TYPE } from '@app/pages/page.constant';
import { CommunicationService } from '@app/services/communication.service';

describe('CommunicationService', () => {
    let httpMock: HttpTestingController;
    let service: CommunicationService;
    let baseUrl: string;
    const mockQuestion: Question = {
        id: '1',
        text: 'Mock Question',
        type: QCM_TYPE,
        points: 50,
        choices: [
            { text: 'Choix 1', isCorrect: false },
            { text: 'Choix 2', isCorrect: true },
        ],
        textZone: '',
        selections: [],
    };
    const mockMatch: Match = {
        game: BASE_GAME,
        canBeAccessed: true,
        startDate: new Date(),
        questionId: '',
        players: PLAYER_BASE,
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
        service = TestBed.inject(CommunicationService);
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

    it('should return expected message (HttpClient called once)', () => {
        const expectedMessage: Message = {
            room: 'expect room',
            time: 'expect time',
            name: 'expect name',
            text: 'expect text',
        };
        service.basicGet().subscribe({
            next: (response: Message) => {
                expect(response.room).toEqual(expectedMessage.room);
                expect(response.time).toEqual(expectedMessage.time);
                expect(response.name).toEqual(expectedMessage.name);
                expect(response.text).toEqual(expectedMessage.text);
            },
            error: fail,
        });

        const req = httpMock.expectOne(`${baseUrl}/example`);
        expect(req.request.method).toBe('GET');
        req.flush(expectedMessage);
    });

    it('should not return any message when sending a POST request (HttpClient called once)', () => {
        const expectedMessage: Message = {
            room: 'expect room',
            time: 'expect time',
            name: 'expect name',
            text: 'expect text',
        };
        service.basicPost(expectedMessage).subscribe({
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            next: () => {},
            error: fail,
        });
        const req = httpMock.expectOne(`${baseUrl}/example/send`);
        expect(req.request.method).toBe('POST');
        req.flush(expectedMessage);
    });

    it('should handle http error safely', () => {
        service.basicGet().subscribe({
            next: (response: Message) => {
                expect(response).toBeUndefined();
            },
            error: fail,
        });

        const req = httpMock.expectOne(`${baseUrl}/example`);
        expect(req.request.method).toBe('GET');
        req.error(new ProgressEvent('Random error occurred'));
    });
    it('should post match data and return a response', () => {
        const mockResponse: string = 'success';

        service.matchPost(mockMatch).subscribe((response: HttpResponse<string>) => {
            expect(response.status).toBe(200);
            expect(response.body).toBe(mockResponse);
        });

        const req = httpMock.expectOne(`${baseUrl}/waitingplayers`);
        expect(req.request.method).toBe('POST');
        req.flush(mockResponse, { status: 200, statusText: 'OK' });
    });

    it('should delete a game and return a response', () => {
        const mockGame: Game = {
            id: '1',
            title: 'Mock Game',
            description: 'Description of Mock Game',
            isVisible: true,
            lastModification: new Date(),
            duration: 10,
            questions: [mockQuestion],
        };
        const mockResponse: string = 'success';

        service.gameDelete(mockGame).subscribe((response: HttpResponse<string>) => {
            expect(response.status).toBe(200);
            expect(response.body).toBe(mockResponse);
        });

        const req = httpMock.expectOne(`${baseUrl}/editgame/${mockGame.id}`);
        expect(req.request.method).toBe('DELETE');
        req.flush(mockResponse, { status: 200, statusText: 'OK' });
    });
    it('should delete a match and return a response', () => {
        const mockMatchCode = '1234';
        const mockResponse: string = 'success';

        service.matchDelete(mockMatchCode).subscribe((response: HttpResponse<string>) => {
            expect(response.status).toBe(200);
            expect(response.body).toBe(mockResponse);
        });

        const req = httpMock.expectOne(`${baseUrl}/waitingplayers/${mockMatchCode}`);
        expect(req.request.method).toBe('DELETE');
        req.flush(mockResponse, { status: 200, statusText: 'OK' });
    });

    it('should patch a match and return a response', () => {
        const mockResponse: string = 'success';

        service.matchPatch(mockMatch).subscribe((response: HttpResponse<string>) => {
            expect(response.status).toBe(200);
            expect(response.body).toBe(mockResponse);
        });

        const req = httpMock.expectOne(`${baseUrl}/waitingplayers/${mockMatch.accessCode}`);
        expect(req.request.method).toBe('PATCH');
        expect(req.request.body).toEqual(mockMatch);
        req.flush(mockResponse, { status: 200, statusText: 'OK' });
    });

    it('should fetch match data', (done: DoneFn) => {
        const mockResponse = [
            {
                game: BASE_GAME,
                canBeAccessed: true,
                startDate: new Date(),
                questionId: '',
                players: PLAYER_BASE,
                time: 0,
                messages: [],
                accessCode: '1234',
                creator: 'Organisateur',
                nomsBannis: [],
            },
        ];

        service.getMatches().subscribe((response) => {
            expect(response).toEqual(mockResponse);
            done();
        });

        const req = httpMock.expectOne(`${baseUrl}/waitingplayers`);
        expect(req.request.method).toBe('GET');
        req.flush(mockResponse);
    });

    it('should map response to Game objects', () => {
        const mockResponse = [
            {
                id: '1',
                title: 'Game Title Test',
                isVisible: true,
                lastModification: new Date(),
                duration: 60,
                description: 'Game Description',
                questions: [
                    {
                        id: 'q1',
                        type: 'Type A',
                        text: 'Question text?',
                        points: 10,
                        choices: [
                            { text: 'Choice 1', isCorrect: true },
                            { text: 'Choice 2', isCorrect: false },
                        ],
                        textZone: '',
                        selections: [],
                    },
                ],
            },
        ];

        const mappedGames = service['mapResponseToGames'](mockResponse);
        expect(mappedGames.length).toBe(mockResponse.length);

        expect(mappedGames[0].id).toBe('1');
        expect(mappedGames[0].title).toBe('Game Title Test');
    });

    it('should map response to Match objects', () => {
        const mockResponse = [
            {
                accessCode: '123',
                canBeAccessed: true,
                startDate: new Date(),
                game: [
                    {
                        id: '1',
                        title: 'Game Title',
                        isVisible: true,
                        lastModification: new Date(),
                        duration: 60,
                        description: 'Game Description',
                        questions: [
                            {
                                id: 'q1',
                                type: 'Type A',
                                text: 'Question text?',
                                points: 10,
                                choices: [
                                    { text: 'Choice 1', isCorrect: true },
                                    { text: 'Choice 2', isCorrect: false },
                                ],
                                textZone: '',
                                selections: [],
                            },
                        ],
                    },
                ],
            },
        ];

        const mappedMatches = service['mapResponseToMatch'](mockResponse);
        expect(mappedMatches.length).toBe(mockResponse.length);
        expect(mappedMatches[0].accessCode).toBe('123');
    });
    it('should map game data correctly', () => {
        const mockGameData = {
            id: '123123',
            title: 'Test Game',
            isVisible: true,
            lastModification: '2023-12-01T12:00:00Z',
            duration: 60,
            description: 'Test Description',
            questions: [{ id: 'q1', type: 'QCM', text: 'Question 1?', points: 10, choices: [] }],
        };

        const mappedGame = service['mapGame'](mockGameData);

        expect(mappedGame.id).toBe('123123');
    });

    it('should return empty array if response is not an array in mapResponseToMatch', () => {
        const mockNonArrayResponse = 'not an array';

        const mappedMatches = service['mapResponseToMatch'](mockNonArrayResponse);

        expect(mappedMatches).toEqual([]);
    });
    it('should handle missing game data in mapGame', () => {
        const mappedGame = service['mapGame'](null);
        expect(mappedGame.id).toBe('');
    });
});
