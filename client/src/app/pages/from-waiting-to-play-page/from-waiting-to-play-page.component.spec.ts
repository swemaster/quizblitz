import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NavbarComponent } from '@app/components/navbar/navbar.component';
import { TimerComponent } from '@app/components/timer/timer.component';
import { GameSocketService } from '@app/services/game-socket.service';
import { of } from 'rxjs';
import { FromWaitingToPlayPageComponent } from './from-waiting-to-play-page.component';
import SpyObj = jasmine.SpyObj;

describe('FromWaitingToPlayComponent', () => {
    let component: FromWaitingToPlayPageComponent;
    let fixture: ComponentFixture<FromWaitingToPlayPageComponent>;
    let socketServiceSpy: SpyObj<GameSocketService>;

    beforeEach(async () => {
        socketServiceSpy = jasmine.createSpyObj('SocketExampleService', ['setReady', 'sendChronoValues', 'receiveChronoValues', 'joinGameRoom']);
        socketServiceSpy.setReady.and.returnValue();
        socketServiceSpy.sendChronoValues.and.returnValue();
        socketServiceSpy.receiveChronoValues.and.returnValue(of(10));
        socketServiceSpy.joinGameRoom.and.returnValue();
        await TestBed.configureTestingModule({
            declarations: [FromWaitingToPlayPageComponent, NavbarComponent, TimerComponent],
            providers: [{ provide: GameSocketService, useValue: socketServiceSpy }],
        }).compileComponents();
        fixture = TestBed.createComponent(FromWaitingToPlayPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
