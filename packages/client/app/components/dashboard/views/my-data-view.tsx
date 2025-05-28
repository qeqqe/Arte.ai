'use client';

import {
  Code,
  FileText,
  Github,
  Loader2,
  Terminal,
  Atom,
  Rocket,
  Cloud,
  Database,
  HardDrive,
  Settings,
  Shield,
  TestTube,
  Globe,
  Palette,
  Building,
  Users,
  Factory,
  Monitor,
  Server,
  Brain,
  Smartphone,
  BarChart3,
  Zap,
  Lightbulb,
  FileUser,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  useConnectedDataSources,
  useUserSkills,
} from '@/hooks/use-dashboard-data';
import { Skill } from '@/types/dashboard';

export function MyDataView() {
  const {
    data: connectedDataSources,
    isLoading: isLoadingDataSources,
    error: dataSourcesError,
  } = useConnectedDataSources();
  const {
    data: userSkills,
    isLoading: isLoadingSkills,
    error: skillsError,
  } = useUserSkills();

  const renderDataSourceStatus = (
    isConnected: boolean,
    name: string,
    icon: React.ReactNode,
    description: string
  ) => (
    <div
      className={`flex items-center gap-2 sm:gap-3 p-1.5 sm:p-2 rounded-lg border border-rose-100 ${!isConnected ? 'bg-rose-50/50' : ''}`}
    >
      <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs sm:text-sm font-medium">{name}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      {isConnected ? (
        <Badge
          variant="outline"
          className="bg-emerald-50 text-emerald-600 hover:bg-emerald-100 text-xs"
        >
          Active
        </Badge>
      ) : (
        <Button
          variant="ghost"
          size="sm"
          className="h-6 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-100 px-2"
        >
          Connect
        </Button>
      )}
    </div>
  );

  const renderSkillCategory = (
    skills: Skill[],
    categoryName: string,
    icon: React.ReactNode
  ) => {
    if (!skills || skills.length === 0) return null;

    const getSkillLevel = (score: number) => {
      if (score >= 80)
        return {
          text: 'Expert',
          gradient: 'bg-gradient-to-r from-emerald-500 to-teal-500',
          bgGradient: 'bg-gradient-to-br from-emerald-50 to-teal-50',
          borderColor: 'border-emerald-300',
        };
      if (score >= 60)
        return {
          text: 'Advanced',
          gradient: 'bg-gradient-to-r from-blue-500 to-indigo-500',
          bgGradient: 'bg-gradient-to-br from-blue-50 to-indigo-50',
          borderColor: 'border-blue-300',
        };
      if (score >= 40)
        return {
          text: 'Intermediate',
          gradient: 'bg-gradient-to-r from-amber-500 to-orange-500',
          bgGradient: 'bg-gradient-to-br from-amber-50 to-orange-50',
          borderColor: 'border-amber-300',
        };
      if (score >= 20)
        return {
          text: 'Beginner',
          gradient: 'bg-gradient-to-r from-orange-500 to-red-500',
          bgGradient: 'bg-gradient-to-br from-orange-50 to-red-50',
          borderColor: 'border-orange-300',
        };
      return {
        text: 'Learning',
        gradient: 'bg-gradient-to-r from-slate-500 to-gray-600',
        bgGradient: 'bg-gradient-to-br from-slate-50 to-gray-100',
        borderColor: 'border-slate-300',
      };
    };

    return (
      <div className="space-y-3">
        <h3 className="text-base font-semibold text-gray-800 border-b border-gray-200 pb-1.5 flex items-center gap-2">
          <span className="text-gray-600">{icon}</span>
          {categoryName}
        </h3>
        <div className="space-y-2.5">
          {skills.map((skill, index) => {
            const scoreValue =
              skill.proficiency_score || skill.proficiency || 0;
            const validScore =
              isNaN(scoreValue) ||
              scoreValue === null ||
              scoreValue === undefined
                ? 0
                : Number(scoreValue);
            const level = getSkillLevel(validScore);
            const skillName =
              skill.skill_name || skill.skill || 'Unknown Skill';

            return (
              <div
                key={index}
                className={`p-2.5 rounded-lg border-2 ${level.borderColor} ${level.bgGradient} hover:shadow-md transition-all duration-200 hover:scale-[1.01]`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-semibold text-gray-900">
                      {skillName}
                    </span>
                    <span
                      className={`self-start px-2 py-0.5 rounded-full text-xs font-bold text-white ${level.gradient} shadow-sm`}
                    >
                      {level.text}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-base font-bold text-gray-700">
                      {validScore > 0 ? `${Math.round(validScore)}%` : 'N/A'}
                    </div>
                    <div className="w-12 h-1.5 bg-gray-200 rounded-full mt-0.5 overflow-hidden">
                      <div
                        className={`h-full ${level.gradient} transition-all duration-500`}
                        style={{ width: `${validScore}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderInfoSection = (
    info: string[],
    title: string,
    icon: React.ReactNode
  ) => {
    if (!info || info.length === 0) return null;

    return (
      <div className="space-y-3">
        <h3 className="text-base font-semibold text-gray-800 border-b border-gray-200 pb-1.5 flex items-center gap-2">
          <span className="text-gray-600">{icon}</span>
          {title}
        </h3>
        <div className="space-y-2">
          {info.map((item, index) => (
            <div
              key={index}
              className="p-2.5 rounded-lg border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-50 hover:shadow-md transition-all duration-200"
            >
              <p className="text-sm text-gray-700 leading-relaxed">{item}</p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="h-[80vh] flex flex-col gap-4 sm:gap-6 max-w-none overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 w-full h-full">
        <Card className="w-full h-[35vh] lg:h-full">
          <CardHeader className="px-4 sm:px-6 pb-2">
            <CardTitle>Connected Data Sources</CardTitle>
            <CardDescription>Your profile information sources</CardDescription>
          </CardHeader>
          <CardContent className="px-4 sm:px-6 h-full overflow-y-auto">
            {isLoadingDataSources ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-rose-600" />
              </div>
            ) : dataSourcesError ? (
              <div className="text-center py-8 text-red-600">
                <p>Failed to load data sources</p>
              </div>
            ) : (
              <div className="space-y-3 pb-4">
                {renderDataSourceStatus(
                  connectedDataSources?.resume || false,
                  'Resume',
                  <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4" />,
                  connectedDataSources?.resume
                    ? 'Last updated recently'
                    : 'Not connected'
                )}
                {renderDataSourceStatus(
                  connectedDataSources?.github || false,
                  'GitHub',
                  <Github className="h-3.5 w-3.5 sm:h-4 sm:w-4" />,
                  connectedDataSources?.github
                    ? 'Repositories analyzed'
                    : 'Not connected'
                )}
                {renderDataSourceStatus(
                  connectedDataSources?.leetcode || false,
                  'LeetCode',
                  <Code className="h-3.5 w-3.5 sm:h-4 sm:w-4" />,
                  connectedDataSources?.leetcode
                    ? 'Problems analyzed'
                    : 'Not connected'
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="w-full lg:col-span-2 h-[45vh] lg:h-full overflow-auto">
          <CardHeader className="px-4 sm:px-6 pb-2">
            <CardTitle>My Skills</CardTitle>
            <CardDescription>
              Your current skill ratings based on your data sources
            </CardDescription>
          </CardHeader>
          <CardContent className="px-4 sm:px-6 h-full overflow-hidden">
            {isLoadingSkills ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-rose-600" />
              </div>
            ) : skillsError ? (
              <div className="text-center py-8 text-red-600">
                <p>Failed to load skills data</p>
              </div>
            ) : userSkills ? (
              <div
                className="h-full overflow-y-auto pr-2"
                style={{ scrollbarWidth: 'thin' }}
              >
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 pb-4">
                  {userSkills.languages &&
                    userSkills.languages.length > 0 &&
                    renderSkillCategory(
                      userSkills.languages,
                      'Programming Languages',
                      <Terminal className="h-4 w-4" />
                    )}
                  {userSkills.frontend_frameworks_libraries &&
                    userSkills.frontend_frameworks_libraries.length > 0 &&
                    renderSkillCategory(
                      userSkills.frontend_frameworks_libraries,
                      'Frontend Frameworks',
                      <Atom className="h-4 w-4" />
                    )}
                  {userSkills.backend_frameworks_runtime &&
                    userSkills.backend_frameworks_runtime.length > 0 &&
                    renderSkillCategory(
                      userSkills.backend_frameworks_runtime,
                      'Backend & Runtime',
                      <Rocket className="h-4 w-4" />
                    )}
                  {userSkills.cloud_platforms &&
                    userSkills.cloud_platforms.length > 0 &&
                    renderSkillCategory(
                      userSkills.cloud_platforms,
                      'Cloud Platforms',
                      <Cloud className="h-4 w-4" />
                    )}
                  {userSkills.database_tools_orms &&
                    userSkills.database_tools_orms.length > 0 &&
                    renderSkillCategory(
                      userSkills.database_tools_orms,
                      'Database & ORMs',
                      <Database className="h-4 w-4" />
                    )}
                  {userSkills.databases_datastores &&
                    userSkills.databases_datastores.length > 0 &&
                    renderSkillCategory(
                      userSkills.databases_datastores,
                      'Databases & Data Stores',
                      <HardDrive className="h-4 w-4" />
                    )}
                  {userSkills.devops_cicd &&
                    userSkills.devops_cicd.length > 0 &&
                    renderSkillCategory(
                      userSkills.devops_cicd,
                      'DevOps & CI/CD',
                      <Settings className="h-4 w-4" />
                    )}
                  {userSkills.security &&
                    userSkills.security.length > 0 &&
                    renderSkillCategory(
                      userSkills.security,
                      'Security',
                      <Shield className="h-4 w-4" />
                    )}
                  {userSkills.testing_quality &&
                    userSkills.testing_quality.length > 0 &&
                    renderSkillCategory(
                      userSkills.testing_quality,
                      'Testing & Quality',
                      <TestTube className="h-4 w-4" />
                    )}
                  {userSkills.apis_communication &&
                    userSkills.apis_communication.length > 0 &&
                    renderSkillCategory(
                      userSkills.apis_communication,
                      'APIs & Communication',
                      <Globe className="h-4 w-4" />
                    )}
                  {userSkills.frontend_styling_ui &&
                    userSkills.frontend_styling_ui.length > 0 &&
                    renderSkillCategory(
                      userSkills.frontend_styling_ui,
                      'Frontend Styling & UI',
                      <Palette className="h-4 w-4" />
                    )}
                  {userSkills.architecture_design_patterns &&
                    userSkills.architecture_design_patterns.length > 0 &&
                    renderSkillCategory(
                      userSkills.architecture_design_patterns,
                      'Architecture & Design',
                      <Building className="h-4 w-4" />
                    )}
                  {userSkills.methodologies_collaboration &&
                    userSkills.methodologies_collaboration.length > 0 &&
                    renderSkillCategory(
                      userSkills.methodologies_collaboration,
                      'Methodologies & Collaboration',
                      <Users className="h-4 w-4" />
                    )}
                  {userSkills.infrastructure_as_code_config &&
                    userSkills.infrastructure_as_code_config.length > 0 &&
                    renderSkillCategory(
                      userSkills.infrastructure_as_code_config,
                      'Infrastructure as Code',
                      <Factory className="h-4 w-4" />
                    )}
                  {userSkills.operating_systems &&
                    userSkills.operating_systems.length > 0 &&
                    renderSkillCategory(
                      userSkills.operating_systems,
                      'Operating Systems',
                      <Monitor className="h-4 w-4" />
                    )}
                  {userSkills.web_servers_proxies &&
                    userSkills.web_servers_proxies.length > 0 &&
                    renderSkillCategory(
                      userSkills.web_servers_proxies,
                      'Web Servers & Proxies',
                      <Server className="h-4 w-4" />
                    )}
                  {userSkills.ai_ml_datascience &&
                    userSkills.ai_ml_datascience.length > 0 &&
                    renderSkillCategory(
                      userSkills.ai_ml_datascience,
                      'AI/ML & Data Science',
                      <Brain className="h-4 w-4" />
                    )}
                  {userSkills.mobile_development &&
                    userSkills.mobile_development.length > 0 &&
                    renderSkillCategory(
                      userSkills.mobile_development,
                      'Mobile Development',
                      <Smartphone className="h-4 w-4" />
                    )}
                  {userSkills.monitoring_observability &&
                    userSkills.monitoring_observability.length > 0 &&
                    renderSkillCategory(
                      userSkills.monitoring_observability,
                      'Monitoring & Observability',
                      <BarChart3 className="h-4 w-4" />
                    )}
                  {userSkills.other_technologies_concepts &&
                    userSkills.other_technologies_concepts.length > 0 &&
                    renderSkillCategory(
                      userSkills.other_technologies_concepts,
                      'Other Technologies',
                      <Zap className="h-4 w-4" />
                    )}
                  {userSkills.other_relevent_info &&
                    userSkills.other_relevent_info.length > 0 &&
                    renderInfoSection(
                      userSkills.other_relevent_info,
                      'Key Insights & Achievements',
                      <Lightbulb className="h-4 w-4" />
                    )}
                  {userSkills.brief_job_description &&
                    userSkills.brief_job_description.length > 0 &&
                    renderInfoSection(
                      userSkills.brief_job_description,
                      'Professional Summary',
                      <FileUser className="h-4 w-4" />
                    )}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No skills data available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
