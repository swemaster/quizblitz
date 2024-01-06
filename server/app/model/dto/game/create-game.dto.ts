import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsString, IsBoolean, IsNumber, ArrayMinSize, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateQuestionDto } from './create-question.dto';
import { UUID } from 'crypto';

export class CreateGameDto {
    @ApiProperty()
    @IsUUID()
    id: UUID;

    @ApiProperty()
    @IsString()
    title: string;

    @ApiProperty()
    @IsBoolean()
    isVisible: boolean;

    @ApiProperty()
    @IsString()
    lastModification: string;

    @ApiProperty()
    @IsNumber()
    duration: number;

    @ApiProperty()
    @IsString()
    description: string;

    @ApiProperty()
    @ArrayMinSize(1)
    @ValidateNested({ each: true })
    @Type(() => CreateQuestionDto)
    questions: CreateQuestionDto[];

    constructor(data: Partial<CreateGameDto>) {
        Object.assign(this, data);
    }
}
