import { Test, TestingModule } from '@nestjs/testing';
import { PollsService } from './polls.service';
import { PollsRepository } from '../polls/polls.repository';
import { JwtService } from '@nestjs/jwt';
import { CreatePollFields } from './types';
import { Poll } from 'shared/poll-types';
import { createPollID, createUserID } from '../ids';

jest.mock('../ids', () => ({
  createPollID: jest.fn(),
  createUserID: jest.fn(),
}));

describe('PollsService', () => {
  let service: PollsService;
  let repository: PollsRepository;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PollsService,
        {
          provide: PollsRepository,
          useValue: {
            createPoll: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<PollsService>(PollsService);
    repository = module.get<PollsRepository>(PollsRepository);
    jwtService = module.get<JwtService>(JwtService);

    (createPollID as jest.Mock).mockReturnValue('poll-id');
    (createUserID as jest.Mock).mockReturnValue('user-id');
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(repository).toBeDefined();
    expect(jwtService).toBeDefined();
  });

  it('should create a poll', async () => {
    const createPollFields: CreatePollFields = {
      topic: 'topic',
      votesPerVoter: 2,
      name: 'name',
    };
    const createdPoll: Poll = {
      id: 'poll-id', // Ensure this matches the mock return value
      topic: 'topic',
      votesPerVoter: 2,
      participants: {},
      nominations: {},
      rankings: {},
      results: [],
      adminID: 'user-id', // Ensure this matches the mock return value
      hasVotingStarted: false,
    };
    const signedString = 'signed-token';

    jest.spyOn(repository, 'createPoll').mockResolvedValue(createdPoll);
    jest.spyOn(jwtService, 'sign').mockReturnValue(signedString as string);

    const result = await service.createPoll(createPollFields);
    expect(result).toEqual({
      poll: createdPoll,
      accessToken: signedString,
    });
    expect(repository.createPoll).toHaveBeenCalledWith({
      ...createPollFields,
      pollID: 'poll-id', // Ensure this matches the mock return value
      userID: 'user-id', // Ensure this matches the mock return value
    });
    expect(jwtService.sign).toHaveBeenCalledWith(
      { pollID: createdPoll.id, name: createPollFields.name },
      { subject: 'user-id' },
    );
  });
});
