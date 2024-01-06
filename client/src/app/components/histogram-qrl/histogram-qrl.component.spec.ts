// Import necessary dependencies for testing
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HistogramQRLComponent } from './histogram-qrl.component';

describe('HistogramQRLComponent', () => {
    let component: HistogramQRLComponent;
    let fixture: ComponentFixture<HistogramQRLComponent>;

    // Set up the testing module before each test
    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [HistogramQRLComponent],
        });

        fixture = TestBed.createComponent(HistogramQRLComponent);
        component = fixture.componentInstance;
        component.widthActive = 0;
        component.widthUnactive = 0;
        component.playerStatusArray = [0, 0];
    });

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });
});
