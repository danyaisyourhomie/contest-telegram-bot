import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './../../api/src/auth/auth.module';
import { AuthService } from './../../api/src/auth/auth.service';
import { MagazinesModule } from './magazines/magazines.module';
import { Module } from '@nestjs/common';

@Module({
  imports: [AuthModule, MagazinesModule],
  controllers: [AppController],
  providers: [AuthService, AppService],
})
export class AppModule {}
