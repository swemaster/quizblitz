import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsString } from 'class-validator';
import { CreateChoiceDto } from './create-choice.dto';

export class CreateQuestionDto {
    @ApiProperty()
    @IsString()
    id: string;

    @ApiProperty()
    @IsString()
    type: string;

    @ApiProperty()
    @IsString()
    text: string;

    @ApiProperty()
    @IsNumber()
    points: number;

    @ApiProperty()
    @Type(() => CreateChoiceDto)
    choices: CreateChoiceDto[];

    @ApiProperty()
    @IsString()
    textZone: string;
}
