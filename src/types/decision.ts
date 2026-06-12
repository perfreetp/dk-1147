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
  reflection?: string;
}

export interface Vote {
  id: string;
  decisionId: string;
  optionId: string;
  createdAt: string;
  isAnonymous: boolean;
}

export type TemplateCategory = '全部' | '生活' | '购物' | '出行' | '工作' | '其他';

export interface Template {
  id: string;
  title: string;
  description: string;
  options: string[];
  usageCount: number;
  category: TemplateCategory;
}

export interface ReportHistory {
  id: string;
  decisionId: string;
  decisionTitle: string;
  finalChoice: string;
  voteCount: number;
  voteResults: Record<string, number>;
  scores: {
    budget: number;
    time: number;
    mood: number;
  };
  satisfaction?: number;
  reflection?: string;
  trendSummary?: {
    leader: string;
    leaderVotes: number;
    gap: number;
    recentChanges: {
      date: string;
      changes: Record<string, number>;
    }[];
  };
  createdAt: string;
}
