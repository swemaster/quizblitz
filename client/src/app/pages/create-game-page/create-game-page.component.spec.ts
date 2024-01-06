import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { CreateGamePageComponent } from './create-game-page.component';
import { of } from 'rxjs';
import { GameService } from '@app/services/game.service';
import { CommunicationService } from '@app/services/communication.service';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { BASE_GAME, QCM_TYPE } from '../page.constant';
import { TestPageComponent } from '../test-page/test-page.component';
import { WaitingForGameStartComponent } from '../waiting-for-game-start/waiting-for-game-start.component';
import { WaitingViewService } from '@app/services/waiting-view.service';

describe('CreateGamePageComponent', () => {
  let component: CreateGamePageComponent;
  let fixture: ComponentFixture<CreateGamePageComponent>;
  let router: Router;
  const gameServiceStub = {setCurrentPlayGame: jasmine.createSpy('setCurrentPlayGame')};
  const waitingServiceStub = {generateAccessCode: jasmine.createSpy('generateAccessCode')};
  const communicationServiceStub = {
    getGames: () => {
      return of([
        {
            id: '1',
            title: 'Game 1',
            description: 'Description of Game 1',
            isVisible: true,
            lastModification: new Date(),
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
                        // Add more choices as needed
                    ],
                },
                // Add more questions as needed
            ],
        },
        {
            id: '2',
            title: 'Game 2',
            description: 'Description of Game 2',
            isVisible: true,
            lastModification: new Date(),
            duration: 15,
            questions: [
                {
                    id: '1',
                    type: QCM_TYPE,
                    text: 'Question 1',
                    points: 30,
                    choices: [
                        { text: 'Choix 1: Faux', isCorrect: false },
                        { text: 'Choix 2: Vrai', isCorrect: true },
                        // Add more choices as needed
                    ],
                },
                {
                    id: '2',
                    type: QCM_TYPE,
                    text: 'Question 2',
                    points: 30,
                    choices: [
                        { text: 'Choix 1: Faux', isCorrect: false },
                        { text: 'Choix 2: Vrai', isCorrect: true },
                        { text: 'Choix 3: Faux', isCorrect: false },
                        { text: 'Choix 4: Vrai', isCorrect: true },
                        // Add more choices as needed
                    ],
                },
                {
                    id: '3',
                    type: QCM_TYPE,
                    text: 'Question 3',
                    points: 30,
                    choices: [
                        { text: 'Choix 1: Faux', isCorrect: false },
                        { text: 'Choix 2: Vrai', isCorrect: true },
                        { text: 'Choix 3: Vrai', isCorrect: true },
                        // Add more choices as needed
                    ],
                },
                // Add more questions as needed
            ] },]);
    }, matchPost: () => {return of({ status: 200, statusText: 'OK' })}, getMatchByAccessCode : jasmine.createSpy('getMatchByAccessCode')
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CreateGamePageComponent],
      providers: [
        { provide: GameService, useValue: gameServiceStub },
        { provide: CommunicationService, useValue: communicationServiceStub },
        { provide: WaitingViewService, useValue:  waitingServiceStub},
      ],
      imports: [RouterTestingModule.withRoutes([{ path: 'waitingplayers/:1', component: WaitingForGameStartComponent }, { path: 'test', component: TestPageComponent }])],
    }).compileComponents();
    fixture = TestBed.createComponent(CreateGamePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    router = TestBed.inject(Router);
    router.initialNavigation();
  });

 
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize gameList', fakeAsync(() => {
    tick();
    expect(component.gameList).toBeTruthy();
  }));

  it('Should select the good game', ()=>{
      let game = BASE_GAME;
      communicationServiceStub.getGames().subscribe((games: any[]) => {
        game = games[0]; // Assuming I want the first game for test purposes
      });
      component.gameSelection('1');
      expect(component.selectedGame.id).toEqual(game.id);
      expect(component.selectedGame.title).toEqual(game.title);
      expect(component.selectedGame.description).toEqual(game.description);
  });

  it('should set the value of the id selected to true and others to false in gameIsSelected map', ()=>{
    component.gameSelection('2');
    expect(component.gameIsSelected.get('2')).toBeTruthy();
    expect(component.gameIsSelected.get('1')).toBeFalsy();
  });


  it('should send current game and navigate to the specified path',  fakeAsync(() => {
    let game = BASE_GAME;
    communicationServiceStub.getGames().subscribe((games: any[]) => {
      game = games[0]; // Assuming I want the first game for test purposes
    });
    tick();
    const path = '/test';
    const routerNavigateSpy = spyOn(router, 'navigateByUrl');
    component.sendCurrentGame(game);
    expect(gameServiceStub.setCurrentPlayGame).toHaveBeenCalledWith(game);
    expect(routerNavigateSpy).toHaveBeenCalledWith(path);
  }));
  
});

