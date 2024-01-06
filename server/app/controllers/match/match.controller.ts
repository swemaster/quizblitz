import { CreateMatchDto } from '@app/model/dto/match/create-match.dto';
import { MatchService } from '@app/services/match/match.service';
import { Body, Controller, Delete, Get, HttpStatus, Param, Patch, Post, Res } from '@nestjs/common';
import { Response } from 'express';

import { UpdateMatchDto } from '@app/model/dto/match/update-match.dto';
import { GameService } from '@app/services/game/game.service';
import { ApiCreatedResponse, ApiNotFoundResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Matches')
@Controller('waitingplayers')
export class MatchController {
    constructor(
        private readonly matchService: MatchService,
        private readonly gameService: GameService,
    ) {}

    @ApiOkResponse({
        description: 'Returns all matches',
    })
    @ApiNotFoundResponse({
        description: 'Return NOT_FOUND http status when request fails',
    })
    @Get('/')
    async allMatches(@Res() response: Response) {
        try {
            const allMatches = await this.matchService.getAllMatches();
            response.status(HttpStatus.OK).json(allMatches);
        } catch (error) {
            response.status(HttpStatus.NOT_FOUND).send(error.message);
        }
    }

    @ApiOkResponse({
        description: 'Get match by access Code',
    })
    @ApiNotFoundResponse({
        description: 'Return NOT_FOUND http status when request fails',
    })
    @Get('/:accessCode')
    async getMatch(@Param('accessCode') accessCode: string, @Res() response: Response) {
        try {
            const match = await this.matchService.getMatch(accessCode);
            response.status(HttpStatus.OK).json(match);
        } catch (error) {
            response.status(HttpStatus.NOT_FOUND).send(error.message);
        }
    }

    @ApiCreatedResponse({
        description: 'Add new match',
    })
    @ApiNotFoundResponse({
        description: 'Return NOT_FOUND http status when request fails',
    })
    @Post('/')
    async addMatch(@Body() matchDto: CreateMatchDto, @Res() response: Response) {
        try {
            await this.matchService.addMatch(matchDto);
            response.status(HttpStatus.CREATED).send();
        } catch (error) {
            response.status(HttpStatus.NOT_FOUND).send(error.message);
        }
    }

    @ApiOkResponse({
        description: 'Delete a match',
    })
    @ApiNotFoundResponse({
        description: 'Return NOT_FOUND http status when request fails',
    })
    @Delete('/:accessCode')
    async deleteMatch(@Param('accessCode') accessCode: string, @Res() response: Response) {
        try {
            await this.matchService.deleteMatch(accessCode);
            response.status(HttpStatus.OK).send();
        } catch (error) {
            response.status(HttpStatus.NOT_FOUND).send(error.message);
        }
    }

    @ApiCreatedResponse({
        description: 'Modify a match',
    })
    @ApiNotFoundResponse({
        description: 'Return NOT_FOUND http status when request fails',
    })
    @Patch('/:accessCode')
    async modifyMatch(@Param('accessCode') accessCode: string, @Body() matchDto: UpdateMatchDto, @Res() response: Response) {
        try {
            await this.matchService.modifyMatch(accessCode, matchDto);
            response.status(HttpStatus.OK).send();
        } catch (error) {
            response.status(HttpStatus.NOT_FOUND).send(error.message);
        }
    }
}
