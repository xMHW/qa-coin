export type Answer = {
  id: number;
  content: string;
  claimAmount: string;
  upvotes: number;
  createdAt: string;
  replier: string;
  isMine: boolean;
  upvoters: string[];
  upvoted: boolean;
  rewardClaimed: boolean;
};
