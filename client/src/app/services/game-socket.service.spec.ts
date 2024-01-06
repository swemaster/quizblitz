import { TestBed } from '@angular/core/testing';
import { Match } from '@app/interfaces/match.model';
import { PlayerServer } from '@app/interfaces/player.server.model';
import { BASE_GAME, PLAYER_BASE } from '@app/pages/page.constant';
import { Socket } from 'ngx-socket-io';
import { of } from 'rxjs';
import { GameSocketService } from './game-socket.service';

describe('GameSocketService', () => {
    let gameSocketService: GameSocketService;
    let socketMock: jasmine.SpyObj<Socket>;

    beforeEach(() => {
        const socketSpy = jasmine.createSpyObj('Socket', ['fromEvent', 'emit', 'disconnect', 'connect']);
        socketSpy.disconnect.and.callFake(() => {});
        TestBed.configureTestingModule({
            providers: [GameSocketService, { provide: Socket, useValue: socketSpy }],
        });
        gameSocketService = TestBed.inject(GameSocketService);
        socketMock = TestBed.inject(Socket) as jasmine.SpyObj<Socket>;
    });

    it('should be created', () => {
        expect(gameSocketService).toBeTruthy();
    });

    it('should emit playerReady event', () => {
        gameSocketService.setReady();
        expect(socketMock.emit).toHaveBeenCalledWith('playerReady');
    });

    it('should emit chrono event with a given value', () => {
        const value = 6;
        gameSocketService.sendChronoValues(value);
        expect(socketMock.emit).toHaveBeenCalledWith('chrono', value);
    });

    it('should listen for chronoReception event and return an Observable', () => {
        const mockValue = 10;
        socketMock.fromEvent.and.returnValue(of(mockValue));

        const result = gameSocketService.receiveChronoValues();

        expect(socketMock.fromEvent).toHaveBeenCalledWith('chronoReception');
        result.subscribe((value) => {
            expect(value).toBe(mockValue);
        });
    });

    it('should emit joinRoom event with user info', () => {
        const userInfo = { username: 'Alice', accessCode: '12345' };
        gameSocketService.joinRoom(userInfo);
        expect(socketMock.emit).toHaveBeenCalledWith('joinRoom', userInfo);
    });

    it('should emit joinGameRoom event with room and name', () => {
        const room = 'Room1';
        const name = 'Alice';
        gameSocketService.joinGameRoom(room, name);
        expect(socketMock.emit).toHaveBeenCalledWith('joinGameRoom', { room, name });
    });

    it('should emit orgQuitGame event', () => {
        gameSocketService.orgQuitGame();
        expect(socketMock.emit).toHaveBeenCalledWith('orgQuitGame');
    });

    it('should emit playerQuitGame event', () => {
        gameSocketService.playerQuitGame();
        expect(socketMock.emit).toHaveBeenCalledWith('playerQuitGame');
    });

    it('should listen for orderedToQuitTheGame event and return an Observable', () => {
        const mockValue = {};
        socketMock.fromEvent.and.returnValue(of(mockValue));

        const result = gameSocketService.orderedToQuitTheGame();

        expect(socketMock.fromEvent).toHaveBeenCalledWith('orderedToQuitTheGame');
        result.subscribe((value) => {
            expect(value).toBe(mockValue);
        });
    });

    it('should listen for playerNextQuestion event and return an Observable', () => {
        const mockValue = {};
        socketMock.fromEvent.and.returnValue(of(mockValue));

        const result = gameSocketService.playerNextQuestion();

        expect(socketMock.fromEvent).toHaveBeenCalledWith('goToNextQuestion');
        result.subscribe((value) => {
            expect(value).toBe(mockValue);
        });
    });

    it('should emit orgNextQuestion event', () => {
        gameSocketService.orgNextQuestion();
        expect(socketMock.emit).toHaveBeenCalledWith('nextQuestion');
    });

    it('should emit askValidateQuestions event', () => {
        gameSocketService.orgValidateQuestions();
        expect(socketMock.emit).toHaveBeenCalledWith('askValidateQuestions');
    });

    it('should listen for validateQuestions event and return an Observable', () => {
        const mockValue = {};
        socketMock.fromEvent.and.returnValue(of(mockValue));

        const result = gameSocketService.playerValidateQuestions();

        expect(socketMock.fromEvent).toHaveBeenCalledWith('validateQuestions');
        result.subscribe((value) => {
            expect(value).toBe(mockValue);
        });
    });

    it('should listen for newPlayer event and return an Observable', () => {
        const mockValue = 'New Player';
        socketMock.fromEvent.and.returnValue(of(mockValue));

        const result = gameSocketService.onNewPlayer();

        expect(socketMock.fromEvent).toHaveBeenCalledWith('newPlayer');
        result.subscribe((value) => {
            expect(value).toBe(mockValue);
        });
    });

    it('should emit playerReadyQuestion event with timeLeft', () => {
        const timeLeft = 30;
        gameSocketService.playerReadyQuestion(timeLeft);
        expect(socketMock.emit).toHaveBeenCalledWith('playerReadyQuestion', timeLeft);
    });

    it('should listen for isFirst event and return an Observable', () => {
        const mockValue = {};
        socketMock.fromEvent.and.returnValue(of(mockValue));

        const result = gameSocketService.isFirst();

        expect(socketMock.fromEvent).toHaveBeenCalledWith('isFirst');
        result.subscribe((value) => {
            expect(value).toBe(mockValue);
        });
    });

    it('should emit sendPlayerSelection event with player selection', () => {
        const playerSelection = [1, 2];
        gameSocketService.sendPlayerSelection(playerSelection);
        expect(socketMock.emit).toHaveBeenCalledWith('sendPlayerSelection', playerSelection);
    });

    it('should emit sendPlayerScore event with player score', () => {
        const score = '30';
        const bonuses = 1;
        gameSocketService.sendPlayerScore({ score, bonuses });
        expect(socketMock.emit).toHaveBeenCalledWith('sendPlayerScore', { score, bonuses });
    });

    it('should emit startGame event', () => {
        gameSocketService.startGame();
        expect(socketMock.emit).toHaveBeenCalledWith('startGame');
    });

    it('should listen for enterInGame event and return an Observable', () => {
        const mockValue = {};
        socketMock.fromEvent.and.returnValue(of(mockValue));

        const result = gameSocketService.enterInGame();

        expect(socketMock.fromEvent).toHaveBeenCalledWith('enterInGame');
        result.subscribe((value) => {
            expect(value).toBe(mockValue);
        });
    });

    it('should listen for receivePlayerData event and return an Observable', () => {
        const mockValue: PlayerServer[] = [];
        socketMock.fromEvent.and.returnValue(of(mockValue));

        const result = gameSocketService.receivePlayerData();

        expect(socketMock.fromEvent).toHaveBeenCalledWith('sendDataToOrg');
        result.subscribe((value) => {
            expect(value).toBe(mockValue);
        });
    });
    it('should emit resultsView event with the given match', () => {
        const mockMatch: Match = {
            game: BASE_GAME,
            canBeAccessed: true,
            startDate: new Date(),
            questionId: '',
            players: PLAYER_BASE,
            time: 0,
            messages: [],
            accessCode: '1234',
            creator: 'Organisateur',
            nomsBannis: [],
        };

        gameSocketService.sendToResultView(mockMatch);

        expect(socketMock.emit).toHaveBeenCalledWith('resultsView', mockMatch);
    });
    it('should emit banPlayer event with the given userInfo', () => {
        const mockUserInfo = {
            username: 'bannedPlayer',
            accessCode: '1234',
        };

        gameSocketService.banPlayer(mockUserInfo);

        expect(socketMock.emit).toHaveBeenCalledWith('banPlayer', mockUserInfo);
    });
    it('should emit quitOrganisator event with the given userInfo', () => {
        const mockUserInfo = {
            username: 'testUser',
            accessCode: '1234',
        };

        gameSocketService.quitOrganisator(mockUserInfo);

        expect(socketMock.emit).toHaveBeenCalledWith('quitOrganisator', mockUserInfo);
    });
    it('should return an observable for OrganisatorQuit event', (done: DoneFn) => {
        const mockEventData = 'Organisator has quit';
        socketMock.fromEvent.and.returnValue(of(mockEventData));
        gameSocketService.onOrganisatorQuit().subscribe((data) => {
            expect(data).toBe(mockEventData);
            done();
        });
    });
    it('should emit quitPlayer event with the given userInfo', () => {
        const mockUserInfo = {
            username: 'quitter',
            accessCode: '1234',
        };

        gameSocketService.quitPlayer(mockUserInfo);

        expect(socketMock.emit).toHaveBeenCalledWith('quitPlayer', mockUserInfo);
    });
    it('should return an observable for goToResultsView event', (done: DoneFn) => {
        const mockMatch: Match = {
            game: BASE_GAME,
            canBeAccessed: true,
            startDate: new Date(),
            questionId: '',
            players: PLAYER_BASE,
            time: 0,
            messages: [],
            accessCode: '1234',
            creator: 'Organisateur',
            nomsBannis: [],
        };
        socketMock.fromEvent.and.returnValue(of(mockMatch));
        gameSocketService.goToResultView().subscribe((data) => {
            expect(data).toEqual(mockMatch);
            done();
        });
    });
    it('should return an observable for playerQuit event', (done: DoneFn) => {
        const mockEventData = 'Player has quit';
        socketMock.fromEvent.and.returnValue(of(mockEventData));
        gameSocketService.onPlayerQuit().subscribe((data) => {
            expect(data).toBe(mockEventData);
            done();
        });
    });
    it('should return an observable for playerBanned event', (done: DoneFn) => {
        const mockEventData = 'Player has been banned';
        socketMock.fromEvent.and.returnValue(of(mockEventData));
        gameSocketService.onPlayerBanned().subscribe((data) => {
            expect(data).toBe(mockEventData);
            done();
        });
    });

    it('should emit askForPlayerData event', () => {
        gameSocketService.askForPlayerData();
        expect(socketMock.emit).toHaveBeenCalledWith('askForPlayerData');
    });

    it('should send banned chat name and updated status', () => {
        const playerName = 'JohnDoe';
        const isBannedChat = { JohnDoe: true };
        gameSocketService.sendBannedChatName({ playerName, isBannedChat });
        expect(socketMock.emit).toHaveBeenCalledWith('sendBannedChatName', { playerName, isBannedChat }, true);
    });

    it('should receive banned chat name', (done) => {
        const mockValue = {};
        socketMock.fromEvent.and.returnValue(of(mockValue));

        const result = gameSocketService.receiveBannedChatName();

        expect(socketMock.fromEvent).toHaveBeenCalledWith('receiveBannedChatName');
        result.subscribe((value) => {
            expect(value).toBe(mockValue);
            done();
        });
    });
    it('should call disconnect on socket service when disconnect is called', () => {
        gameSocketService.disconnect();
        expect(socketMock.disconnect).toHaveBeenCalled();
    });
    it('should subscribe to "playSound" event when onPanic is called', () => {
        const mockEventData = 'Sound was played';
        socketMock.fromEvent.and.returnValue(of(mockEventData));
        const result$ = gameSocketService.onPanic();
        result$.subscribe((data) => {
            expect(data).toEqual(mockEventData);
        });

        expect(socketMock.fromEvent).toHaveBeenCalledWith('playSound');
    });

    it('should emit "panicState" event when panic is called', () => {
        gameSocketService.panic();
        expect(socketMock.emit).toHaveBeenCalledWith('panicState');
    });
    it('should emit "textQRLSent" event with provided text when sendQRLText is called', () => {
        const textQRL = 'QRL sent';
        gameSocketService.sendQRLText(textQRL);
        expect(socketMock.emit).toHaveBeenCalledWith('textQRLSent', textQRL);
    });

    it('should subscribe to "sendQRLToOrg" event when onQRLText is called', () => {
        const mockEventData = { username: 'John', text: 'onQRLToOrg called' };
        socketMock.fromEvent.and.returnValue(of(mockEventData));
        const result$ = gameSocketService.onQRLText();
        result$.subscribe((data) => {
            expect(data).toEqual(mockEventData);
        });

        expect(socketMock.fromEvent).toHaveBeenCalledWith('sendQRLToOrg');
    });

    it('should emit "sendMultiplierToPlayer" event with provided results when sendMultiplierToPlayer is called', () => {
        const mockResults = [
            { name: 'Player1', scoreMultiplier: 2 },
            { name: 'Player2', scoreMultiplier: 1 },
        ];
        gameSocketService.sendMultiplierToPlayer(mockResults);
        expect(socketMock.emit).toHaveBeenCalledWith('sendMultiplierToPlayer', mockResults);
    });

    it('should subscribe to "receiveMultiplier" event when receiveMultiplier is called', () => {
        const mockMultiplier = 5;
        socketMock.fromEvent.and.returnValue(of(mockMultiplier));
        const result$ = gameSocketService.receiveMultiplier();
        result$.subscribe((data) => {
            expect(data).toEqual(mockMultiplier);
        });

        expect(socketMock.fromEvent).toHaveBeenCalledWith('receiveMultiplier');
    });
    it('should set reconnection to true if ioSocket exists', () => {
        socketMock.ioSocket = { reconnection: false };
        gameSocketService = TestBed.inject(GameSocketService);
        expect(socketMock.ioSocket.reconnection).toBe(false);
    });

    it('should not set reconnection if ioSocket does not exist', () => {
        socketMock.ioSocket = null;
        gameSocketService = TestBed.inject(GameSocketService);
        expect(socketMock.ioSocket).toBeNull();
    });
});
