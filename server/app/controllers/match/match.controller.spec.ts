import { Match } from '@app/model/database/match';
import { CreateGameDto } from '@app/model/dto/game/create-game.dto';
import { CreateMatchDto } from '@app/model/dto/match/create-match.dto';
import { CreatePlayerDto } from '@app/model/dto/match/create-player.dto';
import { UpdateMatchDto } from '@app/model/dto/match/update-match.dto';
import { GameService } from '@app/services/game/game.service';
import { MatchService } from '@app/services/match/match.service';
import { HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Response } from 'express';
import { SinonStubbedInstance, createStubInstance } from 'sinon';
import { MatchController } from './match.controller';

const createGameDto: CreateGameDto = {
    id: 'test-84f6-4ffc-9030-7c6407da5cad',
    title: 'Game Title',
    isVisible: true,
    lastModification: '2023-10-01', // Provide appropriate value
    duration: 60, // Provide appropriate value
    description: 'Game Description',
    questions: [], // Provide appropriate value
};

const mockPlayer1: CreatePlayerDto = {
    name: 'Manel',
    points: 50,
    status: 'active',
    selection: [2],
};

const mockMatch: CreateMatchDto = {
    accessCode: '1234',
    canBeAccessed: true,
    startDate: '2023-10-01',
    game: createGameDto,
    players: [mockPlayer1],
    time: 10,
    questionId: '123',
    messages: ['hey'],
    creator: 'Organisateur',
    nomsBannis: ['Diego'],
};

const updateMatchDto: UpdateMatchDto = {
    accessCode: '3333',
    canBeAccessed: false,
};

describe('MatchController', () => {
    let controller: MatchController;
    let matchService: SinonStubbedInstance<MatchService>;
    let gameService: SinonStubbedInstance<GameService>;

    beforeEach(async () => {
        matchService = createStubInstance(MatchService);
        const module: TestingModule = await Test.createTestingModule({
            controllers: [MatchController],
            providers: [
                {
                    provide: MatchService,
                    useValue: matchService,
                },
                {
                    provide: GameService,
                    useValue: gameService,
                },
            ],
        }).compile();

        controller = module.get<MatchController>(MatchController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    it('allMatches() should return all matches', async () => {
        const fakeMatches = [new Match(), new Match()];
        matchService.getAllMatches.resolves(fakeMatches);

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.OK);
            return res;
        };
        res.json = (games) => {
            expect(games).toEqual(fakeMatches);
            return res;
        };

        await controller.allMatches(res);
    });

    it('getAllMatches() should return NOT_FOUND when service unable to fetch matches', async () => {
        matchService.getAllMatches.rejects();

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.NOT_FOUND);
            return res;
        };
        res.send = () => res;

        await controller.allMatches(res);
    });

    it('getMatch() should return the match with the specified access code', async () => {
        const accessCode = '1234';

        matchService.getMatch.resolves(mockMatch);

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.OK);
            return res;
        };
        res.json = (game) => {
            expect(game).toEqual(mockMatch);
            return res;
        };

        await controller.getMatch(accessCode, res);
    });

    it('getMatch() should return NOT_FOUND when service is unable to fetch the match', async () => {
        const accessCode = '1234';

        matchService.getMatch.rejects();

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.NOT_FOUND);
            return res;
        };
        res.send = () => res;

        await controller.getMatch(accessCode, res);
    });

    it('addMatch() should succeed if service able to add the match', async () => {
        matchService.addMatch.resolves();

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.CREATED);
            return res;
        };
        res.send = () => res;

        await controller.addMatch(mockMatch, res);
    });

    it('addMatch() should return NOT_FOUND when service add the match', async () => {
        matchService.addMatch.rejects();

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.NOT_FOUND);
            return res;
        };
        res.send = () => res;

        await controller.addMatch(mockMatch, res);
    });

    it('deleteMatch() should succeed if service able to delete the match', async () => {
        matchService.deleteMatch.resolves();

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.OK);
            return res;
        };
        res.send = () => res;

        await controller.deleteMatch(mockMatch.accessCode, res);
    });

    it('deleteMatch() should return NOT_FOUND when service cannot delete the match', async () => {
        matchService.deleteMatch.rejects();

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.NOT_FOUND);
            return res;
        };
        res.send = () => res;

        await controller.deleteMatch(mockMatch.accessCode, res);
    });

    it('modifyMatch() should succeed if service able to modify the match', async () => {
        matchService.modifyMatch.resolves();
        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.OK);
            return res;
        };
        res.send = () => res;

        await controller.modifyMatch(mockMatch.accessCode, updateMatchDto, res);
    });

    it('modifyGame() should return NOT_FOUND when service is unable to modify the match', async () => {
        matchService.modifyMatch.rejects();
        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.NOT_FOUND);
            return res;
        };
        res.send = () => res;

        await controller.modifyMatch(updateMatchDto.accessCode, updateMatchDto, res);
    });
});
