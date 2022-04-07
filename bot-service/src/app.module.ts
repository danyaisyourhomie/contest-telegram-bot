import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MagazinesModule } from './magazines/magazines.module';
import { Module } from '@nestjs/common';

@Module({
  imports: [MagazinesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
