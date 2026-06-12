export interface DecisionOption {
  id: string;
  title: string;
  pros: string[];
  cons: string[];
  score?: {
    budget: number;
    time: number;
    mood: number;
  };
}

export interface VoteTrend {
  date: string;
  votes: {
    optionId: string;
    count: number;
  }[];
}

export interface Decision {
  id: string;
  title: string;
  description: string;
  options: DecisionOption[];
  voteResults?: Record<string, number>;
  voteTrends?: VoteTrend[];
  deadline: string;
  status: 'active' | 'ended' | 'draft';
  isPublic: boolean;
  voteCount: number;
  createdAt: string;
  finalChoice?: string;
  satisfaction?: number;
  reportUrl?: string;
}

export interface Vote {
  id: string;
  decisionId: string;
  optionId: string;
  createdAt: string;
  isAnonymous: boolean;
}

export interface Template {
  id: string;
  title: string;
  description: string;
  options: string[];
  usageCount: number;
}
