import { TestBed } from '@angular/core/testing';
import { Player } from '@app/interfaces/player.model';
import { PlayerService } from './player.service';

describe('PlayerService', () => {
    let service: PlayerService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(PlayerService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should set and get the player name', () => {
        const newName = 'John Doe';
        service.setName(newName);
        expect(service.getName()).toEqual(newName);
    });

    it('should set and get the player room', () => {
        const newRoom = 'Room 1';
        service.setRoom(newRoom);
        expect(service.getRoom()).toEqual(newRoom);
    });

    it('should emit the new name to subscribers', () => {
        const newName = 'John Doe';
        let emittedName = '';
        service.getNameObs().subscribe((name) => {
            emittedName = name;
        });
        service.setName(newName);
        expect(emittedName).toEqual(newName);
    });

    it('should emit the new room to subscribers', () => {
        const newRoom = 'Room 1';
        let emittedRoom = '';
        service.getRoomObs().subscribe((room) => {
            emittedRoom = room;
        });
        service.setRoom(newRoom);
        expect(emittedRoom).toEqual(newRoom);
    });

    it('should return the highest points from an array of players', () => {
        const players: Player[] = [
            { name: 'Player 1', points: 100, status: 'active', selection: [1, 2, 3], bonuses: 10 },
            { name: 'Player 2', points: 80, status: 'active', selection: [4, 5, 6], bonuses: 0 },
            { name: 'Player 3', points: 120, status: 'active', selection: [7, 8, 9], bonuses: 5 },
        ];
        const highestPoints = service.getHighestPoints(players);
        expect(highestPoints).toEqual(120);
    });
});
