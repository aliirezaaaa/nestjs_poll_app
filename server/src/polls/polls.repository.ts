import { Inject, InternalServerErrorException } from '@nestjs/common';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';
import { IORedisKey } from '../redis.module';
import {
  AddNominationData,
  AddParticipantData,
  AddParticipantRankingData,
  CreatePollData,
} from './types';
import { Poll, Results } from 'shared/poll-types';

@Injectable()
export class PollsRepository {
  private readonly ttl: string;
  private readonly logger = new Logger(PollsRepository.name);

  constructor(
    configService: ConfigService,
    @Inject(IORedisKey) private readonly redisClient: Redis,
  ) {
    this.ttl = configService.get('POLL_DURATION');
  }

  async createPoll({
    votesPerVoter,
    topic,
    pollID,
    userID,
  }: CreatePollData): Promise<Poll> {
    const initialPoll = {
      id: pollID,
      topic,
      votesPerVoter,
      participants: {},
      nominations: {},
      rankings: {},
      results: [],
      adminID: userID,
      hasVotingStarted: false,
    };

    this.logger.log(
      // eslint-disable-next-line prettier/prettier
      `Creating new poll: ${JSON.stringify(initialPoll, null, 2)} with TTL ${this.ttl
      }`,
    );

    const key = `polls:${pollID}`;

    try {
      await this.redisClient.call(
        'JSON.SET',
        key,
        '.',
        JSON.stringify(initialPoll),
      );
      await this.redisClient.call('EXPIRE', key, this.ttl);
      return initialPoll;
    } catch (e) {
      this.logger.error(
        `Failed to add poll ${JSON.stringify(initialPoll)}\n${e}`,
      );
      throw new InternalServerErrorException('Failed to create poll');
    }
  }

  async getPoll(pollID: string): Promise<Poll> {
    this.logger.log(`Attempting to get poll with: ${pollID}`);

    const key = `polls:${pollID}`;

    try {
      const currentPoll = await this.redisClient.call('JSON.GET', key, '.');

      this.logger.verbose(currentPoll);

      return JSON.parse(currentPoll as string);
    } catch (e) {
      this.logger.error(`Failed to get pollID ${pollID}`);
      throw new InternalServerErrorException('Failed to get poll');
    }
  }

  async addParticipant({
    pollID,
    userID,
    name,
  }: AddParticipantData): Promise<Poll> {
    this.logger.log(
      `Attempting to add a participant with userID/name: ${userID}/${name} to pollID: ${pollID}`,
    );

    const key = `polls:${pollID}`;
    const participantPath = `.participants.${userID}`;

    try {
      await this.redisClient.call(
        'JSON.SET',
        key,
        participantPath,
        JSON.stringify(name),
      );

      return this.getPoll(pollID);
    } catch (e) {
      this.logger.error(
        `Failed to add a participant with userID/name: ${userID}/${name} to pollID: ${pollID}`,
      );
      throw new InternalServerErrorException('Failed to add participant');
    }
  }

  async removeParticipant(pollID: string, userID: string): Promise<Poll> {
    this.logger.log(`Remove userID:${userID} from poll:${pollID}`);
    const key = `polls:${pollID}`;
    const participantPath = `.participants.${userID}`;

    try {
      await this.redisClient.call('JSON.DEL', key, participantPath);

      return this.getPoll(pollID);
    } catch (e) {
      this.logger.error(
        `Failed to remove userID: ${userID} from poll: ${pollID}`,
        e,
      );
      throw new InternalServerErrorException('Failed to remove participant');
    }
  }

  async addNomination({
    pollID,
    nominationID,
    nomination,
  }: AddNominationData): Promise<Poll> {
    this.logger.log(
      `Attempting to add a nomination with nominationID/nomination: ${nominationID}/${nomination.text} to pollID: ${pollID}`,
    );

    const key = `polls:${pollID}`;
    const nominationPath = `.nominations.${nominationID}`;

    try {
      await this.redisClient.call(
        'JSON.SET',
        key,
        nominationPath,
        JSON.stringify(nomination),
      );

      return this.getPoll(pollID);
    } catch (e) {
      this.logger.error(
        `Failed to add a nomination with nominationID/text: ${nominationID}/${nomination.text} to pollID: ${pollID}`,
        e,
      );
      throw new InternalServerErrorException(
        `Failed to add a nomination with nominationID/text: ${nominationID}/${nomination.text} to pollID: ${pollID}`,
      );
    }
  }

  async removeNomination(pollID: string, nominationID: string): Promise<Poll> {
    this.logger.log(
      `removing nominationID: ${nominationID} from poll: ${pollID}`,
    );

    const key = `polls:${pollID}`;
    const nominationPath = `.nominations.${nominationID}`;

    try {
      await this.redisClient.call('JSON.DEL', key, nominationPath);

      return this.getPoll(pollID);
    } catch (e) {
      this.logger.error(
        `Failed to remove nominationID: ${nominationID} from poll: ${pollID}`,
        e,
      );

      throw new InternalServerErrorException(
        `Failed to remove nominationID: ${nominationID} from poll: ${pollID}`,
      );
    }
  }

  async startPoll(pollID: string): Promise<Poll> {
    this.logger.log(`Setting hasVotingStarted for poll:${pollID}`);

    const key = `polls:${pollID}`;

    try {
      await this.redisClient.call(
        'JSON.SET',
        key,
        '.hasVotingStarted',
        JSON.stringify(true),
      );

      return this.getPoll(pollID);
    } catch (e) {
      this.logger.error(`Failed set hasVotingStarted for poll: ${pollID}`, e);
      throw new InternalServerErrorException(
        'There was an error starting the poll',
      );
    }
  }

  async addParticipantRankings({
    pollID,
    userID,
    rankings,
  }: AddParticipantRankingData): Promise<Poll> {
    this.logger.log(
      `Attempting to add rankings for userID/name:${userID} to poll:${pollID}`,
      rankings,
    );

    const key = `polls:${pollID}`;
    const rankingsPath = `.rankings.${userID}`;

    try {
      await this.redisClient.call(
        'JSON.SET',
        key,
        rankingsPath,
        JSON.stringify(rankings),
      );

      return this.getPoll(pollID);
    } catch (e) {
      this.logger.error(
        `Failed to add a rankings for userID/name: ${userID}/ to pollID: ${pollID}`,
        rankings,
      );
      throw new InternalServerErrorException(
        'There was an error starting the poll',
      );
    }
  }

  async addResults(pollID: string, results: Results): Promise<Poll> {
    this.logger.log(`Attempting to add results to pollID:${pollID}`);

    const key = `polls:${pollID}`;
    const resultsPath = `.results`;

    try {
      await this.redisClient.call(
        'JSON.SET',
        key,
        resultsPath,
        JSON.stringify(results),
      );

      return this.getPoll(pollID);
    } catch (e) {
      this.logger.error(
        `Failed to add add results for pollID: ${pollID}`,
        results,
        e,
      );
      throw new InternalServerErrorException(
        `Failed to add add results for pollID: ${pollID}`,
      );
    }
  }

  async deletePoll(pollID: string): Promise<void> {
    this.logger.log(`Attempting to delete pollID:${pollID}`);

    const key = `polls:${pollID}`;
    try {
      await this.redisClient.call('JSON.DEL', key);
    } catch (e) {
      this.logger.error(`Failed to delete poll: ${pollID}`, e);
      throw new InternalServerErrorException(
        `Failed to delete poll: ${pollID}`,
      );
    }
  }
}
