import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { HistogramQRLResultsComponent } from '@app/components/histogram-qrl-results/histogram-qrl-results.component';
import { HistogramSwitcherComponent } from '@app/components/histogram-switcher/histogram-switcher.component';
import { EditQuestionQCMComponent } from '@app/components/question/qcm/edit-question-qcm.component';
import { StatsComponent } from '@app/components/stats/stats.component';
import { Question } from '@app/interfaces/game.model';

describe('HistogramComponentQRLResults', () => {
    let component: HistogramQRLResultsComponent;
    let fixture: ComponentFixture<HistogramQRLResultsComponent>;
    const mockQuestion: Question = {
        id: 'q1',
        type: 'QRL',
        text: 'Q',
        points: 20,
        choices: [],
        textZone: '',
        selections: [],
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [HistogramQRLResultsComponent, StatsComponent, HistogramSwitcherComponent],
            providers: [StatsComponent, EditQuestionQCMComponent],
        });
        fixture = TestBed.createComponent(HistogramQRLResultsComponent);
        component = fixture.componentInstance;
        component.question = { ...mockQuestion };
        component.question.selections = [10, 20, 40];
        component.maxValue = 40;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should display the number of the players selections', () => {
        fixture.detectChanges();
        const divElements = fixture.debugElement.queryAll(By.css('.bar-value'));

        expect(divElements[0].nativeElement.textContent).toBe(' 10 ');
        expect(divElements[1].nativeElement.textContent).toBe(' 20 ');
        expect(divElements[2].nativeElement.textContent).toBe(' 40 ');
    });

    it('should update histogram when player adds their selection', () => {
        fixture.detectChanges();
        const bars = fixture.debugElement.queryAll(By.css('.bar-b'));
        expect(bars[0].nativeElement.style.width).toBe('25%');
        expect(bars[1].nativeElement.style.width).toBe('50%');
        expect(bars[2].nativeElement.style.width).toBe('100%');
        component.question.selections[0] += 10;
        fixture.detectChanges();
        const newBars = fixture.debugElement.queryAll(By.css('.bar-b'));
        expect(component.question.selections).toEqual([20, 20, 40]);
        expect(newBars[0].nativeElement.style.width).toBe('50%');
        expect(newBars[1].nativeElement.style.width).toBe('50%');
        expect(newBars[2].nativeElement.style.width).toBe('100%');
    });
    it('should update maximum value to scale histogram', () => {
        fixture.detectChanges();
        const bars = fixture.debugElement.queryAll(By.css('.bar-b'));
        expect(bars[0].nativeElement.style.width).toBe('25%');
        expect(bars[1].nativeElement.style.width).toBe('50%');
        expect(bars[2].nativeElement.style.width).toBe('100%');
        component.question.selections[2] += 10;
        component.calculateMaximum();
        fixture.detectChanges();
        const newBars = fixture.debugElement.queryAll(By.css('.bar-b'));
        expect(component.question.selections).toEqual([10, 20, 50]);
        expect(newBars[0].nativeElement.style.width).toBe('20%');
        expect(newBars[1].nativeElement.style.width).toBe('40%');
        expect(newBars[2].nativeElement.style.width).toBe('100%');
    });
});
