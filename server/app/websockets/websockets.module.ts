import { Module } from '@nestjs/common';
import { ChatGateway } from './websockets.gateway';

@Module({ providers: [ChatGateway] })
export class WebsocketsModule {}
