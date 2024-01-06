import { Historic, HistoricDocument } from '@app/model/database/historic';
import { CreateHistoricDto } from '@app/model/dto/historic/create-historic.dto';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class HistoricService {
    constructor(
        @InjectModel(Historic.name) private readonly historicModel: Model<HistoricDocument>,
        private readonly logger: Logger,
    ) {}

    async getWholeHistory(): Promise<Historic[]> {
        return await this.historicModel.find({});
    }

    async getHistory(historyId: string): Promise<Historic> {
        try {
            const history = await this.historicModel.findOne({ id: historyId });
            return history;
        } catch (error) {
            return Promise.reject(`Failed to get history: ${error}`);
        }
    }

    async addHistory(history: CreateHistoricDto): Promise<void> {
        try {
            await this.historicModel.create(history);
        } catch (error) {
            return Promise.reject(`Failed to insert history: ${error}`);
        }
    }

    async deleteHistory(historyId: string): Promise<void> {
        try {
            await this.historicModel.deleteOne({ id: historyId });
        } catch (error) {
            return Promise.reject(`Failed to delete specific history: ${error}`);
        }
    }

    async deleteWholeHistory(): Promise<void> {
        try {
            await this.historicModel.deleteMany();
        } catch (error) {
            return Promise.reject(`Failed to delete history: ${error}`);
        }
    }
}
