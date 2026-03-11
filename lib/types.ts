export type Action = 0 | 1;

export type CartPoleState = [number, number, number, number];

export type Transition = {
  state: CartPoleState;
  action: Action;
  reward: number;
  nextState: CartPoleState;
  done: boolean;
};

export type StepResult = {
  state: CartPoleState;
  reward: number;
  done: boolean;
};

export type EpisodeStats = {
  episode: number;
  step: number;
  totalReward: number;
  lastEpisodeReward: number;
  epsilon: number;
  loss: number | null;
};

export type RewardPoint = {
  episode: number;
  reward: number;
};
