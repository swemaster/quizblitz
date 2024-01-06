import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { HistogramQCMComponent } from '@app/components/histogram-qcm/histogram-qcm.component';
import { HistogramSwitcherComponent } from '@app/components/histogram-switcher/histogram-switcher.component';
import { EditQuestionQCMComponent } from '@app/components/question/qcm/edit-question-qcm.component';
import { StatsComponent } from '@app/components/stats/stats.component';
import { Question } from '@app/interfaces/game.model';
import { ChatService } from '@app/services/chat.service';
import { GameSocketService } from '@app/services/game-socket.service';
import { of } from 'rxjs';
import SpyObj = jasmine.SpyObj;

describe('HistogramComponent', () => {
    let component: HistogramQCMComponent;
    let fixture: ComponentFixture<HistogramQCMComponent>;
    let socketServiceSpy: SpyObj<GameSocketService>;
    const mockQuestion: Question = {
        id: 'q1',
        type: 'QCM',
        text: 'Q',
        points: 20,
        choices: [
            { text: 'C1', isCorrect: false },
            { text: 'C2', isCorrect: false },
            { text: 'C3', isCorrect: true },
            { text: 'C4', isCorrect: false },
        ],
        textZone: '',
        selections: [],
    };
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

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [HistogramQCMComponent, StatsComponent, HistogramSwitcherComponent],
            providers: [StatsComponent, EditQuestionQCMComponent, { provide: GameSocketService, useValue: socketServiceSpy }, ChatService],
        });
        fixture = TestBed.createComponent(HistogramQCMComponent);
        component = fixture.componentInstance;
        component.question = { ...mockQuestion };
        component.data = [10, 20, 30, 40];
        component.maxValue = 40;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
    it('should adjust the font in relation to the bar size to fit so that a choice half the size in data is half the font size', () => {
        let value = 20;
        const halfFont = component.calculateFontSize(value);
        value = 40;
        const Font = component.calculateFontSize(value);
        expect(halfFont).toBe(Font * 0.5);
    });
    it('should take the color of the right and wrong answers of the question', () => {
        fixture.detectChanges();
        const bars = fixture.debugElement.queryAll(By.css('.bar'));
        expect(bars[0].nativeElement.style.backgroundColor).toBe('rgb(196, 2, 2)');
        expect(bars[1].nativeElement.style.backgroundColor).toBe('rgb(196, 2, 2)');
        expect(bars[2].nativeElement.style.backgroundColor).toBe('rgb(17, 224, 52)');
        expect(bars[3].nativeElement.style.backgroundColor).toBe('rgb(196, 2, 2)');
    });
    it('should display the number of the players selections', () => {
        fixture.detectChanges();
        const divElements = fixture.debugElement.queryAll(By.css('.bar-value'));

        expect(divElements[0].nativeElement.textContent).toBe(' 10 ');
        expect(divElements[1].nativeElement.textContent).toBe(' 20 ');
        expect(divElements[2].nativeElement.textContent).toBe(' 30 ');
        expect(divElements[3].nativeElement.textContent).toBe(' 40 ');
    });
    it('should update histogram when player adds their selection', () => {
        fixture.detectChanges();
        const bars = fixture.debugElement.queryAll(By.css('.bar'));
        expect(bars[0].nativeElement.style.width).toBe('25%');
        expect(bars[1].nativeElement.style.width).toBe('50%');
        expect(bars[2].nativeElement.style.width).toBe('75%');
        expect(bars[3].nativeElement.style.width).toBe('100%');
        component.data[0] += 10;
        fixture.detectChanges();
        const newBars = fixture.debugElement.queryAll(By.css('.bar'));
        expect(component.data).toEqual([20, 20, 30, 40]);
        expect(newBars[0].nativeElement.style.width).toBe('50%');
        expect(newBars[1].nativeElement.style.width).toBe('50%');
        expect(newBars[2].nativeElement.style.width).toBe('75%');
        expect(newBars[3].nativeElement.style.width).toBe('100%');
    });
});
