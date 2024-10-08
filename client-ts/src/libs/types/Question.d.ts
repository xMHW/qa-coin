import { Answer } from './Answer';

export type Question = {
  id: number;
  content: string;
  claimAmount: string;
  upvotes: number;
  createdAt: string;
  asker: string;
  isMine: boolean;
  upvoters: string[];
  upvoted: boolean;
  answers: Answer[];
  voteDeadline: Date;
  answerDeadline: Date;
  rewardClaimed: boolean;
};
