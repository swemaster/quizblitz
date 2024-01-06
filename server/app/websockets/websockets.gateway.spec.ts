/* eslint-disable max-lines */
/* eslint-disable @typescript-eslint/no-magic-numbers */
import { Match } from '@app/interfaces/match';
import { Player } from '@app/interfaces/player';
import { DEFAULT_SELECTION, DEFAULT_STATUS, INITIAL_DEFAULT_VALUE } from '@app/websockets/websockets.constant';
import { ChatGateway } from '@app/websockets/websockets.gateway';
import { Test, TestingModule } from '@nestjs/testing';
import { Server } from 'socket.io';

describe('ChatGateway', () => {
    let chatGateway: ChatGateway;

    const matchList: Match[] = [
        {
            playerList: [
                {
                    name: 'Player1',
                    socketId: '12345',
                    score: 0,
                    isFirstAmount: 0,
                    selection: [],
                    status: 'active',
                    timeLeft: 5,
                    isCorrect: false,
                },
                {
                    name: 'Player2',
                    socketId: '67890',
                    score: 0,
                    isFirstAmount: 0,
                    selection: [],
                    status: 'active',
                    timeLeft: 0,
                    isCorrect: false,
                },
                {
                    name: 'Organisateur',
                    socketId: '12483',
                    score: 0,
                    isFirstAmount: 0,
                    selection: [],
                    status: 'active',
                    timeLeft: 0,
                    isCorrect: false,
                },
            ],

            timeDisplayed: 0,
            roomId: 'room1',
        },
    ];
    const deepCopyArrayWithMatches = (matches: Match[]): Match[] => matches.map((match) => deepCopyMatch(match));

    const deepCopyMatch = (match: Match): Match => ({
        playerList: deepCopyArrayWithPlayers(match.playerList),
        timeDisplayed: match.timeDisplayed,
        roomId: match.roomId,
    });

    const deepCopyArrayWithPlayers = (players: Player[]): Player[] => players.map((player) => deepCopyPlayer(player));

    const deepCopyPlayer = (player: Player): Player => ({
        name: player.name,
        socketId: player.socketId,
        isFirstAmount: player.isFirstAmount,
        score: player.score,
        selection: player.selection,
        status: player.status,
        timeLeft: player.timeLeft,
        isCorrect: false,
    });

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [ChatGateway],
        }).compile();

        chatGateway = module.get<ChatGateway>(ChatGateway);

        chatGateway.server = {
            emit: jest.fn(),
            in: jest.fn(() => ({ emit: jest.fn() })),
        } as unknown as Server;
    });

    it('should be defined', () => {
        expect(chatGateway).toBeDefined();
    });

    it('should join a room', async () => {
        const mockClient = { join: jest.fn() };
        const room = 'room123';

        await chatGateway.onJoinRoom(mockClient, room);

        expect(mockClient.join).toHaveBeenCalledWith(room);
    });

    it('should join a game room and emit newPlayer event', async () => {
        const mockClient = {
            join: jest.fn(),
            to: jest.fn().mockReturnThis(),
            emit: jest.fn(),
        };
        const response = { room: 'room123', name: 'Alice' };

        await chatGateway.joinGameRoom(mockClient, response);

        expect(mockClient.join).toHaveBeenCalledWith(response.room);
        expect(mockClient.to).toHaveBeenCalledWith(response.room);
        expect(mockClient.emit).toHaveBeenCalledWith('newPlayer', response.name);
    });

    it('should leave a room', async () => {
        const mockClient = { leave: jest.fn() };
        const room = 'room123';

        await chatGateway.leaveRoom(mockClient, room);

        expect(mockClient.leave).toHaveBeenCalledWith(room);
    });

    it('should start a game and send enterInGame event to a room', async () => {
        const mockMatchList: Match[] = deepCopyArrayWithMatches(matchList);
        const mockClient = {
            to: jest.fn().mockReturnThis(),
            emit: jest.fn(),
            id: '12345',
        };
        const room = 'room1';
        chatGateway.setMatchList(mockMatchList);

        await chatGateway.onStartGame(mockClient);

        expect(mockClient.to).toHaveBeenCalledWith(room);
        expect(mockClient.emit).toHaveBeenCalledWith('enterInGame');
    });

    it('should send orgQuitGame event to a room and remove the match', async () => {
        const mockMatchList: Match[] = deepCopyArrayWithMatches(matchList);
        const mockClient = {
            to: jest.fn().mockReturnThis(),
            emit: jest.fn(),
            id: '12483',
            leave: jest.fn().mockReturnThis(),
        };
        const room = 'room1';
        chatGateway.setMatchList(mockMatchList);

        await chatGateway.onOrgQuitGame(mockClient);

        expect(mockClient.to).toHaveBeenCalledWith(room);
        expect(mockClient.emit).toHaveBeenCalledWith('orderedToQuitTheGame');
    });

    it('should emit users count when a connection is established', async () => {
        await chatGateway.handleConnection();

        expect(chatGateway.server.emit).toHaveBeenCalledWith('users', expect.any(Number));
    });

    describe('handleDisconnect', () => {
        it('should emit users count when a connection is terminated', async () => {
            await chatGateway.handleDisconnect();

            expect(chatGateway.server.emit).toHaveBeenCalledWith('users', expect.any(Number));
        });
    });

    it('should reset player selections', () => {
        const mockMatch: Match =
            // Create a sample Match object
            {
                playerList: [
                    {
                        name: 'Player1',
                        socketId: '12345',
                        score: 0,
                        isFirstAmount: 0,
                        selection: [],
                        status: 'status',
                        timeLeft: 0,
                        isCorrect: false,
                    },
                    {
                        name: 'Player2',
                        socketId: '67890',
                        score: 0,
                        isFirstAmount: 0,
                        selection: [],
                        status: 'status',
                        timeLeft: 0,
                        isCorrect: false,
                    },
                    {
                        name: 'organisateur',
                        socketId: '12483',
                        score: 0,
                        isFirstAmount: 0,
                        selection: [],
                        status: 'status',
                        timeLeft: 0,
                        isCorrect: false,
                    },
                ],

                timeDisplayed: 0,
                roomId: 'room1',
            };

        chatGateway.resetPlayers(mockMatch);

        for (const player of mockMatch.playerList) {
            expect(player.selection).toEqual([]);
        }
    });

    it('should find a faster player', () => {
        chatGateway.foundMatchByRoom = jest.fn().mockReturnValue({
            playerList: [
                { socketId: 'client123', timeLeft: 10, isCorrect: false },
                { socketId: 'client456', timeLeft: 15, isCorrect: false },
            ],
        });

        const fasterPlayer = chatGateway.foundFasterPlayer('client123', 12);
        expect(fasterPlayer).toEqual(expect.objectContaining({ socketId: 'client456' }));
    });

    it('should find a room by socket ID', () => {
        chatGateway.setMatchList(deepCopyArrayWithMatches(matchList));

        const room = chatGateway.foundRoomBySocket('12345');

        expect(room).toBe('room1');
    });

    it('should not create a match if there is an existing one', async () => {
        const mockMatchList: Match[] = deepCopyArrayWithMatches(matchList);
        const mockMatchList2: Match[] = deepCopyArrayWithMatches(matchList);
        const playerMock: Player = {
            name: 'Player1',
            socketId: '12483',
            score: INITIAL_DEFAULT_VALUE,
            isFirstAmount: INITIAL_DEFAULT_VALUE,
            selection: DEFAULT_SELECTION,
            status: DEFAULT_STATUS,
            timeLeft: INITIAL_DEFAULT_VALUE,
            isCorrect: false,
        };
        mockMatchList2[0].playerList.push(playerMock);
        const mockClient = {
            to: jest.fn().mockReturnThis(),
            emit: jest.fn(),
            id: '12483',
            leave: jest.fn().mockReturnThis(),
            join: jest.fn(),
        };
        const mockReponse = { name: 'Player1', room: 'room1' };
        chatGateway.setMatchList(mockMatchList);

        await chatGateway.joinGameRoom(mockClient, mockReponse);

        expect(chatGateway.getMatchList()).toEqual(mockMatchList2);
    });

    it('should send chrono values to players', async () => {
        const mockMatchList: Match[] = deepCopyArrayWithMatches(matchList);
        chatGateway.setMatchList(mockMatchList);
        const mockClient = {
            to: jest.fn().mockReturnThis(),
            emit: jest.fn(),
            id: '12345',
            leave: jest.fn().mockReturnThis(),
            join: jest.fn(),
        };
        const mockValue = 5;

        await chatGateway.onChrono(mockClient, mockValue);
        expect(mockClient.to).toHaveBeenCalledWith('room1');
        expect(mockClient.emit).toHaveBeenCalledWith('chronoReception', mockValue);
    });

    it('should send event to go to result view with value', async () => {
        const mockMatchList: Match[] = deepCopyArrayWithMatches(matchList);
        chatGateway.setMatchList(mockMatchList);
        const mockClient = {
            to: jest.fn().mockReturnThis(),
            emit: jest.fn(),
            id: '12345',
            leave: jest.fn().mockReturnThis(),
            join: jest.fn(),
        };
        const mockValue = 5;

        await chatGateway.onGoToResultView(mockClient, mockValue);
        expect(mockClient.to).toHaveBeenCalledWith('room1');
        expect(mockClient.emit).toHaveBeenCalledWith('goToResultsView', mockValue);
    });

    it('should delete match from the list if org is last to quit', async () => {
        const mockMatchList: Match[] = [
            {
                playerList: [
                    {
                        name: 'organisateur',
                        socketId: '12483',
                        score: 0,
                        isFirstAmount: 0,
                        selection: [],
                        status: 'status',
                        timeLeft: 0,
                        isCorrect: false,
                    },
                ],

                timeDisplayed: 0,
                roomId: 'room1',
            },
        ];
        const mockClient = {
            to: jest.fn().mockReturnThis(),
            emit: jest.fn(),
            id: '12483',
            leave: jest.fn().mockReturnThis(),
        };
        const room = 'room1';
        chatGateway.setMatchList(mockMatchList);

        await chatGateway.onOrgQuitGame(mockClient);

        expect(mockClient.leave).toHaveBeenCalledWith(room);
        expect(chatGateway.getMatchList()).toEqual([]);
    });

    it('should put player in disconnected status when he quits and is not last', async () => {
        const mockMatchList: Match[] = deepCopyArrayWithMatches(matchList);
        chatGateway.setMatchList(mockMatchList);
        const mockPlayerList = [
            {
                name: 'Player1',
                socketId: '12345',
                score: 0,
                isFirstAmount: 0,
                selection: [],
                status: 'disconnected',
                timeLeft: 5,
                isCorrect: false,
            },
            {
                name: 'Player2',
                socketId: '67890',
                score: 0,
                isFirstAmount: 0,
                selection: [],
                status: 'active',
                timeLeft: 0,
                isCorrect: false,
            },
            {
                name: 'Organisateur',
                socketId: '12483',
                score: 0,
                isFirstAmount: 0,
                selection: [],
                status: 'active',
                timeLeft: 0,
                isCorrect: false,
            },
        ];
        const mockClient = {
            to: jest.fn().mockReturnThis(),
            emit: jest.fn(),
            id: '12345',
            leave: jest.fn().mockReturnThis(),
            join: jest.fn(),
        };

        await chatGateway.onPlayerQuitGame(mockClient);
        expect(mockClient.to).toHaveBeenCalledWith('12483');
        expect(mockClient.emit).toHaveBeenCalledWith('sendDataToOrg', mockPlayerList);
        expect(mockClient.leave).toHaveBeenCalledWith('room1');
    });

    it('should erase match if player is last to quit', async () => {
        const mockMatchList: Match[] = [
            {
                playerList: [
                    {
                        name: 'Player1',
                        socketId: '12345',
                        score: 0,
                        isFirstAmount: 0,
                        selection: [],
                        status: 'active',
                        timeLeft: 0,
                        isCorrect: false,
                    },
                ],

                timeDisplayed: 0,
                roomId: 'room1',
            },
        ];
        chatGateway.setMatchList(mockMatchList);
        const mockClient = {
            to: jest.fn().mockReturnThis(),
            emit: jest.fn(),
            id: '12345',
            leave: jest.fn().mockReturnThis(),
            join: jest.fn(),
        };

        await chatGateway.onPlayerQuitGame(mockClient);
        expect(mockClient.leave).toHaveBeenCalledWith('room1');
        expect(chatGateway.getMatchList()).toEqual([]);
    });

    it('should send isFirst event to fastest player on askValidateQuestions', async () => {
        const mockMatchList: Match[] = deepCopyArrayWithMatches(matchList);
        const mockClient = {
            to: jest.fn().mockReturnThis(),
            emit: jest.fn(),
            id: '12483',
            leave: jest.fn().mockReturnThis(),
            join: jest.fn(),
        };
        chatGateway.setMatchList(mockMatchList);

        await chatGateway.onAskValidateQuestions(mockClient);
        expect(mockClient.to).toHaveBeenCalledWith('12345');
        expect(mockClient.emit).toHaveBeenCalledWith('isFirst');

        expect(mockClient.to).toHaveBeenCalledWith('room1');
        expect(mockClient.emit).toHaveBeenCalledWith('validateQuestions');
    });

    it('should call reset players on next question', async () => {
        chatGateway.resetPlayers = jest.fn();
        const mockMatchList: Match[] = deepCopyArrayWithMatches(matchList);
        const mockClient = {
            to: jest.fn().mockReturnThis(),
            emit: jest.fn(),
            id: '12483',
            leave: jest.fn().mockReturnThis(),
            join: jest.fn(),
        };
        chatGateway.setMatchList(mockMatchList);

        await chatGateway.onNextQuestion(mockClient);
        expect(chatGateway.resetPlayers).toHaveBeenCalledWith(mockMatchList[0]);
    });

    it('should send data to org and go to next question', async () => {
        const mockMatchList: Match[] = deepCopyArrayWithMatches(matchList);
        const mockClient = {
            to: jest.fn().mockReturnThis(),
            emit: jest.fn(),
            id: '12483',
            leave: jest.fn().mockReturnThis(),
            join: jest.fn(),
        };
        chatGateway.setMatchList(mockMatchList);

        await chatGateway.onNextQuestion(mockClient);

        expect(mockClient.to).toHaveBeenCalledWith('room1');
        expect(mockClient.emit).toHaveBeenCalledWith('goToNextQuestion');
    });

    it('should send playSound event to players on panic state', async () => {
        const mockMatchList: Match[] = deepCopyArrayWithMatches(matchList);
        const mockClient = {
            to: jest.fn().mockReturnThis(),
            emit: jest.fn(),
            id: '12483',
            leave: jest.fn().mockReturnThis(),
            join: jest.fn(),
        };
        chatGateway.setMatchList(mockMatchList);

        await chatGateway.onPanicState(mockClient);

        expect(mockClient.to).toHaveBeenCalledWith('room1');
        expect(mockClient.emit).toHaveBeenCalledWith('playSound');
    });

    it('should switch status if player is ready', async () => {
        const mockMatchList: Match[] = deepCopyArrayWithMatches(matchList);
        const mockMatchList2: Match[] = [
            {
                playerList: [
                    {
                        name: 'Player1',
                        socketId: '12345',
                        score: 0,
                        isFirstAmount: 0,
                        selection: [],
                        status: 'active',
                        timeLeft: 10,
                        isCorrect: false,
                    },
                    {
                        name: 'Player2',
                        socketId: '67890',
                        score: 0,
                        isFirstAmount: 0,
                        selection: [],
                        status: 'active',
                        timeLeft: 0,
                        isCorrect: false,
                    },
                    {
                        name: 'Organisateur',
                        socketId: '12483',
                        score: 0,
                        isFirstAmount: 0,
                        selection: [],
                        status: 'active',
                        timeLeft: 0,
                        isCorrect: false,
                    },
                ],

                timeDisplayed: 0,
                roomId: 'room1',
            },
        ];
        const mockClient = {
            to: jest.fn().mockReturnThis(),
            emit: jest.fn(),
            id: '12345',
            leave: jest.fn().mockReturnThis(),
            join: jest.fn(),
        };
        chatGateway.setMatchList(mockMatchList);

        await chatGateway.onPlayerReadyQuestion(mockClient, 10);

        expect(mockClient.to).toHaveBeenCalledWith('12483');
        expect(mockClient.emit).toHaveBeenCalledWith('sendDataToOrg', mockMatchList2[0].playerList);
    });

    it('should send player selection to org', async () => {
        const mockMatchList: Match[] = deepCopyArrayWithMatches(matchList);
        const mockMatchList2: Match[] = [
            {
                playerList: [
                    {
                        name: 'Player1',
                        socketId: '12345',
                        score: 0,
                        isFirstAmount: 0,
                        selection: [0, 2, 3],
                        status: 'typing',
                        timeLeft: 5,
                        isCorrect: false,
                    },
                    {
                        name: 'Player2',
                        socketId: '67890',
                        score: 0,
                        isFirstAmount: 0,
                        selection: [],
                        status: 'active',
                        timeLeft: 0,
                        isCorrect: false,
                    },
                    {
                        name: 'Organisateur',
                        socketId: '12483',
                        score: 0,
                        isFirstAmount: 0,
                        selection: [],
                        status: 'active',
                        timeLeft: 0,
                        isCorrect: false,
                    },
                ],

                timeDisplayed: 0,
                roomId: 'room1',
            },
        ];
        const mockClient = {
            to: jest.fn().mockReturnThis(),
            emit: jest.fn(),
            id: '12345',
            leave: jest.fn().mockReturnThis(),
            join: jest.fn(),
        };
        chatGateway.setMatchList(mockMatchList);

        await chatGateway.onSendPlayerSelection(mockClient, [0, 2, 3]);

        expect(mockClient.to).toHaveBeenCalledWith('12483');
        expect(mockClient.emit).toHaveBeenCalledWith('sendDataToOrg', mockMatchList2[0].playerList);
    });

    it('should send player score to org', async () => {
        const mockMatchList: Match[] = deepCopyArrayWithMatches(matchList);
        const mockMatchList2: Match[] = [
            {
                playerList: [
                    {
                        name: 'Player1',
                        socketId: '12345',
                        score: 80,
                        isFirstAmount: 3,
                        selection: [],
                        status: 'active',
                        timeLeft: 5,
                        isCorrect: false,
                    },
                    {
                        name: 'Player2',
                        socketId: '67890',
                        score: 0,
                        isFirstAmount: 0,
                        selection: [],
                        status: 'active',
                        timeLeft: 0,
                        isCorrect: false,
                    },
                    {
                        name: 'Organisateur',
                        socketId: '12483',
                        score: 0,
                        isFirstAmount: 0,
                        selection: [],
                        status: 'active',
                        timeLeft: 0,
                        isCorrect: false,
                    },
                ],

                timeDisplayed: 0,
                roomId: 'room1',
            },
        ];
        const mockClient = {
            to: jest.fn().mockReturnThis(),
            emit: jest.fn(),
            id: '12345',
            leave: jest.fn().mockReturnThis(),
            join: jest.fn(),
        };
        chatGateway.setMatchList(mockMatchList);

        await chatGateway.onSendPlayerScore(mockClient, { score: '80', bonuses: 3 });

        expect(mockClient.to).toHaveBeenCalledWith('12483');
        expect(mockClient.emit).toHaveBeenCalledWith('sendDataToOrg', mockMatchList2[0].playerList);
    });

    it('should send message to everyone', async () => {
        const mockClient = {
            to: jest.fn().mockReturnThis(),
            emit: jest.fn(),
            id: '12345',
            leave: jest.fn().mockReturnThis(),
            join: jest.fn(),
            broadcast: {
                to: jest.fn(() => ({
                    emit: jest.fn(),
                })),
            },
        };

        const mockMessage = {
            room: 'room1',
            time: 'present time',
            name: 'sample name',
            text: 'sample text',
        };

        await chatGateway.onChat(mockClient, mockMessage);

        expect(mockClient.broadcast.to).toHaveBeenCalledWith('room1');
    });

    it('should send player list to organizer', async () => {
        const mockMatchList: Match[] = deepCopyArrayWithMatches(matchList);

        const mockClient = {
            to: jest.fn().mockReturnThis(),
            emit: jest.fn(),
            id: '12345',
            leave: jest.fn().mockReturnThis(),
            join: jest.fn(),
        };
        chatGateway.setMatchList(mockMatchList);

        await chatGateway.onAskForPlayerData(mockClient);

        expect(mockClient.emit).toHaveBeenCalledWith('sendDataToOrg', mockMatchList[0].playerList);
    });

    it('should send qrl answer to organizer', async () => {
        const mockMatchList: Match[] = deepCopyArrayWithMatches(matchList);

        const mockClient = {
            to: jest.fn().mockReturnThis(),
            emit: jest.fn(),
            id: '12345',
            leave: jest.fn().mockReturnThis(),
            join: jest.fn(),
        };
        chatGateway.setMatchList(mockMatchList);

        await chatGateway.onQRLPlayerText(mockClient, 'sample text');

        expect(mockClient.emit).toHaveBeenCalledWith('sendQRLToOrg', { username: 'Player1', text: 'sample text' });
    });

    it('should send qrl multiplier to player', async () => {
        const mockMatchList: Match[] = deepCopyArrayWithMatches(matchList);

        const mockClient = {
            to: jest.fn().mockReturnThis(),
            emit: jest.fn(),
            id: '12345',
            leave: jest.fn().mockReturnThis(),
            join: jest.fn(),
        };
        chatGateway.setMatchList(mockMatchList);

        await chatGateway.onSendMultiplierToPlayer(mockClient, [
            { name: 'Player1', scoreMultiplier: 50 },
            { name: 'Player2', scoreMultiplier: 100 },
        ]);

        expect(mockClient.to).toHaveBeenCalledWith('12345');
        expect(mockClient.to).toHaveBeenCalledWith('67890');

        expect(mockClient.emit).toHaveBeenCalledWith('receiveMultiplier', 50);
        expect(mockClient.emit).toHaveBeenCalledWith('receiveMultiplier', 100);
    });

    it('should switch boolean when sending correct answers', async () => {
        const mockMatchList: Match[] = deepCopyArrayWithMatches(matchList);

        const mockClient = {
            to: jest.fn().mockReturnThis(),
            emit: jest.fn(),
            id: '12345',
            leave: jest.fn().mockReturnThis(),
            join: jest.fn(),
        };
        chatGateway.setMatchList(mockMatchList);

        await chatGateway.onSendIsCorrect(mockClient, true);

        expect(mockMatchList[0].playerList[0].isCorrect).toBeTruthy();
    });

    it('should throw an error if WebSocket server is not initialized', () => {
        chatGateway.server = undefined;
        expect(() => chatGateway.onModuleInit()).toThrowError('WebSocket server is not initialized.');
    });

    it('should throw an error if WebSocket server is not initialized', () => {
        expect(() => chatGateway.onModuleInit()).not.toThrow();
    });
});
