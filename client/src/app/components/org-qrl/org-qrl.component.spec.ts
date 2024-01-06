import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { OrgQrlComponent } from '@app/components/org-qrl/org-qrl.component';
import { Game, Question } from '@app/interfaces/game.model';
import { Match } from '@app/interfaces/match.model';
import { HALF_POINTS, HALF_POINTS_INDEX, MAX_POINTS, MAX_POINTS_INDEX } from '@app/pages/page.constant';
import { ChatService } from '@app/services/chat.service';
import { GameSocketService } from '@app/services/game-socket.service';
import { SelectionsService } from '@app/services/selections.service';
import { SnackbarService } from '@app/services/snackbar.service';
import { TimerService } from '@app/services/timer.service';
import { of } from 'rxjs';
import SpyObj = jasmine.SpyObj;

describe('OrgQrlComponent', () => {
    let component: OrgQrlComponent;
    let fixture: ComponentFixture<OrgQrlComponent>;
    let snackbarServiceSpy: jasmine.SpyObj<SnackbarService>;
    let socketServiceSpy: SpyObj<GameSocketService>;
    let chatServiceSpy: SpyObj<ChatService>;
    let timerServiceSpy: SpyObj<TimerService>;
    let selectionsServiceSpy: SpyObj<SelectionsService>;
    selectionsServiceSpy = jasmine.createSpyObj('SelectionsService', ['updateData']);
    selectionsServiceSpy.updateData.and.returnValue();
    socketServiceSpy = jasmine.createSpyObj('SocketExampleService', ['onQRLText', 'sendMultiplierToPlayer']);
    socketServiceSpy.sendMultiplierToPlayer.and.returnValue();
    socketServiceSpy.onQRLText.and.returnValue(of({ username: 'sample name', text: 'sample-text' }));
    snackbarServiceSpy = jasmine.createSpyObj('SnackbarService', ['showSnackbar']);
    snackbarServiceSpy.showSnackbar.and.returnValue(of());
    timerServiceSpy = jasmine.createSpyObj('TimerService', ['setTimeOver']);
    timerServiceSpy.setTimeOver.and.returnValue();
    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [OrgQrlComponent],
            providers: [
                { provide: SnackbarService, useValue: snackbarServiceSpy },
                { provide: ChatService, useValue: chatServiceSpy },
                { provide: GameSocketService, useValue: socketServiceSpy },
                MatSnackBar,
                { provide: TimerService, useValue: timerServiceSpy },
            ],
        });

        fixture = TestBed.createComponent(OrgQrlComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
    it('should set time over using setTimeout', fakeAsync(() => {
        component.ngOnInit();
        tick();
        expect(timerServiceSpy.setTimeOver).toHaveBeenCalled();
    }));

    it('should initialize data, currentAnswerIndex, sort answer list, and load question when qrlMap is available', () => {
        component.qrlMap = new Map<string, string>();
        component.qrlMap.set('Name1', 'Text1');
        component.qrlMap.set('Name2', 'Text2');

        spyOn(component, 'sortAnswerListByName');
        spyOn(component, 'loadQuestion');
        component.ngOnInit();
        expect(component.data).toEqual([
            { name: 'Name1', text: 'Text1' },
            { name: 'Name2', text: 'Text2' },
        ]);
        expect(component.currentAnswerIndex).toBe(0);
        expect(component.sortAnswerListByName).toHaveBeenCalledWith(component.data);
        expect(component.loadQuestion).toHaveBeenCalled();
    });

    it('should sort answerList by name in ascending order', () => {
        const inputArray = [
            { name: 'Charlie', text: 'Answer C' },
            { name: 'Alice', text: 'Answer A' },
            { name: 'Bob', text: 'Answer B' },
        ];
        const sortedArray = component.sortAnswerListByName(inputArray);
        expect(sortedArray).toEqual([
            { name: 'Alice', text: 'Answer A' },
            { name: 'Bob', text: 'Answer B' },
            { name: 'Charlie', text: 'Answer C' },
        ]);
    });
    it('should load question and update properties based on currentAnswerIndex', () => {
        component.data = [
            { name: 'Player1', text: 'Answer A' },
            { name: 'Player2', text: 'Answer B' },
        ];
        component.currentAnswerIndex = 1;

        component.loadQuestion();

        expect(component.currentAnswer).toEqual({ name: 'Player2', text: 'Answer B' });
        expect(component.currentViewingAnswer).toBe('Answer B');
        expect(component.currentPlayer).toBe('Player2');
    });

    it('should load question and update properties based on currentAnswerIndex', () => {
        const mockQuestion: Question = {
            id: 'q1',
            type: 'QCM',
            text: 'Q',
            points: 20,
            choices: [
                { text: 'C1', isCorrect: false },
                { text: 'C2', isCorrect: false },
                { text: 'C3', isCorrect: true },
                { text: 'C4', isCorrect: false },
            ],
            textZone: '',
            selections: [],
        };
        component.data = [
            { name: 'Player1', text: 'Answer A' },
            { name: 'Player2', text: 'Answer B' },
        ];
        component.currentAnswerIndex = 1;
        component.question = mockQuestion;
        component.loadQuestion();
        expect(component.currentAnswer).toEqual({ name: 'Player2', text: 'Answer B' });
        expect(component.currentViewingAnswer).toBe('Answer B');
        expect(component.currentPlayer).toBe('Player2');
    });

    it('should increment points and update selections when currentAnswerIndex + 1 is equal to data.length', () => {
        const mockQuestion: Question = {
            id: 'q1',
            type: 'QCM',
            text: 'Q',
            points: 20,
            choices: [
                { text: 'C1', isCorrect: false },
                { text: 'C2', isCorrect: false },
                { text: 'C3', isCorrect: true },
                { text: 'C4', isCorrect: false },
            ],
            textZone: '',
            selections: [],
        };
        const mockGame: Game = {
            id: '1',
            title: 'Mock Game',
            description: 'Description of Mock Game',
            isVisible: true,
            lastModification: new Date(),
            duration: 10,
            questions: [mockQuestion],
        };
        const mockMatch: Match = {
            game: mockGame,
            canBeAccessed: true,
            startDate: new Date(),
            questionId: '',
            players: [{ name: 'firstPlayer', points: 20, status: 'active', selection: [1, 2, 3], bonuses: 10 }],
            time: 0,
            messages: [],
            accessCode: '1234',
            creator: 'Organisateur',
            nomsBannis: [],
        };
        component.question = mockQuestion;
        component.match = mockMatch;
        component.currentAnswerIndex = component.data.length - 1;
        spyOn(component, 'loadQuestion');
        selectionsServiceSpy.updateData.and.returnValue();
        socketServiceSpy.sendMultiplierToPlayer.and.returnValue();
        component.nextAnswer();
        expect(component.showNextPlayer).toBe(false);
        expect(component.loadQuestion).not.toHaveBeenCalled();
        expect(socketServiceSpy.sendMultiplierToPlayer).toHaveBeenCalled();
    });

    it('should increment currentAnswerIndex and load next question when currentAnswerIndex + 1 is less than data.length', () => {
        const mockQuestion: Question = {
            id: 'q1',
            type: 'QCM',
            text: 'Q',
            points: 20,
            choices: [
                { text: 'C1', isCorrect: false },
                { text: 'C2', isCorrect: false },
                { text: 'C3', isCorrect: true },
                { text: 'C4', isCorrect: false },
            ],
            textZone: '',
            selections: [],
        };
        component.question = mockQuestion;
        const mockGame: Game = {
            id: '1',
            title: 'Mock Game',
            description: 'Description of Mock Game',
            isVisible: true,
            lastModification: new Date(),
            duration: 10,
            questions: [mockQuestion],
        };
        const mockMatch: Match = {
            game: mockGame,
            canBeAccessed: true,
            startDate: new Date(),
            questionId: '',
            players: [{ name: 'firstPlayer', points: 20, status: 'active', selection: [1, 2, 3], bonuses: 10 }],
            time: 0,
            messages: [],
            accessCode: '1234',
            creator: 'Organisateur',
            nomsBannis: [],
        };
        component.match = mockMatch;
        component.currentAnswerIndex = 0;
        component.data.length = 3;
        spyOn(component, 'loadQuestion');
        component.nextAnswer();
        expect(component.currentAnswerIndex).toBe(1);
        expect(component.loadQuestion).toHaveBeenCalled();
    });
    it('should handle MAX_POINTS and update properties accordingly', () => {
        const mockQuestion: Question = {
            id: 'q1',
            type: 'QCM',
            text: 'Q',
            points: 20,
            choices: [
                { text: 'C1', isCorrect: false },
                { text: 'C2', isCorrect: false },
                { text: 'C3', isCorrect: true },
                { text: 'C4', isCorrect: false },
            ],
            textZone: '',
            selections: [],
        };
        component.question = mockQuestion;
        const mockGame: Game = {
            id: '1',
            title: 'Mock Game',
            description: 'Description of Mock Game',
            isVisible: true,
            lastModification: new Date(),
            duration: 10,
            questions: [mockQuestion],
        };
        const mockMatch: Match = {
            game: mockGame,
            canBeAccessed: true,
            startDate: new Date(),
            questionId: '',
            players: [{ name: 'firstPlayer', points: 20, status: 'active', selection: [1, 2, 3], bonuses: 10 }],
            time: 0,
            messages: [],
            accessCode: '1234',
            creator: 'Organisateur',
            nomsBannis: [],
        };
        component.match = mockMatch;
        component.data = [
            { name: 'Player1', text: 'Answer A' },
            { name: 'Player2', text: 'Answer B' },
        ];
        component.currentAnswerIndex = 2;
        component.selectedValue = MAX_POINTS;
        component.pointsResult = [0, 0, 0];
        component.nextAnswer();
        expect(component.pointsResult[MAX_POINTS_INDEX]).toBe(1);
    });
    it('should handle HALF_POINTS and update properties accordingly', () => {
        const mockQuestion: Question = {
            id: 'q1',
            type: 'QCM',
            text: 'Q',
            points: 20,
            choices: [
                { text: 'C1', isCorrect: false },
                { text: 'C2', isCorrect: false },
                { text: 'C3', isCorrect: true },
                { text: 'C4', isCorrect: false },
            ],
            textZone: '',
            selections: [],
        };
        component.question = mockQuestion;
        const mockGame: Game = {
            id: '1',
            title: 'Mock Game',
            description: 'Description of Mock Game',
            isVisible: true,
            lastModification: new Date(),
            duration: 10,
            questions: [mockQuestion],
        };
        const mockMatch: Match = {
            game: mockGame,
            canBeAccessed: true,
            startDate: new Date(),
            questionId: '',
            players: [{ name: 'firstPlayer', points: 20, status: 'active', selection: [1, 2, 3], bonuses: 10 }],
            time: 0,
            messages: [],
            accessCode: '1234',
            creator: 'Organisateur',
            nomsBannis: [],
        };
        component.match = mockMatch;
        component.data = [
            { name: 'Player1', text: 'Answer A' },
            { name: 'Player2', text: 'Answer B' },
        ];
        component.currentAnswerIndex = 2;
        component.selectedValue = HALF_POINTS;
        component.pointsResult = [0, 0, 0];
        component.nextAnswer();
        expect(component.pointsResult[HALF_POINTS_INDEX]).toBe(1);
    });
});
