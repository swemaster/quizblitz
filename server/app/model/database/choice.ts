import { ApiProperty } from '@nestjs/swagger';

export class Choice {
    @ApiProperty()
    text: string;

    @ApiProperty()
    isCorrect: boolean;
}
