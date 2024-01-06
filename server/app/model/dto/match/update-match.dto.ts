import { Game } from '@app/model/database/game';
import { Player } from '@app/model/database/player';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsBoolean, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';

export class UpdateMatchDto {
    @ApiProperty()
    @IsString()
    accessCode: string;

    @ApiProperty()
    @IsBoolean()
    canBeAccessed: boolean;

    @ApiProperty()
    @IsString()
    startDate?: string;

    @ApiProperty()
    @Type(() => Game)
    game?: Game;

    @ApiProperty()
    @IsOptional()
    @ArrayMinSize(1)
    @ValidateNested({ each: true })
    @Type(() => Player)
    players?: Player[];

    @ApiProperty()
    @IsNumber()
    time?: number;

    @ApiProperty()
    @IsString()
    questionId?: string;

    @ApiProperty()
    @ArrayMinSize(0)
    @IsArray()
    messages?: string[];

    @ApiProperty()
    @IsString()
    creator?: string;

    @ApiProperty()
    @IsArray()
    nomsBannis?: string[];
}
