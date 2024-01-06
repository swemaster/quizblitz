import { TestBed } from '@angular/core/testing';

import { Player } from '@app/interfaces/player.model';
import { WaitingViewService } from './waiting-view.service';

describe('WaitingViewService', () => {
    let service: WaitingViewService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(WaitingViewService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should generate a valid access code', () => {
        const accessCode = service.generateAccessCode();
        expect(accessCode).toBeTruthy();
        expect(accessCode).toBeGreaterThan(1000);
        expect(accessCode).toBeLessThan(9999);
    });

    it('should add a player to the match', () => {
        const player: Player = { name: 'TestPlayer', points: 0, status: 'active', selection: [], bonuses: 0 };
        service.addPlayer(player);
        expect(service.match.players).toContain(player);
    });

    it('should return the correct access code', () => {
        const expectedAccessCode = '1234';
        service.match.accessCode = expectedAccessCode;
        const result = service.getAccessCode();
        expect(result).toEqual(expectedAccessCode);
    });
});
