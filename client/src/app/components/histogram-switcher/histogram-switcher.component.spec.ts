import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HistogramQRLResultsComponent } from '@app/components/histogram-qrl-results/histogram-qrl-results.component';
import { HistogramSwitcherComponent } from '@app/components/histogram-switcher/histogram-switcher.component';
import { EditQuestionQCMComponent } from '@app/components/question/qcm/edit-question-qcm.component';
import { StatsComponent } from '@app/components/stats/stats.component';
import { GAME_START } from '@app/pages/page.constant';

describe('HistogramSwitcherComponent', () => {
    let component: HistogramSwitcherComponent;
    let fixture: ComponentFixture<HistogramSwitcherComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [HistogramSwitcherComponent, StatsComponent, HistogramQRLResultsComponent],
            providers: [StatsComponent, EditQuestionQCMComponent],
        });
        fixture = TestBed.createComponent(HistogramSwitcherComponent);
        component = fixture.componentInstance;
        component.game = GAME_START;

        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    //needs to be included with histogram switcher tests, similar to test in stats component to trigger ngOnChanges needs test in parent
    it('should call ngOnChanges in HistogramQRLResultsComponent and transfer data', async () => {
        const histogramComponent = component.histogramQRLResultsComponents;
        expect(histogramComponent).toBeDefined();
        component.game.questions[1].selections = [0, 0, 1];

        expect(histogramComponent.toArray()[0].question.selections).toEqual([0, 0, 1]);

        component.game.questions[1].selections = [0, 0, 2];

        expect(histogramComponent.toArray()[0].question.selections).toEqual([0, 0, 2]);

        component.game.questions[1].selections = [];
    });

    it('should go to previous question when button is pressed and previous question exists', () => {
        const initialIndex = 1;
        component.currentIndex = initialIndex;
        const initialQuestion = component.game.questions[initialIndex];
        component.previous();
        expect(component.currentIndex).toBe(initialIndex - 1);
        expect(component.game.questions[component.currentIndex]).not.toBe(initialQuestion);
    });
    it('should not go to previous question when button is pressed current question is the first', () => {
        const initialIndex = 0;
        component.currentIndex = initialIndex;
        const initialQuestion = component.game.questions[initialIndex];
        component.previous();
        expect(component.currentIndex).toBe(initialIndex);
        expect(component.game.questions[component.currentIndex]).toBe(initialQuestion);
    });
    it('should go to next question when button is pressed and next question exists', () => {
        const initialIndex = 0;
        component.currentIndex = initialIndex;
        const initialQuestion = component.game.questions[initialIndex];
        component.next();
        expect(component.currentIndex).toBe(initialIndex + 1);
        expect(component.game.questions[component.currentIndex]).not.toBe(initialQuestion);
    });
    it('should not go to next question when button is pressed current question is the first', () => {
        const initialIndex = 1;
        component.currentIndex = initialIndex;
        const initialQuestion = component.game.questions[initialIndex];
        component.next();
        expect(component.currentIndex).toBe(initialIndex);
        expect(component.game.questions[component.currentIndex]).toBe(initialQuestion);
    });
});
