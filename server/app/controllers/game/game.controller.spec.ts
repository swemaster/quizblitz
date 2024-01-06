import { Game } from '@app/model/database/game';
import { CreateGameDto } from '@app/model/dto/game/create-game.dto';
import { GameService } from '@app/services/game/game.service';
import { HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UUID } from 'crypto';
import { Response } from 'express';
import { SinonStubbedInstance, createStubInstance } from 'sinon';
import { GameController } from './game.controller';

describe('GameController', () => {
    let controller: GameController;
    let gameService: SinonStubbedInstance<GameService>;

    const createGameDto: CreateGameDto = {
        id: 'test-84f6-4ffc-9030-7c6407da5cad',
        title: 'Game Title',
        isVisible: true,
        lastModification: '2023-10-01', // Provide appropriate value
        duration: 60, // Provide appropriate value
        description: 'Game Description',
        questions: [], // Provide appropriate value
    };

    beforeEach(async () => {
        gameService = createStubInstance(GameService);
        const module: TestingModule = await Test.createTestingModule({
            controllers: [GameController],
            providers: [
                {
                    provide: GameService,
                    useValue: gameService,
                },
            ],
        }).compile();

        controller = module.get<GameController>(GameController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    it('getAllGames() should return all games', async () => {
        const fakeGames = [new Game(), new Game()];
        gameService.getAllGames.resolves(fakeGames);

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.OK);
            return res;
        };
        res.json = (games) => {
            expect(games).toEqual(fakeGames);
            return res;
        };

        await controller.allGames(res);
    });

    it('getAllGames() should return NOT_FOUND when service unable to fetch games', async () => {
        gameService.getAllGames.rejects();

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.NOT_FOUND);
            return res;
        };
        res.send = () => res;

        await controller.allGames(res);
    });

    it('getGame() should return the game with the specified ID', async () => {
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

        gameService.getGame.resolves(mockGame);

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.OK);
            return res;
        };
        res.json = (game) => {
            expect(game).toEqual(mockGame);
            return res;
        };

        await controller.getGame(gameId, res);
    });

    it('getGame() should return NOT_FOUND when service is unable to fetch the game', async () => {
        const gameId: UUID = 'e3eb44d2-4218-40cb-8f26-815afdd90010';

        gameService.getGame.rejects();

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.NOT_FOUND);
            return res;
        };
        res.send = () => res;

        await controller.getGame(gameId, res);
    });

    it('addGame() should succeed if service able to add the Game', async () => {
        gameService.addGame.resolves();

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.CREATED);
            return res;
        };
        res.send = () => res;

        await controller.addGame(createGameDto, res);
    });

    it('addGame() should return NOT_FOUND when service add the Game', async () => {
        gameService.addGame.rejects();

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.NOT_FOUND);
            return res;
        };
        res.send = () => res;

        await controller.addGame(createGameDto, res);
    });

    it('modifyGame() should succeed if service able to modify the game or create a game', async () => {
        gameService.modifyGame.resolves();

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.OK);
            return res;
        };
        res.send = () => res;

        await controller.modifyGame(createGameDto.id, createGameDto, res);
    });

    it('modifyGame() should return NOT_FOUND when service is unable to modify the game', async () => {
        const gameId: UUID = 'e3eb44d2-4218-40cb-8f26-815afdd90010';
        const updateGameDto = {
            id: gameId,
            title: 'New Title',
            isVisible: false,
        };

        gameService.modifyGame.rejects();

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.NOT_FOUND);
            return res;
        };
        res.send = () => res;

        await controller.modifyGame(gameId, updateGameDto, res);
    });

    it('deleteGame() should succeed if service able to delete the game', async () => {
        gameService.deleteGame.resolves();

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.OK);
            return res;
        };
        res.send = () => res;

        await controller.deleteGame(createGameDto.id, res);
    });

    it('deleteGame() should return NOT_FOUND when service cannot delete the game', async () => {
        gameService.deleteGame.rejects();

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.NOT_FOUND);
            return res;
        };
        res.send = () => res;

        await controller.deleteGame(createGameDto.id, res);
    });
});
