import { ApiProperty } from '@nestjs/swagger';
import { ArrayMinSize, IsArray, IsNumber, IsString } from 'class-validator';

export class CreatePlayerDto {
    @ApiProperty()
    @IsString()
    name: string;

    @ApiProperty()
    @IsNumber()
    points: number;

    @ApiProperty()
    @IsString()
    status: string;

    @ApiProperty()
    @IsArray()
    @ArrayMinSize(0)
    @IsNumber({}, { each: true })
    selection: number[];
}
