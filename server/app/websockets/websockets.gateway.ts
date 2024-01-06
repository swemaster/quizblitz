// TODO: Lint disabled for now due to too many lines, will have to separate into smaller files anyways
/* eslint-disable max-lines */
import { Match } from '@app/interfaces/match';
import { Message } from '@app/interfaces/message';
import { Player } from '@app/interfaces/player';
import { Selections } from '@app/interfaces/selections.model';
import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import {
    ACTIVE_STATUS,
    DEFAULT_PLAYER_LIST,
    DEFAULT_SELECTION,
    DEFAULT_STATUS,
    DISCONNECTED_STATUS,
    INITIAL_DEFAULT_VALUE,
    INTERVAL,
    TYPING_STATUS,
} from './websockets.constant';

@WebSocketGateway({
    cors: {
        origin: '*',
    },
})
@WebSocketGateway()
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer() server: Server;
    private users: number = 0;
    private matchList: Match[] = [];
    private ack: boolean = false;

    // receives an object like this { room: string; questions: Question[] }
    @SubscribeMessage('selections')
    async onSelections(_, selections: Selections) {
        this.ack = selections.acknowledged;
        const intervalId = setInterval(() => {
            if (this.ack) {
                clearInterval(intervalId);
            } else {
                this.server.in(selections.room).emit('selections', selections);
            }
        }, INTERVAL);
    }

    @SubscribeMessage('quitPlayer')
    async onQuitPlayer(client, userInfo: { username: string; accessCode: string }) {
        const { username, accessCode } = userInfo;
        client.leave(accessCode);
        client.to(accessCode.toString()).emit('playerQuit', username);
    }

    @SubscribeMessage('quitOrganisator')
    async onQuitOrganisator(client, userInfo: { username: string; accessCode: string }) {
        const { username, accessCode } = userInfo;
        client.leave(accessCode);
        client.to(accessCode.toString()).emit('OrganisatorQuit', username);
    }

    @SubscribeMessage('banPlayer')
    async onBanPlayer(client, userInfo: { username: string; accessCode: string }) {
        const { username, accessCode } = userInfo;
        client.to(accessCode.toString()).emit('playerBanned', username);
    }

    // Joining room for chat. Should not add player to match player list since it already does on joinGameRoom
    // Must be called each time a player enters the chat room
    @SubscribeMessage('joinRoom')
    async onJoinRoom(client, room: string) {
        client.join(room);
    }

    // Joining room for game. Should add player to match player list
    // Must be called each time a player enters a game.
    @SubscribeMessage('joinGameRoom')
    async joinGameRoom(client, response) {
        client.join(response.room);

        // If new player isn't the organizer, add as player
        if (response.name.toLowerCase() !== 'organisateur') {
            client.to(response.room).emit('newPlayer', response.name);
        }

        // Construct new player object with corresponding name and id
        const newPlayer: Player = {
            name: response.name,
            socketId: client.id,
            score: INITIAL_DEFAULT_VALUE,
            isFirstAmount: INITIAL_DEFAULT_VALUE,
            selection: DEFAULT_SELECTION,
            status: DEFAULT_STATUS,
            timeLeft: INITIAL_DEFAULT_VALUE,
            isCorrect: false,
        };
        newPlayer.name = response.name;
        newPlayer.socketId = client.id;

        // If match with room already exists, only add player to its player list
        if (this.foundMatchByRoom(response.room)) {
            this.foundMatchByRoom(response.room).playerList.push(newPlayer);
        } else {
            // Create new match with corresponding room, add player, and add room to match list
            const newMatch: Match = {
                playerList: DEFAULT_PLAYER_LIST(),
                timeDisplayed: INITIAL_DEFAULT_VALUE,
                roomId: response.room,
            };
            newMatch.playerList.push(newPlayer);
            this.matchList.push(newMatch);
        }
    }

    // Leaving chat room. Must be called when player quits the game (also leaves the chat)
    @SubscribeMessage('leaveRoom')
    async leaveRoom(client, room: string) {
        client.leave(room);
    }

    // Send chrono values to players. Only organizer can call this event
    @SubscribeMessage('chrono')
    async onChrono(client, value) {
        client.to(this.foundRoomBySocket(client.id)).emit('chronoReception', value);
    }

    // Starting the game event
    @SubscribeMessage('startGame')
    async onStartGame(client) {
        client.to(this.foundRoomBySocket(client.id)).emit('enterInGame');
    }

    // Going to result view event
    @SubscribeMessage('resultsView')
    async onGoToResultView(client, value) {
        client.to(this.foundRoomBySocket(client.id)).emit('goToResultsView', value);
    }

    @SubscribeMessage('orgQuitGame')
    async onOrgQuitGame(client) {
        const matchFound = this.foundMatchByRoom(this.foundRoomBySocket(client.id));

        let isLast = true;
        for (const player of matchFound.playerList) {
            if (player.socketId !== client.id && player.status !== DISCONNECTED_STATUS) {
                isLast = false;
            }
        }
        if (isLast) {
            client.leave(matchFound.roomId);
            this.matchList = this.matchList.filter((match) => match.roomId !== matchFound.roomId);
        } else {
            client.to(matchFound.roomId).emit('orderedToQuitTheGame');
            this.foundPlayerBySocket(client.id).status = DISCONNECTED_STATUS;
            client.leave(matchFound.roomId);
        }
    }

    // Event for when a normal player quits the game. Must not erase the game.
    @SubscribeMessage('playerQuitGame')
    async onPlayerQuitGame(client) {
        const matchRoom = this.foundRoomBySocket(client.id);
        const concernedMatch = this.foundMatchByRoom(matchRoom);

        let isLastPlayer = true;

        for (const player of concernedMatch.playerList) {
            if (player.socketId !== client.id && player.status !== DISCONNECTED_STATUS) {
                isLastPlayer = false;
            }
        }
        if (isLastPlayer) {
            client.leave(concernedMatch.roomId);
            this.matchList = this.matchList.filter((match) => match.roomId !== concernedMatch.roomId);
        } else {
            const playerLeft = this.foundPlayerBySocket(client.id);
            playerLeft.status = DISCONNECTED_STATUS;
            playerLeft.selection = [];
            client.to(this.foundOrganizerByRoom(matchRoom).socketId).emit('sendDataToOrg', concernedMatch.playerList);
            client.leave(concernedMatch.roomId);
        }
    }

    // Event that is emitted by org at the end of the timer. Used to automatically validate answers on the player's page
    @SubscribeMessage('askValidateQuestions')
    async onAskValidateQuestions(client) {
        const currentMatch = this.foundMatchByRoom(this.foundRoomBySocket(client.id));
        if (currentMatch) {
            for (const player of currentMatch.playerList) {
                if (!this.foundFasterPlayer(player.socketId, player.timeLeft)) {
                    client.to(player.socketId).emit('isFirst');
                }
            }
            client.to(this.foundRoomBySocket(client.id)).emit('validateQuestions');
        }
    }

    // Event triggered by org to ask players to pass to the next question
    @SubscribeMessage('nextQuestion')
    async onNextQuestion(client) {
        const currentMatch = this.foundMatchByRoom(this.foundRoomBySocket(client.id));
        this.resetPlayers(currentMatch);
        client.emit('sendDataToOrg', currentMatch.playerList);
        client.to(currentMatch.roomId).emit('goToNextQuestion');
    }
    @SubscribeMessage('panicState')
    async onPanicState(client) {
        const currentMatch = this.foundMatchByRoom(this.foundRoomBySocket(client.id));
        client.to(currentMatch.roomId).emit('playSound');
    }

    // Event triggered by player. Updates its response time and its status on the server.
    @SubscribeMessage('playerReadyQuestion')
    async onPlayerReadyQuestion(client, time: number) {
        const player = this.foundPlayerBySocket(client.id);
        player.timeLeft = time;
        if (time !== 0) {
            player.status = ACTIVE_STATUS;
        }
        const concernedMatch = this.foundMatchByRoom(this.foundRoomBySocket(client.id));
        client.to(this.foundOrganizerByRoom(concernedMatch.roomId).socketId).emit('sendDataToOrg', concernedMatch.playerList);
    }

    // Sends player selection to org each time a player selects a different choice
    @SubscribeMessage('sendPlayerSelection')
    async onSendPlayerSelection(client, newSelection: number[]) {
        const concernedPlayer = this.foundPlayerBySocket(client.id);
        concernedPlayer.status = TYPING_STATUS;
        if (concernedPlayer) {
            concernedPlayer.selection = newSelection;
            const matchRoom = this.foundRoomBySocket(client.id);
            const concernedMatch = this.foundMatchByRoom(matchRoom);
            client.to(this.foundOrganizerByRoom(matchRoom).socketId).emit('sendDataToOrg', concernedMatch.playerList);
        }
    }

    // Sends player score when question validation is asked by the organizer
    @SubscribeMessage('sendPlayerScore')
    async onSendPlayerScore(client, eventData: { score: string; bonuses: number }) {
        const concernedPlayer = this.foundPlayerBySocket(client.id);
        if (concernedPlayer) {
            concernedPlayer.score = Number(eventData.score);
            concernedPlayer.isFirstAmount = eventData.bonuses;
            const matchRoom = this.foundRoomBySocket(client.id);
            const concernedMatch = this.foundMatchByRoom(matchRoom);
            client.to(this.foundOrganizerByRoom(matchRoom).socketId).emit('sendDataToOrg', concernedMatch.playerList);
        }
    }

    @SubscribeMessage('chat')
    async onChat(client, message: Message) {
        client.broadcast.to(message.room).emit('chat', message);
    }

    // Initial event to ask for player data, otherwise player status is not shown at org page construction
    @SubscribeMessage('askForPlayerData')
    async onAskForPlayerData(client) {
        const concernedMatch = this.foundMatchByRoom(this.foundRoomBySocket(client.id));
        client.emit('sendDataToOrg', concernedMatch.playerList);
    }
    @SubscribeMessage('sendBannedChatName')
    async onSendBannedChatName(client, eventData: { playerName: string; isBannedChat: boolean }) {
        const concernedMatch = this.foundMatchByRoom(this.foundRoomBySocket(client.id));
        const playerSocketId = this.foundPlayerByNameInMatch(eventData[0].playerName, concernedMatch);
        client.to(playerSocketId).emit('receiveBannedChatName');
    }

    @SubscribeMessage('textQRLSent')
    async onQRLPlayerText(client, text: string) {
        const concernedPlayer = this.foundPlayerBySocket(client.id);
        if (concernedPlayer) {
            const matchRoom = this.foundRoomBySocket(client.id);
            const username = concernedPlayer.name;
            client.to(this.foundOrganizerByRoom(matchRoom).socketId).emit('sendQRLToOrg', { username, text });
        }
    }

    @SubscribeMessage('sendMultiplierToPlayer')
    async onSendMultiplierToPlayer(client, results: { name: string; scoreMultiplier: number }[]) {
        const concernedMatch = this.foundMatchByRoom(this.foundRoomBySocket(client.id));
        for (const data of results) {
            client.to(this.foundPlayerByNameInMatch(data.name, concernedMatch)).emit('receiveMultiplier', data.scoreMultiplier);
        }
    }

    @SubscribeMessage('sendIsCorrect')
    async onSendIsCorrect(client, isCorrect: boolean) {
        const concernedPlayer = this.foundPlayerBySocket(client.id);
        concernedPlayer.isCorrect = isCorrect;
    }

    async handleConnection() {
        this.server.emit('users', ++this.users);
    }

    async handleDisconnect() {
        this.server.emit('users', --this.users);
    }

    foundPlayerByNameInMatch(playerName: string, match: Match) {
        for (const player of match.playerList) {
            if (player.name === playerName) {
                return player.socketId;
            }
        }
    }

    onModuleInit() {
        // Perform any initialization tasks for the WebSocket server here
        if (!this.server) {
            throw new Error('WebSocket server is not initialized.');
        }
    }

    foundPlayerBySocket(socketId: string) {
        for (const match of this.matchList) {
            const searchedPlayer = match.playerList.find((player) => player.socketId === socketId);
            if (searchedPlayer) {
                return searchedPlayer;
            }
        }
    }

    foundMatchByRoom(searchedRoom: string) {
        return this.matchList.find((match) => match.roomId === searchedRoom);
    }

    foundOrganizerByRoom(searchedRoom: string) {
        const match = this.foundMatchByRoom(searchedRoom);
        return match.playerList.find((player) => player.name === 'Organisateur');
    }

    foundRoomBySocket(socketId: string) {
        for (const match of this.matchList) {
            const searchedPlayer = match.playerList.find((player) => player.socketId === socketId);
            if (searchedPlayer) {
                return match.roomId;
            }
        }
    }

    foundFasterPlayer(socketId: string, time: number) {
        const match = this.foundMatchByRoom(this.foundRoomBySocket(socketId));
        for (const player of match.playerList) {
            if (player.socketId === socketId) {
                continue;
            }
            if (player.timeLeft >= time) {
                return player;
            }
        }
        return undefined;
    }

    resetPlayers(match: Match) {
        for (const player of match.playerList) {
            if (player.status !== DISCONNECTED_STATUS) {
                player.selection = [];
                player.status = DEFAULT_STATUS;
                player.isCorrect = false;
            }
        }
    }

    // For test file purposes
    setMatchList(newMatchList: Match[]) {
        this.matchList = newMatchList;
    }

    // For test file purposes
    getMatchList() {
        return this.matchList;
    }
}
