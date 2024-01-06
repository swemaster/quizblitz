import { HttpClientModule, HttpResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Game } from '@app/interfaces/game.model';
import { QCM_TYPE } from '@app/pages/page.constant';
import { CommunicationService } from '@app/services/communication.service';
import { GameService } from '@app/services/game.service';
import { GameValidationService } from '@app/services/game.validation.service';
import { QuestionService } from '@app/services/question.service';
import Ajv from 'ajv';
import { of } from 'rxjs';
import { AdminGamePageComponent } from './admin-game-page.component';

describe('AdminGamePageComponent', () => {
    let component: AdminGamePageComponent;
    let fixture: ComponentFixture<AdminGamePageComponent>;
    let questionService: QuestionService;
    let communicationService: CommunicationService;
    let gameValidation: GameValidationService;
    let gameService: GameService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [AdminGamePageComponent],
            imports: [HttpClientModule],
            providers: [
                {
                    provide: Ajv,
                    useValue: new Ajv(),
                },
                GameValidationService,
                GameService,
                CommunicationService,
            ],
        });
        fixture = TestBed.createComponent(AdminGamePageComponent);
        component = fixture.componentInstance;
        gameValidation = TestBed.inject(GameValidationService);
        questionService = TestBed.inject(QuestionService);
        gameService = TestBed.inject(GameService);
        communicationService = TestBed.inject(CommunicationService);
        fixture.detectChanges();
    });
    it('should create a new game successfully', () => {
        spyOn(component.router, 'navigate').and.stub();
        spyOn(questionService, 'generateNewId').and.returnValue('new-game-id');
        component.createNewGame();

        expect(questionService.generateNewId).toHaveBeenCalled();
        expect(sessionStorage.getItem('isAdminAuthenticated')).toBe('true');
        expect(component.router.navigate).toHaveBeenCalledWith(['/editgame', 'new-game-id']);
    });
    it('should delete a game and update arrays accordingly', () => {
        const mockGame: Game = {
            id: '1hd8hk',
            title: 'Mock game 1',
            description: 'Description of Game 1',
            isVisible: true,
            lastModification: new Date('2023-10-01T10:00:00'),
            duration: 10,
            questions: [
                {
                    id: '1',
                    type: QCM_TYPE,
                    text: 'Question 1 and more characters to show of the truncation',
                    points: 20,
                    choices: [
                        { text: 'Choix 1', isCorrect: true },
                        { text: 'Choix 2', isCorrect: false },
                    ],
                    textZone: '',
                    selections: [],
                },
            ],
        };
        const mockIndex = 0;
        const responseMock: HttpResponse<string> = new HttpResponse({
            body: 'Game deleted successfully',
            status: 200,
            statusText: 'OK',
        });
        spyOn(communicationService, 'gameDelete').and.returnValue(of(responseMock));
        component.games = [mockGame];
        component.gameValidation.games = [mockGame];
        component.deleteGame(mockGame, mockIndex);
        expect(component.games.length).toBe(0);
        expect(component.gameValidation.games.length).toBe(0);
    });

    it('should handle HTTP error during game deletion', () => {
        const mockGame = {
            id: '1hd8hk',
            title: 'Mock game 1',
            description: 'Description of Game 1',
            isVisible: true,
            lastModification: new Date('2023-10-01T10:00:00'),
            duration: 10,
            questions: [
                {
                    id: '1',
                    type: 'QCM',
                    text: 'Question 1 and more characters to show of the truncation',
                    points: 20,
                    choices: [
                        { text: 'Choix 1', isCorrect: true },
                        { text: 'Choix 2', isCorrect: false },
                    ],
                    textZone: '',
                    selections: [],
                },
            ],
        };
        const mockIndex = 0;

        const spyDelete = spyOn(gameService, 'deleteGame');

        component.deleteGame(mockGame, mockIndex);
        expect(component.games.length).toBe(0);
        expect(component.gameValidation.games.length).toBe(0);
        expect(spyDelete).toHaveBeenCalledWith(mockGame);
    });

    it('should create a new game and navigate to editgame', () => {
        const mockGame2: Game = {
            id: '274s6shd8',
            title: 'Mock game 2',
            description: 'Description of Game 2',
            isVisible: false,
            lastModification: new Date(),
            duration: 15,
            questions: [
                {
                    id: '1',
                    type: QCM_TYPE,
                    text: 'Question 1 and more characters to show of the truncation',
                    points: 20,
                    choices: [{ text: 'Choix 1', isCorrect: true }],
                    textZone: '',
                    selections: [],
                },
            ],
        };
        const newGameId = mockGame2.id;
        spyOn(questionService, 'generateNewId').and.returnValue(newGameId);
        spyOn(component.router, 'navigate').and.stub();
        component.createNewGame();
        expect(questionService.generateNewId).toHaveBeenCalled();
        expect(component.router.navigate).toHaveBeenCalledWith(['/editgame', newGameId]);
    });
    it('should navigate to history page on goToHistoryPage method', () => {
        const navigateSpy = spyOn(component.router, 'navigate').and.stub();
        component.goToHistoryPage();

        expect(navigateSpy).toHaveBeenCalledWith(['/history']);
    });

    it('should handle game subscription during initialization', () => {
        const mockGames: Game[] = [
            {
                id: '1hd8hk',
                title: 'Mock game 1',
                description: 'Description of Game 1',
                isVisible: true,
                lastModification: new Date('2023-10-01T10:00:00'),
                duration: 10,
                questions: [
                    {
                        id: '1',
                        type: 'QCM',
                        text: 'Question 1 and more characters to show of the truncation',
                        points: 20,
                        choices: [
                            { text: 'Choix 1', isCorrect: true },
                            { text: 'Choix 2', isCorrect: false },
                        ],
                        textZone: '',
                        selections: [],
                    },
                ],
            },
            {
                id: '274s6shd8',
                title: 'Mock game 2',
                description: 'Description of Game 2',
                isVisible: false,
                lastModification: new Date(),
                duration: 15,
                questions: [
                    {
                        id: '2',
                        type: 'QRL',
                        text: 'Question 1',
                        points: 30,
                        choices: [],
                        textZone: '',
                        selections: [],
                    },
                ],
            },
        ];
        spyOn(communicationService, 'getGames').and.returnValue(of(mockGames));
        component.ngOnInit();
        expect(communicationService.getGames).toHaveBeenCalled();
        expect(component.games).toEqual(mockGames);
    });

    it('should return undefined when trying to import without a file', async () => {
        const importedGame = await component.importGame({ target: {} } as unknown as Event);
        expect(importedGame).toBeUndefined();
    });
    it('should return undefined if parseFile returns undefined', async () => {
        const file = new File(['{"id": "example-id"}'], 'game.json', { type: 'application/json' });
        const event = { target: { files: [file] } } as unknown as Event;

        spyOn(gameValidation, 'parseFile').and.returnValue(Promise.resolve(undefined));
        spyOn(gameValidation, 'validateAndCorrectGame').and.returnValue(Promise.resolve({ id: 'example-id' } as Game));

        const result = await component.importGame(event);

        expect(result).toBeUndefined();
    });
    it('should return undefined if validateAndCorrectGame returns undefined', async () => {
        const file = new File(['{"id": "example-id"}'], 'game.json', { type: 'application/json' });
        const event = { target: { files: [file] } } as unknown as Event;

        spyOn(gameValidation, 'parseFile').and.returnValue(Promise.resolve({ id: 'example-id' } as Game));
        spyOn(gameValidation, 'validateAndCorrectGame').and.returnValue(Promise.resolve(undefined));

        const result = await component.importGame(event);

        expect(result).toBeUndefined();
    });
    it('should import and save a valid game in importGame', async () => {
        const file = new File(['{"id": "example-id"}'], 'game.json', { type: 'application/json' });
        const event = { target: { files: [file] } } as unknown as Event;

        spyOn(gameValidation, 'parseFile').and.returnValue(Promise.resolve({ id: 'example-id' } as Game));
        spyOn(gameValidation, 'validateAndCorrectGame').and.returnValue(Promise.resolve({ id: 'example-id' } as Game));
        spyOn(gameValidation, 'saveGame').and.returnValue(Promise.resolve({ id: 'example-id' } as Game));

        const result = await component.importGame(event);

        expect(result).toEqual({ id: 'example-id' } as Game);
    });

    it('should update games array when importing a game', () => {
        const mockImportedGame: Game = {
            id: '1hd8hk',
            title: 'Mock game 1',
            description: 'Description of Game 1',
            isVisible: true,
            lastModification: new Date('2023-10-01T10:00:00'),
            duration: 10,
            questions: [
                {
                    id: '1',
                    type: QCM_TYPE,
                    text: 'Question 1 and more characters to show of the truncation',
                    points: 20,
                    choices: [
                        { text: 'Choix 1', isCorrect: true },
                        { text: 'Choix 2', isCorrect: false },
                    ],
                    textZone: '',
                    selections: [],
                },
            ],
        };
        spyOn(component.gameValidation.importedGame, 'subscribe').and.callThrough();
        component.ngOnInit();
        component.gameValidation.importedGame.next(mockImportedGame);
        expect(component.gameValidation.importedGame.subscribe).toHaveBeenCalled();
        fixture.detectChanges();
        expect(component.games[0]).toEqual(mockImportedGame);
    });
});
