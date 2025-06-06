// Comparison object for job post

import { Organization } from './scraped_job.types';

export type SkillGapAnalysis = {
  matchedSkills: Array<{
    skill: string;
    candidateLevel: number;
    requiredLevel: number;
    matchPercentage: number;
    details?: string;
  }>;
  gapAnalysis: Array<{
    skill: string;
    proficiencyGap: number;
    estimatedTimeToClose: {
      value: number;
      unit: 'days' | 'weeks' | 'months';
    };
    priority: 'high' | 'medium' | 'low';
    learningResources?: Array<{
      type: 'course' | 'book' | 'documentation' | 'project' | 'other';
      title: string;
      url?: string;
    }>;
  }>;
  overallScore: {
    value: number;
    category: 'excellent' | 'good' | 'adequate' | 'insufficient';
  };
  recommendations: Array<{
    focus: string;
    action: string;
    timeframe?: string;
  }>;
  insights: string;
  metadata: {
    generatedAt: string;
  };
};

type recentJobType = {
  comparison: SkillGapAnalysis;
  jobInfo: string;
  processedSkills: JSON;
  organization: Organization;
  postedTimeAgo: string;
};

export type JobComparisonsResponse = {
  recentJobComparisons: recentJobType[];
  username: string;
  avatarUrl: string;
};
