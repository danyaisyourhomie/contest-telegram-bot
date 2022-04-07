import { Controller, Get } from '@nestjs/common';

import { AppService } from './app.service';

const logger = require('./logger');

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    logger.info({ message: 'Service was pinged' });
    return this.appService.getHello();
  }
}
