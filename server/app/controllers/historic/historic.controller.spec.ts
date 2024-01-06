import { Historic } from '@app/model/database/historic';
import { CreateGameDto } from '@app/model/dto/game/create-game.dto';
import { CreateHistoricDto } from '@app/model/dto/historic/create-historic.dto';
import { CreateMatchDto } from '@app/model/dto/match/create-match.dto';
import { CreatePlayerDto } from '@app/model/dto/match/create-player.dto';
import { HistoricService } from '@app/services/historic/historic.service';
import { HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Response } from 'express';
import { SinonStubbedInstance, createStubInstance } from 'sinon';
import { HistoricController } from './historic.controller';

const mockGame: CreateGameDto = {
    id: 'test-84f6-4ffc-9030-7c6407da5cad',
    title: 'Game Title',
    isVisible: true,
    lastModification: '2023-10-01',
    duration: 60,
    description: 'Game Description',
    questions: [],
};

const mockPlayer: CreatePlayerDto = {
    name: 'Manel',
    points: 50,
    status: 'active',
    selection: [2],
};

const mockMatch: CreateMatchDto = {
    accessCode: '1234',
    canBeAccessed: true,
    startDate: '2023-10-01',
    game: mockGame,
    players: [mockPlayer],
    time: 10,
    questionId: '123',
    messages: ['hey'],
    creator: 'Organisateur',
    nomsBannis: ['Diego'],
};

const mockHistory: CreateHistoricDto = {
    id: mockMatch.accessCode,
    gameName: mockGame.title,
    playDate: '2024-01-01',
    players: mockMatch.players.length,
    bestPoints: mockPlayer.points,
};

describe('HistoricController', () => {
    let controller: HistoricController;
    let historicService: SinonStubbedInstance<HistoricService>;

    beforeEach(async () => {
        historicService = createStubInstance(HistoricService);
        const module: TestingModule = await Test.createTestingModule({
            controllers: [HistoricController],
            providers: [
                {
                    provide: HistoricService,
                    useValue: historicService,
                },
            ],
        }).compile();

        controller = module.get<HistoricController>(HistoricController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    it('allHistory() should return the whole history', async () => {
        const fakeHistorics = [new Historic(), new Historic()];
        historicService.getWholeHistory.resolves(fakeHistorics);

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.OK);
            return res;
        };
        res.json = (historics) => {
            expect(historics).toEqual(fakeHistorics);
            return res;
        };

        await controller.allHistory(res);
    });

    it('getWholeHistory() should return NOT_FOUND when service unable to fetch history', async () => {
        historicService.getWholeHistory.rejects();

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.NOT_FOUND);
            return res;
        };
        res.send = () => res;

        await controller.allHistory(res);
    });

    it('getHistory() should return the match with the specified access code', async () => {
        const id = '1234';

        historicService.getHistory.resolves(mockHistory);

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.OK);
            return res;
        };
        res.json = (history) => {
            expect(history).toEqual(mockHistory);
            return res;
        };

        await controller.getHistory(id, res);
    });

    it('getHistory() should return NOT_FOUND when service is unable to fetch the match history', async () => {
        const id = '1234';

        historicService.getHistory.rejects();

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.NOT_FOUND);
            return res;
        };
        res.send = () => res;

        await controller.getHistory(id, res);
    });

    it('addHistory() should succeed if service able to add the match history', async () => {
        historicService.addHistory.resolves();

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.CREATED);
            return res;
        };
        res.send = () => res;

        await controller.addHistory(mockHistory, res);
    });

    it('addHistory() should return NOT_FOUND when service add the match history', async () => {
        historicService.addHistory.rejects();

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.NOT_FOUND);
            return res;
        };
        res.send = () => res;

        await controller.addHistory(mockHistory, res);
    });

    it('deleteHistory() should succeed if service able to delete the match history', async () => {
        historicService.deleteHistory.resolves();

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.OK);
            return res;
        };
        res.send = () => res;

        await controller.deleteHistory(mockHistory.id, res);
    });

    it('deleteHistory() should return NOT_FOUND when service cannot delete the match history', async () => {
        historicService.deleteHistory.rejects();

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.NOT_FOUND);
            return res;
        };
        res.send = () => res;

        await controller.deleteHistory(mockHistory.id, res);
    });

    it('deleteWholeHistory() should succeed if service able to delete the whole match history', async () => {
        historicService.deleteWholeHistory.resolves();

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.OK);
            return res;
        };
        res.send = () => res;

        await controller.deleteWholeHistory(res);
    });

    it('deleteWholeHistory() should return NOT_FOUND when service cannot delete the whole match history', async () => {
        historicService.deleteWholeHistory.rejects();

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.NOT_FOUND);
            return res;
        };
        res.send = () => res;

        await controller.deleteWholeHistory(res);
    });
});
