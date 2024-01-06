import { Injectable } from '@angular/core';
import { Player } from '@app/interfaces/player.model';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class PlayerService {
    private nameObs$ = new BehaviorSubject<string>('');
    private roomObs$ = new BehaviorSubject<string>('');

    // https://stackoverflow.com/questions/57355066/how-to-implement-behavior-subject-using-service-in-angular-8
    setName(newName: string) {
        this.nameObs$.next(newName);
    }

    getName() {
        return this.nameObs$.getValue();
    }

    getNameObs() {
        return this.nameObs$.asObservable();
    }

    setRoom(newRoom: string) {
        this.roomObs$.next(newRoom);
    }

    getRoom() {
        return this.roomObs$.getValue();
    }

    getRoomObs() {
        return this.roomObs$.asObservable();
    }

    getHighestPoints(players: Player[]): number {
        const highestPointsPlayer = players.reduce((highest, current) => (current.points > highest.points ? current : highest), players[0]);
        return highestPointsPlayer.points;
    }
}
