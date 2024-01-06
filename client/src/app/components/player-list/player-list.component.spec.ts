import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { PlayerListComponent } from '@app/components/player-list/player-list.component';
import { Player } from '@app/interfaces/player.model';
import { GameSocketService } from '@app/services/game-socket.service';
import { of } from 'rxjs';
import SpyObj = jasmine.SpyObj;

describe('PlayerListComponent', () => {
    let component: PlayerListComponent;
    let fixture: ComponentFixture<PlayerListComponent>;
    let gameSocketServiceSpy: SpyObj<GameSocketService>;
    const mockPlayers: Player[] = [
        {
            name: 'Flydon',
            points: 1190,
            status: 'active',
            selection: [0, 3],
            bonuses: 0,
        },
        {
            name: 'Wadon',
            points: 380,
            status: 'typing',
            selection: [1, 3],
            bonuses: 0,
        },
        {
            name: 'Lydon',
            points: 1330,
            status: 'disconnected',
            selection: [],
            bonuses: 0,
        },
        {
            name: 'Glodon',
            points: 380,
            status: 'typing',
            selection: [1, 3],
            bonuses: 0,
        },
    ];
    const mockNewPlayer: Player = {
        name: 'Newdon',
        points: 1480,
        status: 'typing',
        selection: [1, 3],
        bonuses: 0,
    };
    gameSocketServiceSpy = jasmine.createSpyObj('SocketExampleService', [
        'setReady',
        'sendChronoValues',
        'receiveChronoValues',
        'sendToResultView',
        'joinRoom',
        'goToResultView',
        'orgQuitGame',
        'orgNextQuestion',
        'orderedToQuitTheGame',
        'receivePlayerData',
        'askForPlayerData',
        'sendBannedChatName',
    ]);
    gameSocketServiceSpy.sendBannedChatName.and.returnValue();
    gameSocketServiceSpy.setReady.and.returnValue();
    gameSocketServiceSpy.sendChronoValues.and.returnValue();
    gameSocketServiceSpy.receiveChronoValues.and.returnValue(of(10));
    gameSocketServiceSpy.sendToResultView.and.returnValue();
    gameSocketServiceSpy.joinRoom.and.returnValue();
    gameSocketServiceSpy.goToResultView.and.returnValue(of());
    gameSocketServiceSpy.orgQuitGame.and.returnValue();
    gameSocketServiceSpy.askForPlayerData.and.returnValue();
    gameSocketServiceSpy.orgNextQuestion.and.returnValue();
    gameSocketServiceSpy.orderedToQuitTheGame.and.returnValue(of('Value'));
    gameSocketServiceSpy.receivePlayerData.and.returnValue(
        of([
            {
                name: 'Sample-Name',
                role: 'Player',
                socketId: 'ServerRoom',
                isFirstAmount: 1,
                score: 20,
                selection: [0, 1],
                status: 'Active',
            },
        ]),
    );

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [PlayerListComponent],
            providers: [{ provide: GameSocketService, useValue: gameSocketServiceSpy }],
        });
        fixture = TestBed.createComponent(PlayerListComponent);
        component = fixture.componentInstance;
        component.players = [...mockPlayers];
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should add a player to the list when the playerbase is updated', () => {
        const firstLength = component.players.length;
        component.players.push(mockNewPlayer);
        expect(component.players.length).toBe(firstLength + 1);
        expect(mockNewPlayer).toBe(component.players[firstLength]);
    });
    it('should identify a player of a certain status to be of a certain color', () => {
        const playerElements = fixture.debugElement.queryAll(By.css('.player'));
        for (let i = 0; i < component.players.length; i++) {
            const playerStatus = component.players[i].status;
            const playerElement = playerElements[i].nativeElement;
            const backgroundColor = getComputedStyle(playerElement).backgroundColor;
            switch (playerStatus) {
                case 'typing':
                    expect(playerElement.classList.contains('typing')).toBeTruthy();
                    expect(backgroundColor).toBe('rgb(207, 160, 6)');
                    break;
                case 'active':
                    expect(playerElement.classList.contains('active')).toBeTruthy();
                    expect(backgroundColor).toBe('rgb(17, 224, 52)');
                    break;
                case 'disconnected':
                    expect(playerElement.classList.contains('disconnected')).toBeTruthy();
                    expect(backgroundColor).toBe('rgb(128, 128, 128)');
                    break;
                case 'idle':
                    expect(playerElement.classList.contains('idle')).toBeTruthy();
                    expect(backgroundColor).toBe('rgb(196, 2, 2)');
                    break;
            }
        }
    });

    it('should sort players by name in ascending order', () => {
        component.sortPlayers('name-ascendant');
        const expectedOrder: Player[] = [
            {
                name: 'Flydon',
                points: 1190,
                status: 'active',
                selection: [0, 3],
                bonuses: 0,
            },
            {
                name: 'Glodon',
                points: 380,
                status: 'typing',
                selection: [1, 3],
                bonuses: 0,
            },
            {
                name: 'Lydon',
                points: 1330,
                status: 'disconnected',
                selection: [],
                bonuses: 0,
            },
            {
                name: 'Wadon',
                points: 380,
                status: 'typing',
                selection: [1, 3],
                bonuses: 0,
            },
        ];
        expect(component.players).toEqual(expectedOrder);
    });
    it('should sort players by name in descending order', () => {
        component.sortPlayers('name-descendant');
        const expectedOrder: Player[] = [
            {
                name: 'Wadon',
                points: 380,
                status: 'typing',
                selection: [1, 3],
                bonuses: 0,
            },
            {
                name: 'Lydon',
                points: 1330,
                status: 'disconnected',
                selection: [],
                bonuses: 0,
            },
            {
                name: 'Glodon',
                points: 380,
                status: 'typing',
                selection: [1, 3],
                bonuses: 0,
            },
            {
                name: 'Flydon',
                points: 1190,
                status: 'active',
                selection: [0, 3],
                bonuses: 0,
            },
        ];
        expect(component.players).toEqual(expectedOrder);
    });
    it('should sort players by score in ascending order', () => {
        component.sortPlayers('points-ascendant');
        const expectedOrder: Player[] = [
            {
                name: 'Glodon',
                points: 380,
                status: 'typing',
                selection: [1, 3],
                bonuses: 0,
            },
            {
                name: 'Wadon',
                points: 380,
                status: 'typing',
                selection: [1, 3],
                bonuses: 0,
            },
            {
                name: 'Flydon',
                points: 1190,
                status: 'active',
                selection: [0, 3],
                bonuses: 0,
            },
            {
                name: 'Lydon',
                points: 1330,
                status: 'disconnected',
                selection: [],
                bonuses: 0,
            },
        ];
        expect(component.players).toEqual(expectedOrder);
    });
    it('should sort players by score in descending order', () => {
        component.sortPlayers('points-descendant');
        const expectedOrder: Player[] = [
            {
                name: 'Lydon',
                points: 1330,
                status: 'disconnected',
                selection: [],
                bonuses: 0,
            },
            {
                name: 'Flydon',
                points: 1190,
                status: 'active',
                selection: [0, 3],
                bonuses: 0,
            },
            {
                name: 'Glodon',
                points: 380,
                status: 'typing',
                selection: [1, 3],
                bonuses: 0,
            },
            {
                name: 'Wadon',
                points: 380,
                status: 'typing',
                selection: [1, 3],
                bonuses: 0,
            },
        ];
        expect(component.players).toEqual(expectedOrder);
    });
    it('should sort players by status in ascending order', () => {
        component.sortPlayers('status-ascendant');
        const expectedOrder: Player[] = [
            {
                name: 'Flydon',
                points: 1190,
                status: 'active',
                selection: [0, 3],
                bonuses: 0,
            },
            {
                name: 'Lydon',
                points: 1330,
                status: 'disconnected',
                selection: [],
                bonuses: 0,
            },
            {
                name: 'Glodon',
                points: 380,
                status: 'typing',
                selection: [1, 3],
                bonuses: 0,
            },
            {
                name: 'Wadon',
                points: 380,
                status: 'typing',
                selection: [1, 3],
                bonuses: 0,
            },
        ];
        expect(component.players).toEqual(expectedOrder);
    });
    it('should sort players by status in descending order', () => {
        component.sortPlayers('status-descendant');
        const expectedOrder: Player[] = [
            {
                name: 'Flydon',
                points: 1190,
                status: 'active',
                selection: [0, 3],
                bonuses: 0,
            },
            {
                name: 'Lydon',
                points: 1330,
                status: 'disconnected',
                selection: [],
                bonuses: 0,
            },
            {
                name: 'Glodon',
                points: 380,
                status: 'typing',
                selection: [1, 3],
                bonuses: 0,
            },
            {
                name: 'Wadon',
                points: 380,
                status: 'typing',
                selection: [1, 3],
                bonuses: 0,
            },
        ];
        expect(component.players).toEqual(expectedOrder);
    });

    it('should default sort players by score in ascending order', () => {
        component.sortPlayers('');
        const expectedOrder: Player[] = [
            {
                name: 'Glodon',
                points: 380,
                status: 'typing',
                selection: [1, 3],
                bonuses: 0,
            },
            {
                name: 'Wadon',
                points: 380,
                status: 'typing',
                selection: [1, 3],
                bonuses: 0,
            },
            {
                name: 'Flydon',
                points: 1190,
                status: 'active',
                selection: [0, 3],
                bonuses: 0,
            },
            {
                name: 'Lydon',
                points: 1330,
                status: 'disconnected',
                selection: [],
                bonuses: 0,
            },
        ];
        expect(component.players).toEqual(expectedOrder);
    });
    it('should call sortPlayers with the selected option on order type change', () => {
        const sortPlayersSpy = spyOn(component, 'sortPlayers');
        const selectElement = fixture.debugElement.query(By.css('select'));
        selectElement.triggerEventHandler('change', { target: { value: 'name-ascendant' } });
        expect(sortPlayersSpy).toHaveBeenCalledWith('name-ascendant');
    });

    it('should toggle banned chat and call sendBannedChatName on toggleBannedChat', () => {
        const playerName = 'Alice';
        const initialBannedChatValue = component.isBannedChat[playerName];
        const sendBannedChatNameSpy = gameSocketServiceSpy.sendBannedChatName;

        component.toggleBannedChat(playerName);

        expect(component.isBannedChat[playerName]).toBe(!initialBannedChatValue);
        expect(sendBannedChatNameSpy).toHaveBeenCalledWith({
            playerName,
            isBannedChat: component.isBannedChat,
        });
    });
});
