import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { ConfigModule } from '@nestjs/config';
import { PollsModule } from './polls/polls.module';

@Module({
  imports: [ConfigModule.forRoot(), PollsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
