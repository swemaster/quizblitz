import { Match, MatchDocument } from '@app/model/database/match';
import { CreateMatchDto } from '@app/model/dto/match/create-match.dto';
import { UpdateMatchDto } from '@app/model/dto/match/update-match.dto';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class MatchService {
    constructor(
        @InjectModel(Match.name) private readonly matchModel: Model<MatchDocument>,
        private readonly logger: Logger,
    ) {}

    async matchExists(matchAccessCode: string): Promise<boolean> {
        try {
            const match = await this.matchModel.findOne({ accessCode: matchAccessCode }); // Find match by accessCode, returns null if not found
            return !!match; // If `match` is truthy, return true, else return false
        } catch (error) {
            throw new Error(`Failed to check if match exists: ${error}`);
        }
    }

    async getAllMatches(): Promise<Match[]> {
        return await this.matchModel.find({});
    }

    async getMatch(matchAccessCode: string): Promise<Match> {
        try {
            const match = await this.matchModel.findOne({ accessCode: matchAccessCode });
            return match;
        } catch (error) {
            return Promise.reject(`Failed to get match: ${error}`);
        }
    }

    async addMatch(match: CreateMatchDto): Promise<void> {
        try {
            await this.matchModel.create(match);
        } catch (error) {
            return Promise.reject(`Failed to insert match: ${error}`);
        }
    }

    async deleteMatch(matchAccessCode: string): Promise<void> {
        try {
            await this.matchModel.deleteOne({ accessCode: matchAccessCode });
        } catch (error) {
            return Promise.reject(`Failed to end match: ${error}`);
        }
    }

    async modifyMatch(accessCodeMatch: string, match: UpdateMatchDto): Promise<void> {
        const filterQuery = { accessCode: accessCodeMatch };
        const matchExists = await this.matchExists(accessCodeMatch);

        try {
            if (matchExists) {
                await this.matchModel.updateOne(filterQuery, match);
            }
        } catch (error) {
            return Promise.reject(`Failed to update match: ${error}`);
        }
    }
}
