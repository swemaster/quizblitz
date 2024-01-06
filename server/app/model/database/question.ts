import { ApiProperty } from '@nestjs/swagger';
import { Choice } from './choice';

export class Question {
    @ApiProperty()
    id: string;

    @ApiProperty()
    type: string;

    @ApiProperty()
    text: string;

    @ApiProperty()
    points: number;

    @ApiProperty({ type: [Choice] })
    choices: Choice[];
}
