import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsString } from 'class-validator';

export class CreateChoiceDto {
    @ApiProperty()
    @IsString()
    text: string;

    @ApiProperty()
    @IsBoolean()
    isCorrect: boolean;
}
