import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, Min } from 'class-validator';

export class CreateHistoricDto {
    @ApiProperty()
    @IsString()
    id: string;

    @ApiProperty()
    @IsString()
    gameName: string;

    @ApiProperty()
    @IsString()
    playDate: string;

    @ApiProperty()
    @IsNumber()
    @Min(1, { message: 'Players must be greater than 0' })
    players: number;

    @ApiProperty()
    @IsNumber()
    bestPoints: number;
}
