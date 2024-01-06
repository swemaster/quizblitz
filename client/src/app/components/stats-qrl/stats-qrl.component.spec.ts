import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SimpleChange, SimpleChanges } from '@angular/core';
import { HistogramQRLComponent } from '@app/components/histogram-qrl/histogram-qrl.component';
import { StatsQRLComponent } from '@app/components/stats-qrl/stats-qrl.component';
import { GameSocketService } from '@app/services/game-socket.service';
import { of } from 'rxjs';
import SpyObj = jasmine.SpyObj;

describe('StatsQRLComponent', () => {
    let component: StatsQRLComponent;
    let socketServiceSpy: SpyObj<GameSocketService>;
    let fixture: ComponentFixture<StatsQRLComponent>;

    beforeEach(async () => {
        socketServiceSpy = jasmine.createSpyObj('SocketExampleService', [
            'panic',
            'setReady',
            'sendChronoValues',
            'receiveChronoValues',
            'sendToResultView',
            'joinRoom',
            'goToResultView',
            'orgQuitGame',
            'orgNextQuestion',
            'orgValidateQuestions',
            'orderedToQuitTheGame',
            'receivePlayerData',
            'askForPlayerData',
            'onQRLText',
        ]);

        socketServiceSpy.panic.and.returnValue();
        socketServiceSpy.setReady.and.returnValue();
        socketServiceSpy.sendChronoValues.and.returnValue();
        socketServiceSpy.receiveChronoValues.and.returnValue(of(10));
        socketServiceSpy.sendToResultView.and.returnValue();
        socketServiceSpy.joinRoom.and.returnValue();
        socketServiceSpy.goToResultView.and.returnValue(of());
        socketServiceSpy.orgQuitGame.and.returnValue();
        socketServiceSpy.orgNextQuestion.and.returnValue();
        socketServiceSpy.askForPlayerData.and.returnValue();
        socketServiceSpy.orgValidateQuestions.and.returnValue();
        socketServiceSpy.orderedToQuitTheGame.and.returnValue(of('Value'));
        socketServiceSpy.onQRLText.and.returnValue(of({ username: 'username sample', text: 'text sample1' }));
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
        TestBed.configureTestingModule({
            declarations: [StatsQRLComponent, HistogramQRLComponent],
            providers: [{ provide: GameSocketService, useValue: socketServiceSpy }],
        }).compileComponents();
        fixture = TestBed.createComponent(StatsQRLComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(StatsQRLComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
    it('should set playerActivityMap correctly on ngOnInit', () => {
        component.ngOnInit();
        expect(component.playerActivityMap.get('Player1')).toBe(true);
        expect(component.playerActivityMap.get('Player2')).toBe(false);
    });
    it('should update playerActivityMap and playerStatusArray on ngOnChanges', () => {
        component.data = { name: 'Player1', isActive: true };
        const changes: SimpleChanges = {
            data: new SimpleChange(undefined, component.data, false),
        };
        fixture.detectChanges();

        component.ngOnChanges(changes);
        expect(component.playerActivityMap.get('Player1')).toBe(true);
        expect(component.playerStatusArray[0]).toBe(1);
        expect(component.playerStatusArray[1]).toBe(1);

        component.data = { name: 'Player1', isActive: false };
        fixture.detectChanges();
        component.ngOnChanges(changes);
        expect(component.playerActivityMap.get('Player1')).toBe(false);
        expect(component.playerStatusArray[0]).toBe(0);
        expect(component.playerStatusArray[1]).toBe(2);
    });

    it('should call ngOnChanges in HistogramQRLComponent and transfer data', () => {
        const histogramComponent = component.histogramQRLComponent;
        expect(histogramComponent).toBeDefined();
        spyOn(histogramComponent, 'ngOnChanges').and.callThrough();
        component.playerStatusArray = [0, 2];
        fixture.detectChanges();

        expect(histogramComponent.ngOnChanges).toHaveBeenCalled();
        expect(histogramComponent.playerStatusArray).toEqual([0, 2]);
    });
});
