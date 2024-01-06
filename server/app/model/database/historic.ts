import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document } from 'mongoose';

export type HistoricDocument = Historic & Document;

@Schema()
export class Historic {
    @ApiProperty()
    @Prop({ required: true })
    id?: string;

    @ApiProperty()
    @Prop({ required: true })
    gameName: string;

    @ApiProperty()
    @Prop({ required: true })
    playDate: string;

    @ApiProperty()
    @Prop({ required: true })
    players: number;

    @ApiProperty()
    @Prop({ required: true })
    bestPoints: number;
}

export const historicSchema = SchemaFactory.createForClass(Historic);
