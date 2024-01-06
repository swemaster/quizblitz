import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';

@Injectable()
export class SocketService {
    constructor(private socket: Socket) {}

    sendChat(message: string) {
        // emit sends event with the first parameter as its name and the second parameter as its body
        // TODO: in the future, events need to be listed in a separate file
        this.socket.emit('chat', message);
    }
    // returns an Observable bound to 'chat' event
    receiveChat() {
        return this.socket.fromEvent('chat');
    }
}
