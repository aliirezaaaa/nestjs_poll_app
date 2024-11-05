import { Body, Controller, Post } from '@nestjs/common';
import { CreatePollDto } from 'src/polls/dto/create-poll.dto';
import { JoinPollDto } from 'src/polls/dto/join-poll.dto';
import { RejoinPollDto } from 'src/polls/dto/re-join-poll.dto';
import { PollsService } from 'src/polls/polls.service';

@Controller('polls')
export class PollsController {
  constructor(private readonly pollsService:PollsService){}

  @Post()
  async createPoll(@Body() createPollDto: CreatePollDto) {
    return await this.pollsService.createPoll(createPollDto)
  }

  @Post('/join')
  async joinPoll(@Body() joinPollDto:JoinPollDto) {
    return await this.pollsService.joinPoll(joinPollDto)
  }

  @Post('/rejoin')
  async reJoinPoll(@Body() rejoinPollDto:RejoinPollDto) {
    return await this.pollsService.reJoinPoll(rejoinPollDto)
  }
}
