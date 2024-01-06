import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed, fakeAsync } from '@angular/core/testing';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Game } from '@app/interfaces/game.model';
import { CommunicationService } from '@app/services/communication.service';
import Ajv from 'ajv';
import { GameComponent } from './game.component';
import { QCM_TYPE, QRL_TYPE } from '@app/pages/page.constant';

describe('GameComponent', () => {
    let component: GameComponent;
    let fixture: ComponentFixture<GameComponent>;
    const SNACKBAR_DURATION = 3000;
    const mockGames: Game[] = [
        {
            id: '1hd8hk',
            title: 'Mock Game 1',
            description: 'Description of Game 1',
            isVisible: true,
            lastModification: new Date('2023-10-01T10:00:00'),
            duration: 10,
            questions: [
                {
                    id: '1',
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
            id: '274s6shd8',
            title: 'Mock Game 2',
            description: 'Description of Game 2',
            isVisible: false,
            lastModification: new Date(),
            duration: 15,
            questions: [
                {
                    id: '2',
                    type: QRL_TYPE,
                    text: 'Question 1',
                    points: 30,
                    choices: [],
                    textZone: '',
                    selections: [],
                },
            ],
        },
    ];

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [GameComponent],
            imports: [HttpClientModule, MatSnackBarModule],
            providers: [
                CommunicationService,
                MatSnackBar,
                {
                    provide: Ajv,
                    useValue: new Ajv(),
                },
            ],
        });
        fixture = TestBed.createComponent(GameComponent);
        component = fixture.componentInstance;
        component.game = mockGames[0];
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should toggle visibility of a game', () => {
        const visibleGame = mockGames[0];
        const unvisibleGame = mockGames[1];
        component.toggleVisibility(visibleGame);
        component.toggleVisibility(unvisibleGame);
        expect(visibleGame.isVisible).toBe(false);
        expect(unvisibleGame.isVisible).toBe(true);
    });

    it('should navigate to editgame with the correct game ID', () => {
        const gameId = mockGames[0].id;
        spyOn(component.router, 'navigate').and.stub();
        component.goToEditGamePage(gameId);
        expect(component.router.navigate).toHaveBeenCalledWith(['/editgame', gameId]);
    });

    it('should export a game with no visibility parameter', () => {
        const gameToExport = mockGames[0];
        const snackBarOpenSpy = spyOn(component.snackBar, 'open');
        const createObjectURLSpy = spyOn(window.URL, 'createObjectURL').and.returnValue('mockURL');
        const removeChildSpy = spyOn(document.body, 'removeChild');
        const clickSpy = spyOn(document.createElement('a'), 'click');
        const exportedGame = component.exportGame(gameToExport);

        expect(snackBarOpenSpy).toHaveBeenCalledWith('Game exported successfully', 'Close', {
            duration: SNACKBAR_DURATION,
        });

        expect(createObjectURLSpy).toHaveBeenCalled();
        expect(removeChildSpy).toHaveBeenCalled();
        expect(clickSpy).not.toHaveBeenCalled();

        expect(exportedGame.isVisible).toBeUndefined();
        expect(exportedGame.id).toBeDefined();
        expect(exportedGame.title).toBeDefined();
        expect(exportedGame.lastModification).toBeDefined();
        expect(exportedGame.duration).toBeDefined();
        expect(exportedGame.description).toBeDefined();
        expect(exportedGame.questions).toBeDefined();
    });

    it('should be able to tell parent to delete game', fakeAsync(() => {
        const emitSpy = spyOn(component.deleteGameEvent, 'emit');
        spyOn(window, 'confirm').and.returnValue(true);
        component.deleteGame(mockGames[0]);
        expect(emitSpy).toHaveBeenCalledWith(mockGames[0]);
    }));
});
