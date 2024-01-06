import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScorerComponent } from './scorer.component';

describe('ScorerComponent', () => {
    let component: ScorerComponent;
    let fixture: ComponentFixture<ScorerComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [ScorerComponent],
        });
        fixture = TestBed.createComponent(ScorerComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
