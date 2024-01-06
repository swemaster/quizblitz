import { Match, MatchDocument } from '@app/model/database/match';
import { CreateGameDto } from '@app/model/dto/game/create-game.dto';
import { CreateMatchDto } from '@app/model/dto/match/create-match.dto';
import { CreatePlayerDto } from '@app/model/dto/match/create-player.dto';
import { UpdateMatchDto } from '@app/model/dto/match/update-match.dto';
import { Logger } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { UUID } from 'crypto';
import { Model } from 'mongoose';
import { MatchService } from './match.service';

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

const accessCodeTest = '1234';
const mockMatch: CreateMatchDto = {
    accessCode: accessCodeTest,
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

describe('MatchService gameExists', () => {
    let service: MatchService;
    let matchModel: Model<MatchDocument>;
    beforeEach(async () => {
        matchModel = {
            countDocuments: jest.fn(),
            insertMany: jest.fn(),
            create: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            deleteOne: jest.fn(),
            update: jest.fn(),
            updateOne: jest.fn(),
        } as unknown as Model<MatchDocument>;

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                MatchService,
                Logger,
                {
                    provide: getModelToken(Match.name),
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

        service = module.get<MatchService>(MatchService);
        matchModel = module.get<Model<MatchDocument>>(getModelToken(Match.name));
    });
    it('matchExists() should return true if match exists', async () => {
        jest.spyOn(matchModel, 'findOne').mockResolvedValue(mockMatch);
        const result = await service.matchExists(mockMatch.accessCode);
        expect(result).toBe(true);
        expect(matchModel.findOne).toHaveBeenCalledWith({ accessCode: mockMatch.accessCode });
    });

    it('matchExists() should return false if match does not exist', async () => {
        const testAccessCode = '3333';
        jest.spyOn(matchModel, 'findOne').mockResolvedValue(null);
        const result = await service.matchExists(testAccessCode);
        expect(result).toBe(false);
        expect(matchModel.findOne).toHaveBeenCalledWith({ accessCode: testAccessCode });
    });
    it('matchExists() should throw an error if an exception occurs', async () => {
        const testAccessCode = '3333';
        jest.spyOn(matchModel, 'findOne').mockRejectedValue(new Error('Database error'));
        await expect(service.matchExists(testAccessCode)).rejects.toThrowError('Failed to check if match exists: Error: Database error');
        expect(matchModel.findOne).toHaveBeenCalledWith({ accessCode: testAccessCode });
    });

    it('getAllMatches() should return an array of matches', async () => {
        const mockMatches = [
            { accessCode: '1234', game: mockGame },
            { accessCode: '3333', game: mockGame },
        ];
        jest.spyOn(matchModel, 'find').mockResolvedValue([]);
        const initialLength = (await service.getAllMatches()).length;
        // Add another match
        jest.spyOn(matchModel, 'find').mockResolvedValue(mockMatches);
        const afterAddingTwoMatches = (await service.getAllMatches()).length;
        expect(initialLength).toEqual(0);
        expect(afterAddingTwoMatches).toEqual(2);
        const result = await service.getAllMatches();
        expect(result).toEqual(mockMatches);
        expect(matchModel.find).toHaveBeenCalledWith({});
    });

    it('getMatch() should return a match', async () => {
        const matchAccessCode = '1234';
        jest.spyOn(matchModel, 'findOne').mockResolvedValue(mockGame);

        const result = await service.getMatch(matchAccessCode);
        expect(result).toEqual(mockGame);
        expect(matchModel.findOne).toHaveBeenCalledWith({ accessCode: matchAccessCode });
    });
    it('getMatch() should throw an error if an exception occurs', async () => {
        const matchAccessCode = '1234';
        jest.spyOn(matchModel, 'findOne').mockRejectedValue(new Error('Database error'));
        try {
            await service.getMatch(matchAccessCode);
        } catch (error) {
            expect(error).toBe('Failed to get match: Error: Database error');
        }
    });
    it('addMatch() should add a match to the database', async () => {
        await service.addMatch(mockMatch);
        expect(matchModel.create).toHaveBeenCalledWith(mockMatch);
    });

    it('addMatch() should throw an error if insertion fails', async () => {
        const errorMessage = 'Database error';
        const expectedError = 'Failed to insert match: Error: Database error';
        jest.spyOn(matchModel, 'create').mockRejectedValue(new Error(errorMessage));
        try {
            await service.addMatch(mockMatch);
        } catch (error) {
            expect(error).toBe(expectedError);
        }
        expect(matchModel.create).toHaveBeenCalledWith(mockMatch);
    });
    it('addMatch() should fail if mongo query failed', async () => {
        jest.spyOn(matchModel, 'create').mockImplementation(async () => Promise.reject(''));
        await expect(service.addMatch(mockMatch)).rejects.toBeTruthy();
    });

    it('deleteMatch() should end a match', async () => {
        await service.deleteMatch(accessCodeTest);
        expect(matchModel.deleteOne).toHaveBeenCalledWith({ accessCode: accessCodeTest });
    });
    it('deleteMatch() should throw an error if deletion fails', async () => {
        const errorMessage = 'Database error';
        const expectedError = 'Failed to end match: Error: Database error';
        jest.spyOn(matchModel, 'deleteOne').mockRejectedValue(new Error(errorMessage));
        try {
            await service.deleteMatch(accessCodeTest);
        } catch (error) {
            expect(error).toBe(expectedError);
        }
        expect(matchModel.deleteOne).toHaveBeenCalledWith({ accessCode: accessCodeTest });
    });
    it('modifyMatch() should update an existing match', async () => {
        const accessCodeTest2 = '8975';
        const updateMatchDto: UpdateMatchDto = {
            accessCode: accessCodeTest2,
            canBeAccessed: false,
        };

        jest.spyOn(service, 'matchExists').mockResolvedValue(true);

        await service.modifyMatch(accessCodeTest2, updateMatchDto);

        expect(service.matchExists).toHaveBeenCalledWith(accessCodeTest2);
        expect(matchModel.updateOne).toHaveBeenCalledWith({ accessCode: accessCodeTest2 }, updateMatchDto);
    });

    it('modifyMatch() should throw an error if an exception occurs', async () => {
        const accessCodeTest2 = '8975';

        jest.spyOn(matchModel, 'findOne').mockRejectedValue(new Error('Database error'));

        try {
            await service.getMatch(accessCodeTest2);
        } catch (error) {
            expect(error).toBe('Failed to get match: Error: Database error');
        }
    });
});
