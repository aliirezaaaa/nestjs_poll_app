import { Request } from 'express';
import { Nomination } from 'shared/poll-types';
import { Socket } from 'socket.io';

// service types
export type CreatePollFields = {
  topic: string;
  votesPerVoter: number;
  name: string;
};

export type GetJoinPollTokenFields = {
  pollID: string;
  name: string;
};

export type addParticipantFields = {
  pollID: string;
  userID: string;
  name: string;
};

export type RemoveParticipantFields = {
  poolID: string;
  userID: string;
};

export type AddNominationFields = {
  pollID: string;
  userID: string;
  text: string;
};

export type SubmitRankingFields = {
  pollID: string;
  userID: string;
  rankings: string[];
};
// repository types
export type CreatePollData = {
  pollID: string;
  topic: string;
  votesPerVoter: number;
  userID: string;
};

export type AddParticipantData = {
  pollID: string;
  userID: string;
  name: string;
};

export type AddNominationData = {
  pollID: string;
  nominationID: string;
  nomination: Nomination;
};

export type AddParticipantRankingData = {
  pollID: string;
  userID: string;
  rankings: string[];
};
// guard types
export type AuthPayload = {
  userID: string;
  pollID: string;
  name: string;
};

export type RequestWithAuth = Request & AuthPayload;
export type SocketWithAuth = Socket & AuthPayload;
