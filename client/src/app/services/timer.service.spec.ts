import { HttpClientModule } from '@angular/common/http';
import { TestBed, discardPeriodicTasks, fakeAsync, tick } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { DURATION_INTERVAL, TIME_ANSWERS_SHOW } from '@app/pages/page.constant';
import { ChatService } from '@app/services/chat.service';
import { CommunicationService } from '@app/services/communication.service';
import { GameSocketService } from '@app/services/game-socket.service';
import { QuestionService } from '@app/services/question.service';
import { of } from 'rxjs';
import { TimerService } from './timer.service';
import SpyObj = jasmine.SpyObj;
describe('OrgGamePageComponent', () => {
    // let questionService: QuestionService;
    let socketServiceSpy: SpyObj<GameSocketService>;
    let service: TimerService;
    let timerReference: number | null;

    beforeEach(async () => {
        socketServiceSpy = jasmine.createSpyObj('SocketExampleService', [
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
        ]);
        socketServiceSpy.setReady.and.returnValue();
        socketServiceSpy.sendChronoValues.and.returnValue();
        socketServiceSpy.receiveChronoValues.and.returnValue(of(10));
        socketServiceSpy.sendToResultView.and.returnValue();
        socketServiceSpy.joinRoom.and.returnValue();
        socketServiceSpy.goToResultView.and.returnValue(of());
        socketServiceSpy.orgQuitGame.and.returnValue();
        socketServiceSpy.orgNextQuestion.and.returnValue();
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
            declarations: [],
            providers: [
                {
                    provide: ActivatedRoute,
                    useValue: { snapshot: { paramMap: convertToParamMap({ id: '123' }) } },
                },
                { provide: GameSocketService, useValue: socketServiceSpy },
                QuestionService,
                CommunicationService,
                MatSnackBar,
                ChatService,
            ],
            imports: [HttpClientModule, RouterTestingModule],
        }).compileComponents();
    });

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(TimerService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
    afterEach(() => {
        // Clear the interval timer to ensure proper cleanup
        if (timerReference !== null) {
            clearInterval(timerReference);
        }
    });

    it('should create', () => {
        expect(service).toBeTruthy();
    });
    it('should pause the timer when the question duration is active', () => {
        service.startQuestionTime(10);
        const clearIntervalSpy = spyOn(window, 'clearInterval');
        service.pauseTimer();
        expect(clearIntervalSpy).toHaveBeenCalled();
    });
    it('should resume the timer when the question duration is active', () => {
        service.startQuestionTime(10);
        service.pauseTimer();
        const setIntervalSpy = spyOn(window, 'setInterval');
        service.resumeTimer();
        expect(setIntervalSpy).toHaveBeenCalled();
    });
    it('should not pause the timer when the wait time is active', () => {
        service.startWaitTime(TIME_ANSWERS_SHOW);
        const clearIntervalSpy = spyOn(window, 'clearInterval');
        service.pauseTimer();
        expect(clearIntervalSpy).not.toHaveBeenCalled();
    });
    it('should not resume the timer when the wait time is active', () => {
        service.startWaitTime(TIME_ANSWERS_SHOW);
        const setIntervalSpy = spyOn(window, 'setInterval');
        service.resumeTimer();
        expect(setIntervalSpy).not.toHaveBeenCalled();
    });
    it('should not resume the timer when the time is at zero', () => {
        service.time = 0;
        const setIntervalSpy = spyOn(window, 'setInterval');
        service.resumeTimer();
        expect(setIntervalSpy).not.toHaveBeenCalled();
    });
    it('should run the time for the question and communicate it to the player', fakeAsync(() => {
        service.startQuestionTime(11);
        tick(DURATION_INTERVAL);
        expect(service.time).toBe(10);
        expect(socketServiceSpy.sendChronoValues).toHaveBeenCalledWith(10);
        discardPeriodicTasks();
    }));
    it('should stop running the time for the question once it gets to 0', fakeAsync(() => {
        service.startQuestionTime(1);
        tick(DURATION_INTERVAL);
        expect(service.time).toBe(0);
        expect(socketServiceSpy.sendChronoValues).toHaveBeenCalledWith(0);
        tick(DURATION_INTERVAL);
        expect(service.time).toBe(0);
        expect(socketServiceSpy.sendChronoValues).toHaveBeenCalledWith(0);
        discardPeriodicTasks();
    }));
    it('should not run the time for the question if it happens to start in the negatives', fakeAsync(() => {
        service.time = -1;
        service.runQuestionTime();
        expect(service.time).toBe(-1);
        expect(socketServiceSpy.sendChronoValues).not.toHaveBeenCalled();
        tick(DURATION_INTERVAL);
        expect(service.time).toBe(-1);
        expect(socketServiceSpy.sendChronoValues).not.toHaveBeenCalled();
        discardPeriodicTasks();
    }));
    it('should run the wait time and communicate it to the player', fakeAsync(() => {
        service.startWaitTime(TIME_ANSWERS_SHOW);
        tick(DURATION_INTERVAL * TIME_ANSWERS_SHOW);
        expect(service.time).toBe(0);
        expect(socketServiceSpy.sendChronoValues).toHaveBeenCalledWith(2);
        expect(socketServiceSpy.sendChronoValues).toHaveBeenCalledWith(1);
        expect(socketServiceSpy.sendChronoValues).toHaveBeenCalledWith(0);
        discardPeriodicTasks();
    }));
    it('should start running the question time after spent time waiting', fakeAsync(() => {
        service.startWaitTime(TIME_ANSWERS_SHOW);
        tick(DURATION_INTERVAL * TIME_ANSWERS_SHOW);
        expect(service.time).toBe(0);
        expect(socketServiceSpy.sendChronoValues).toHaveBeenCalledWith(0);
        const questionTimeSpy = spyOn(service, 'startQuestionTime');
        tick(DURATION_INTERVAL);
        expect(questionTimeSpy).toHaveBeenCalled();
        expect(socketServiceSpy.sendChronoValues).toHaveBeenCalledWith(0);
        discardPeriodicTasks();
    }));
    it('should still run question time if time happens to be in negatives', fakeAsync(() => {
        service.time = -1;
        const questionTimeSpy = spyOn(service, 'startQuestionTime');
        service.runWaitTime(TIME_ANSWERS_SHOW);
        expect(service.time).toBe(-1);
        expect(questionTimeSpy).toHaveBeenCalled();
        expect(socketServiceSpy.sendChronoValues).not.toHaveBeenCalled();
        tick(DURATION_INTERVAL);
        expect(service.time).toBe(-1);
        expect(socketServiceSpy.sendChronoValues).not.toHaveBeenCalled();
        discardPeriodicTasks();
    }));
});
