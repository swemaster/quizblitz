import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { MainPageComponent } from '@app/pages/main-page/main-page.component';
import { MATCH_BASE, MOCK_SELECTIONS } from '@app/pages/page.constant';
import { ResultPageComponent } from '@app/pages/result-page/result-page.component';
import { ChatService } from '@app/services/chat.service';
import { CommunicationService } from '@app/services/communication.service';
import { GameSocketService } from '@app/services/game-socket.service';
import { InGameService } from '@app/services/in-game.service';
import { of } from 'rxjs';
import SpyObj = jasmine.SpyObj;

describe('ResultPageComponent', () => {
    let router: Router;
    let component: ResultPageComponent;
    let fixture: ComponentFixture<ResultPageComponent>;
    let socketServiceSpy: SpyObj<GameSocketService>;
    let chatServiceSpy: SpyObj<ChatService>;
    let communicationServiceSpy: SpyObj<CommunicationService>;
    let inGameServiceSpy: InGameService;

    beforeEach(() => {
        inGameServiceSpy = jasmine.createSpyObj('inGameServiceSpy', ['getMatch', 'getCurrentPoints']);

        communicationServiceSpy = jasmine.createSpyObj('communicationServiceSpy', ['matchPost']);

        inGameServiceSpy = jasmine.createSpyObj('inGameServiceSpy',
            [
                'getMatch',
                'getCurrentPoints',
            ]);

        communicationServiceSpy = jasmine.createSpyObj('communicationServiceSpy',
            [
                'matchPost',
            ]);

        chatServiceSpy = jasmine.createSpyObj('chatSpy', [
            'removeApiSuffix',
            'joinRoom',
            'leaveRoom',
            'sendMessage',
            'receiveChat',
            'sendSelections',
            'getSelectionsObs',
        ]);
        socketServiceSpy = jasmine.createSpyObj('SocketExampleService', [
            'setReady',
            'sendChronoValues',
            'receiveChronoValues',
            'sendToResultView',
            'joinRoom',
            'goToResultView',
            'playerQuitGame',
            'orderedToQuitTheGame',
        ]);
        socketServiceSpy.setReady.and.returnValue();
        socketServiceSpy.sendChronoValues.and.returnValue();
        socketServiceSpy.receiveChronoValues.and.returnValue(of(10));
        socketServiceSpy.sendToResultView.and.returnValue();
        socketServiceSpy.joinRoom.and.returnValue();
        socketServiceSpy.goToResultView.and.returnValue(of());
        socketServiceSpy.playerQuitGame.and.returnValue();
        socketServiceSpy.orderedToQuitTheGame.and.returnValue(of('Value'));

        // inGameServiceSpy.getMatch.and.returnValue(of());

        chatServiceSpy.getSelectionsObs.and.returnValue(of());

        const match = {
            players: [], // Provide the desired value for match.players here
        };

        TestBed.configureTestingModule({
            declarations: [ResultPageComponent],
            providers: [
                { provide: GameSocketService, useValue: socketServiceSpy },
                { provide: ChatService, useValue: chatServiceSpy },
                { provide: CommunicationService, useValue: communicationServiceSpy },
                { provide: 'match', useValue: match }, // Provide the mock match object
            ],
            imports: [RouterTestingModule.withRoutes([{ path: 'home', component: MainPageComponent }]), HttpClientModule],
        }).compileComponents(); // Add this line to fix the error

        fixture = TestBed.createComponent(ResultPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();

        router = TestBed.inject(Router);
        router.initialNavigation();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('quitting should redirect to /homePage', () => {
        const spy1 = spyOn(router, 'navigateByUrl');
        component.quitGame();
        expect(spy1).toHaveBeenCalledWith('/home');
    });

    it('should update the match when inGameService.getMatch emits a value', () => {
        component.ngOnInit();
        inGameServiceSpy.getMatch;

        expect(component.match).toEqual(MATCH_BASE);
    });

    // if valid seelctions are provided by getSelectionsObs, then acknowledgeSelections should be called
    it('should call acknowledgeSelections if valid selections are provided', () => {
        const spy1 = spyOn(component.selectionsService, 'acknowledgeSelections');
        chatServiceSpy.getSelectionsObs.and.returnValue(of(MOCK_SELECTIONS));
        component.ngOnInit();
        expect(spy1).toHaveBeenCalled();
    });

    // if inGameService.getMatch observer is triggered and match is not undefined, then this.match should change to the observed match
    it('should update the match when inGameService.getMatch emits a value', () => {
        component.ngOnInit();
        inGameServiceSpy.getMatch;

        expect(component.match).toEqual(MATCH_BASE);
    });
});
