import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Player } from '@app/interfaces/player.model';
import { MATCH_BASE } from '@app/pages/page.constant';
import { ChatService } from '@app/services/chat.service';
import { GameSocketService } from '@app/services/game-socket.service';
import { of } from 'rxjs';
import { HistogramQCMComponent } from '../histogram-qcm/histogram-qcm.component';
import { StatsComponent } from './stats.component';
import SpyObj = jasmine.SpyObj;

describe('StatsComponent', () => {
    let component: StatsComponent;
    let fixture: ComponentFixture<StatsComponent>;
    let socketServiceSpy: SpyObj<GameSocketService>;
    let chatServiceSpy: SpyObj<ChatService>;

    const mockNewPlayer: Player = {
        name: 'Newdon',
        points: 1480,
        status: 'typing',
        selection: [2, 3],
        bonuses: 0,
    };
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
            status: 'idle',
            selection: [],
            bonuses: 0,
        },
        {
            name: 'Glodon',
            points: 185,
            status: 'active',
            selection: [1, 3],
            bonuses: 0,
        },
        {
            name: 'Klidon',
            points: 60,
            status: 'typing',
            selection: [1, 2],
            bonuses: 0,
        },
    ];
    socketServiceSpy = jasmine.createSpyObj('SocketExampleService', [
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
    ]);
    socketServiceSpy.setReady.and.returnValue();
    socketServiceSpy.sendChronoValues.and.returnValue();
    socketServiceSpy.receiveChronoValues.and.returnValue(of(10));
    socketServiceSpy.sendToResultView.and.returnValue();
    socketServiceSpy.joinRoom.and.returnValue();
    socketServiceSpy.goToResultView.and.returnValue(of());
    socketServiceSpy.orgQuitGame.and.returnValue();
    socketServiceSpy.orgNextQuestion.and.returnValue();
    socketServiceSpy.orderedToQuitTheGame.and.returnValue(of('Value'));
    socketServiceSpy.receivePlayerData.and.returnValue(
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

    chatServiceSpy = jasmine.createSpyObj('ChatService', [
        'joinRoom',
        'leaveRoom',
        'sendMessage',
        'receiveChat',
        'sendSelections',
        'receiveSelectionsObs',
    ]);
    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [StatsComponent, HistogramQCMComponent],
            providers: [
                { provide: GameSocketService, useValue: socketServiceSpy },
                { provide: ChatService, useValue: chatServiceSpy },
            ],
        });
        fixture = TestBed.createComponent(StatsComponent);
        component = fixture.componentInstance;
        component.match = { ...MATCH_BASE };
        component.match.players = [
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
                status: 'idle',
                selection: [],
                bonuses: 0,
            },
            {
                name: 'Glodon',
                points: 185,
                status: 'active',
                selection: [1, 3],
                bonuses: 0,
            },
            {
                name: 'Klidon',
                points: 60,
                status: 'typing',
                selection: [1, 2],
                bonuses: 0,
            },
        ];
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
    it('should update the data from the players', () => {
        component.match.players = [...mockPlayers];
        expect(component.updateHist()).toEqual([1, 3, 1, 3]);
        // from [0, 3] to [1,3], 0 index column should go down (1) and 1 index column should go up (1)
        component.match.players[0].selection = [1, 3];
        expect(component.updateHist()).toEqual([0, 4, 1, 3]);
        component.match.players[4].selection = [2, 3];
        // from [1, 2] to [2 ,3], 1 index column should go down (1) and 3 index column should go up (1)
        expect(component.updateHist()).toEqual([0, 3, 1, 4]);
    });
    it('should update the data from a new player, be able to handle case', () => {
        component.match.players = [
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
                status: 'idle',
                selection: [],
                bonuses: 0,
            },
            {
                name: 'Glodon',
                points: 185,
                status: 'active',
                selection: [1, 3],
                bonuses: 0,
            },
            {
                name: 'Klidon',
                points: 60,
                status: 'typing',
                selection: [1, 2],
                bonuses: 0,
            },
        ];
        expect(component.updateHist()).toEqual([1, 3, 1, 3]);
        // new player arrives with selection [2, 3]
        component.match.players.push(mockNewPlayer);
        // [2 ,3], 2 index column should go up (1) and 3 index column should go up (1)
        expect(component.updateHist()).toEqual([1, 3, 2, 4]);
    });
    it('should call ngOnChanges in HistogramQCMComponent and transfer data', () => {
        const histogramComponent = component.histogramQCMComponent;
        expect(histogramComponent).toBeDefined();
        spyOn(histogramComponent, 'ngOnChanges').and.callThrough();
        component.data = [5, 1, 4];
        fixture.detectChanges();

        expect(histogramComponent.ngOnChanges).toHaveBeenCalled();
        expect(histogramComponent.data).toEqual([5, 1, 4]);
        expect(histogramComponent.maxValue).toBe(5);
    });
});
