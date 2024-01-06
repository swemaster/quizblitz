import { ComponentFixture, TestBed, fakeAsync } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { Choice, Game, Question } from '@app/interfaces/game.model';
import { ChoiceComponent } from './choice.component';
import { QCM_TYPE } from '@app/pages/page.constant';
describe('ChoiceComponent', () => {
    let component: ChoiceComponent;
    let fixture: ComponentFixture<ChoiceComponent>;
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
    const mockChoice: Choice = {
        text: 'Mock Choice',
        isCorrect: true,
    };

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ChoiceComponent],
            providers: [
                {
                    provide: ActivatedRoute,
                    useValue: { snapshot: { paramMap: convertToParamMap({ id: '123' }) } },
                },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ChoiceComponent);
        component = fixture.componentInstance;
        component.game = mockGame;
        component.question = mockQuestion;
        component.choice = mockChoice;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should be able to change the value of a choice', fakeAsync(() => {
        let value = component.choice.isCorrect;
        component.updateValue();
        expect(component.choice.isCorrect).toBe(!value);
        value = component.choice.isCorrect; // the one left
        component.updateValue();
        expect(component.choice.isCorrect).toBe(!value);
    }));
    it('should be able to tell parent to update index', fakeAsync(() => {
        const emitSpy = spyOn(component.updateChoiceIndexEvent, 'emit');
        component.updateChoiceIndex(true, 1);
        expect(emitSpy).toHaveBeenCalledWith({ direction: true, questionId: component.question.id, choiceIndex: 1 });
    }));
    it('should be able to tell parent to delete choice', fakeAsync(() => {
        const emitSpy = spyOn(component.deleteChoiceEvent, 'emit');
        component.deleteChoice(1);
        expect(emitSpy).toHaveBeenCalledWith({ questionId: component.question.id, choiceId: 1 });
    }));
});
