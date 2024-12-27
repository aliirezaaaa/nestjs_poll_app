import {
  Body,
  Controller,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { CreatePollDto, GetJoinPollToken } from './dtos';
import { PollsService } from './polls.service';

@UsePipes(new ValidationPipe())
@Controller('polls')
export class PollsController {
  // eslint-disable-next-line prettier/prettier
  constructor(private pollsService: PollsService) { }

  @Post()
  async createPoll(@Body() createPollDto: CreatePollDto) {
    const result = await this.pollsService.createPoll(createPollDto);

    return result;
  }

  @Post('/join')
  async getJoinPollToken(@Body() joinPollDto: GetJoinPollToken) {
    const result = await this.pollsService.getJoinPollToken(joinPollDto);

    return result;
  }
}
