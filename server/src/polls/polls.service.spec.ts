import { Test, TestingModule } from '@nestjs/testing';
import { PollsService } from './polls.service';
import { PollsRepository } from '../polls/polls.repository';
import { JwtService } from '@nestjs/jwt';
import {
  AddNominationFields,
  addParticipantFields,
  CreatePollFields,
  GetJoinPollTokenFields,
  SubmitRankingFields,
} from './types';
import { Poll } from 'shared/poll-types';
import { createPollID, createUserID, createNominationID } from '../ids';
import getResults from '../polls/getResults';

jest.mock('../ids', () => ({
  createPollID: jest.fn(),
  createUserID: jest.fn(),
  createNominationID: jest.fn(),
}));

jest.mock('../polls/getResults');

const createdPoll: Poll = {
  id: 'poll-id',
  topic: 'topic',
  votesPerVoter: 2,
  participants: {},
  nominations: {},
  rankings: {},
  results: [],
  adminID: 'user-id',
  hasVotingStarted: false,
};

const signedString = 'signed-token';

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
            getPoll: jest.fn(),
            addParticipant: jest.fn(),
            removeParticipant: jest.fn(),
            addNomination: jest.fn(),
            removeNomination: jest.fn(),
            startPoll: jest.fn(),
            submitRankings: jest.fn(),
            addParticipantRankings: jest.fn(),
            computeResults: jest.fn(),
            addResults: jest.fn(),
            deletePoll: jest.fn(),
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

    jest.spyOn(repository, 'createPoll').mockResolvedValue(createdPoll);
    jest.spyOn(jwtService, 'sign').mockReturnValue(signedString as string);

    const result = await service.createPoll(createPollFields);
    expect(result).toEqual({
      poll: createdPoll,
      accessToken: signedString,
    });
    expect(repository.createPoll).toHaveBeenCalledWith({
      ...createPollFields,
      pollID: 'poll-id',
      userID: 'user-id',
    });
    expect(jwtService.sign).toHaveBeenCalledWith(
      { pollID: createdPoll.id, name: createPollFields.name },
      { subject: 'user-id' },
    );
  });

  it('should return an access token for specified pollID', async () => {
    const getJoinPollTokenFields: GetJoinPollTokenFields = {
      pollID: 'poll-id',
      name: 'name',
    };

    jest.spyOn(repository, 'getPoll').mockResolvedValue(createdPoll);
    jest.spyOn(jwtService, 'sign').mockReturnValue(signedString as string);

    const result = await service.getJoinPollToken(getJoinPollTokenFields);
    expect(result).toEqual({
      poll: createdPoll,
      accessToken: signedString,
    });

    expect(repository.getPoll).toHaveBeenCalledWith('poll-id');
    expect(jwtService.sign).toHaveBeenCalledWith(
      {
        pollID: getJoinPollTokenFields.pollID,
        name: getJoinPollTokenFields.name,
      },
      {
        subject: 'user-id',
      },
    );
  });

  it('should add participants to the poll and then return poll', async () => {
    const addParticipantFields: addParticipantFields = {
      pollID: 'poll-id',
      userID: 'user-id',
      name: 'New Participant',
    };
    const updatedPoll = {
      id: 'poll-id',
      participants: { 'user-id': 'New Participant' },
      topic: 'topic',
      votesPerVoter: 2,
      nominations: {},
      rankings: {},
      results: [],
      adminID: 'user-id',
      hasVotingStarted: false,
    };
    jest.spyOn(repository, 'addParticipant').mockResolvedValue(updatedPoll);

    const result = await service.addParticipant(addParticipantFields);

    expect(result).toEqual(updatedPoll);
    expect(repository.addParticipant).toHaveBeenCalledWith(
      addParticipantFields,
    );
  });

  it('should remove a participant and return the updated poll', async () => {
    const pollID = 'poll-id';
    const userID = 'user-id';
    const poll = {
      id: 'poll-id',
      participants: { 'user-id': 'New Participant' },
      topic: 'topic',
      votesPerVoter: 2,
      nominations: {},
      rankings: {},
      results: [],
      adminID: 'user-id',
      hasVotingStarted: false,
    };
    const updatedPoll = {
      id: 'poll-id',
      participants: {},
      topic: 'topic',
      votesPerVoter: 2,
      nominations: {},
      rankings: {},
      results: [],
      adminID: 'user-id',
      hasVotingStarted: false,
    };

    jest.spyOn(repository, 'getPoll').mockResolvedValue(poll);
    jest.spyOn(repository, 'removeParticipant').mockResolvedValue(updatedPoll);

    const result = await service.removeParticipant(pollID, userID);
    expect(result).toEqual(updatedPoll);
  });

  it('should return poll with poll-id', async () => {
    const pollID = 'poll-id';

    jest.spyOn(repository, 'getPoll').mockResolvedValue(createdPoll);

    const result = await service.getPoll(pollID);

    expect(result).toEqual(createdPoll);
    expect(repository.getPoll).toHaveBeenCalledWith(pollID);
  });

  it('should add nomination to the poll and return the poll', async () => {
    const addNominationFields: AddNominationFields = {
      pollID: 'poll-id',
      userID: 'user-id',
      text: 'text',
    };
    const updatedPoll = {
      id: 'poll-id',
      topic: 'Sample Poll',
      votesPerVoter: 2,
      participants: {},
      nominations: {
        'nomination-id': { userID: 'user-id', text: 'Sample Nomination' },
      },
      rankings: {},
      results: [],
      adminID: 'admin-id',
      hasVotingStarted: false,
    };

    jest.spyOn(repository, 'addNomination').mockResolvedValue(updatedPoll);
    (createNominationID as jest.Mock).mockReturnValue('nomination-id');

    const result = await service.addNomination(addNominationFields);

    expect(result).toEqual(updatedPoll);
    expect(repository.addNomination).toHaveBeenCalledWith({
      pollID: 'poll-id',
      nominationID: 'nomination-id',
      nomination: { userID: 'user-id', text: 'text' },
    });
  });

  it('should remove a nomination from a poll and then return the updated poll', async () => {
    const pollID = 'poll-id';
    const nominationID = 'nomination-id';
    const updatedPoll = {
      id: 'poll-id',
      topic: 'Sample Poll',
      votesPerVoter: 2,
      participants: {},
      nominations: {},
      rankings: {},
      results: [],
      adminID: 'admin-id',
      hasVotingStarted: false,
    };

    jest.spyOn(repository, 'removeNomination').mockResolvedValue(updatedPoll);

    const result = await service.removeNomination(pollID, nominationID);

    expect(result).toEqual(updatedPoll);
    expect(repository.removeNomination).toHaveBeenCalledWith(
      pollID,
      nominationID,
    );
  });

  it('should start a poll and then return updated poll(hasVotingStarted => true)', async () => {
    const pollID = 'poll-id';
    const updatedPoll = {
      id: 'poll-id',
      topic: 'Sample Poll',
      votesPerVoter: 2,
      participants: {},
      nominations: {},
      rankings: {},
      results: [],
      adminID: 'admin-id',
      hasVotingStarted: true,
    };

    jest.spyOn(repository, 'startPoll').mockResolvedValue(updatedPoll);

    const result = await service.startPoll(pollID);

    expect(result).toEqual(updatedPoll);
    expect(repository.startPoll).toHaveBeenCalledWith(pollID);
  });

  it('should submit rankings and return the updated poll', async () => {
    const submitRankingFields: SubmitRankingFields = {
      pollID: 'poll-id',
      userID: 'user-id',
      rankings: ['nomination-1', 'nomination-2'],
    };
    const updatedPoll = {
      id: 'poll-id',
      topic: 'Sample Poll',
      votesPerVoter: 2,
      participants: {},
      nominations: {},
      rankings: { 'user-id': ['nomination-1', 'nomination-2'] },
      results: [],
      adminID: 'admin-id',
      hasVotingStarted: true,
    };

    jest.spyOn(repository, 'getPoll').mockResolvedValue(createdPoll);
    jest
      .spyOn(repository, 'addParticipantRankings')
      .mockResolvedValue(updatedPoll);

    const result = await service.submitRankings(submitRankingFields);

    expect(result).toEqual(updatedPoll);
    expect(repository.getPoll).toHaveBeenCalledWith('poll-id');
    expect(repository.addParticipantRankings).toHaveBeenCalledWith(
      submitRankingFields,
    );
  });

  it('should compute results and then return the updated poll', async () => {
    const pollID = 'poll-id';
    const poll: Poll = {
      id: 'poll-id',
      topic: 'Sample Poll',
      votesPerVoter: 2,
      participants: {},
      nominations: {},
      rankings: {},
      results: [],
      adminID: 'admin-id',
      hasVotingStarted: true,
    };
    const updatedPoll = {
      id: 'poll-id',
      topic: 'Sample Poll',
      votesPerVoter: 2,
      participants: {},
      nominations: {},
      rankings: {},
      results: [
        {
          nominationID: 'nomination-1',
          nominationText: 'Nomination 1',
          score: 10,
        },
        {
          nominationID: 'nomination-2',
          nominationText: 'Nomination 2',
          score: 8,
        },
      ],
      adminID: 'admin-id',
      hasVotingStarted: true,
    };

    jest.spyOn(repository, 'getPoll').mockResolvedValue(poll);
    (getResults as jest.Mock).mockReturnValue([
      {
        nominationID: 'nomination-1',
        nominationText: 'Nomination 1',
        score: 10,
      },
      {
        nominationID: 'nomination-2',
        nominationText: 'Nomination 2',
        score: 8,
      },
    ]);
    jest.spyOn(repository, 'addResults').mockResolvedValue(updatedPoll);

    const result = await service.computeResults(pollID);

    expect(result).toEqual(updatedPoll);
    expect(repository.getPoll).toHaveBeenCalledWith(pollID);
    expect(getResults).toHaveBeenCalledWith(
      poll.rankings,
      poll.nominations,
      poll.votesPerVoter,
    );
    expect(repository.addResults).toHaveBeenCalledWith(pollID, [
      {
        nominationID: 'nomination-1',
        nominationText: 'Nomination 1',
        score: 10,
      },
      {
        nominationID: 'nomination-2',
        nominationText: 'Nomination 2',
        score: 8,
      },
    ]);
  });

  it('should cancel the poll by deleting it', async () => {
    const pollID = 'poll-id';

    jest.spyOn(repository, 'deletePoll').mockResolvedValue();

    const result = await service.cancelPoll(pollID);

    expect(result).toBeUndefined();
    expect(repository.deletePoll).toHaveBeenCalledWith(pollID);
  });
});
