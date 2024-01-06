import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { Match } from '@app/interfaces/match.model';
import { Player } from '@app/interfaces/player.model';
import { CommunicationService } from '@app/services/communication.service';
import { GameSocketService } from '@app/services/game-socket.service';
import { PlayerService } from '@app/services/player.service';
import { of, throwError } from 'rxjs';
import { BASE_GAME, SNACKBAR_DURATION_LOCK } from '../page.constant';
import { WaitingForPlayersPageComponent } from './waiting-for-players-page.component';
import SpyObj = jasmine.SpyObj;

describe('WaitingForPlayersPageComponent', () => {
    let component: WaitingForPlayersPageComponent;
    let fixture: ComponentFixture<WaitingForPlayersPageComponent>;
    let playerServiceSpy: SpyObj<PlayerService>;
    let communicationServiceSpy: any;
    let gameSocketServiceSpy: SpyObj<GameSocketService>;
    let routerSpy: SpyObj<Router>;
    let mockActivatedRoute = {
        params: of({ accessCode: '1234' }),
    };
    let snackBarSpy: SpyObj<MatSnackBar>;
    const mockPlayer: Player[] = [
        {
            name: 'Manel',
            points: 0,
            status: 'active',
            selection: [],
            bonuses: 0,
        },
        {
            name: 'player1',
            points: 0,
            status: 'active',
            selection: [],
            bonuses: 0,
        },
    ];

    const mockMatch: Match = {
        game: BASE_GAME,
        canBeAccessed: true,
        startDate: new Date(),
        questionId: '',
        players: mockPlayer,
        time: 0,
        messages: [],
        accessCode: '1234',
        creator: 'Organisateur',
        nomsBannis: [],
    };
    const mockMatchLocked: Match = {
        game: BASE_GAME,
        canBeAccessed: false,
        startDate: new Date(),
        questionId: '',
        players: mockPlayer,
        time: 0,
        messages: [],
        accessCode: '1234',
        creator: 'Organisateur',
        nomsBannis: [],
    };
    playerServiceSpy = jasmine.createSpyObj('PlayerService', ['getName']);
    communicationServiceSpy = jasmine.createSpyObj('CommunicationService', ['getMatchByAccessCode', 'matchPatch', 'matchDelete']);
    gameSocketServiceSpy = jasmine.createSpyObj('GameSocketService', [
        'quitPlayer',
        'onNewPlayer',
        'enterInGame',
        'onPlayerBanned',
        'onPlayerQuit',
        'onOrganisatorQuit',
        'orgQuitGame',
        'banPlayer',
        'startGame',
        'joinGameRoom',
        'quitOrganisator',
    ]);
    routerSpy = jasmine.createSpyObj('router', ['navigate', 'navigateByUrl']);
    snackBarSpy = jasmine.createSpyObj('snackbar', ['open']);
    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [WaitingForPlayersPageComponent],
            providers: [
                { provide: MatSnackBar, useValue: snackBarSpy },
                { provide: ActivatedRoute, useValue: mockActivatedRoute },
                { provide: Router, useValue: routerSpy },
                { provide: CommunicationService, useValue: communicationServiceSpy },
                { provide: GameSocketService, useValue: gameSocketServiceSpy },
                { provide: PlayerService, useValue: playerServiceSpy },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(WaitingForPlayersPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });
    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call showConfirmationAlert when popstate event occurs', () => {
        const accessCode = '1234';
        spyOn(component, 'showConfirmationAlert');
        spyOn(component, 'setupUnloadHandler');
        const popStateEvent = new PopStateEvent('popstate', { state: { accessCode } });
        window.dispatchEvent(popStateEvent);
        expect(component.showConfirmationAlert).toHaveBeenCalledWith(accessCode);
        expect(component.setupUnloadHandler).toHaveBeenCalledWith(accessCode);
    });

    it('should not call showConfirmationAlert for other events', () => {
        spyOn(component, 'showConfirmationAlert');
        const customEvent = new Event('custom-event');
        window.dispatchEvent(customEvent);
        expect(component.showConfirmationAlert).not.toHaveBeenCalled();
    });

    it('should toggle the view lock and send a patch request', fakeAsync(async () => {
        const httpResponse = new HttpResponse<string>({
            status: 200,
            statusText: 'OK',
            body: '',
        });
        communicationServiceSpy.matchPatch.and.returnValue(of(httpResponse));
        component.match = mockMatchLocked;
        communicationServiceSpy.getMatchByAccessCode.and.returnValue(of(mockMatchLocked));
        await component.toggleViewLock();

        expect(component.match.canBeAccessed).toBe(true);

        const responseString = `Le serveur a reçu la requête a retourné un code 200 : OK`;
        expect(component.message.getValue()).toBe(responseString)
    }));

    it('should confirm and navigate to creategame', () => {
        const match = mockMatch;
        spyOn(window, 'confirm').and.returnValue(true);
        spyOn(component, 'deleteMatch');

        component.showConfirmationAlert(match.accessCode);

        expect(window.confirm).toHaveBeenCalledWith(
            'Êtes-vous sûr de vouloir revenir à la page de création de jeu ? Cela supprimera la partie en cours.',
        );
        expect(gameSocketServiceSpy.orgQuitGame).toHaveBeenCalled();
        expect(component.deleteMatch).toHaveBeenCalledWith(match.accessCode);
        expect(routerSpy.navigateByUrl).toHaveBeenCalled();
    });

    it('should confirm and ban the player', () => {
        playerServiceSpy.getName.and.returnValue('Manel');
        spyOn(window, 'confirm').and.returnValue(true);
        spyOn(component, 'banPlayer');

        component.showBanConfirmationAlert('Manel');

        expect(window.confirm).toHaveBeenCalledWith('Êtes-vous sûr de vouloir bannir le joueur Manel ?');
        expect(component.banPlayer).toHaveBeenCalledWith('Manel');
    });

    it('should not ban the player when confirmation is canceled', () => {
        playerServiceSpy.getName.and.returnValue('Manel');
        spyOn(window, 'confirm').and.returnValue(false);
        spyOn(component, 'banPlayer');

        component.showBanConfirmationAlert('Manel');

        expect(window.confirm).toHaveBeenCalledWith('Êtes-vous sûr de vouloir bannir le joueur Manel ?');
        expect(component.banPlayer).not.toHaveBeenCalled();
    });

    it('should start the game when canBeAccessed is false', () => {
        component.match.canBeAccessed = false;
        component.match.players.length = 3;
        component.accessCode = mockMatch.accessCode;

        component.startGame();

        expect(gameSocketServiceSpy.startGame).toHaveBeenCalled();
        expect(routerSpy.navigateByUrl).toHaveBeenCalledWith(`fromwaitingtoorg/${mockMatch.accessCode}`);
    });

    it('should show snackbar when org tries to start game and there is 0 players', () => {
        component.match.players.length = 0;
        component.match.accessCode = mockMatch.accessCode;
        component.startGame();

        expect(snackBarSpy.open).toHaveBeenCalledWith("Il faut qu'il y ai au moins un joueur avant de commencer la partie", 'Dismiss', {
            duration: SNACKBAR_DURATION_LOCK,
            verticalPosition: 'top',
        });
    });

    it('should show snackbar when org tries to start game and canBeAccessed is true', () => {
        component.match.canBeAccessed = true;
        component.startGame();

        expect(snackBarSpy.open).toHaveBeenCalledWith('Il faut verrouiller la partie avant de la commencer', 'Dismiss', {
            duration: SNACKBAR_DURATION_LOCK,
            verticalPosition: 'top',
        });
    });

    it('should set accessCode and initialize players', fakeAsync(() => {
        communicationServiceSpy.getMatchByAccessCode.and.returnValue(
            of({
                accessCode: '1234',
                players: [],
            }),
        );

        gameSocketServiceSpy.joinGameRoom;
        gameSocketServiceSpy.onNewPlayer.and.returnValue(of('player1'));
        gameSocketServiceSpy.enterInGame.and.returnValue(of(null));
        gameSocketServiceSpy.onPlayerBanned.and.returnValue(of('banned-player'));
        gameSocketServiceSpy.onPlayerQuit.and.returnValue(of('gone-player'));
        component.ngOnInit();

        tick();

        expect(component.accessCode).toBe('1234');
        expect(component.players).toEqual(['player1']);
        expect(communicationServiceSpy.getMatchByAccessCode).toHaveBeenCalledWith('1234');
        expect(gameSocketServiceSpy.joinGameRoom).toHaveBeenCalledWith('1234', 'Organisateur');
        expect(gameSocketServiceSpy.onNewPlayer).toHaveBeenCalled();
        expect(gameSocketServiceSpy.enterInGame).toHaveBeenCalled();
        expect(gameSocketServiceSpy.onPlayerBanned).toHaveBeenCalled();
        expect(gameSocketServiceSpy.onPlayerQuit).toHaveBeenCalled();
    }));

    it('should handle error response in toggle view lock', fakeAsync(() => {
        const errorResponseMock = new HttpErrorResponse({ status: 500, statusText: 'Internal Server Error', error: 'Server error' });

        communicationServiceSpy.getMatchByAccessCode.and.returnValue(of(component.match));
        communicationServiceSpy.matchPatch.and.returnValue(throwError(errorResponseMock));
        spyOn(component.message, 'next');

        component.toggleViewLock();
        tick();

        expect(communicationServiceSpy.matchPatch).toHaveBeenCalledWith(component.match);
        expect(component.message.next).toHaveBeenCalledWith(`Le serveur ne répond pas et a retourné : ${errorResponseMock.message}`);
    }));

    it('should handle error during match deletion', fakeAsync(() => {
        const errorResponseMock = new HttpErrorResponse({ status: 500, statusText: 'Internal Server Error', error: 'Server error' });
        communicationServiceSpy.matchDelete.and.returnValue(throwError(errorResponseMock));
        spyOn(component.message, 'next');

        component.deleteMatch(mockMatch.accessCode);
        tick();

        expect(communicationServiceSpy.matchDelete).toHaveBeenCalledWith(mockMatch.accessCode);
        expect(component.message.next).toHaveBeenCalledWith(`Le serveur ne répond pas et a retourné : ${errorResponseMock.message}`);
    }));

    it('should delete match successfully', fakeAsync(() => {
        const responseMock = { status: 200, statusText: 'OK' };
        communicationServiceSpy.matchDelete.and.returnValue(of(responseMock));

        component.deleteMatch(mockMatch.accessCode);
        tick();

        expect(communicationServiceSpy.matchDelete).toHaveBeenCalledWith(mockMatch.accessCode);
        expect(gameSocketServiceSpy.quitOrganisator).toHaveBeenCalledWith({
            username: 'Organisateur',
            accessCode: mockMatch.accessCode,
        });
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/creategame']);
    }));

    it('should ban a player successfully', fakeAsync(() => {
        const mockMatchBeforeBan: Match = {
            game: BASE_GAME,
            canBeAccessed: true,
            startDate: new Date(),
            questionId: '',
            players: mockPlayer,
            time: 0,
            messages: [],
            accessCode: '1234',
            creator: 'Organisateur',
            nomsBannis: [],
        };

        const responseMock = { status: 200, statusText: 'OK' };

        communicationServiceSpy.getMatchByAccessCode.and.returnValue(of(mockMatchBeforeBan));
        communicationServiceSpy.matchPatch.and.returnValue(of(responseMock));
        spyOn(component.message, 'next');
        component.banPlayer('player1');
        tick();

        expect(communicationServiceSpy.getMatchByAccessCode).toHaveBeenCalledWith(mockMatchBeforeBan.accessCode);
        expect(gameSocketServiceSpy.banPlayer).toHaveBeenCalledWith({ username: 'player1', accessCode: mockMatchBeforeBan.accessCode });
        expect(communicationServiceSpy.matchPatch).toHaveBeenCalledWith(mockMatchBeforeBan);
    }));

    it('should handle HTTP error during banPlayer', fakeAsync(() => {
        const playerName = 'player1';
        const errorResponse = new HttpErrorResponse({
            status: 500,
            statusText: 'Internal Server Error',
            error: 'Server error',
        });
        communicationServiceSpy.getMatchByAccessCode.and.returnValue(of(mockMatch));
        communicationServiceSpy.matchPatch.and.returnValue(throwError(errorResponse));

        spyOn(component.message, 'next');

        component.banPlayer(playerName);
        tick();

        const expectedResponseString = `Le serveur ne répond pas et a retourné : ${errorResponse.message}`;
        expect(component.message.next).toHaveBeenCalledWith(expectedResponseString);
    }));
});
