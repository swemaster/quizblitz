import { Prop, Schema } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document } from 'mongoose';

export type PlayerDocument = Player & Document;

@Schema()
export class Player {
    @ApiProperty()
    @Prop({ required: false })
    name?: string;

    @ApiProperty()
    @Prop({ required: false })
    points: number;

    @ApiProperty()
    @Prop({ required: false })
    status: string;

    @ApiProperty()
    @Prop({ required: false })
    selection: number[];
}
