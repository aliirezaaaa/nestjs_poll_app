import { Injectable } from '@nestjs/common';
import { createPollID, createUserID } from 'src/ids';
import { CreatePollDto } from 'src/polls/dto/create-poll.dto';
import { JoinPollDto } from 'src/polls/dto/join-poll.dto';
import { RejoinPollDto } from 'src/polls/dto/re-join-poll.dto';

@Injectable()
export class PollsService {

    async createPoll(createPollDto: CreatePollDto) {
        const userId = createUserID()
        const pollId = createPollID()

        return {
            ...createPollDto,
            userId,
            pollId
        }
    }

    async joinPoll(joinPollDto: JoinPollDto) {
        const userId = createUserID()

        return{...joinPollDto,userId}
    }

    async reJoinPoll(rejoinPollDto: RejoinPollDto) {
        return rejoinPollDto
    }
}
