import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatBarComponent } from './chat-bar.component';

describe('ChatBarComponent', () => {
    let component: ChatBarComponent;
    let fixture: ComponentFixture<ChatBarComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [ChatBarComponent],
        });
        fixture = TestBed.createComponent(ChatBarComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
