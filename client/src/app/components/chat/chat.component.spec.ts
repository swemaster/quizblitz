import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Message } from '@app/interfaces/message';
import { EMPTY_STRING, MESSAGE_LIMIT, TIME_FORMAT } from '@app/pages/page.constant';
import { ChatService } from '@app/services/chat.service';
import { PlayerService } from '@app/services/player.service';

import { GameSocketService } from '@app/services/game-socket.service';
import { of } from 'rxjs';
import { ChatComponent } from './chat.component';
import SpyObj = jasmine.SpyObj;

describe('ChatComponent', () => {
    let component: ChatComponent;
    let fixture: ComponentFixture<ChatComponent>;
    let chatSpy: SpyObj<ChatService>;
    let playerSpy: SpyObj<PlayerService>;
    let gameSocketServiceSpy: SpyObj<GameSocketService>;

    beforeEach(() => {
        chatSpy = jasmine.createSpyObj('ChatService', ['joinRoom', 'leaveRoom', 'sendMessage', 'receiveChat']);
        chatSpy.receiveChat.and.returnValue(of());
        chatSpy.messages = [];

        playerSpy = jasmine.createSpyObj('PlayerService', ['getNameObs', 'getRoomObs', 'getName', 'setName']);
        playerSpy.getNameObs.and.returnValue(of());

        gameSocketServiceSpy = jasmine.createSpyObj('GameSocketService', ['receiveBannedChatName']);
        gameSocketServiceSpy.receiveBannedChatName.and.returnValue(of());

        TestBed.configureTestingModule({
            declarations: [ChatComponent],
            providers: [
                { provide: ChatService, useValue: chatSpy },
                { provide: GameSocketService, useValue: gameSocketServiceSpy },
            ],
        });
        fixture = TestBed.createComponent(ChatComponent);
        component = fixture.componentInstance;
        component.chatService = chatSpy;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should get the current time', () => {
        const component = fixture.componentInstance;
        const time = component.getTime();
        const expectedTime = new Date().toLocaleTimeString(TIME_FORMAT);
        expect(time).toEqual(expectedTime);
    });

    it('should handle beforeUnload event', () => {
        component.beforeUnloadHandler();
        expect(chatSpy.leaveRoom).toHaveBeenCalled();
    });

    it('should send a message', () => {
        const expectedMessage: Message = {
            room: 'expect room',
            time: component.getTime(),
            name: 'expect name',
            text: 'expect text',
        };
        chatSpy.name = expectedMessage.name;
        chatSpy.room = expectedMessage.room;
        chatSpy.message = expectedMessage.text;
        component.sendMessage();
        expect(chatSpy.sendMessage).toHaveBeenCalledWith(expectedMessage);
        expect(chatSpy.message).toEqual(EMPTY_STRING);
    });

    it('should validate a message', () => {
        expect(component.isValid('Hello, world!')).toBeTruthy();
    });

    it('should invalidate an empty string', () => {
        expect(component.isValid(EMPTY_STRING)).toBeFalsy();
    });

    it('should invalidate a 200+ char message', () => {
        expect(component.isValid('a'.repeat(MESSAGE_LIMIT + 1))).toBeFalsy();
    });

    it('should not send an empty message', () => {
        const expectedMessage = EMPTY_STRING;
        const expectedError = 'Invalid input, empty string or 200 char limit reached';
        chatSpy.message = expectedMessage;
        chatSpy.room = 'room';

        // Spy on the window.alert method
        spyOn(window, 'alert');

        // Call the sendMessage method
        component.sendMessage();

        // Check if the message was cleared
        expect(component.chatService.message).toEqual(EMPTY_STRING);

        // Check if the alert was shown when sending an empty message
        expect(window.alert).toHaveBeenCalledWith(expectedError);
    });

    it('should not send a 200+ char message', () => {
        const expectedMessage = 'a'.repeat(MESSAGE_LIMIT + 1);
        const expectedError = 'Invalid input, empty string or 200 char limit reached';
        chatSpy.message = expectedMessage;
        chatSpy.room = 'room';

        // Spy on the window.alert method
        spyOn(window, 'alert');

        // Call the sendMessage method
        component.sendMessage();

        // Check if the alert was shown when sending a message above 200 characters
        expect(window.alert).toHaveBeenCalledWith(expectedError);
    });

    it('should not send invalid messages', () => {
        const expectedMessage = EMPTY_STRING;
        const expectedError = 'Invalid input, empty string or 200 char limit reached';
        chatSpy.message = expectedMessage;
        chatSpy.room = 'room';

        // Spy on the window.alert method
        spyOn(window, 'alert');

        // Call the sendMessage method
        component.sendMessage();

        // Check if the message was cleared
        expect(chatSpy.message).toEqual(EMPTY_STRING);

        // Check if the alert was shown when sending an empty message
        expect(window.alert).toHaveBeenCalledWith(expectedError);

        // Check if the alert was shown when sending a message above 200 characters
        chatSpy.message = 'a'.repeat(MESSAGE_LIMIT + 1);
        component.sendMessage();
        expect(window.alert).toHaveBeenCalledWith(expectedError);
    });

    it('should initialize the component', () => {
        const playerServiceSpy = jasmine.createSpyObj('PlayerService', ['getNameObs', 'getRoomObs', 'getName']);
        const expectedName = 'John Doe';
        const currentRoom = 'room1';
        const newRoom = 'room2';
        const expectedDate = new Date();
        const expectedMessage: Message = {
            room: 'expect room',
            time: 'expect time',
            name: 'expect name',
            text: 'expect text',
        };
        const expectedMessages = [expectedMessage];

        playerServiceSpy.getNameObs.and.returnValue(of(expectedName));
        playerServiceSpy.getRoomObs.and.returnValue(of(newRoom));
        playerServiceSpy.getName.and.returnValue(expectedName);
        chatSpy.receiveChat.and.returnValue(of(expectedMessage));

        const component = new ChatComponent(chatSpy, playerServiceSpy, gameSocketServiceSpy);
        component.chatService.room = currentRoom;
        component.ngOnInit();

        expect(chatSpy.date.getDate).toEqual(expectedDate.getDate);
        expect(chatSpy.messages).toEqual(expectedMessages);
        expect(chatSpy.name).toEqual(expectedName);
        expect(chatSpy.leaveRoom).toHaveBeenCalledWith(currentRoom);
        expect(chatSpy.joinRoom).toHaveBeenCalledWith(newRoom);
        expect(component.isAllowedToChat).toBeTrue();

        gameSocketServiceSpy.receiveBannedChatName.calls.mostRecent().returnValue.subscribe(() => {
            expect(component.isAllowedToChat).toBeFalse();
        });
    });
    it('should join a room', () => {
        const expectedRoom = 'test-room';
        chatSpy.room = expectedRoom;
        component.joinRoom();
        expect(chatSpy.joinRoom).toHaveBeenCalledWith(expectedRoom);
    });
});
