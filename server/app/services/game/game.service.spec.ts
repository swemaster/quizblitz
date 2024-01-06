import { Game, GameDocument } from '@app/model/database/game';
import { CreateGameDto } from '@app/model/dto/game/create-game.dto';
import { UpdateGameDto } from '@app/model/dto/game/update-game.dto';
import { Logger } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { UUID } from 'crypto';
import { Model } from 'mongoose';
import { GameService } from './game.service';

describe('GameService gameExists', () => {
    let service: GameService;
    let gameModel: Model<GameDocument>;

    beforeEach(async () => {
        gameModel = {
            countDocuments: jest.fn(),
            insertMany: jest.fn(),
            create: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            deleteOne: jest.fn(),
            update: jest.fn(),
            updateOne: jest.fn(),
        } as unknown as Model<GameDocument>;

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                GameService,
                Logger,
                {
                    provide: getModelToken(Game.name),
                    useValue: {
                        findOne: jest.fn(),
                        find: jest.fn(),
                        create: jest.fn(),
                        updateOne: jest.fn(),
                        deleteOne: jest.fn(),
                        deleteMany: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get<GameService>(GameService);
        gameModel = module.get<Model<GameDocument>>(getModelToken(Game.name));
    });

    it('gameExists() should return true if game exists', async () => {
        const gameId: UUID = 'e3eb44d2-4218-40cb-8f26-815afdd90010';
        const mockGame = { id: gameId, title: 'Test Game', isVisible: true };

        jest.spyOn(gameModel, 'findOne').mockResolvedValue(mockGame);

        const result = await service.gameExists(gameId);

        expect(result).toBe(true);
        expect(gameModel.findOne).toHaveBeenCalledWith({ id: gameId });
    });

    it('gameExists() should return false if game does not exist', async () => {
        const gameId: UUID = '259101ba-729b-425d-998a-d5fae058edfe';

        jest.spyOn(gameModel, 'findOne').mockResolvedValue(null);

        const result = await service.gameExists(gameId);

        expect(result).toBe(false);
        expect(gameModel.findOne).toHaveBeenCalledWith({ id: gameId });
    });

    it('gameExists() should throw an error if an exception occurs', async () => {
        const gameId: UUID = '2ac9fa59-3561-4696-a173-16a1a012d335';

        jest.spyOn(gameModel, 'findOne').mockRejectedValue(new Error('Database error'));

        await expect(service.gameExists(gameId)).rejects.toThrowError('Failed to check if game exists');
        expect(gameModel.findOne).toHaveBeenCalledWith({ id: gameId });
    });

    it('getAllGames() should return an array of games', async () => {
        const mockGames = [
            { id: 'e3eb44d2-4218-40cb-8f26-815afdd90010', title: 'Game 1', isVisible: true },
            { id: '259101ba-729b-425d-998a-d5fae058edfe', title: 'Game 2', isVisible: true },
        ];

        jest.spyOn(gameModel, 'find').mockResolvedValue([]);

        const initialLength = (await service.getAllGames()).length;

        // Add another game
        jest.spyOn(gameModel, 'find').mockResolvedValue(mockGames);
        const afterAddingTwoGames = (await service.getAllGames()).length;

        expect(initialLength).toEqual(0);
        expect(afterAddingTwoGames).toEqual(2);

        const result = await service.getAllGames();

        expect(result).toEqual(mockGames);
        expect(gameModel.find).toHaveBeenCalledWith({});
    });

    it('getGame() should return a game', async () => {
        const gameId: UUID = 'e3eb44d2-4218-40cb-8f26-815afdd90010';
        const mockGame = { id: gameId, title: 'Test Game', isVisible: true };

        jest.spyOn(gameModel, 'findOne').mockResolvedValue(mockGame);

        const result = await service.getGame(gameId);

        expect(result).toEqual(mockGame);
        expect(gameModel.findOne).toHaveBeenCalledWith({ id: gameId });
    });

    it('getGame() should throw an error if an exception occurs', async () => {
        const gameId: UUID = '2ac9fa59-3561-4696-a173-16a1a012d335';

        jest.spyOn(gameModel, 'findOne').mockRejectedValue(new Error('Database error'));

        try {
            await service.getGame(gameId);
        } catch (error) {
            expect(error).toBe('Failed to get game: Error: Database error');
        }
    });

    it('addGame() should add a game to the database', async () => {
        const gameId: UUID = 'e3eb44d2-4218-40cb-8f26-815afdd90010';

        const mockGame: CreateGameDto = {
            id: gameId,
            title: 'Test Game',
            isVisible: true,
            lastModification: '3333-11-13T20:20:39Z',
            duration: 60,
            description: 'Test of addGame()',
            questions: [],
        };

        await service.addGame(mockGame);

        expect(gameModel.create).toHaveBeenCalledWith(mockGame);
    });

    it('addGame() should throw an error if insertion fails', async () => {
        const gameId: UUID = 'e3eb44d2-4218-40cb-8f26-815afdd90010';

        const mockGame: CreateGameDto = {
            id: gameId,
            title: 'Test Game',
            isVisible: true,
            lastModification: '3333-11-13T20:20:39Z',
            duration: 60,
            description: 'Test of addGame()',
            questions: [],
        };

        const errorMessage = 'Database error';
        const expectedError = 'Failed to insert game: Error: Database error';
        jest.spyOn(gameModel, 'create').mockRejectedValue(new Error(errorMessage));

        try {
            await service.addGame(mockGame);
        } catch (error) {
            expect(error).toBe(expectedError);
        }

        expect(gameModel.create).toHaveBeenCalledWith(mockGame);
    });

    it('addGame() should fail if mongo query failed', async () => {
        jest.spyOn(gameModel, 'create').mockImplementation(async () => Promise.reject(''));
        const gameId: UUID = 'e3eb44d2-4218-40cb-8f26-815afdd90010';

        const mockGame: CreateGameDto = {
            id: gameId,
            title: 'Test Game',
            isVisible: true,
            lastModification: '3333-11-13T20:20:39Z',
            duration: 60,
            description: 'Test of addGame()',
            questions: [],
        };
        await expect(service.addGame(mockGame)).rejects.toBeTruthy();
    });

    it('modifyGame() should update an existing game', async () => {
        const gameId: UUID = 'e3eb44d2-4218-40cb-8f26-815afdd90010';
        const updateGameDto: UpdateGameDto = {
            id: gameId,
            title: 'New Title',
            isVisible: false,
        };

        jest.spyOn(service, 'gameExists').mockResolvedValue(true);

        await service.modifyGame(gameId, updateGameDto);

        expect(service.gameExists).toHaveBeenCalledWith(gameId);
        expect(gameModel.updateOne).toHaveBeenCalledWith({ id: gameId }, updateGameDto);
    });

    it('modifyGame() should create a new game if it does not exist', async () => {
        const gameId: UUID = '259101ba-729b-425d-998a-d5fae058edfe';
        const updateGameDto: UpdateGameDto = {
            id: gameId,
            title: 'New Game Title',
            isVisible: true,
        };

        jest.spyOn(service, 'gameExists').mockResolvedValue(false);

        await service.modifyGame(gameId, updateGameDto);

        expect(service.gameExists).toHaveBeenCalledWith(gameId);
    });

    it('modifyGame() should throw an error if an exception occurs', async () => {
        const gameId: UUID = '2ac9fa59-3561-4696-a173-16a1a012d335';

        jest.spyOn(gameModel, 'findOne').mockRejectedValue(new Error('Database error'));

        try {
            await service.getGame(gameId);
        } catch (error) {
            expect(error).toBe('Failed to get game: Error: Database error');
        }
    });

    it('deleteGame() should delete a game', async () => {
        const gameId: UUID = 'e3eb44d2-4218-40cb-8f26-815afdd90010';

        await service.deleteGame(gameId);

        expect(gameModel.deleteOne).toHaveBeenCalledWith({ id: gameId });
    });

    it('deleteGame() should throw an error if deletion fails', async () => {
        const gameId: UUID = 'e3eb44d2-4218-40cb-8f26-815afdd90010';
        const errorMessage = 'Database error';
        const expectedError = 'Failed to delete game: Error: Database error';
        jest.spyOn(gameModel, 'deleteOne').mockRejectedValue(new Error(errorMessage));

        try {
            await service.deleteGame(gameId);
        } catch (error) {
            expect(error).toBe(expectedError);
        }

        expect(gameModel.deleteOne).toHaveBeenCalledWith({ id: gameId });
    });
});
