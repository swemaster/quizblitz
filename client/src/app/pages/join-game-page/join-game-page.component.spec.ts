import { HttpErrorResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Match } from '@app/interfaces/match.model';
import { BASE_GAME } from '@app/pages/page.constant';
import { CommunicationService } from '@app/services/communication.service';
import { GameSocketService } from '@app/services/game-socket.service';
import { PlayerService } from '@app/services/player.service';
import { Observable, of } from 'rxjs';
import { JoinGamePageComponent } from './join-game-page.component';

describe('JoinGamePageComponent', () => {
    let component: JoinGamePageComponent;
    let fixture: ComponentFixture<JoinGamePageComponent>;
    let socketServiceSpy: jasmine.SpyObj<GameSocketService>;
    let playerServiceSpy: jasmine.SpyObj<PlayerService>;
    let communicationServiceSpy: any;

    beforeEach(() => {
        communicationServiceSpy = jasmine.createSpyObj('CommunicationService', ['getMatchByAccessCode', 'matchPatch']);
        socketServiceSpy = jasmine.createSpyObj('SocketExampleService', ['onNewPlayer', 'joinRoom', 'joinGameRoom']);
        playerServiceSpy = jasmine.createSpyObj('PlayerService', ['setRoom', 'setName']);
        TestBed.configureTestingModule({
            imports: [RouterTestingModule, HttpClientTestingModule],
            declarations: [JoinGamePageComponent],
            providers: [
                { provide: GameSocketService, useValue: socketServiceSpy },
                { provide: PlayerService, useValue: playerServiceSpy },
                { provide: CommunicationService, useValue: communicationServiceSpy },
            ],
        }).compileComponents();
        fixture = TestBed.createComponent(JoinGamePageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', fakeAsync(() => {
        expect(component).toBeTruthy();
    }));

    it('should validate access code', fakeAsync(() => {
        component.inputCode = '1234';
        const mockMatch: Match = {
            game: BASE_GAME,
            canBeAccessed: true,
            startDate: new Date(),
            questionId: '',
            players: [{ name: 'firstPlayer', points: 20, status: 'active', selection: [1, 2, 3], bonuses: 10 }],
            time: 0,
            messages: [],
            accessCode: '1234',
            creator: 'Organisateur',
            nomsBannis: [],
        };
        communicationServiceSpy.getMatchByAccessCode.and.returnValue(of(mockMatch));

        component.validateAccess();

        expect(communicationServiceSpy.getMatchByAccessCode).toHaveBeenCalledWith('1234');
        tick();

        expect(component.isAccessCodeValid).toBeTrue();
        expect(component.isAccessCodeEditable).toBeFalse();
        expect(component.errorMessage).toBe('');
    }));

    it('should handle invalid access code format', () => {
        component.inputCode = 'abcd';
        component.validateAccess();

        expect(component.isAccessCodeValid).toBeFalse();
        expect(component.isAccessCodeEditable).toBeTrue();
        expect(component.errorMessage).toContain("Code d'accès invalide, veuillez rentrer 4 chiffres");
    });

    it('should handle invalid access code with no matching match', fakeAsync(() => {
        component.inputCode = '0000';
        communicationServiceSpy.getMatchByAccessCode.and.returnValue(of(null));

        component.validateAccess();

        expect(communicationServiceSpy.getMatchByAccessCode).toHaveBeenCalledWith('0000');
        tick();

        expect(component.isAccessCodeValid).toBeFalse();
        expect(component.isAccessCodeEditable).toBeTrue();
        expect(component.errorMessage).toBe("Aucune partie n'est reliée au code d'accès que vous avez entré, veuillez saisir un autre code");
        tick();
    }));

    it('should handle locked game', fakeAsync(() => {
        component.inputCode = '1234';
        const mockLockedMatch: Match = {
            game: BASE_GAME,
            canBeAccessed: false,
            startDate: new Date(),
            questionId: '',
            players: [{ name: 'firstPlayer', points: 20, status: 'active', selection: [1, 2, 3], bonuses: 10 }],
            time: 0,
            messages: [],
            accessCode: '1234',
            creator: 'Organisateur',
            nomsBannis: [],
        };
        mockLockedMatch.canBeAccessed = false;
        communicationServiceSpy.getMatchByAccessCode.and.returnValue(of(mockLockedMatch));
        component.validateAccess();
        expect(communicationServiceSpy.getMatchByAccessCode).toHaveBeenCalledWith('1234');
        tick();

        expect(component.isAccessCodeValid).toBeFalse();
        expect(component.isAccessCodeEditable).toBeTrue();
        expect(component.errorMessage).toContain('La partie est vérouiller vous ne pouvez pas rentrer');
        tick();
    }));

    it('should set error message when the game becomes locked after entering access code', fakeAsync(() => {
        component.inputCode = '1234';
        const initialMockMatch: Match = {
            game: BASE_GAME,
            canBeAccessed: true,
            startDate: new Date(),
            questionId: '',
            players: [{ name: 'firstPlayer', points: 20, status: 'active', selection: [1, 2, 3], bonuses: 10 }],
            time: 0,
            messages: [],
            accessCode: '1234',
            creator: 'Organisateur',
            nomsBannis: [],
        };
        const lockedMockMatch = { ...initialMockMatch, canBeAccessed: false };
        communicationServiceSpy.getMatchByAccessCode.and.returnValue(of(initialMockMatch));
        component.validateAccess();
        tick();
        communicationServiceSpy.getMatchByAccessCode.and.returnValue(of(lockedMockMatch));
        component.joinMatch();
        tick();

        expect(component.errorMessage).toBe('La partie est vérouiller vous ne pouvez pas rentrer');
    }));

    it('should handle unvalid player name', fakeAsync(() => {
        component.inputCode = '1234';
        const mockMatch: Match = {
            game: BASE_GAME,
            canBeAccessed: true,
            startDate: new Date(),
            questionId: '',
            players: [{ name: 'firstPlayer', points: 20, status: 'active', selection: [1, 2, 3], bonuses: 10 }],
            time: 0,
            messages: [],
            accessCode: '1234',
            creator: 'Organisateur',
            nomsBannis: [],
        };
        communicationServiceSpy.getMatchByAccessCode.and.returnValue(of(mockMatch));
        component.validateAccess();
        expect(communicationServiceSpy.getMatchByAccessCode).toHaveBeenCalledWith('1234');
        tick();

        component.playerName = 'organisateur';
        component.validatePlayerName();

        tick();

        expect(component.isPlayerValidated).toBeFalsy();
        expect(component.errorMessage).toBe("Ce nom d'utilisateur n'est pas valide.");
    }));

    it('should handle a banned player name', fakeAsync(() => {
        component.inputCode = '1234';
        const mockMatch: Match = {
            game: BASE_GAME,
            canBeAccessed: true,
            startDate: new Date(),
            questionId: '',
            players: [{ name: 'firstPlayer', points: 20, status: 'active', selection: [1, 2, 3], bonuses: 10 }],
            time: 0,
            messages: [],
            accessCode: '1234',
            creator: 'Organisateur',
            nomsBannis: [],
        };
        mockMatch.nomsBannis.push('allo');
        communicationServiceSpy.getMatchByAccessCode.and.returnValue(of(mockMatch));
        component.validateAccess();
        expect(communicationServiceSpy.getMatchByAccessCode).toHaveBeenCalledWith('1234');
        tick();

        component.playerName = 'allo';
        component.validatePlayerName();

        tick();

        expect(component.isPlayerValidated).toBeFalsy();
        expect(component.errorMessage).toBe('Ce nom est banni. Veuillez en choisir un autre.');
    }));

    it('should reset access code', () => {
        component.isAccessCodeValid = true;
        component.isAccessCodeEditable = false;
        component.errorMessage = 'Test error';
        component.inputCode = '1234';
        component.playerName = 'TestPlayer';

        component.resetAccessCode();

        expect(component.isAccessCodeValid).toBeFalse();
        expect(component.isAccessCodeEditable).toBeTrue();
        expect(component.errorMessage).toBe('');
        expect(component.inputCode).toBe('');
        expect(component.playerName).toBe('');
    });

    it('should perform actions upon successfully joining a game', fakeAsync(() => {
        const mockMatch1: Match = {
            game: BASE_GAME,
            canBeAccessed: true,
            startDate: new Date(),
            questionId: '',
            players: [{ name: 'firstPlayer', points: 20, status: 'active', selection: [1, 2, 3], bonuses: 10 }],
            time: 0,
            messages: [],
            accessCode: '1234',
            creator: 'Organisateur',
            nomsBannis: [],
        };
        communicationServiceSpy.getMatchByAccessCode.and.returnValue(of(mockMatch1));
        component.inputCode = '1234';
        component.isPlayerValidated = true;
        const router = TestBed.inject(Router);
        const routerSpy = spyOn(router, 'navigate');
        component.joinMatch();
        tick();
        expect(sessionStorage.getItem('isPlayerAuthenticated')).toBe('true');
        expect(socketServiceSpy.joinGameRoom).toHaveBeenCalledWith('1234', component.playerName);
        expect(routerSpy).toHaveBeenCalledWith(['waitinggame', '1234']);
        expect(playerServiceSpy.setRoom).toHaveBeenCalledWith('1234');
    }));

    it('should handle a duplicate player name', async () => {
        const mockMatchDuplicatedPlayer: Match = {
            game: BASE_GAME,
            canBeAccessed: true,
            startDate: new Date(),
            questionId: '',
            players: [{ name: 'testUsedPlayerName', points: 20, status: 'active', selection: [1, 2, 3], bonuses: 10 }],
            time: 0,
            messages: [],
            accessCode: '1234',
            creator: 'Organisateur',
            nomsBannis: [],
        };
        communicationServiceSpy.getMatchByAccessCode.and.returnValue(of(mockMatchDuplicatedPlayer));
        component.inputCode = '1234';
        component.playerName = 'testUsedPlayerName';
        await component.validatePlayerName();
        expect(component.errorMessage).toBe("Ce nom d'utilisateur est deja pris veuillez en saisir un autre");
    });

    it('should handle HTTP error', fakeAsync(() => {
        component.inputCode = '1234';
        const httpErrorResponse = new HttpErrorResponse({ status: 500, statusText: 'Internal Server Error' });
        communicationServiceSpy.getMatchByAccessCode.and.throwError(httpErrorResponse);

        component.validateAccess();
        tick();

        expect(component.errorMessage).toContain(
            'Le serveur ne répond pas et a retourné : Http failure response for (unknown url): 500 Internal Server Error',
        );
    }));

    it('should validate a unique player name', async () => {
        const mockMatchUniquePlayer: Match = {
            game: BASE_GAME,
            canBeAccessed: true,
            startDate: new Date(),
            questionId: '',
            players: [{ name: 'firstPlayer', points: 20, status: 'active', selection: [1, 2, 3], bonuses: 10 }],
            time: 0,
            messages: [],
            accessCode: '1234',
            creator: 'Organisateur',
            nomsBannis: [],
        };
        communicationServiceSpy.getMatchByAccessCode.and.returnValue(of(mockMatchUniquePlayer));
        component.inputCode = '1234';
        component.playerName = 'uniqueNewPlayer';

        communicationServiceSpy.matchPatch.and.returnValue(of({ status: 200, statusText: 'OK' }));

        await component.validatePlayerName();

        expect(component.errorMessage).toBe('');
        expect(component.isPlayerValidated).toBeTrue();
        expect(playerServiceSpy.setName).toHaveBeenCalledWith('uniqueNewPlayer');
        expect(communicationServiceSpy.matchPatch).toHaveBeenCalledWith(mockMatchUniquePlayer);
    });

    it('should handle server error during match patch', async () => {
        const mockMatchPatchError: Match = {
            game: BASE_GAME,
            canBeAccessed: true,
            startDate: new Date(),
            questionId: '',
            players: [{ name: 'firstPlayer', points: 20, status: 'active', selection: [1, 2, 3], bonuses: 10 }],
            time: 0,
            messages: [],
            accessCode: '1234',
            creator: 'Organisateur',
            nomsBannis: [],
        };
        communicationServiceSpy.getMatchByAccessCode.and.returnValue(of(mockMatchPatchError));
        communicationServiceSpy.matchPatch.and.returnValue(
            new Observable((observer) => {
                observer.error(new HttpErrorResponse({ status: 500, statusText: 'Internal Server Error' }));
            }),
        );
        component.inputCode = '1234';
        component.playerName = 'playerNameTest';
        const messageNextSpy = spyOn(component.message, 'next');
        await component.validatePlayerName();
        expect(messageNextSpy).toHaveBeenCalledWith(jasmine.stringMatching('Le serveur ne répond pas et a retourné'));
    });
});
