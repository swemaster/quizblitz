import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { Game, Question } from '@app/interfaces/game.model';
import { QuestionService } from '@app/services/question.service';
import { EditQuestionQCMComponent } from './edit-question-qcm.component';
import { QCM_TYPE } from '@app/pages/page.constant';
describe('EditQuestionQCMComponent', () => {
    let component: EditQuestionQCMComponent;
    let fixture: ComponentFixture<EditQuestionQCMComponent>;
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
            declarations: [EditQuestionQCMComponent],
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
        fixture = TestBed.createComponent(EditQuestionQCMComponent);
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

    it('should delete a choice', () => {
        const choiceId = 1;
        const questionId = '1';
        component.question.choices = [
            { text: 'Choix 1', isCorrect: false },
            { text: 'Choix 2', isCorrect: true },
            { text: 'Choix 3', isCorrect: true },
        ];
        const eventData = { questionId, choiceId };
        const lenChoices = component.question.choices.length;
        component.deleteChoice(eventData); // should go down to 2
        // update game model
        /// //
        const newChoices = component.question.choices;
        if (!newChoices || !lenChoices) {
            expect(true).toBe(false);
            return; // fail test
        }
        expect(newChoices.length).toBeLessThan(lenChoices);
        expect(newChoices.length).toBe(lenChoices - 1);
        for (const choice of newChoices) {
            expect(choice).toBeDefined();
        }
    });

    it('should not delete a choice when the minimum is reached (2)', () => {
        const choiceId = 1;
        const questionId = '1';
        const lenChoices = component.question.choices.length;
        component.deleteChoice({ questionId, choiceId });
        const newChoices = component.question.choices;
        if (!newChoices || !lenChoices) {
            expect(true).toBe(false);
            return; // fail test
        }
        expect(newChoices.length).toBe(lenChoices);
        for (const choice of newChoices) {
            expect(choice).toBeDefined();
        }
    });

    it('should be able to move a choice up or down', () => {
        const questionId = '1';
        let choiceIndex = 1;
        let direction = true;
        const choices = component.question.choices;
        // Choix 1
        // Choix 2
        component.updateChoiceIndex({ direction, questionId, choiceIndex }); // Move "Choix 2" up

        expect(choices[0].text).toBe('Choix 2'); // "Choix 2" should be in the first position
        expect(choices[1].text).toBe('Choix 1'); // "Choix 1" should be in the second position

        direction = false;
        choiceIndex = 0;
        component.updateChoiceIndex({ direction, questionId, choiceIndex }); // Move "Choix 2" down

        expect(choices[0].text).toBe('Choix 1'); // "Choix 1" should be in the first position
        expect(choices[1].text).toBe('Choix 2'); // "Choix 2" should be in the second position
    });

    it('should not be able to move a choice up or down at the edge', () => {
        const questionId = '1';
        let choiceIndex = 1;
        let direction = false;
        const choices = component.game.questions[0].choices;
        // Choix 1
        // Choix 2
        component.updateChoiceIndex({ direction, questionId, choiceIndex }); // Move "Choix 2" down
        expect(choices[0].text).toBe('Choix 1'); // "Choix 1" should be in the first position
        expect(choices[1].text).toBe('Choix 2'); // "Choix 2" should be in the second position

        choiceIndex = 0;
        direction = true;
        component.updateChoiceIndex({ direction, questionId, choiceIndex }); // Move "Choix 1" up

        expect(choices[0].text).toBe('Choix 1'); // "Choix 1" should be in the first position
        expect(choices[1].text).toBe('Choix 2'); // "Choix 2" should be in the second position
    });
    it('should not cause errors  or attempt to move if question doesnt exist', () => {
        const questionId = '3';
        let choiceIndex = 1;
        let direction = false;
        const choices = component.question.choices;
        expect(choices[0].text).toBe('Choix 1'); // "Choix 1" should be in the first position
        expect(choices[1].text).toBe('Choix 2'); // "Choix 2" should be in the second position
        component.updateChoiceIndex({ direction, questionId, choiceIndex });
        expect(choices[0].text).toBe('Choix 1'); // "Choix 1" should be in the first position
        expect(choices[1].text).toBe('Choix 2'); // "Choix 2" should be in the second position
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
    it('should create a choice', () => {
        const questionId = '1';
        const lenChoices = component.game.questions[0].choices.length;
        component.createNewChoice(questionId);
        const newChoices = component.game.questions[0].choices;
        if (!newChoices || !lenChoices) {
            expect(true).toBe(false);
            return; // fail test
        }
        expect(newChoices.length).toBeGreaterThan(lenChoices);
        expect(newChoices.length).toBe(lenChoices + 1);
        for (const choice of newChoices) {
            expect(choice).toBeDefined();
        }
    });

    it('should not create a choice when list is at maximum (4)', () => {
        const questionId = '1';
        component.createNewChoice(questionId); // length now 3
        component.createNewChoice(questionId); // length now 4
        const lenChoices = component.question.choices.length;
        component.createNewChoice(questionId); // should stay at 4
        const newChoices = component.question.choices;
        if (!newChoices || !lenChoices) {
            expect(true).toBe(false);
            return; // fail test
        }
        expect(newChoices.length).toBe(lenChoices);
        for (const choice of newChoices) {
            expect(choice).toBeDefined();
        }
    });
});
