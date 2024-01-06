/* eslint-disable @typescript-eslint/no-magic-numbers */
import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { QuestionInGameComponent } from '@app/components/question-in-game/question-in-game.component';
import { Choice, Question } from '@app/interfaces/game.model';
import { QCM_TYPE } from '@app/pages/page.constant';
import { GameSocketService } from '@app/services/game-socket.service';
import { GameService } from '@app/services/game.service';
import { InGameService } from '@app/services/in-game.service';
import { of } from 'rxjs';
import SpyObj = jasmine.SpyObj;

describe('QuestionInGameComponent', () => {
    let component: QuestionInGameComponent;
    let fixture: ComponentFixture<QuestionInGameComponent>;
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

        TestBed.configureTestingModule({
            declarations: [QuestionInGameComponent],
            providers: [MatSnackBar, GameService, InGameService, { provide: GameSocketService, useValue: socketServiceSpy }],
            imports: [HttpClientModule],
        });
        fixture = TestBed.createComponent(QuestionInGameComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should add choice to selectedAnswers at the end if not already in it', () => {
        component.selectedAnswers = ['choice 1', 'choice 2'];
        component.selectAnswerFromButtons('choice 3');
        expect(component.selectedAnswers).toEqual(['choice 1', 'choice 2', 'choice 3']);
    });

    it('should remove choice from selectedAnswers if already in it', () => {
        component.selectedAnswers = ['choice 1', 'choice 2', 'choice 3'];
        component.selectAnswerFromButtons('choice 2');
        expect(component.selectedAnswers).toEqual(['choice 1', 'choice 3']);
    });

    it('should correctly retrieve data from the game service', () => {
        const mockChoice1: Choice = { text: 'Burger', isCorrect: true };
        const mockChoice2: Choice = { text: 'Pizza', isCorrect: true };
        const mockChoice3: Choice = { text: 'Hot-Dog', isCorrect: false };
        const mockQuestion: Question = {
            id: '13243',
            type: QCM_TYPE,
            text: 'Best food',
            points: 50,
            choices: [mockChoice1, mockChoice2, mockChoice3],
            textZone: '',
            selections: [],
        };
        spyOn(component.getGameService(), 'getCurrentQuestionByIndex').and.returnValue(mockQuestion);
        component.loadQuestion();
        expect(component.title).toEqual('Best food');
        expect(component.points).toEqual(50);
        expect(component.choices).toEqual(['Burger', 'Pizza', 'Hot-Dog']);
        expect(component.selectedAnswers).toEqual([]);
        expect(component.answers).toEqual(['Burger', 'Pizza']);
    });

    it('should add points if the correct answers are selected', () => {
        component.questionType = QCM_TYPE;
        const spy1 = spyOn(component, 'updateScore');
        component.score = 40;
        component.points = 30;
        component.selectedAnswers = ['Choice 1', 'Choice 3'];
        component.answers = ['Choice 1', 'Choice 3'];
        component.validateAnswers();
        expect(component.score).toEqual(70);
        expect(spy1).toHaveBeenCalled();
    });

    it('should not add points if one or more incorrect answer is selected', () => {
        component.questionType = QCM_TYPE;
        const spy1 = spyOn(component, 'updateScore');
        component.score = 40;
        component.points = 30;
        component.selectedAnswers = ['Choice 1', 'Choice 3'];
        component.answers = ['Choice 1'];
        component.validateAnswers();
        expect(component.score).toEqual(40);
        expect(spy1).toHaveBeenCalled();
    });

    it('should call selectAnswerFromButtons with appropriate parameter', () => {
        const spy1 = spyOn(component, 'selectAnswerFromButtons');
        const mockEvent: MouseEvent = {
            target: {
                id: 'Choice 1',
            },
        } as unknown as MouseEvent;
        component.onClick(mockEvent);
        expect(spy1).toHaveBeenCalledOnceWith('Choice 1');
    });
});
