import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject } from '@angular/core';
import { Player } from '@app/interfaces/player.model';
import { GameSocketService } from '@app/services/game-socket.service';
@Component({
    selector: 'app-player-list',
    templateUrl: './player-list.component.html',
    styleUrls: ['./player-list.component.scss'],
})
export class PlayerListComponent implements OnChanges {
    @Input() players: Player[];
    @Input() showBonus: boolean = false;
    @Output() bannedChatToggle = new EventEmitter<{ playerName: string; isBannedChat: boolean }>();
    isBannedChat: { [name: string]: boolean } = {};
    socketService = inject(GameSocketService);
    compareByScoreAscendant(a: Player, b: Player): number {
        if (a.points === b.points) {
            return a.name.localeCompare(b.name);
        }
        return a.points - b.points;
    }
    compareByScoreDescendant(a: Player, b: Player): number {
        if (a.points === b.points) {
            return a.name.localeCompare(b.name);
        }
        return b.points - a.points;
    }
    compareByStatusAscendant(a: Player, b: Player): number {
        if (a.status === b.status) {
            return a.name.localeCompare(b.name);
        }
        return a.status.localeCompare(b.status);
    }
    compareByStatusDescendant(a: Player, b: Player): number {
        if (a.status === b.status) {
            return a.name.localeCompare(b.name);
        }
        return a.status.localeCompare(b.status);
    }
    compareByNameAscendant(a: Player, b: Player): number {
        return a.name.localeCompare(b.name);
    }
    compareByNameDescendant(a: Player, b: Player): number {
        return b.name.localeCompare(a.name);
    }
    onOrderTypeChange(event: Event): void {
        const selectedOption = (event.target as HTMLSelectElement).value;
        this.sortPlayers(selectedOption);
    }
    sortPlayers(sortOption: string): void {
        let sortingFunction: (a: Player, b: Player) => number;
        switch (sortOption) {
            case 'name-ascendant':
                sortingFunction = this.compareByNameAscendant;
                break;
            case 'points-ascendant':
                sortingFunction = this.compareByScoreAscendant;
                break;
            case 'status-ascendant':
                sortingFunction = this.compareByStatusAscendant;
                break;
            case 'name-descendant':
                sortingFunction = this.compareByNameDescendant;
                break;
            case 'points-descendant':
                sortingFunction = this.compareByScoreDescendant;
                break;
            case 'status-descendant':
                sortingFunction = this.compareByStatusDescendant;
                break;
            default:
                sortingFunction = this.compareByScoreAscendant;
        }
        this.orderList(sortingFunction);
    }
    toggleBannedChat(playerName: string) {
        this.isBannedChat[playerName] = !this.isBannedChat[playerName];
        this.socketService.sendBannedChatName({ playerName, isBannedChat: this.isBannedChat });
    }
    orderList(sortingFunction: (a: Player, b: Player) => number): void {
        this.players.sort(sortingFunction);
    }
    ngOnChanges(changes: SimpleChanges) {
        if (changes.match) {
            const selectedOption = (document.querySelector('.order-select') as HTMLSelectElement).value;
            this.sortPlayers(selectedOption);
        }
    }
}
