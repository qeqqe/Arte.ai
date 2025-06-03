// dashboard data types

export interface JobInfo {
  title: string;
  company: string;
  location: string;
  description?: string;
  companyLogo?: string;
  url?: string;
}

export interface ProcessedSkills {
  security?: string[];
  languages?: string[];
  devops_cicd?: string[];
  cloud_platforms?: string[];
  testing_quality?: string[];
  ai_ml_datascience?: string[];
  operating_systems?: string[];
  apis_communication?: string[];
  mobile_development?: string[];
  database_tools_orms?: string[];
  frontend_styling_ui?: string[];
  other_relevent_info?: string[];
  web_servers_proxies?: string[];
  databases_datastores?: string[];
  brief_job_description?: string[];
  monitoring_observability?: string[];
  backend_frameworks_runtime?: string[];
  methodologies_collaboration?: string[];
  other_technologies_concepts?: string[];
  architecture_design_patterns?: string[];
  frontend_frameworks_libraries?: string[];
  infrastructure_as_code_config?: string[];
  [key: string]: string[] | undefined;
}

export interface ProcessedSkill {
  name: string;
  category: string;
  level?: number;
  matches?: boolean;
}

export interface Comparison {
  matchPercentage?: number;
  matchedSkills?: ProcessedSkill[];
  missingSkills?: ProcessedSkill[];

  matchedSkillsDetailed?: Array<{
    skill: string;
    candidateLevel: number;
    requiredLevel: number;
    matchPercentage: number;
    details?: string;
  }>;
  gapAnalysis?: Array<{
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
  overallScore?: {
    value: number;
    category: 'excellent' | 'good' | 'adequate' | 'insufficient';
  };
  recommendations?: Array<{
    focus: string;
    action: string;
    timeframe?: string;
  }>;
  insights?: string;
  metadata?: {
    generatedAt: string;
  };

  [key: string]: any;
}

export interface Organization {
  logo_url: string;
  name: string;
  location: string;
}

export interface RecentJobComparison {
  comparison: Comparison;
  jobInfo: string;
  processedSkills: ProcessedSkills;
  parsedJobInfo?: JobInfo;
  organization?: Organization;
  postedTimeAgo?: string;
  username?: string;
  avatarUrl?: string;
}

export interface ConnectedDataSources {
  github: boolean;
  leetcode: boolean;
  resume: boolean;
}

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

export type recentJobType = {
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

export interface Skill {
  skill_name: string;
  evidence_source: string;
  proficiency_score: number;
  // Support alternative field names that might come from different API responses
  skill?: string;
  proficiency?: number;
}

export interface BackendSkill {
  name: string;
  evidence: string;
  proficiency: number;
}

export interface UserSkillsData {
  security?: string[] | Skill[] | BackendSkill[];
  languages?: string[] | Skill[] | BackendSkill[];
  devops_cicd?: string[] | Skill[] | BackendSkill[];
  cloud_platforms?: string[] | Skill[] | BackendSkill[];
  testing_quality?: string[] | Skill[] | BackendSkill[];
  ai_ml_datascience?: string[] | Skill[] | BackendSkill[];
  operating_systems?: string[] | Skill[] | BackendSkill[];
  apis_communication?: string[] | Skill[] | BackendSkill[];
  mobile_development?: string[] | Skill[] | BackendSkill[];
  database_tools_orms?: string[] | Skill[] | BackendSkill[];
  frontend_styling_ui?: string[] | Skill[] | BackendSkill[];
  other_relevent_info?: string[];
  web_servers_proxies?: string[] | Skill[] | BackendSkill[];
  databases_datastores?: string[] | Skill[] | BackendSkill[];
  monitoring_observability?: string[] | Skill[] | BackendSkill[];
  backend_frameworks_runtime?: string[] | Skill[] | BackendSkill[];
  methodologies_collaboration?: string[] | Skill[] | BackendSkill[];
  other_technologies_concepts?: string[] | Skill[] | BackendSkill[];
  architecture_design_patterns?: string[] | Skill[] | BackendSkill[];
  frontend_frameworks_libraries?: string[] | Skill[] | BackendSkill[];
  infrastructure_as_code_config?: string[] | Skill[] | BackendSkill[];
  skill_gaps?: string[];
  key_strengths?: string[];
  brief_description?: string;
  brief_skill_description?: string[];
}
