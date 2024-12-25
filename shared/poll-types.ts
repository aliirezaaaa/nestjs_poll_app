export type Participants = {
  [participantID: string]: string;
}

export type Nomination = {
  userID: string;
  text: string;
}

export type Nominations = {
  [nominationID: string]: Nomination
}

export type Rankings = {
  [userID: string]: string[]
}

export type Results = Array<{
  nominationID: string
  nominationText: string
  score: Number
}>
export type Poll = {
  id: string;
  topic: string;
  votesPerVoter: number;
  participants: Participants;
  adminID: string;
  nominations: Nominations;
  rankings: Rankings;
  results: Results;
  hasVotingStarted: boolean;
}
