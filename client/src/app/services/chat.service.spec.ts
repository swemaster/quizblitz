import { TestBed } from '@angular/core/testing';
import { Message } from '@app/interfaces/message';
import { EMPTY_STRING, PLAYER_NAME } from '@app/pages/page.constant';
import { Socket } from 'ngx-socket-io';
import { of } from 'rxjs';
import { ChatService } from './chat.service';
import SpyObj = jasmine.SpyObj;

describe('ChatService', () => {
    let chatService: ChatService;
    let socketSpy: SpyObj<Socket>;

    beforeEach(() => {
        socketSpy = jasmine.createSpyObj('Socket', ['emit', 'fromEvent']);
        socketSpy.emit.and.returnValue(0);
        socketSpy.fromEvent.and.returnValue(of('test-message'));

        TestBed.configureTestingModule({
            providers: [ChatService, { provide: Socket, useValue: socketSpy }],
        });
        chatService = TestBed.inject(ChatService);
    });

    it('should be created', () => {
        expect(chatService).toBeTruthy();
    });

    it('should have default values', () => {
        expect(chatService.date).toBeInstanceOf(Date);
        expect(chatService.messages).toEqual([]);
        expect(chatService.room).toEqual(EMPTY_STRING);
        expect(chatService.message).toEqual(EMPTY_STRING);
        expect(chatService.name).toEqual(PLAYER_NAME);
    });

    it('should remove api suffix from url', () => {
        const url = 'http://localhost:3000/api';
        const expectedUrl = 'http://localhost:3000/';
        expect(chatService.removeApiSuffix(url)).toEqual(expectedUrl);
    });

    // should not remove api asuffix from url if it does not end with api
    it('should not remove api suffix from url', () => {
        const url = 'http://localhost:3000/';
        expect(chatService.removeApiSuffix(url)).toEqual(url);
    });

    it('should join a room', () => {
        const room = 'test-room';
        spyOn(chatService.socket, 'emit');
        chatService.joinRoom(room);
        expect(chatService.socket.emit).toHaveBeenCalled();
        expect(chatService.socket.emit).toHaveBeenCalledWith('joinRoom', room);
    });

    it('should leave a room', () => {
        const room = 'test-room';
        spyOn(chatService.socket, 'emit');
        chatService.leaveRoom(room);
        expect(chatService.socket.emit).toHaveBeenCalled();
        expect(chatService.socket.emit).toHaveBeenCalledWith('leaveRoom', room);
    });

    it('should send a chat message', () => {
        const expectedMessage: Message = {
            room: 'expect room',
            time: 'expect time',
            name: 'expect name',
            text: 'expect text',
        };
        spyOn(chatService.socket, 'emit');
        chatService.sendMessage(expectedMessage);
        expect(chatService.socket.emit).toHaveBeenCalled();
        expect(chatService.socket.emit).toHaveBeenCalledWith('chat', expectedMessage);
    });

    it('should receive a chat message', () => {
        const expectedMessage: Message = {
            room: 'expect room',
            time: 'expect time',
            name: 'expect name',
            text: 'expect text',
        };
        chatService.receiveChat().subscribe((msg) => {
            expect(msg).toEqual(expectedMessage);
        });
    });

    it('should receive a chat message from the server', () => {
        const expectedMessage: Message = {
            room: 'expect room',
            time: 'expect time',
            name: 'expect name',
            text: 'expect text',
        };
        spyOn(chatService.socket, 'on').and.callFake((event: string, callback: Function) => {
            if (event === 'chat') {
                callback(expectedMessage);
            }
        });
        chatService.receiveChat().subscribe((msg) => {
            expect(msg).toEqual(expectedMessage);
        });
    });
});
