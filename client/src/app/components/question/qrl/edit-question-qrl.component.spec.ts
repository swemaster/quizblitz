import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { Game, Question } from '@app/interfaces/game.model';
import { QuestionService } from '@app/services/question.service';
import { EditQuestionQRLComponent } from './edit-question-qrl.component';
import { QCM_TYPE } from '@app/pages/page.constant';
describe('EditQuestionQRLComponent', () => {
    let component: EditQuestionQRLComponent;
    let fixture: ComponentFixture<EditQuestionQRLComponent>;
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

    const mockGame: Game = {
        id: '1',
        title: 'Mock Game',
        description: 'Description of Mock Game',
        isVisible: true,
        lastModification: new Date(),
        duration: 10,
        questions: [mockQuestion],
    };

    function newMockEvent(val: string): Event {
        const mockEvent = new Event('input');
        const mockTarget = {
            value: val,
        };
        Object.defineProperty(mockEvent, 'target', { value: mockTarget });
        return mockEvent;
    }
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [EditQuestionQRLComponent],
            providers: [
                {
                    provide: ActivatedRoute,
                    useValue: { snapshot: { paramMap: convertToParamMap({ id: '123' }) } },
                },
                QuestionService,
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(EditQuestionQRLComponent);
        component = fixture.componentInstance;
        component.game = mockGame;
        component.question = mockQuestion;
        component.question.choices = [
            { text: 'Choix 1', isCorrect: false },
            { text: 'Choix 2', isCorrect: true },
        ];
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should update question points', () => {
        const question = component.game.questions[0];
        const questionId = question.id;
        if (!question) {
            expect(true).toBe(false); // fail test
            return;
        }
        question.points = 50;
        const $event = newMockEvent('80');
        const newPoints = 80;
        component.onPointsChanged($event, questionId);
        expect(question.points).toBe(newPoints);
    });

    it('points should always be between 10 and 100', () => {
        const max = 100;
        const min = 10;
        const questionId = '1';
        const question = component.game.questions[0];
        spyOn(component, 'onPointsChanged').and.callThrough();
        const inputElement: HTMLInputElement = fixture.nativeElement.querySelector('#points-changing');
        if (!question) {
            expect(true).toBe(false); // fail test
            return;
        }
        // upper case
        let $event = newMockEvent('115');
        inputElement.dispatchEvent($event);
        let newPoints = max;

        expect(component.onPointsChanged).toHaveBeenCalledWith($event, questionId);
        expect(question.points).toBeLessThanOrEqual(max);
        expect(question.points).toBeGreaterThanOrEqual(min);
        expect(question.points).toBe(newPoints);

        // lower case
        $event = newMockEvent('5');
        inputElement.dispatchEvent($event);
        newPoints = min;

        expect(component.onPointsChanged).toHaveBeenCalledWith($event, questionId);
        expect(question.points).toBeLessThanOrEqual(max);
        expect(question.points).toBeGreaterThanOrEqual(min);
        expect(question.points).toBe(newPoints);
    });

    it('points should always be multiples of 10', () => {
        const multiple = 10;
        const questionId = '1';
        const $event = newMockEvent('84');
        const inputElement: HTMLInputElement = fixture.nativeElement.querySelector('#points-changing');
        spyOn(component, 'onPointsChanged').and.callThrough();
        inputElement.dispatchEvent($event);
        const newPoints = 80;
        fixture.detectChanges();
        expect(component.onPointsChanged).toHaveBeenCalledWith($event, questionId);
        const question = component.question;
        if (!question) {
            expect(true).toBe(false); // fail test
            return;
        }
        expect(question.points % multiple).toBe(0);
        expect(question.points).toBe(newPoints);
    });
    it('should be able to tell parent to update index', () => {
        const emitSpy = spyOn(component.updateQuestionPositionEvent, 'emit');
        component.updateQuestionPosition(true, 1);
        expect(emitSpy).toHaveBeenCalledWith({ direction: true, questionIndex: 1 });
    });
    it('should be able to tell parent to update index', () => {
        const emitSpy = spyOn(component.deleteQuestionEvent, 'emit');
        component.deleteQuestion('1');
        expect(emitSpy).toHaveBeenCalledWith('1');
    });
    it('should be able to tell parent to update index', () => {
        const emitSpy = spyOn(component.deleteQuestionEvent, 'emit');
        component.deleteQuestion('1');
        expect(emitSpy).toHaveBeenCalledWith('1');
    });
});
