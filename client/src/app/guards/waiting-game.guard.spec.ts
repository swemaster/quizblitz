import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { waitingGameGuard } from './waiting-game.guard';

describe('waitingGameGuard', () => {
    const executeGuard: CanActivateFn = (...guardParameters) => TestBed.runInInjectionContext(() => waitingGameGuard(...guardParameters));

    beforeEach(() => {
        TestBed.configureTestingModule({});
    });

    it('should be created', () => {
        expect(executeGuard).toBeTruthy();
    });
});
