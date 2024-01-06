import { CreateHistoricDto } from '@app/model/dto/historic/create-historic.dto';
import { HistoricService } from '@app/services/historic/historic.service';
import { Body, Controller, Delete, Get, HttpStatus, Param, Post, Res } from '@nestjs/common';
import { ApiCreatedResponse, ApiNotFoundResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';

@ApiTags('Historic')
@Controller('history')
export class HistoricController {
    constructor(private readonly historicService: HistoricService) {}

    @ApiOkResponse({
        description: 'Returns whole history of matches',
    })
    @ApiNotFoundResponse({
        description: 'Return NOT_FOUND http status when request fails',
    })
    @Get('/')
    async allHistory(@Res() response: Response) {
        try {
            const allHistory = await this.historicService.getWholeHistory();
            response.status(HttpStatus.OK).json(allHistory);
        } catch (error) {
            response.status(HttpStatus.NOT_FOUND).send(error.message);
        }
    }

    @ApiOkResponse({
        description: 'Get history by id',
    })
    @ApiNotFoundResponse({
        description: 'Return NOT_FOUND http status when request fails',
    })
    @Get('/:id')
    async getHistory(@Param('id') id: string, @Res() response: Response) {
        try {
            const history = await this.historicService.getHistory(id);
            response.status(HttpStatus.OK).json(history);
        } catch (error) {
            response.status(HttpStatus.NOT_FOUND).send(error.message);
        }
    }

    @ApiCreatedResponse({
        description: 'Add new match history',
    })
    @ApiNotFoundResponse({
        description: 'Return NOT_FOUND http status when request fails',
    })
    @Post('/')
    async addHistory(@Body() historyDto: CreateHistoricDto, @Res() response: Response) {
        try {
            await this.historicService.addHistory(historyDto);
            response.status(HttpStatus.CREATED).send();
        } catch (error) {
            response.status(HttpStatus.NOT_FOUND).send(error.message);
        }
    }

    @ApiOkResponse({
        description: 'Delete a specific match history',
    })
    @ApiNotFoundResponse({
        description: 'Return NOT_FOUND http status when request fails',
    })
    @Delete('/:id')
    async deleteHistory(@Param('id') id: string, @Res() response: Response) {
        try {
            await this.historicService.deleteHistory(id);
            response.status(HttpStatus.OK).send();
        } catch (error) {
            response.status(HttpStatus.NOT_FOUND).send(error.message);
        }
    }

    @ApiOkResponse({
        description: 'Delete whole match history',
    })
    @ApiNotFoundResponse({
        description: 'Return NOT_FOUND http status when request fails',
    })
    @Delete('/')
    async deleteWholeHistory(@Res() response: Response) {
        try {
            await this.historicService.deleteWholeHistory();
            response.status(HttpStatus.OK).send();
        } catch (error) {
            response.status(HttpStatus.NOT_FOUND).send(error.message);
        }
    }
}
