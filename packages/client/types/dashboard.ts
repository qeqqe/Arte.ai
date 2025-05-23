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
