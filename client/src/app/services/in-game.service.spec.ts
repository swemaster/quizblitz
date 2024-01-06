/* eslint-disable @typescript-eslint/no-magic-numbers */
import { TestBed } from '@angular/core/testing';

import { InGameService } from './in-game.service';

describe('InGameService', () => {
    let service: InGameService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(InGameService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should increase current question index correctly', () => {
        service.increaseCurrentQuestionIndex();
        expect(service.getCurrentQuestionIndex()).toEqual(1);
    });

    it('should decrease current question index correctly', () => {
        service.decreaseCurrentQuestionIndex();
        expect(service.getCurrentQuestionIndex()).toEqual(-1);
    });

    it('should update score correctly', () => {
        service.updateScore(40);
        expect(service.getCurrentPoints()).toEqual(40);
    });
});
