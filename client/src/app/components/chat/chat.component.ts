import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { Message } from '@app/interfaces/message';
import { EMPTY_STRING, MESSAGE_LIMIT, PLAYER_NAME, TIME_FORMAT } from '@app/pages/page.constant';
import { ChatService } from '@app/services/chat.service';
import { GameSocketService } from '@app/services/game-socket.service';
import { PlayerService } from '@app/services/player.service';
import { Subscription } from 'rxjs';
@Component({
    selector: 'app-chat',
    templateUrl: './chat.component.html',
    styleUrls: ['./chat.component.scss'],
})
export class ChatComponent implements OnInit, OnDestroy {
    isAllowedToChat: boolean = true;
    private subscriptions: Subscription[] = [];

    constructor(
        public chatService: ChatService,
        private playerService: PlayerService,
        private gameSocketService: GameSocketService,
    ) {}

    @HostListener('window:beforeunload', ['$event'])
    beforeUnloadHandler(): void {
        this.chatService.leaveRoom(this.chatService.room);
    }

    ngOnInit() {
        this.chatService.date = new Date();
        this.subscriptions.push(
            this.chatService.receiveChat().subscribe((message: Message) => {
                this.chatService.messages.push(message as Message);
            }),
            this.gameSocketService.receiveBannedChatName().subscribe(() => {
                this.isAllowedToChat = !this.isAllowedToChat;
            }),
            this.playerService.getNameObs().subscribe((name) => {
                if (name !== EMPTY_STRING) {
                    this.chatService.name = name;
                }
            }),
            this.playerService.getRoomObs().subscribe((room) => {
                // Leave the current room and join the new one
                if (this.chatService.room !== EMPTY_STRING) {
                    this.chatService.leaveRoom(this.chatService.room);
                }
                if (room !== EMPTY_STRING) {
                    this.chatService.room = room;
                    this.chatService.joinRoom(room);
                }
            }),
        );
        const tempName = this.playerService.getName();
        this.chatService.name = tempName === EMPTY_STRING ? PLAYER_NAME : tempName;
    }

    getTime() {
        this.chatService.date = new Date();
        return this.chatService.date.toLocaleTimeString(TIME_FORMAT);
    }

    sendMessage() {
        if (this.isValid(this.chatService.message) && this.isAllowedToChat) {
            const message: Message = {
                room: this.chatService.room,
                time: this.getTime(),
                name: this.chatService.name,
                text: this.chatService.message,
            };
            this.chatService.messages.push(message);
            this.chatService.sendMessage(message);
            this.clearInput();
            this.scrollDown();
        } else {
            if (!this.isValid(this.chatService.message)) {
                alert('Invalid input, empty string or 200 char limit reached');
            }
        }
    }

    clearInput() {
        this.chatService.message = EMPTY_STRING;
    }

    scrollDown() {
        const element = document.querySelector('.chat-body');
        if (element) element.scrollTop = element.scrollHeight;
    }

    // Checks that the string is not empty and smaller than 200 chars
    isValid(message: string) {
        const trimmedMessage = message.replace(/\s/g, ''); // Remove all spaces from the message
        return trimmedMessage.length !== 0 && message.length <= MESSAGE_LIMIT;
    }

    // For tests purposes
    joinRoom() {
        this.chatService.joinRoom(this.chatService.room);
    }

    ngOnDestroy() {
        this.subscriptions.forEach((subscription) => subscription.unsubscribe());
    }

    // For tests purposes
    // changeName() {
    //     this.playerService.setName(this.name);
    // }
}
