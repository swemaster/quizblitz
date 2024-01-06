import { HttpClientModule, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { ComponentFixture, TestBed, discardPeriodicTasks, fakeAsync, tick } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { PlayerListComponent } from '@app/components/player-list/player-list.component';
import { StatsComponent } from '@app/components/stats/stats.component';
import { OrgGamePageComponent } from '@app/pages/org-game-page/org-game-page.component';
import { CREATE_GAME_PAGE_PATH, DURATION_INTERVAL_PANIC, MAX_DURATION, PLAYER_BASE, QCM_TYPE, QRL_TYPE } from '@app/pages/page.constant';
import { ResultPageComponent } from '@app/pages/result-page/result-page.component';
import { ChatService } from '@app/services/chat.service';
import { CommunicationService } from '@app/services/communication.service';
import { GameSocketService } from '@app/services/game-socket.service';
import { QuestionService } from '@app/services/question.service';
import { TimerService } from '@app/services/timer.service';
import { of, throwError } from 'rxjs';
import SpyObj = jasmine.SpyObj;
describe('OrgGamePageComponent', () => {
    let router: Router;
    let component: OrgGamePageComponent;
    let fixture: ComponentFixture<OrgGamePageComponent>;
    let socketServiceSpy: SpyObj<GameSocketService>;
    let routerSpy: SpyObj<Router>;
    let timerReference: number | null;
    let timerService: TimerService;
    let communicationServiceSpy: SpyObj<CommunicationService>;
    const mockMatch = {
        game: {
            id: '3',
            title: 'Quiz',
            description: 'Description of Quiz',
            isVisible: true,
            lastModification: new Date(),
            duration: 10,
            questions: [
                {
                    id: 'q17',
                    type: QCM_TYPE,
                    text: 'Quel est le meilleur type de poulie?',
                    points: 20,
                    choices: [
                        { text: 'Poulie simple fixe', isCorrect: false },
                        { text: 'Poulies composées', isCorrect: false },
                        { text: 'Palan composé de deux moufles', isCorrect: true },
                        { text: 'Poulie triple', isCorrect: false },
                    ],
                    textZone: '',
                    selections: [],
                },
                {
                    id: 'q18',
                    type: QCM_TYPE,
                    text: 'Quelle est la meilleure lettre??',
                    points: 30,
                    choices: [
                        { text: 'R', isCorrect: true },
                        { text: 'C', isCorrect: false },
                    ],
                    textZone: '',
                    selections: [],
                },
            ],
        },
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

    beforeEach(async () => {
        routerSpy = jasmine.createSpyObj('router', ['navigate', 'navigateByUrl', 'initialNavigation']);
        communicationServiceSpy = jasmine.createSpyObj('communicationService', ['matchDelete', 'getMatchByAccessCode']);
        communicationServiceSpy.getMatchByAccessCode.and.returnValue(of());
        communicationServiceSpy.matchDelete.and.returnValue(of());
        socketServiceSpy = jasmine.createSpyObj('SocketExampleService', [
            'panic',
            'setReady',
            'sendChronoValues',
            'receiveChronoValues',
            'sendToResultView',
            'joinRoom',
            'goToResultView',
            'orgQuitGame',
            'orgNextQuestion',
            'orgValidateQuestions',
            'orderedToQuitTheGame',
            'receivePlayerData',
            'askForPlayerData',
        ]);
        socketServiceSpy.panic.and.returnValue();
        socketServiceSpy.setReady.and.returnValue();
        socketServiceSpy.sendChronoValues.and.returnValue();
        socketServiceSpy.receiveChronoValues.and.returnValue(of(10));
        socketServiceSpy.sendToResultView.and.returnValue();
        socketServiceSpy.joinRoom.and.returnValue();
        socketServiceSpy.goToResultView.and.returnValue(of());
        socketServiceSpy.orgQuitGame.and.returnValue();
        socketServiceSpy.orgNextQuestion.and.returnValue();
        socketServiceSpy.askForPlayerData.and.returnValue();
        socketServiceSpy.orgValidateQuestions.and.returnValue();
        socketServiceSpy.orderedToQuitTheGame.and.returnValue(of('Value'));
        socketServiceSpy.receivePlayerData.and.returnValue(
            of([
                {
                    name: 'Sample-Name',
                    role: 'Player',
                    socketId: 'ServerRoom',
                    isFirstAmount: 1,
                    score: 20,
                    selection: [0, 1],
                    status: 'Active',
                },
            ]),
        );

        await TestBed.configureTestingModule({
            declarations: [OrgGamePageComponent, StatsComponent, PlayerListComponent],
            providers: [
                {
                    provide: ActivatedRoute,
                    useValue: { snapshot: { paramMap: convertToParamMap({ id: '123' }) } },
                },
                { provide: GameSocketService, useValue: socketServiceSpy },
                { provide: Router, useValue: routerSpy },
                QuestionService,
                { provide: CommunicationService, useValue: communicationServiceSpy },
                TimerService,
                MatSnackBar,
                ChatService,
            ],
            imports: [
                HttpClientModule,
                RouterTestingModule.withRoutes([{ path: 'results', component: ResultPageComponent }]),
                BrowserAnimationsModule,
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(OrgGamePageComponent);
        component = fixture.componentInstance;
        timerService = TestBed.inject(TimerService);
        component.match = {
            game: {
                id: '1',
                title: 'Game',
                description: 'Description of Game',
                isVisible: true,
                lastModification: new Date(),
                duration: 10,
                questions: [
                    {
                        id: 'q7',
                        type: QCM_TYPE,
                        text: 'Quel est le meilleur type de poulie?',
                        points: 20,
                        choices: [
                            { text: 'Poulie simple fixe', isCorrect: false },
                            { text: 'Poulies composées', isCorrect: false },
                            { text: 'Palan composé de deux moufles', isCorrect: true },
                            { text: 'Poulie triple', isCorrect: false },
                        ],
                        textZone: '',
                        selections: [],
                    },
                    {
                        id: 'q8',
                        type: QCM_TYPE,
                        text: 'Quelle est la meilleure lettre??',
                        points: 30,
                        choices: [
                            { text: 'R', isCorrect: true },
                            { text: 'C', isCorrect: false },
                        ],
                        textZone: '',
                        selections: [],
                    },
                    {
                        id: 'q9',
                        type: QRL_TYPE,
                        text: 'Donner une idée pour des céréales',
                        points: 30,
                        choices: [],
                        textZone: '',
                        selections: [],
                    },
                ],
            },
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
        component.path = CREATE_GAME_PAGE_PATH;
        // should start with the first index, requirements are out of this component
        component.match.questionId = 'q7';
        component.qstIndex = 0;
        timerReference = null;
        fixture.detectChanges();

        router = TestBed.inject(Router);
        router.initialNavigation();
    });
    afterEach(() => {
        // Clear the interval timer to ensure proper cleanup
        if (timerReference !== null) {
            clearInterval(timerReference);
        }
    });
    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize match and start timer on ngOnInit when starting with a QCM', fakeAsync(() => {
        communicationServiceSpy.getMatchByAccessCode.and.returnValue(of(mockMatch));

        component.ngOnInit();

        fixture.whenStable().then(() => {
            expect(component.match).toEqual(mockMatch);
            expect(component.match.questionId).toEqual(mockMatch.game.questions[component.qstIndex].id);
            expect(component.currentQuestionType).toBe(QCM_TYPE);
            expect(component.timerService.startQuestionTime).toHaveBeenCalledWith(mockMatch.game.duration);
        });
        discardPeriodicTasks();
    }));

    it('should initialize match and start timer on ngOnInit when starting with a QRL', fakeAsync(() => {
        mockMatch.game.questions[0].type = QRL_TYPE;
        communicationServiceSpy.getMatchByAccessCode.and.returnValue(of(mockMatch));

        component.ngOnInit();

        fixture.whenStable().then(() => {
            expect(component.match).toEqual(mockMatch);
            expect(component.match.questionId).toEqual(mockMatch.game.questions[component.qstIndex].id);
            expect(component.currentQuestionType).toBe(QRL_TYPE);
            expect(component.timerService.startQuestionTime).toHaveBeenCalledWith(MAX_DURATION);
        });
        discardPeriodicTasks();
    }));
    it('should go to the next question', () => {
        timerService.canSkip = true;
        component.match.players[0].selection = [1, 2, 3];
        expect(component.match.game.questions.findIndex((question) => question.id === component.match.questionId)).toBe(0);
        component.nextQuestion();
        // clear the selections and move onto next id of the question to show
        expect(component.match.game.questions.findIndex((question) => question.id === component.match.questionId)).toBe(1);
    });

    it('should set different waiting times when changing question depending on type', () => {
        const spyTime = spyOn(component.timerService, 'startWaitTime');
        timerService.canSkip = true;
        component.match.players[0].selection = [1, 2, 3];
        expect(component.match.game.questions.findIndex((question) => question.id === component.match.questionId)).toBe(0);
        component.nextQuestion();
        // clear the selections and move onto next id of the question to show
        expect(component.match.game.questions.findIndex((question) => question.id === component.match.questionId)).toBe(1);
        expect(spyTime).toHaveBeenCalledWith(component.match.game.duration);
        timerService.canSkip = true;
        component.nextQuestion();
        // clear the selections and move onto next id of the question to show
        expect(component.match.game.questions.findIndex((question) => question.id === component.match.questionId)).toBe(2);
        expect(spyTime).toHaveBeenCalledWith(MAX_DURATION);
    });

    it('should show results after the last question has ended and the organizer skips', () => {
        component.match.questionId = 'q7';
        timerService.canSkip = true;
        component.nextQuestion();
        timerService.canSkip = true;
        component.nextQuestion();
        // test only has 2 questions
        const resultsSpy = spyOn(component, 'showResults');
        //supposed to be last question
        expect(component.match.game.questions.slice(-1)[0].id).toBe(component.match.questionId);
        timerService.canSkip = true;
        component.nextQuestion();
        expect(component.match.game.questions.slice(-1)[0].id).toBe(component.match.questionId);
        expect(resultsSpy).toHaveBeenCalled();
    });
    it('should quit the game', () => {
        component.closeGame();
        expect(socketServiceSpy.orgQuitGame).toHaveBeenCalled();
        expect(component.path).toBe(CREATE_GAME_PAGE_PATH);
    });
    it('should tell players to show results', () => {
        component.showResults();
        expect(socketServiceSpy.sendToResultView).toHaveBeenCalled();
    });

    it('should be able to play a sound', () => {
        // Mock the audio element
        const audioElementSpy = jasmine.createSpyObj('HTMLAudioElement', ['play']);
        spyOn(document, 'getElementById').and.returnValue(audioElementSpy);
        component.playSound();
        expect(audioElementSpy.play).toHaveBeenCalled();
    });

    it('should start the panic mode and play sound when under required time for QCM, which should also work for QRLs', () => {
        const soundSpy = spyOn(component, 'playSound');
        component.match.game.questions[component.qstIndex].type = QCM_TYPE;
        component.timerService.time = 8;
        component.timerService.isWaiting = false;
        component.startPanic();
        expect(soundSpy).toHaveBeenCalledTimes(1);
        expect(socketServiceSpy.panic).toHaveBeenCalledTimes(1);
        component.match.game.questions[component.qstIndex].type = QRL_TYPE;
        component.startPanic();
        // should be called a second time since 8<20
        expect(soundSpy).toHaveBeenCalledTimes(2);
        expect(socketServiceSpy.panic).toHaveBeenCalledTimes(2);
    });

    it('should start the panic mode and play sound when under required time for QRL but not for QCM', () => {
        const soundSpy = spyOn(component, 'playSound');
        component.match.game.questions[component.qstIndex].type = QRL_TYPE;
        component.timerService.time = 17;
        component.timerService.isWaiting = false;
        component.startPanic();
        expect(soundSpy).toHaveBeenCalledTimes(1);
        expect(socketServiceSpy.panic).toHaveBeenCalledTimes(1);
        component.match.game.questions[component.qstIndex].type = QCM_TYPE;
        component.startPanic();
        // should not be called a second time since 17>10
        expect(soundSpy).toHaveBeenCalledTimes(1);
        expect(socketServiceSpy.panic).toHaveBeenCalledTimes(1);
    });
    it('should not start the panic mode and not play sound when over required time for QRL and QCM', () => {
        const soundSpy = spyOn(component, 'playSound');
        component.match.game.questions[component.qstIndex].type = QRL_TYPE;
        component.timerService.time = 21;
        component.timerService.isWaiting = false;
        component.startPanic();
        // should not be called since 21>20
        expect(soundSpy).toHaveBeenCalledTimes(0);
        expect(socketServiceSpy.panic).toHaveBeenCalledTimes(0);
        component.match.game.questions[component.qstIndex].type = QCM_TYPE;
        component.startPanic();
        // should not be called since 21>10
        expect(soundSpy).toHaveBeenCalledTimes(0);
        expect(socketServiceSpy.panic).toHaveBeenCalledTimes(0);
    });
    it('should not start the panic mode and not play sound if timer is in waiting mode (between question)', () => {
        const soundSpy = spyOn(component, 'playSound');
        component.match.game.questions[component.qstIndex].type = QRL_TYPE;
        component.timerService.time = 5;
        component.timerService.isWaiting = true;
        component.startPanic();
        expect(soundSpy).toHaveBeenCalledTimes(0);
        expect(socketServiceSpy.panic).toHaveBeenCalledTimes(0);
        component.match.game.questions[component.qstIndex].type = QCM_TYPE;
        component.startPanic();
        expect(soundSpy).toHaveBeenCalledTimes(0);
        expect(socketServiceSpy.panic).toHaveBeenCalledTimes(0);
    });

    it('should blink surroundings for the remaining amount of time to the question', fakeAsync(() => {
        component.timerService.time = 8;
        expect(component.blinking).toBe(false);
        component.blinkSurroundings();
        // blinking should be initially true
        expect(component.blinking).toBe(true);

        // Move time forward to just before the timeout
        tick(component.timerService.time * DURATION_INTERVAL_PANIC - 1);

        // Blinking should be still true when time hasn't run out
        expect(component.blinking).toBe(true);

        // Move time forward to just after the timeout
        tick(1);

        // blinking should be false when time is over
        expect(component.blinking).toBe(false);
        discardPeriodicTasks();
    }));

    it('should delete match and navigate to /creategame on success', () => {
        const matchCode = '1234';
        const successResponse = new HttpResponse<string>({ status: 200, statusText: 'OK' });
        communicationServiceSpy.matchDelete.and.returnValue(of(successResponse));

        component.deleteMatch(matchCode);

        expect(communicationServiceSpy.matchDelete).toHaveBeenCalledWith(matchCode);
        expect(component.message.getValue()).toContain('Le serveur a reçu la requête a retourné un code 200 : OK');
        expect(routerSpy.navigate).toHaveBeenCalledWith([component.path]);
    });
    it('should handle error response', () => {
        const matchCode = '1234';
        const errorResponse = new HttpErrorResponse({
            status: 500,
            statusText: 'Internal Server Error',
        });
        communicationServiceSpy.matchDelete.and.returnValue(throwError(errorResponse));

        component.deleteMatch(matchCode);
        expect(communicationServiceSpy.matchDelete).toHaveBeenCalledWith(matchCode);
        expect(component.message.getValue()).toContain(
            'Le serveur ne répond pas et a retourné : Http failure response for (unknown url): 500 Internal Server Error',
        );
    });

    it('should tell the service to pause the timer when the question duration is active', () => {
        component.timerService.time = 8;
        component.timerService.isWaiting = false;
        const timerSpy = spyOn(component.timerService, 'pauseTimer');
        component.pause();
        expect(timerSpy).toHaveBeenCalled();
    });
    it('should tell the service to resume the timer when the question duration is active', () => {
        component.timerService.time = 8;
        component.timerService.isWaiting = false;
        component.pause();
        const timerSpy = spyOn(component.timerService, 'resumeTimer');
        component.resume();
        expect(timerSpy).toHaveBeenCalled();
    });

    // might remove if it causes problem for the pipeline
    it('should call closeGame() when window:beforeunload event is triggered', () => {
        const closeGameSpy = spyOn(component, 'closeGame');

        component.beforeUnloadHandler();

        expect(closeGameSpy).toHaveBeenCalled();
    });

    afterEach(() => {
        fixture.destroy();
    });
});
