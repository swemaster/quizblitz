import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Game } from '@app/interfaces/game.model';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { Observable, of } from 'rxjs';
import { CommunicationService } from './communication.service';
import { GameValidationService } from './game.validation.service';

describe('GameValidationService', () => {
    let service: GameValidationService;
    let communicationService: CommunicationService;
    beforeEach(() => {
        const ajv = new Ajv();
        addFormats(ajv);

        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule, NoopAnimationsModule],
            providers: [
                GameValidationService,
                {
                    provide: Ajv,
                    useValue: ajv,
                },
                CommunicationService,
                MatSnackBar,
            ],
        });
        service = TestBed.inject(GameValidationService);
        communicationService = TestBed.inject(CommunicationService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should return correct errors for an invalid game', () => {
        const invalidGame: Game = {
            id: 'example-id',
            title: 'Example Game',
            isVisible: true,
            lastModification: new Date(),
            duration: 110,
            description: 'Example game description',
            questions: [
                {
                    id: 'q1',
                    type: 'QCM',
                    text: 'Example question',
                    points: 5,
                    choices: [
                        { text: 'Choice 1', isCorrect: false },
                        { text: 'Choice 2', isCorrect: false },
                        { text: 'Choice 3', isCorrect: false },
                        { text: 'Choice 4', isCorrect: false },
                        { text: 'Choice 5', isCorrect: false },
                    ],
                    textZone: '',
                    selections: [],
                },
            ],
        };

        const errors = service.validateGame(invalidGame);
        expect(errors).toContain('Le temps pour chaque question QCM doit être entre 10 et 60 secondes.');
        expect(errors).toContain('Question 1: Les questions QCM doivent contenir au moins un bon et un mauvais choix.');
        expect(errors).toContain('Question 1: Les questions QCM doivent contenir entre 2 et 4 choix de réponse inclusivement.');
        expect(errors).toContain('Question 1: Chaque question doit valoir entre 10 et 100 points, multiple de 10.');
    });
    it('should return correct error a game with no questions.', () => {
        const noQuestionGame: Game = {
            id: 'example-id',
            title: 'Example Game',
            isVisible: true,
            lastModification: new Date(),
            duration: 110,
            description: 'Example game description',
            questions: [],
        };

        const errors = service.validateGame(noQuestionGame);
        expect(errors).toContain('Le jeu doit contenir au moins une question.');
    });
    it('should correctly handle a game with QRL type questions', () => {
        const game: Game = {
            id: 'example-id',
            title: 'Example Game',
            isVisible: true,
            lastModification: new Date(),
            duration: 110,
            description: 'Example game description',
            questions: [
                {
                    id: 'q1',
                    type: 'QRL',
                    text: 'Example question',
                    points: 30,
                    choices: [],
                    textZone: '',
                    selections: [],
                },
            ],
        };

        service.correctGameAttributes(game);

        expect(game.questions[0].id).toBe('q1');
        expect(game.questions[0].textZone).toBe('');
        expect(game.questions[0].choices).toEqual([]);
        expect(game.questions[0].selections).toEqual([]);
    });
    it('should read file as text', async () => {
        const file = new File(['test file'], 'test.txt', { type: 'text/plain' });

        const result = await service.readFileAsText(file);

        expect(result).toBe('test file');
    });
    it('should parse valid file data', async () => {
        const file = new File(['{"id": "example-id"}'], 'game.json', { type: 'application/json' });
        const fileInputMock = document.createElement('input');
        const result = await service.parseFile(file, fileInputMock);
        expect(result).toEqual({ id: 'example-id' } as Game);
    });
    it('should handle invalid file data', async () => {
        const invalidGameData = '{invalid-json-data}';
        const file = new File([invalidGameData], 'game.json', { type: 'application/json' });
        const fileInputMock = document.createElement('input');
        const result = await service.parseFile(file, fileInputMock);
        expect(result).toBeUndefined();
    });
    it('should save a game and update lists on successful post', async () => {
        const game: Game = {
            id: 'example-id',
            title: 'Example Game',
            isVisible: true,
            lastModification: new Date(),
            duration: 110,
            description: 'Example game description',
            questions: [
                {
                    id: 'q1',
                    type: 'QCM',
                    text: 'Example question',
                    points: 30,
                    choices: [],
                    textZone: '',
                    selections: [],
                },
            ],
        };
        const fileInputMock = document.createElement('input');
        const httpResponseMock = new HttpResponse({ status: 200, body: 'Success' });
        spyOn(communicationService, 'gamePost').and.returnValue(of(httpResponseMock));
        await service.saveGame(game, fileInputMock);
        expect(service.games.length).toBe(1);
        expect(service.games[0]).toEqual(game);

        service.importedGame.subscribe((importedGame) => {
            expect(importedGame).toEqual(game);
        });

        expect(fileInputMock.value).toBe('');
    });
    it('should handle error on server response', async () => {
        const game = {
            id: 'example-id',
            title: 'Example Game',
            isVisible: true,
            lastModification: new Date(),
            duration: 110,
            description: 'Example game description',
            questions: [
                {
                    id: 'q1',
                    type: 'QCM',
                    text: 'Example question',
                    points: 30,
                    choices: [],
                    textZone: '',
                    selections: [],
                },
            ],
        };
        const fileInputMock = document.createElement('input');

        const httpErrorResponse = new HttpErrorResponse({ status: 400, statusText: 'Bad Request' });

        spyOn(communicationService, 'gamePost').and.returnValue(
            new Observable((observer) => {
                observer.error(httpErrorResponse);
            }),
        );

        const result = await service.saveGame(game, fileInputMock);

        expect(result).toBeUndefined();
        expect(service.message.getValue()).toContain(`Le serveur ne répond pas et a retourné`);
    });

    it('should return undefined if the game name already exists', async () => {
        const existingGame: Game = {
            id: 'example-id',
            title: 'Example Game',
            isVisible: true,
            lastModification: new Date(),
            duration: 110,
            description: 'Example game description',
            questions: [
                {
                    id: 'q1',
                    type: 'QCM',
                    text: 'Example question',
                    points: 30,
                    choices: [],
                    textZone: '',
                    selections: [],
                },
            ],
        };
        service.games = [existingGame];

        const importedGame: Game = {
            id: 'example-id',
            title: 'Example Game',
            isVisible: true,
            lastModification: new Date(),
            duration: 110,
            description: 'Example game description',
            questions: [
                {
                    id: 'q1',
                    type: 'QCM',
                    text: 'Example question',
                    points: 30,
                    choices: [],
                    textZone: '',
                    selections: [],
                },
            ],
        };
        const fileInputMock = document.createElement('input');
        spyOn(window, 'prompt').and.returnValue('Cancelled');
        const result = await service.validateAndCorrectGame(importedGame, fileInputMock);
        expect(result).toBeUndefined();
    });
    it('should return undefined if the user cancels entering a new game name', async () => {
        const existingGame: Game = {
            id: 'example-id',
            title: 'Example Game',
            isVisible: true,
            lastModification: new Date(),
            duration: 110,
            description: 'Example game description',
            questions: [
                {
                    id: 'q1',
                    type: 'QCM',
                    text: 'Example question',
                    points: 30,
                    choices: [],
                    textZone: '',
                    selections: [],
                },
            ],
        };
        service.games = [existingGame];

        const importedGame: Game = {
            id: 'example-id',
            title: 'Example Game',
            isVisible: true,
            lastModification: new Date(),
            duration: 110,
            description: 'Example game description',
            questions: [
                {
                    id: 'q1',
                    type: 'QCM',
                    text: 'Example question',
                    points: 30,
                    choices: [],
                    textZone: '',
                    selections: [],
                },
            ],
        };

        const fileInputMock = document.createElement('input');
        spyOn(window, 'prompt').and.returnValue(null);
        const result = await service.validateAndCorrectGame(importedGame, fileInputMock);
        expect(result).toBeUndefined();
        expect(fileInputMock.value).toBe('');
    });
});
