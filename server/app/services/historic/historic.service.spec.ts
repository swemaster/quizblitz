import { Historic, HistoricDocument } from '@app/model/database/historic';
import { CreateGameDto } from '@app/model/dto/game/create-game.dto';
import { CreateHistoricDto } from '@app/model/dto/historic/create-historic.dto';
import { CreateMatchDto } from '@app/model/dto/match/create-match.dto';
import { CreatePlayerDto } from '@app/model/dto/match/create-player.dto';
import { Logger } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { UUID } from 'crypto';
import { Model } from 'mongoose';
import { HistoricService } from './historic.service';

const gameId: UUID = 'e3eb44d2-4218-40cb-8f26-815afdd90010';
const mockGame: CreateGameDto = {
    id: gameId,
    title: 'Test Game',
    isVisible: true,
    lastModification: '3333-11-13T20:20:39Z',
    duration: 60,
    description: 'Test',
    questions: [],
};
const mockPlayer1: CreatePlayerDto = {
    name: 'Manel',
    points: 50,
    status: 'active',
    selection: [2],
};
const mockPlayer2: CreatePlayerDto = {
    name: 'Lina',
    points: 30,
    status: 'active',
    selection: [3],
};

const mockMatch: CreateMatchDto = {
    accessCode: '1234',
    canBeAccessed: true,
    startDate: '2023-10-01',
    game: mockGame,
    players: [mockPlayer1, mockPlayer2],
    time: 10,
    questionId: '123',
    messages: ['hey'],
    creator: 'Organisateur',
    nomsBannis: ['Diego'],
};

const mockHistory1: CreateHistoricDto = {
    id: mockMatch.accessCode,
    gameName: mockGame.title,
    playDate: '2024-01-01',
    players: mockMatch.players.length,
    bestPoints: mockPlayer1.points,
};

const idTest = '1234';
const mockHistory2: CreateHistoricDto = {
    id: idTest,
    gameName: 'test',
    playDate: '2023-01-01',
    players: 3,
    bestPoints: 50,
};

describe('HistoricService', () => {
    let service: HistoricService;
    let historicModel: Model<HistoricDocument>;
    beforeEach(async () => {
        historicModel = {
            countDocuments: jest.fn(),
            insertMany: jest.fn(),
            create: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            deleteOne: jest.fn(),
            update: jest.fn(),
            updateOne: jest.fn(),
        } as unknown as Model<HistoricDocument>;

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                HistoricService,
                Logger,
                {
                    provide: getModelToken(Historic.name),
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

        service = module.get<HistoricService>(HistoricService);
        historicModel = module.get<Model<HistoricDocument>>(getModelToken(Historic.name));
    });

    it('getWholeHistory() should return an array of all match history', async () => {
        const mockHistories = [mockHistory1, mockHistory2];
        jest.spyOn(historicModel, 'find').mockResolvedValue([]);
        const initialLength = (await service.getWholeHistory()).length;
        jest.spyOn(historicModel, 'find').mockResolvedValue(mockHistories);
        const afterAddingTwoHistories = (await service.getWholeHistory()).length;
        expect(initialLength).toEqual(0);
        expect(afterAddingTwoHistories).toEqual(2);
        const result = await service.getWholeHistory();
        expect(result).toEqual(mockHistories);
        expect(historicModel.find).toHaveBeenCalledWith({});
    });

    it('getHistory() should return a specific match history', async () => {
        const historyId = '1234';
        jest.spyOn(historicModel, 'findOne').mockResolvedValue(mockHistory2);

        const result = await service.getHistory(historyId);
        expect(result).toEqual(mockHistory2);
        expect(historicModel.findOne).toHaveBeenCalledWith({ id: historyId });
    });

    it('getHistory() should throw an error if an exception occurs', async () => {
        const historyId = '1234';
        jest.spyOn(historicModel, 'findOne').mockRejectedValue(new Error('Database error'));
        try {
            await service.getHistory(historyId);
        } catch (error) {
            expect(error).toBe('Failed to get history: Error: Database error');
        }
    });

    it('addHistory() should add a match history to the database', async () => {
        await service.addHistory(mockHistory1);
        expect(historicModel.create).toHaveBeenCalledWith(mockHistory1);
    });

    it('addHistory() should throw an error if insertion fails', async () => {
        const errorMessage = 'Database error';
        const expectedError = 'Failed to insert history: Error: Database error';
        jest.spyOn(historicModel, 'create').mockRejectedValue(new Error(errorMessage));
        try {
            await service.addHistory(mockHistory1);
        } catch (error) {
            expect(error).toBe(expectedError);
        }
        expect(historicModel.create).toHaveBeenCalledWith(mockHistory1);
    });

    it('addHistory() should fail if mongo query failed', async () => {
        jest.spyOn(historicModel, 'create').mockImplementation(async () => Promise.reject(''));
        await expect(service.addHistory(mockHistory1)).rejects.toBeTruthy();
    });

    it('deleteHistory() should delete a specific match history', async () => {
        await service.deleteHistory(idTest);
        expect(historicModel.deleteOne).toHaveBeenCalledWith({ id: idTest });
    });

    it('deleteHistory() should throw an error if deletion fails', async () => {
        const errorMessage = 'Database error';
        const expectedError = 'Failed to delete specific history: Error: Database error';
        jest.spyOn(historicModel, 'deleteOne').mockRejectedValue(new Error(errorMessage));
        try {
            await service.deleteHistory(idTest);
        } catch (error) {
            expect(error).toBe(expectedError);
        }
        expect(historicModel.deleteOne).toHaveBeenCalledWith({ id: idTest });
    });

    it('deleteWholeHistory() should delete whole match history', async () => {
        jest.spyOn(historicModel, 'deleteMany').mockResolvedValue(undefined);
        await service.deleteWholeHistory();
        expect(historicModel.deleteMany).toHaveBeenCalledWith();
    });

    it('deleteWholeHistory() should throw an error if deletion fails', async () => {
        const errorMessage = 'Database error';
        const expectedError = 'Failed to delete history: Error: Database error';
        jest.spyOn(historicModel, 'deleteMany').mockRejectedValue(new Error(errorMessage));
        try {
            await service.deleteWholeHistory();
        } catch (error) {
            expect(error).toBe(expectedError);
        }
        expect(historicModel.deleteMany).toHaveBeenCalledWith();
    });
});
