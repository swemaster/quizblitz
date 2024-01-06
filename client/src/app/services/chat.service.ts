import { Injectable } from '@angular/core';
import { Message } from '@app/interfaces/message';
import { Selections } from '@app/interfaces/selections.model';
import { API, API_LENGTH, EMPTY_STRING, PLAYER_NAME } from '@app/pages/page.constant';
import { environment } from '@src/environments/environment';
import { Socket } from 'ngx-socket-io';
import { Observable } from 'rxjs';

@Injectable()
export class ChatService {
    messages: Message[] = [];

    date: Date = new Date();
    name = PLAYER_NAME;
    room = EMPTY_STRING;
    message = EMPTY_STRING;

    url = this.removeApiSuffix(environment.serverUrl);
    socket: Socket;

    constructor() {
        this.socket = new Socket({ url: this.url });
    }

    removeApiSuffix(str: string) {
        if (str.endsWith(API)) {
            return str.slice(0, -API_LENGTH);
        } else {
            return str;
        }
    }

    joinRoom(room: string) {
        this.socket.emit('joinRoom', room);
    }

    leaveRoom(room: string) {
        this.socket.emit('leaveRoom', room);
    }

    sendMessage(message: Message) {
        this.socket.emit('chat', message);
    }

    // The receiveChat method is creating and returning an Observable
    // that emits a value whenever a 'chat' event is received from the server.
    receiveChat(): Observable<Message> {
        return new Observable((observer) => {
            this.socket.on('chat', (message: Message) => {
                observer.next(message);
            });
        });
    }

    // send an array of questions to the server
    sendSelections(selections: Selections) {
        this.socket.emit('selections', selections);
    }

    getSelectionsObs(): Observable<Selections> {
        return new Observable((observer) => {
            this.socket.on('selections', (selections: Selections) => {
                observer.next(selections);
            });
        });
    }
}
