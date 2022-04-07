import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
// Create new logger instance
const logger = new Logger('Main');

// Create micro service options
const microserviceOptions = {
  name: 'MAGAZINE_SERVICE',
  transport: Transport.REDIS,
  options: {
    url: 'redis://redis:4000',
  },
};
async function bootstrap() {
  const app = await NestFactory.createMicroservice(
    AppModule,
    microserviceOptions
  );
  app.listen(() => {
    logger.log('Magazine microservice is listening ... ');
  });
}
bootstrap();
