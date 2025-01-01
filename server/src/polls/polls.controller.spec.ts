/* eslint-disable prettier/prettier */
import { Test, TestingModule } from '@nestjs/testing';
import { PollsService } from '../polls/polls.service';
import { PollsController } from '../polls/polls.controller';
import { CreatePollDto, GetJoinPollToken } from '../polls/dtos';
import { Poll } from 'shared/poll-types';

const poll: Poll = {
    id: 'id',
    topic: 'topic',
    votesPerVoter: 2,
    participants: {},
    adminID: 'admin-id',
    nominations: {},
    rankings: {},
    results: [],
    hasVotingStarted: false,
}

describe('PollsController', () => {
    let controller: PollsController;
    let service: PollsService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [PollsController],
            providers: [
                {
                    provide: PollsService,
                    useValue: {
                        createPoll: jest.fn(),
                        getJoinPollToken: jest.fn(),
                    },
                },
            ],
        }).compile()

        controller = module.get<PollsController>(PollsController)
        service = module.get<PollsService>(PollsService)
    });

    it('should be defined', () => {
        expect(controller).toBeDefined()
        expect(service).toBeDefined()
    })

    describe('createPoll', () => {
        it('should call PollsService.createPoll with correct arguments', async () => {
            const createPollDto: CreatePollDto = {
                topic: 'topic',
                votesPerVoter: 2,
                name: 'alireza'
            }

            const mockResult = {
                poll: poll,
                accessToken: 'access-jwt-token',
            }

            jest.spyOn(service, 'createPoll').mockResolvedValue(mockResult)

            const result = await controller.createPoll(createPollDto)

            expect(result).toEqual(mockResult)
            expect(service.createPoll).toHaveBeenCalledWith(createPollDto)
        })

        it('should throw an error if service failes', async () => {
            const createPollDto: CreatePollDto = {
                topic: 'topic',
                votesPerVoter: 2,
                name: 'alireza'
            }

            jest.spyOn(service, 'createPoll').mockRejectedValue(new Error('Service Error'))

            try {
                await controller.createPoll(createPollDto)
            } catch (error) {
                expect(error).toBeInstanceOf(Error)
                expect(error.message).toBe('Service Error')
            }
        })
    })

    describe('getJoinPollToken', () => {
        it('should call PollsService.getJoinPollToken with correct arguments', async () => {
            const getJoinPollToken: GetJoinPollToken = {
                name: 'name',
                pollID: 'poll-id'
            }
            const mockResult = {
                poll: poll,
                accessToken: 'access-jwt-token',
            }

            jest.spyOn(service, 'getJoinPollToken').mockResolvedValue(mockResult)

            const result = await controller.getJoinPollToken(getJoinPollToken)

            expect(result).toEqual(mockResult)
            expect(service.getJoinPollToken).toHaveBeenCalledWith(getJoinPollToken)
        })

        it('should throw an error if service fails', async () => {
            const getJoinPollToken: GetJoinPollToken = {
                name: 'name',
                pollID: 'poll-id'
            }

            jest.spyOn(service, 'getJoinPollToken').mockRejectedValue(new Error('Service Error'))

            try {
                await controller.getJoinPollToken(getJoinPollToken)
            } catch (error) {
                expect(error).toBeInstanceOf(Error)
                expect(error.message).toBe('Service Error')
            }
        })
    })
});
