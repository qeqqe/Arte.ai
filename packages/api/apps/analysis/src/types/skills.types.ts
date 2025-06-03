export interface SkillsData {
  languages: string[];
  frontend_frameworks_libraries: string[];
  frontend_styling_ui: string[];
  backend_frameworks_runtime: string[];
  databases_datastores: string[];
  database_tools_orms: string[];
  cloud_platforms: string[];
  devops_cicd: string[];
  infrastructure_as_code_config: string[];
  monitoring_observability: string[];
  ai_ml_datascience: string[];
  mobile_development: string[];
  testing_quality: string[];
  apis_communication: string[];
  architecture_design_patterns: string[];
  security: string[];
  methodologies_collaboration: string[];
  operating_systems: string[];
  web_servers_proxies: string[];
  other_technologies_concepts: string[];
  other_relevent_info: string[];
  brief_skill_description: string[];
}

export interface SimilarSkill {
  category: string;
  skill: string;
  similarity: number;
}
