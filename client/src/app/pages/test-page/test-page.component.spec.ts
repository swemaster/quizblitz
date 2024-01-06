/* eslint-disable no-restricted-imports */
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HttpClientModule } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { QuestionInGameComponent } from '@app/components/question-in-game/question-in-game.component';
import { GameSocketService } from '@app/services/game-socket.service';
import { GameService } from '@app/services/game.service';
import { InGameService } from '@app/services/in-game.service';
import { CreateGamePageComponent } from '../create-game-page/create-game-page.component';
import { CREATE_GAME_PAGE_PATH, PERCENT_SCORE, SNACKBAR_DURATION_BONUS, SNACKBAR_DURATION_EXIT } from '../page.constant';
import { TestPageComponent } from './test-page.component';
import SpyObj = jasmine.SpyObj;

describe('TestPageComponent', () => {
    let component: TestPageComponent;
    let fixture: ComponentFixture<TestPageComponent>;
    let router: Router;
    let gameService: GameService;
    let inGameService: InGameService;
    let socketServiceSpy: SpyObj<GameSocketService>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [TestPageComponent, QuestionInGameComponent, CreateGamePageComponent],
            imports: [
                RouterTestingModule.withRoutes([{ path: 'creategame', component: CreateGamePageComponent }]),
                BrowserAnimationsModule,
                HttpClientModule,
            ],
            providers: [MatSnackBar, GameService, InGameService, { provide: GameSocketService, useValue: socketServiceSpy }],
        });
        fixture = TestBed.createComponent(TestPageComponent);
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

    describe('runTimer', () => {
        it('should decrement time correctly', () => {
            component.time = 3;
            component.runTimer();
            expect(component.time).toEqual(2);
        });
        it('should call validateAnswers if timer reaches 0 and isShowingAnswers is true and reset time', () => {
            const gameDuration = component.gameService.getCurrentGame().duration;
            const spy1 = spyOn(component, 'validateAnswers');
            component.isShowingAnswers = true;
            component.time = 1;
            component.runTimer();
            expect(spy1).toHaveBeenCalled();
            expect(component.time).toEqual(gameDuration);
            expect(component.isShowingAnswers).toBeFalse();
            expect(component.isAllowedToChange).toBeTrue();
        });
        it('should call checkSelectedAnswers if timer reaches 0', () => {
            const spy1 = spyOn(component, 'checkSelectedAnswers');
            component.isShowingAnswers = true;
            component.time = 1;
            component.runTimer();
            expect(spy1).toHaveBeenCalled();
        });

        it('runTimer should toggle and retoggle isShowingAnswers', () => {
            component.isShowingAnswers = false;
            component.runTimer();
            expect(component.isShowingAnswers).toBeFalse();
        });
    });

    describe('KeyPressing', () => {
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
            const spy1 = spyOn(component, 'validateAnswers');
            component.questionComponent.selectedAnswers = ['choice 1', 'choice 2', 'choice 3'];
            component.clickEnterButton();
            component.questionComponent.selectedAnswers = [];
            component.clickEnterButton();
            expect(spy1).toHaveBeenCalledTimes(1);
        });
    });

    describe('setScore', () => {
        it('setScore should correctly update score', () => {
            const newScore = 50;
            component.setScore(`${newScore}`);
            expect(component.score).toEqual(newScore);
        });
    });

    describe('validateAnswers', () => {
        it('should toggle isShowingAnswers to true and isAllowedToChange to false when validateAnswers is called', () => {
            component.isShowingAnswers = false;
            component.validateAnswers();
            expect(component.isShowingAnswers).toBeTrue();
            expect(component.isAllowedToChange).toBeFalse();
        });

        it('should load next question if there are more questions', () => {
            component.isShowingAnswers = true;
            const currentQuestionIndex = 1;
            const gameLength = 2;
            const spy1 = spyOn(component.questionComponent, 'loadQuestion');
            spyOn(inGameService, 'increaseCurrentQuestionIndex').and.callThrough();
            spyOn(inGameService, 'getCurrentQuestionIndex').and.returnValue(currentQuestionIndex);
            spyOn(gameService, 'getCurrentGameLength').and.returnValue(gameLength);
            component.validateAnswers();
            expect(spy1).toHaveBeenCalledTimes(1);
        });

        it('should add choice to selectedAnswers at the end if not already in it', () => {
            component.questionComponent.selectedAnswers = ['choice 1', 'choice 2'];
            component.questionComponent.selectAnswerFromButtons('choice 3');
            expect(component.questionComponent.selectedAnswers).toEqual(['choice 1', 'choice 2', 'choice 3']);
        });

        it('should not load next question if there is no more questions navigate to creategame page and show a snackbar with score', () => {
            component.isShowingAnswers = true;
            const spy1 = spyOn(component.questionComponent, 'loadQuestion');
            const spy2 = spyOn(router, 'navigateByUrl');
            spyOn(inGameService, 'getCurrentQuestionIndex').and.returnValue(3);
            spyOn(gameService, 'getCurrentGameLength').and.returnValue(2);
            spyOn(TestBed.inject(MatSnackBar), 'open');
            component.validateAnswers();
            expect(TestBed.inject(MatSnackBar).open).toHaveBeenCalledWith('The game has ended. Your final score is : ' + component.score, 'Dismiss', {
                duration: SNACKBAR_DURATION_BONUS,
                verticalPosition: 'top',
            });
            expect(spy1).toHaveBeenCalledTimes(0);
            expect(spy2).toHaveBeenCalledOnceWith(CREATE_GAME_PAGE_PATH);
        });
    });

    describe('checkSelectedAnswers', () => {
        it('should increase the score and open a snackbar for correct answers', () => {
            component.score = 0;
            const expectedScore = 10;
            component.questionComponent.selectedAnswers = ['choice 1', 'choice 2', 'choice 3'];
            component.questionComponent.answers = ['choice 1', 'choice 2', 'choice 3'];
            component.questionComponent.points = 10;
            spyOn(TestBed.inject(MatSnackBar), 'open');
            component.checkSelectedAnswers();
            expect(component.score).toBe(expectedScore * PERCENT_SCORE);
            expect(TestBed.inject(MatSnackBar).open).toHaveBeenCalledWith('You have a 20% bonus !', '', {
                duration: SNACKBAR_DURATION_BONUS,
                verticalPosition: 'top',
            });
        });

        it('should not increase the score for one or more wrong answers', () => {
            component.questionComponent.answers = ['Choice 1', 'Choice 2'];
            component.questionComponent.selectedAnswers = ['Choice 1', 'Choice 2', 'Choice 3'];
            component.checkSelectedAnswers();
            expect(component.score).toBe(component.score);
        });
    });

    describe('quitGame', () => {
        it('quitting should redirect to creategame page and show a snackbar while exiting', () => {
            const spy1 = spyOn(router, 'navigateByUrl');
            spyOn(TestBed.inject(MatSnackBar), 'open');
            component.quitGame();
            expect(TestBed.inject(MatSnackBar).open).toHaveBeenCalledWith('Exited the game', '', {
                duration: SNACKBAR_DURATION_EXIT,
                verticalPosition: 'top',
            });
            expect(spy1).toHaveBeenCalledWith(CREATE_GAME_PAGE_PATH);
        });
    });
});
