/* eslint-disable @typescript-eslint/no-magic-numbers */
import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed, discardPeriodicTasks, fakeAsync, tick } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { QuestionInGameComponent } from '@app/components/question-in-game/question-in-game.component';
import { Message } from '@app/interfaces/message';
import { DURATION_INTERVAL_PANIC, HOME_PAGE_PATH, QCM_TYPE } from '@app/pages/page.constant';
import { PlayerPageComponent } from '@app/pages/player-page/player-page.component';
import { ResultPageComponent } from '@app/pages/result-page/result-page.component';
import { ChatService } from '@app/services/chat.service';
import { GameSocketService } from '@app/services/game-socket.service';
import { GameService } from '@app/services/game.service';
import { InGameService } from '@app/services/in-game.service';
import { PlayerService } from '@app/services/player.service';
import { of } from 'rxjs';
import SpyObj = jasmine.SpyObj;

describe('PlayerPageComponent', () => {
    let router: Router;
    let gameService: GameService;
    let inGameService: InGameService;
    let component: PlayerPageComponent;
    let fixture: ComponentFixture<PlayerPageComponent>;
    let chatSpy: SpyObj<ChatService>;
    let socketServiceSpy: SpyObj<GameSocketService>;

    beforeEach(() => {
        socketServiceSpy = jasmine.createSpyObj('SocketExampleService', [
            'setReady',
            'onPanic',
            'sendChronoValues',
            'receiveChronoValues',
            'sendToResultView',
            'joinRoom',
            'goToResultView',
            'playerQuitGame',
            'orderedToQuitTheGame',
            'playerNextQuestion',
            'playerValidateQuestions',
            'isFirst',
            'playerReadyQuestion',
            'sendPlayerSelection',
            'playerQuiGame',
            'sendPlayerScore',
            'receiveMultiplier',
            'sendQRLText',
        ]);
        socketServiceSpy.onPanic.and.returnValue(of());
        socketServiceSpy.setReady.and.returnValue();
        socketServiceSpy.sendChronoValues.and.returnValue();
        socketServiceSpy.receiveChronoValues.and.returnValue(of(10));
        socketServiceSpy.sendToResultView.and.returnValue();
        socketServiceSpy.joinRoom.and.returnValue();
        socketServiceSpy.goToResultView.and.returnValue(of());
        socketServiceSpy.playerQuitGame.and.returnValue();
        socketServiceSpy.orderedToQuitTheGame.and.returnValue(of());
        socketServiceSpy.playerNextQuestion.and.returnValue(of());
        socketServiceSpy.playerValidateQuestions.and.returnValue(of());
        socketServiceSpy.isFirst.and.returnValue(of());
        socketServiceSpy.playerReadyQuestion.and.returnValue();
        socketServiceSpy.sendPlayerSelection.and.returnValue();
        socketServiceSpy.playerQuitGame.and.returnValue();
        socketServiceSpy.sendPlayerScore.and.returnValue();
        socketServiceSpy.receiveMultiplier.and.returnValue(of(50));
        socketServiceSpy.sendQRLText.and.returnValue();

        chatSpy = jasmine.createSpyObj('SocketExampleService', ['sendMessage']);
        chatSpy.sendMessage.and.returnValue();

        TestBed.configureTestingModule({
            declarations: [PlayerPageComponent, QuestionInGameComponent, ResultPageComponent],
            imports: [HttpClientModule, RouterTestingModule.withRoutes([{ path: 'results', component: ResultPageComponent }])],
            providers: [
                MatSnackBar,
                PlayerService,
                GameService,
                InGameService,
                ChatService,
                { provide: GameSocketService, useValue: socketServiceSpy },
            ],
        }).compileComponents();
        fixture = TestBed.createComponent(PlayerPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();

        router = TestBed.inject(Router);
        router.initialNavigation();
        gameService = TestBed.inject(GameService);
        inGameService = TestBed.inject(InGameService);
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should subscribe to socket events in ngOnInit', () => {
        component.ngOnInit();

        expect(socketServiceSpy.receiveChronoValues).toHaveBeenCalled();
        expect(socketServiceSpy.playerValidateQuestions).toHaveBeenCalled();
        expect(socketServiceSpy.playerNextQuestion).toHaveBeenCalled();
        expect(socketServiceSpy.goToResultView).toHaveBeenCalled();
        expect(socketServiceSpy.orderedToQuitTheGame).toHaveBeenCalled();
        expect(socketServiceSpy.isFirst).toHaveBeenCalled();
    });

    it('should navigate to the home page when player is ordered to quit', (done) => {
        const navigateByUrlSpy = spyOn(router, 'navigateByUrl');
        socketServiceSpy.orderedToQuitTheGame.and.returnValue(of({}));

        component.ngOnInit();

        setTimeout(() => {
            expect(navigateByUrlSpy).toHaveBeenCalledWith(HOME_PAGE_PATH);
            done();
        });
    });

    it('multiplier should change if player is first to respond', (done) => {
        socketServiceSpy.isFirst.and.returnValue(of({}));

        component.ngOnInit();

        setTimeout(() => {
            expect(component.scoreMultiplier).toBe(1.2);
            done();
        });
    });

    it('answers should show if asked to validate questions ', (done) => {
        socketServiceSpy.playerValidateQuestions.and.returnValue(of({}));

        component.ngOnInit();

        setTimeout(() => {
            expect(component.isShowingAnswers).toBe(true);
            done();
        });
    });

    it('should handle beforeUnload event', () => {
        spyOn(component, 'playerQuitGame');
        component.beforeUnloadHandler();
        expect(component.playerQuitGame).toHaveBeenCalled();
    });

    it('should call validateAnswers when Enter key is pressed', () => {
        const spy1 = spyOn(component, 'validateAnswers');
        component.questionComponent.selectedAnswers = ['choice 1'];
        const mockEvent: KeyboardEvent = {
            key: 'Enter',
            target: {
                className: 'mat-typography',
            },
        } as unknown as KeyboardEvent;
        component.onKeyDown(mockEvent);
        expect(spy1).toHaveBeenCalled();
    });

    it('should call validateAnswers when Enter key is pressed', () => {
        const spy1 = spyOn(component, 'validateAnswers');
        component.questionComponent.selectedAnswers = ['choice 1'];
        const mockEvent: KeyboardEvent = {
            key: 'Enter',
            target: {
                className: 'enter-button',
            },
        } as unknown as KeyboardEvent;
        component.onKeyDown(mockEvent);
        expect(spy1).toHaveBeenCalled();
    });

    it('should call selectAnswerFromButtons when a valid number key is pressed', () => {
        const spy1 = spyOn(component.questionComponent, 'selectAnswerFromButtons');
        component.questionComponent.choices = ['choice 1', 'choice 2', 'choice 3'];
        const mockEvent: KeyboardEvent = {
            key: '2',
            target: {
                className: 'mat-typography',
            },
        } as unknown as KeyboardEvent;
        component.onKeyDown(mockEvent);
        expect(spy1).toHaveBeenCalledWith('choice 2');
    });

    it('should call selectAnswerFromButtons when a valid number key is pressed', () => {
        const spy1 = spyOn(component.questionComponent, 'selectAnswerFromButtons');
        component.questionComponent.choices = ['choice 1', 'choice 2', 'choice 3'];
        const mockEvent: KeyboardEvent = {
            key: '3',
            target: {
                className: 'choice-button',
            },
        } as unknown as KeyboardEvent;
        component.onKeyDown(mockEvent);
        expect(spy1).toHaveBeenCalledWith('choice 3');
    });

    it('should call selectAnswerFromButtons when a valid number key is pressed', () => {
        const spy1 = spyOn(component.questionComponent, 'selectAnswerFromButtons');
        component.questionComponent.choices = ['choice 1', 'choice 2', 'choice 3', 'choice 4'];
        const mockEvent: KeyboardEvent = {
            key: '1',
            target: {
                className: 'choice-button selected',
            },
        } as unknown as KeyboardEvent;
        component.onKeyDown(mockEvent);
        expect(spy1).toHaveBeenCalledWith('choice 1');
    });

    it('should validate answers only if at least one choice is selected', () => {
        component.questionComponent.questionType = QCM_TYPE;
        const spy1 = spyOn(component, 'validateAnswers');
        component.questionComponent.selectedAnswers = ['choice 1', 'choice 2', 'choice 3'];
        component.clickEnterButton();
        component.questionComponent.selectedAnswers = [];
        component.clickEnterButton();
        expect(spy1).toHaveBeenCalledTimes(1);
    });
    it('should send player selection to the server', () => {
        const selection = [1, 2, 3]; // Mock the selection

        component.sendSelection(selection);

        expect(socketServiceSpy.sendPlayerSelection).toHaveBeenCalledWith(selection);
    });

    it('should update the score and send to the server', () => {
        const score = '50';
        const bonuses = 1;

        component.updateScoreTimer({ score, bonuses });

        expect(component.score).toBe(50);
        expect(socketServiceSpy.sendPlayerScore).toHaveBeenCalledWith({ score, bonuses });
    });

    it('should play sound when asked to panic', (done) => {
        const spy1 = spyOn(component, 'playSound');
        const spy2 = spyOn(component, 'blinkSurroundings');
        socketServiceSpy.onPanic.and.returnValue(of({}));

        component.ngOnInit();

        setTimeout(() => {
            expect(spy1).toHaveBeenCalledTimes(1);
            expect(spy2).toHaveBeenCalledTimes(1);
            done();
        });
    });

    it('should blink surroundings for the remaining amount of time to the question', fakeAsync(() => {
        component.time = 8;
        expect(component.blinking).toBe(false);
        component.blinkSurroundings();
        // blinking should be initially true
        expect(component.blinking).toBe(true);

        // Move time forward to just before the timeout, should be given and synced by org(1.750 second delay for animation + wave effect)
        component.time = component.time - (component.time - 1);
        tick((component.time + 7) * DURATION_INTERVAL_PANIC - 1);

        // Assert that blinking is still true when time hasn't run out
        expect(component.time).toBe(1);
        expect(component.blinking).toBe(true);

        // Move time forward to just after the timeout
        component.time = component.time - 1;
        tick(1);

        // blinking should be false when time is over
        expect(component.time).toBe(0);
        expect(component.blinking).toEqual(false);
        discardPeriodicTasks();
    }));

    it('should play the short sound', () => {
        const audioElementSpy = jasmine.createSpyObj('HTMLAudioElement', ['play']);
        spyOn(document, 'getElementById').and.returnValue(audioElementSpy);
        component.playSound();
        expect(audioElementSpy.play).toHaveBeenCalled();
    });

    it('should not load next question if there is no more questions', () => {
        const spy1 = spyOn(component.questionComponent, 'loadQuestion');
        spyOn(inGameService, 'getCurrentQuestionIndex').and.returnValue(4);
        spyOn(gameService, 'getCurrentGameLength').and.returnValue(4);
        component.validateAnswers();
        expect(spy1).toHaveBeenCalledTimes(0);
    });

    it('should quit the game and navigate to the home page', () => {
        spyOn(router, 'navigateByUrl');

        component.playerQuitGame();

        expect(socketServiceSpy.playerQuitGame).toHaveBeenCalled();
        expect(router.navigateByUrl).toHaveBeenCalledWith(HOME_PAGE_PATH);
    });
    it('should send message to room on departure', () => {
        const text = ` ${component.playerService.getName()} a quitté la partie.`;
        const message: Message = { room: component.playerService.getRoom(), name: 'Système', time: '', text };
        spyOn(router, 'navigateByUrl');
        spyOn(component.chatService, 'sendMessage');

        component.playerQuitGame();

        expect(socketServiceSpy.playerQuitGame).toHaveBeenCalled();
        expect(component.chatService.sendMessage).toHaveBeenCalledWith(message);
        expect(router.navigateByUrl).toHaveBeenCalledWith(HOME_PAGE_PATH);
    });
});
