import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WaitingAnswerTransitionComponent } from './waiting-answer-transition.component';

describe('WaitingAnswerTransitionComponent', () => {
  let component: WaitingAnswerTransitionComponent;
  let fixture: ComponentFixture<WaitingAnswerTransitionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [WaitingAnswerTransitionComponent]
    });
    fixture = TestBed.createComponent(WaitingAnswerTransitionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
