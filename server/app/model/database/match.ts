import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document } from 'mongoose';
import { Game } from './game';
import { Player } from './player';

export type MatchDocument = Match & Document;

@Schema()
export class Match {
    @ApiProperty()
    @Prop({ required: true })
    accessCode?: string;

    @ApiProperty()
    @Prop({ required: true })
    canBeAccessed: boolean;

    @ApiProperty()
    @Prop({ required: true })
    startDate: string;

    @ApiProperty()
    @Prop({ required: true })
    game: Game;

    @ApiProperty()
    @Prop({ required: true })
    players: Player[];

    @ApiProperty()
    @Prop({ required: true })
    time: number;

    @ApiProperty()
    @Prop({ required: false })
    questionId: string;

    @ApiProperty()
    @Prop({ required: false })
    messages: string[];

    @ApiProperty()
    @Prop({ required: false })
    creator: string;

    @ApiProperty()
    @Prop({ required: false })
    nomsBannis: string[];
}

export const matchSchema = SchemaFactory.createForClass(Match);
