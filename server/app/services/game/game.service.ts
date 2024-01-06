import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Game, GameDocument } from '@app/model/database/game';
import { CreateGameDto } from '@app/model/dto/game/create-game.dto';
import { UpdateGameDto } from '@app/model/dto/game/update-game.dto';
import { UUID } from 'crypto';

@Injectable()
export class GameService {
    constructor(
        @InjectModel(Game.name) private readonly gameModel: Model<GameDocument>,
        private readonly logger: Logger,
    ) {}

    async gameExists(gameId: UUID): Promise<boolean> {
        try {
            const game = await this.gameModel.findOne({ id: gameId }); // Find game by id, returns null if not found
            return !!game; // If `game` is truthy, return true, else return false
        } catch (error) {
            throw new Error(`Failed to check if game exists: ${error}`);
        }
    }

    async getAllGames(): Promise<Game[]> {
        return await this.gameModel.find({});
    }

    async getGame(gameId: UUID): Promise<Game> {
        try {
            const game = await this.gameModel.findOne({ id: gameId });
            return game;
        } catch (error) {
            return Promise.reject(`Failed to get game: ${error}`);
        }
    }

    async addGame(game: CreateGameDto): Promise<void> {
        try {
            await this.gameModel.create(game);
        } catch (error) {
            return Promise.reject(`Failed to insert game: ${error}`);
        }
    }

    async modifyGame(gameId: UUID, game: UpdateGameDto): Promise<void> {
        const filterQuery = { id: gameId };
        const gameExists = await this.gameExists(gameId);
        try {
            if (gameExists) {
                await this.gameModel.updateOne(filterQuery, game);
            } else {
                // If the game doesn't exist, create a new one
                await this.gameModel.create(game);
            }
        } catch (error) {
            return Promise.reject(`Failed to update game: ${error}`);
        }
    }

    async deleteGame(gameId: UUID): Promise<void> {
        try {
            await this.gameModel.deleteOne({ id: gameId });
        } catch (error) {
            return Promise.reject(`Failed to delete game: ${error}`);
        }
    }
}
