import { Injectable } from '@angular/core';
import { Match } from '@app/interfaces/match.model';
import { PlayerServer } from '@app/interfaces/player.server.model';
import { Socket } from 'ngx-socket-io';
import { Observable } from 'rxjs';

@Injectable()
export class GameSocketService {
    socketId: string;
    constructor(private socket: Socket) {
        if (this.socket.ioSocket) {
            this.socket.ioSocket.reconnection = true;
        }
    }

    disconnect() {
        this.socket.disconnect();
    }

    setReady() {
        this.socket.emit('playerReady');
    }

    sendChronoValues(value: number) {
        this.socket.emit('chrono', value);
    }
    receiveChronoValues() {
        return this.socket.fromEvent<number>('chronoReception');
    }

    // signal send by the organisator to send players to results view
    sendToResultView(match: Match) {
        this.socket.emit('resultsView', match);
    }

    joinRoom(userInfo: { username: string; accessCode: string }) {
        this.socket.emit('joinRoom', userInfo);
    }

    banPlayer(userInfo: { username: string; accessCode: string }) {
        this.socket.emit('banPlayer', userInfo);
    }

    quitOrganisator(userInfo: { username: string; accessCode: string }) {
        this.socket.emit('quitOrganisator', userInfo);
        this.socket.disconnect();
        this.socket.connect();
    }

    onOrganisatorQuit() {
        return this.socket.fromEvent<string>('OrganisatorQuit');
    }

    quitPlayer(userInfo: { username: string; accessCode: string }) {
        this.socket.emit('quitPlayer', userInfo);
        this.socket.disconnect();
        this.socket.connect();
    }

    joinGameRoom(userRoom: string, userName: string) {
        this.socket.emit('joinGameRoom', { room: userRoom, name: userName });
    }

    goToResultView() {
        return this.socket.fromEvent<Match>('goToResultsView');
    }

    orgQuitGame() {
        this.socket.emit('orgQuitGame');
        this.socket.disconnect();
        this.socket.connect();
    }

    playerQuitGame() {
        this.socket.emit('playerQuitGame');
        this.socket.disconnect();
        this.socket.connect();
    }

    orderedToQuitTheGame() {
        return this.socket.fromEvent('orderedToQuitTheGame');
    }

    playerNextQuestion() {
        return this.socket.fromEvent('goToNextQuestion');
    }
    onPanic() {
        return this.socket.fromEvent('playSound');
    }

    panic() {
        this.socket.emit('panicState');
    }

    orgNextQuestion() {
        this.socket.emit('nextQuestion');
    }

    orgValidateQuestions() {
        this.socket.emit('askValidateQuestions');
    }

    playerValidateQuestions() {
        return this.socket.fromEvent('validateQuestions');
    }

    onNewPlayer() {
        return this.socket.fromEvent<string>('newPlayer');
    }

    onPlayerQuit() {
        return this.socket.fromEvent<string>('playerQuit');
    }

    onPlayerBanned() {
        return this.socket.fromEvent<string>('playerBanned');
    }

    playerReadyQuestion(timeLeft: number) {
        this.socket.emit('playerReadyQuestion', timeLeft);
    }

    isFirst() {
        return this.socket.fromEvent('isFirst');
    }

    sendPlayerSelection(selection: number[]) {
        this.socket.emit('sendPlayerSelection', selection);
    }

    sendPlayerScore(eventData: { score: string; bonuses: number }) {
        this.socket.emit('sendPlayerScore', eventData);
    }

    startGame() {
        this.socket.emit('startGame');
    }

    enterInGame() {
        return this.socket.fromEvent('enterInGame');
    }

    receivePlayerData() {
        return this.socket.fromEvent('sendDataToOrg') as Observable<PlayerServer[]>;
    }

    askForPlayerData() {
        this.socket.emit('askForPlayerData');
    }

    sendBannedChatName(eventData: { playerName: string; isBannedChat: { [name: string]: boolean } }) {
        const updatedStatus = eventData.isBannedChat[eventData.playerName];
        this.socket.emit('sendBannedChatName', eventData, updatedStatus);
    }

    receiveBannedChatName() {
        return this.socket.fromEvent('receiveBannedChatName');
    }

    sendQRLText(textQRL: string) {
        this.socket.emit('textQRLSent', textQRL);
    }

    onQRLText() {
        return this.socket.fromEvent<{ username: string; text: string }>('sendQRLToOrg');
    }

    sendMultiplierToPlayer(results: { name: string; scoreMultiplier: number }[]) {
        this.socket.emit('sendMultiplierToPlayer', results);
    }

    receiveMultiplier() {
        return this.socket.fromEvent<number>('receiveMultiplier');
    }

    sendIsCorrect(isCorrect: boolean) {
        this.socket.emit('sendIsCorrect', isCorrect);
    }
}
