import {
  Body,
  Controller,
  Post,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { CreatePollDto, JoinPollDto } from './dtos';
import { PollsService } from './polls.service';
import { ControllerAuthGuard } from '../../guards/controller-auth.guard';
import { RequestWithAuth } from './types';

@UsePipes(new ValidationPipe())
@Controller('polls')
export class PollsController {
  constructor(private pollsService: PollsService) {}

  // @Post()
  // async create(@Body() createPollDto: CreatePollDto) {
  //   const result = await this.pollsService.createPoll(createPollDto);

  //   return result;
  // }
  @Post()
  async create(@Body() createPollDto: CreatePollDto) {
    console.log(
      `Received votesPerVoter type: ${typeof createPollDto.votesPerVoter}`,
    );
    console.log(`Received votesPerVoter value: ${createPollDto.votesPerVoter}`);

    const result = await this.pollsService.createPoll(createPollDto);
    return result;
  }

  @Post('/join')
  async join(@Body() joinPollDto: JoinPollDto) {
    const result = await this.pollsService.joinPoll(joinPollDto);

    return result;
  }

  @UseGuards(ControllerAuthGuard)
  @Post('/rejoin')
  async rejoin(@Req() request: RequestWithAuth) {
    const { userID, pollID, name } = request;
    const result = await this.pollsService.rejoinPoll({
      name,
      pollID,
      userID,
    });

    return result;
  }
}
