import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
// import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { Choice, Game, Question } from '@app/interfaces/game.model';
import { AdminEditgamePageComponent } from '@app/pages/admin-editgame-page/admin-editgame-page.component';
import { QCM_TYPE, QRL_TYPE } from '@app/pages/page.constant';
import { CommunicationService } from '@app/services/communication.service';
import { of } from 'rxjs';
/* eslint-disable */
describe('AdminEditgamePageComponent', () => {
    let component: AdminEditgamePageComponent;
    // let questionService: QuestionService;
    let fixture: ComponentFixture<AdminEditgamePageComponent>;
    const mockGames: Game[] = [
        {
            id: '1',
            title: 'Mock Game 1',
            description: 'Description of Game 1',
            isVisible: true,
            lastModification: new Date(),
            duration: 10,
            questions: [
                {
                    id: 'q7',
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
        },
        {
            id: '2',
            title: 'Mock Game 2',
            description: 'Description of Game 2',
            isVisible: false,
            lastModification: new Date(),
            duration: 15,
            questions: [
                {
                    id: 'q8',
                    type: QCM_TYPE,
                    text: 'Question 1',
                    points: 30,
                    choices: [
                        { text: 'Choix 1', isCorrect: false },
                        { text: 'Choix 2', isCorrect: true },
                    ],
                    textZone: '',
                    selections: [],
                },
            ],
        },
    ];

    let mockQuestion: Question = {
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
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [AdminEditgamePageComponent],
            providers: [MatSnackBar],
            imports: [HttpClientModule],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(AdminEditgamePageComponent);
        component = fixture.componentInstance;
        component.game = mockGame;
        mockQuestion = {
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
        component.gameId = '1';
        component.game.questions[0] = mockQuestion;

        fixture.detectChanges();
    });

    function newMockEvent(val: string): Event {
        const mockEvent = new Event('input');
        const mockTarget = {
            value: val,
        };
        Object.defineProperty(mockEvent, 'target', { value: mockTarget });
        return mockEvent;
    }

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should allow editing the game description', () => {
        const newDescription = 'New game description';
        component.editGameDescription();
        component.newText = newDescription;
        component.saveGameDescription();

        expect(component.game.description).toBe(newDescription);
    });

    it('should not allow editing the game title when taken', fakeAsync(() => {
        spyOn(TestBed.inject(MatSnackBar), 'open');
        const newTitle = 'Mock Game 1';

        const communicationService = TestBed.inject(CommunicationService);
        spyOn(communicationService, 'getGames').and.returnValue(of(mockGames));

        component.editGameTitle();
        component.newText = newTitle;
        component.saveGameTitle();

        tick();
        expect(component.game.title).not.toBe(newTitle);
        expect(TestBed.inject(MatSnackBar).open).toHaveBeenCalled();
        expect(component.showTextBubble.game).toBeTruthy();
    }));

    it('should allow editing the game title when unique', fakeAsync(() => {
        const newTitle = 'New game title';
        const communicationService = TestBed.inject(CommunicationService);
        spyOn(communicationService, 'getGames').and.returnValue(of(mockGames));
        component.editGameTitle();
        component.newText = newTitle;
        component.saveGameTitle();
        tick();
        expect(component.game.title).toBe(newTitle);
        expect(component.showTextBubble.game).toBeFalsy();
    }));

    it('should update game duration', () => {
        const mockEvent = newMockEvent('20');
        component.game.duration = 10;
        const newDuration = 20;
        component.onDurationChanged(mockEvent);
        expect(component.game.duration).toBe(newDuration);
    });

    it('should create a new qcm question', () => {
        const lenQuestions = component.game.questions.length;
        component.createNewQCMQuestion();
        expect(component.game.questions.length).toBeGreaterThan(lenQuestions);
        expect(component.game.questions.length).toBe(lenQuestions + 1);
        for (const question of component.game.questions) {
            expect(question).toBeDefined();
        }
    });

    it('should create a new qrl question', () => {
        const lenQuestions = component.game.questions.length;
        component.createNewQRLQuestion();
        expect(component.game.questions.length).toBeGreaterThan(lenQuestions);
        expect(component.game.questions.length).toBe(lenQuestions + 1);
        for (const question of component.game.questions) {
            expect(question).toBeDefined();
        }
    });

    it('should delete a question', () => {
        const lenQuestions = component.game.questions.length;
        component.deleteQuestion('1');
        expect(component.game.questions.length).toBeLessThan(lenQuestions);
        expect(component.game.questions.length).toBe(lenQuestions - 1);
        for (const question of component.game.questions) {
            expect(question).toBeDefined();
        }
    });

    it('should be able to move a question up or down', () => {
        let direction = true;
        let questionIndex = 1;
        const questions = [
            { id: '1', type: QCM_TYPE, text: 'Question 1', choices: [] as Choice[], points: 10, textZone: '', selections: [] as number[] },
            { id: '2', type: QRL_TYPE, text: 'Question 2', choices: [] as Choice[], points: 10, textZone: '', selections: [] as number[] },
        ];
        component.game.questions = questions;
        component.updateQuestionPosition({ direction, questionIndex }); // Move "Question 2" up

        const updatedQuestions = component.game.questions;

        expect(updatedQuestions[0].id).toBe('2'); // "Question 2" should be in the first position
        expect(updatedQuestions[1].id).toBe('1'); // "Question 1" should be in the second position
        direction = true;
        questionIndex = 1;
        component.updateQuestionPosition({ direction, questionIndex }); // Move "Question 2" down

        expect(updatedQuestions[0].id).toBe('1'); // "Question 1" should be in the first position
        expect(updatedQuestions[1].id).toBe('2'); // "Question 2" should be in the second position
    });

    it('should not be able to move a question up or down if at the end of list', () => {
        let direction = false;
        let questionIndex = 1;
        const questions = [
            { id: '1', text: 'Question 1', choices: [] as Choice[], points: 10, type: QCM_TYPE, textZone: '', selections: [] as number[] },
            { id: '2', text: 'Question 2', choices: [] as Choice[], points: 10, type: QRL_TYPE, textZone: '', selections: [] as number[] },
        ];
        component.game.questions = questions;
        component.updateQuestionPosition({ direction, questionIndex }); // Move "Question 2" down (fail)

        const updatedQuestions = component.game.questions;

        expect(updatedQuestions[0].id).toBe('1'); // "Question 2" should be in the first position
        expect(updatedQuestions[1].id).toBe('2'); // "Question 1" should be in the second position
        direction = true;
        questionIndex = 0;
        component.updateQuestionPosition({ direction, questionIndex }); // Move "Question 1" up (fail)

        expect(updatedQuestions[0].id).toBe('1'); // "Question 1" should be in the first position
        expect(updatedQuestions[1].id).toBe('2'); // "Question 2" should be in the second position
    });
    it('should return true when questions have both correct and incorrect choices', () => {
        const choices = [
            { text: 'Iuas 1', isCorrect: true },
            { text: 'Vlaui 2', isCorrect: false },
        ];
        for (const question of component.game.questions) {
            question.choices = choices;
        }
        const result = component.validateQCMQuestions();
        expect(result).toBe(true);
    });

    it('should return false when questions have only correct choices', () => {
        const choices = [
            { text: 'Choix 1', isCorrect: true },
            { text: 'Choix 2', isCorrect: true },
        ];
        component.game.questions[0].choices = choices;
        const result = component.validateQCMQuestions();
        expect(result).toBe(false);
    });

    it('should return true when all questions have titles', () => {
        const result = component.validateTitles();
        expect(result).toBe(true);
    });

    it('should return false when a question has no title', () => {
        component.game.questions[0].text = '';
        const result = component.validateTitles();
        expect(result).toBe(false);
    });

    it('should return false when questions have only false choices', () => {
        const choices = [
            { text: 'Choix 1', isCorrect: false },
            { text: 'Choix 2', isCorrect: false },
        ];
        component.game.questions[0].choices = choices;
        const result = component.validateQCMQuestions();
        expect(result).toBe(false);
    });

    it('should alert when validateQuestions is false and doesnt return', () => {
        spyOn(TestBed.inject(MatSnackBar), 'open');
        component.game.questions[0].choices[1].isCorrect = false;
        component.onSaveAndReturn();
        expect(TestBed.inject(MatSnackBar).open).toHaveBeenCalled();
    });

    it('should alert when validateTitles is false and doesnt return', () => {
        spyOn(TestBed.inject(MatSnackBar), 'open');
        component.game.questions[0].text = '';
        component.onSaveAndReturn();
        expect(TestBed.inject(MatSnackBar).open).toHaveBeenCalled();
    });
});
