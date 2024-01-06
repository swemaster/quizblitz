import { Game } from '@app/model/database/game';
import { Player } from '@app/model/database/player';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsBoolean, IsNumber, IsString, ValidateNested } from 'class-validator';

export class CreateMatchDto {
    @ApiProperty()
    @IsString()
    accessCode: string;

    @ApiProperty()
    @IsBoolean()
    canBeAccessed: boolean;

    @ApiProperty()
    @IsString()
    startDate: string;

    @ApiProperty()
    @Type(() => Game)
    game: Game;

    @ApiProperty()
    @ArrayMinSize(1)
    @ValidateNested({ each: true })
    @Type(() => Player)
    players: Player[];

    @ApiProperty()
    @IsNumber()
    time: number;

    @ApiProperty()
    @IsString()
    questionId: string;

    @ApiProperty()
    @IsArray()
    @IsString({ each: true })
    @ArrayMinSize(0)
    messages: string[];

    @ApiProperty()
    @IsString()
    creator: string;

    @ApiProperty()
    @IsArray()
    @IsString({ each: true })
    @ArrayMinSize(0)
    nomsBannis: string[];

    constructor(data: Partial<CreateMatchDto>) {
        Object.assign(this, data);
    }
}
