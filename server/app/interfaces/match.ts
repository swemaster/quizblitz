import { Player } from '@app/interfaces/player';

export interface Match {
    playerList: Player[];
    timeDisplayed: number;
    roomId: string;
}
