// import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { MatSnackBar, MatSnackBarDismiss, MatSnackBarRef } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { CommunicationService } from '@app/services/communication.service';
import { GameSocketService } from '@app/services/game-socket.service';
import { PlayerService } from '@app/services/player.service';
// import { of, throwError } from 'rxjs';
import { of } from 'rxjs';
import { HOME_PAGE_PATH, SNACKBAR_DURATION_EXIT } from '../page.constant';
import { WaitingForGameStartComponent } from './waiting-for-game-start.component';
import SpyObj = jasmine.SpyObj;

describe('WaitingForGameStartComponent', () => {
    let component: WaitingForGameStartComponent;
    let fixture: ComponentFixture<WaitingForGameStartComponent>;
    let playerServiceSpy: SpyObj<PlayerService>;
    let communicationServiceSpy: any;
    let gameSocketServiceSpy: SpyObj<GameSocketService>;
    let routerSpy: SpyObj<Router>;
    let snackBarSpy: SpyObj<MatSnackBar>;
    let snackBarRefSpy: any;
    playerServiceSpy = jasmine.createSpyObj('PlayerService', ['getName']);
    communicationServiceSpy = jasmine.createSpyObj('CommunicationService', ['getMatchByAccessCode', 'matchPatch']);
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
    routerSpy = jasmine.createSpyObj('router', ['navigateByUrl', 'navigate']);
    snackBarSpy = jasmine.createSpyObj('snackBar', ['open']);
    let mockActivatedRoute = {
        params: of({ accessCode: '1234' }),
    };
    snackBarRefSpy = jasmine.createSpyObj('MatSnackBarRef', ['afterDismissed']);

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [WaitingForGameStartComponent],
            providers: [
                { provide: MatSnackBar, useValue: snackBarSpy },
                { provide: MatSnackBarRef, useValue: snackBarRefSpy },
                { provide: ActivatedRoute, useValue: mockActivatedRoute },
                { provide: Router, useValue: routerSpy },
                { provide: CommunicationService, useValue: communicationServiceSpy },
                { provide: GameSocketService, useValue: gameSocketServiceSpy },
                { provide: PlayerService, useValue: playerServiceSpy },
            ],
        }).compileComponents();
        fixture = TestBed.createComponent(WaitingForGameStartComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });
    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call showConfirmationAlert on popstate', () => {
        spyOn(component, 'showConfirmationAlert');
        window.dispatchEvent(new Event('popstate'));
        expect(component.showConfirmationAlert).toHaveBeenCalled();
    });

    it('should call quitMatch if user confirms', () => {
        const confirmSpy = spyOn(window, 'confirm').and.returnValue(true);
        const quitMatchSpy = spyOn(component, 'quitMatch');
        component.showConfirmationAlert();
        expect(confirmSpy).toHaveBeenCalledWith('Êtes-vous sûr de vouloir quitter le jeu ?');
        expect(quitMatchSpy).toHaveBeenCalledTimes(1);
    });

    it('should not call quitMatch if user cancels', () => {
        const confirmSpy = spyOn(window, 'confirm').and.returnValue(false);
        const quitMatchSpy = spyOn(component, 'quitMatch');
        component.showConfirmationAlert();
        expect(confirmSpy).toHaveBeenCalledWith('Êtes-vous sûr de vouloir quitter le jeu ?');
        expect(quitMatchSpy).not.toHaveBeenCalled();
    });

    it('should return the player name', () => {
        const playerName = 'Manel';
        playerServiceSpy.getName.and.returnValue(playerName);
        const result = component.showPlayerName();
        expect(playerServiceSpy.getName).toHaveBeenCalled();
        expect(result).toBe(playerName);
    });
    it('should quit the match and navigate to the home page', async () => {
        playerServiceSpy.getName.and.returnValue('testPlayer');
        communicationServiceSpy.getMatchByAccessCode.and.returnValue(of({ players: [{ name: 'testPlayer' }], accessCode: '1234' }));
        communicationServiceSpy.matchPatch.and.returnValue(of({ status: 200, statusText: 'OK' }));
        component.accessCode = '1234';
        await component.quitMatch();

        expect(playerServiceSpy.getName).toHaveBeenCalled();
        expect(communicationServiceSpy.getMatchByAccessCode).toHaveBeenCalledWith('1234');
        expect(communicationServiceSpy.matchPatch).toHaveBeenCalled();
        expect(gameSocketServiceSpy.quitPlayer).toHaveBeenCalledWith({ username: 'testPlayer', accessCode: '1234' });
        expect(routerSpy.navigateByUrl).toHaveBeenCalledWith(HOME_PAGE_PATH);
    });

    it('should show ban alert and redirect', () => {
        const playerName = 'testPlayer';
        spyOn(component, 'showPlayerName').and.returnValue(playerName);
        const dismissEvent: MatSnackBarDismiss = { dismissedByAction: false };
        snackBarSpy.open.and.returnValue({ afterDismissed: () => of(dismissEvent) } as any);

        component.showBanAlertAndRedirect(playerName);

        expect(component.showPlayerName).toHaveBeenCalled();
        expect(snackBarSpy.open).toHaveBeenCalledWith(
            `Vous avez été banni pour avoir utiliser le nom ${playerName}. Vous serez redirigé vers la page d'accueil.`,
            'OK',
            { duration: SNACKBAR_DURATION_EXIT },
        );
        snackBarSpy.open.calls
            .mostRecent()
            .returnValue.afterDismissed()
            .subscribe(() => {
                expect(routerSpy.navigate).toHaveBeenCalledWith(['/home']);
            });
        expect(gameSocketServiceSpy.quitPlayer).toHaveBeenCalledWith({
            username: playerName,
            accessCode: component.match.accessCode,
        });
    });

    it('should show organizer quit alert and redirect', () => {
        const orgaQuitMessage = "L'organisateur de la partie a quitter. Vous serez rediriger vers la page d'accueil";
        const mockSnackBarRef: any = {
            afterDismissed: jasmine.createSpy().and.returnValue(of({} as MatSnackBarDismiss)),
        };
        snackBarSpy.open.and.returnValue(mockSnackBarRef);

        component.showOrganisatorQuitAlert();

        expect(snackBarSpy.open).toHaveBeenCalledWith(orgaQuitMessage, 'OK', { duration: SNACKBAR_DURATION_EXIT });
        expect(mockSnackBarRef.afterDismissed).toHaveBeenCalled();
        mockSnackBarRef.afterDismissed().subscribe(() => {
            expect(routerSpy.navigateByUrl).toHaveBeenCalledWith(HOME_PAGE_PATH);
        });
    });

    it('should set accessCode and initialize players', fakeAsync(() => {
        communicationServiceSpy.getMatchByAccessCode.and.returnValue(
            of({
                accessCode: '1234',
                players: [{ name: 'Organisateur' }, { name: 'player1' }],
            }),
        );

        gameSocketServiceSpy.joinGameRoom;
        gameSocketServiceSpy.onNewPlayer.and.returnValue(of('player1'));
        gameSocketServiceSpy.enterInGame.and.returnValue(of(null));
        gameSocketServiceSpy.onPlayerBanned.and.returnValue(of('banned-player'));
        gameSocketServiceSpy.onPlayerQuit.and.returnValue(of('gone-player'));
        gameSocketServiceSpy.onOrganisatorQuit.and.returnValue(of(''));
        spyOn(component, 'showOrganisatorQuitAlert');
        component.ngOnInit();

        tick();

        expect(component.accessCode).toBe('1234');
        expect(communicationServiceSpy.getMatchByAccessCode).toHaveBeenCalledWith('1234');
        expect(gameSocketServiceSpy.onNewPlayer).toHaveBeenCalled();
        expect(gameSocketServiceSpy.enterInGame).toHaveBeenCalled();
        expect(gameSocketServiceSpy.onPlayerBanned).toHaveBeenCalled();
        expect(gameSocketServiceSpy.onPlayerQuit).toHaveBeenCalled();
        expect(gameSocketServiceSpy.onOrganisatorQuit).toHaveBeenCalled();
        expect(component.showOrganisatorQuitAlert).toHaveBeenCalled();
    }));

    // it('should handle error when quitting the match', fakeAsync(() => {
    //     const errorResponseMock = new HttpErrorResponse({ status: 500, statusText: 'Internal Server Error', error: 'Server error' });

    //     communicationServiceSpy.getMatchByAccessCode.and.returnValue(of(component.match));
    //     communicationServiceSpy.matchPatch.and.returnValue(throwError(errorResponseMock));
    //     spyOn(component.message, 'next');

    //     component.quitMatch();
    //     tick();

    //     expect(playerServiceSpy.getName).toHaveBeenCalled();
    //     expect(communicationServiceSpy.getMatchByAccessCode).toHaveBeenCalledWith(component.match.accessCode);
    //     expect(communicationServiceSpy.matchPatch).toHaveBeenCalled();
    //     expect(component.message.next).toHaveBeenCalledWith(`Le serveur ne répond pas et a retourné : ${errorResponseMock.message}`);
    // }));
});
