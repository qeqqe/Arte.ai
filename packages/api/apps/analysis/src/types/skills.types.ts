export interface SkillsData {
  languages: string[];
  frontend_frameworks_libraries: string[];
  frontend_styling_ui: any[];
  backend_frameworks_runtime: string[];
  databases_datastores: string[];
  database_tools_orms: any[];
  cloud_platforms: string[];
  devops_cicd: any[];
  infrastructure_as_code_config: any[];
  monitoring_observability: any[];
  ai_ml_datascience: any[];
  mobile_development: any[];
  testing_quality: any[];
  apis_communication: string[];
  architecture_design_patterns: string[];
  security: any[];
  methodologies_collaboration: string[];
  operating_systems: any[];
  web_servers_proxies: any[];
  other_technologies_concepts: string[];
  brief_job_description: string;
  other_relevent_info: string[];
}

export interface SimilarSkill {
  category: string;
  skill: string;
  similarity: number;
}
