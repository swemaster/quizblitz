import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsOptional, IsString, IsBoolean, IsNumber, ArrayMinSize, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateQuestionDto } from './create-question.dto';

export class UpdateGameDto {
    @ApiProperty()
    @IsUUID()
    id: string;

    @ApiProperty()
    @IsOptional()
    @IsString()
    title?: string;

    @ApiProperty()
    @IsOptional()
    @IsBoolean()
    isVisible?: boolean;

    @ApiProperty()
    @IsOptional()
    @IsString()
    lastModification?: string;

    @ApiProperty()
    @IsOptional()
    @IsNumber()
    duration?: number;

    @ApiProperty()
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty()
    @IsOptional()
    @ArrayMinSize(1)
    @ValidateNested({ each: true })
    @Type(() => CreateQuestionDto)
    questions?: CreateQuestionDto[];
}
