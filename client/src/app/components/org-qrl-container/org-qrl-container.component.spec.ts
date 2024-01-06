import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrgQrlContainerComponent } from '@app/components/org-qrl-container/org-qrl-container.component';
import { GameSocketService } from '@app/services/game-socket.service';
import { of } from 'rxjs';
import SpyObj = jasmine.SpyObj;

describe('OrgQrlContainerComponent', () => {
    let component: OrgQrlContainerComponent;
    let socketServiceSpy: SpyObj<GameSocketService>;
    let fixture: ComponentFixture<OrgQrlContainerComponent>;

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
        socketServiceSpy.onQRLText.and.returnValue(of({ username: 'username sample', text: 'text sample' }));
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
            declarations: [OrgQrlContainerComponent],
            providers: [{ provide: GameSocketService, useValue: socketServiceSpy }],
        }).compileComponents();
        fixture = TestBed.createComponent(OrgQrlContainerComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(OrgQrlContainerComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
