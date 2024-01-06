import { GameController } from '@app/controllers/game/game.controller';
import { HistoricController } from '@app/controllers/historic/historic.controller';
import { MatchController } from '@app/controllers/match/match.controller';
import { Game, gameSchema } from '@app/model/database/game';
import { Historic, historicSchema } from '@app/model/database/historic';
import { Match, matchSchema } from '@app/model/database/match';
import { GameService } from '@app/services/game/game.service';
import { HistoricService } from '@app/services/historic/historic.service';
import { MatchService } from '@app/services/match/match.service';
import { Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { WebsocketsModule } from './websockets/websockets.module';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        MongooseModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: async (config: ConfigService) => ({
                uri: config.get<string>('DATABASE_CONNECTION_STRING'), // Loaded from .env
            }),
        }),
        MongooseModule.forFeature([{ name: Game.name, schema: gameSchema }]), // Register the Game model
        MongooseModule.forFeature([{ name: Match.name, schema: matchSchema }]), // Register the Match model
        MongooseModule.forFeature([{ name: Historic.name, schema: historicSchema }]), // Register the Historic model
        WebsocketsModule,
    ],
    controllers: [GameController, MatchController, HistoricController],
    providers: [GameService, MatchService, HistoricService, Logger],
})
export class AppModule {}
