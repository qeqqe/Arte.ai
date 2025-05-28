'use client';

import {
  Code,
  FileText,
  Github,
  Loader2,
  Cpu,
  Globe,
  Server,
  Cloud,
  Database,
  Shield,
  TestTube,
  Zap,
  Paintbrush,
  Building,
  Users,
  Settings,
  Monitor,
  Smartphone,
  Activity,
  Wrench,
  BookOpen,
  Award,
  User,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
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
      className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] ${
        isConnected
          ? 'bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200 hover:border-emerald-300'
          : 'bg-gradient-to-br from-red-50 to-rose-50 border-red-200 hover:border-red-300'
      }`}
    >
      <div
        className={`h-10 w-10 rounded-full flex items-center justify-center ${
          isConnected
            ? 'bg-gradient-to-br from-emerald-500 to-teal-500 text-white'
            : 'bg-gradient-to-br from-red-500 to-rose-500 text-white'
        }`}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900">{name}</p>
        <p className="text-xs text-gray-600">{description}</p>
      </div>
      <Badge
        variant="outline"
        className={`text-xs font-semibold px-3 py-1 ${
          isConnected
            ? 'bg-emerald-100 text-emerald-700 border-emerald-300'
            : 'bg-red-100 text-red-700 border-red-300'
        }`}
      >
        {isConnected ? 'Connected' : 'Disconnected'}
      </Badge>
    </div>
  );

  const getSkillCategoryIcon = (categoryName: string) => {
    const iconClass = 'h-4 w-4 mr-2';

    if (categoryName.includes('Programming Languages'))
      return <Code className={iconClass} />;
    if (categoryName.includes('Frontend Frameworks'))
      return <Globe className={iconClass} />;
    if (categoryName.includes('Backend'))
      return <Server className={iconClass} />;
    if (categoryName.includes('Cloud')) return <Cloud className={iconClass} />;
    if (categoryName.includes('Database'))
      return <Database className={iconClass} />;
    if (categoryName.includes('DevOps'))
      return <Settings className={iconClass} />;
    if (categoryName.includes('Security'))
      return <Shield className={iconClass} />;
    if (categoryName.includes('Testing'))
      return <TestTube className={iconClass} />;
    if (categoryName.includes('APIs')) return <Zap className={iconClass} />;
    if (categoryName.includes('Styling'))
      return <Paintbrush className={iconClass} />;
    if (categoryName.includes('Architecture'))
      return <Building className={iconClass} />;
    if (categoryName.includes('Methodologies'))
      return <Users className={iconClass} />;
    if (categoryName.includes('Infrastructure'))
      return <Wrench className={iconClass} />;
    if (categoryName.includes('Operating'))
      return <Monitor className={iconClass} />;
    if (categoryName.includes('Web Servers'))
      return <Server className={iconClass} />;
    if (categoryName.includes('AI/ML')) return <Cpu className={iconClass} />;
    if (categoryName.includes('Mobile'))
      return <Smartphone className={iconClass} />;
    if (categoryName.includes('Monitoring'))
      return <Activity className={iconClass} />;
    if (categoryName.includes('Other Technologies'))
      return <Zap className={iconClass} />;
    if (categoryName.includes('Key Insights'))
      return <Award className={iconClass} />;
    if (categoryName.includes('Professional'))
      return <User className={iconClass} />;

    return <BookOpen className={iconClass} />;
  };

  const renderSkillCategory = (skills: Skill[], categoryName: string) => {
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
      <div className="space-y-4">
        <div className="flex items-center text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
          {getSkillCategoryIcon(categoryName)}
          <h3>{categoryName.replace(/^[^\w\s]+\s/, '')}</h3>
        </div>
        <div className="space-y-3">
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
                className={`p-3 rounded-lg border-2 ${level.borderColor} ${level.bgGradient} hover:shadow-md transition-all duration-200 hover:scale-[1.01]`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-sm font-semibold text-gray-900">
                      {skillName}
                    </span>
                    <span
                      className={`self-start px-2.5 py-1 rounded-full text-xs font-bold text-white ${level.gradient} shadow-sm`}
                    >
                      {level.text}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-700">
                      {validScore > 0 ? `${Math.round(validScore)}%` : 'N/A'}
                    </div>
                    <div className="w-12 h-1.5 bg-gray-200 rounded-full mt-1 overflow-hidden">
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

  const renderInfoSection = (info: string[], title: string) => {
    if (!info || info.length === 0) return null;

    return (
      <div className="space-y-4">
        <div className="flex items-center text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
          {getSkillCategoryIcon(title)}
          <h3>{title.replace(/^[^\w\s]+\s/, '')}</h3>
        </div>
        <div className="space-y-2">
          {info.map((item, index) => (
            <div
              key={index}
              className="p-3 rounded-lg border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-50 hover:shadow-md transition-all duration-200"
            >
              <p className="text-sm text-gray-700 leading-relaxed">{item}</p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="h-screen flex flex-col gap-4 sm:gap-6 max-w-none overflow-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 w-full h-full">
        <Card className="w-full h-[85vh] bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 shadow-lg">
          <CardHeader className="px-4 sm:px-6 pb-3 rounded-t-lg">
            <CardTitle className="text-gray-800">
              Connected Data Sources
            </CardTitle>
            <CardDescription className="text-gray-600">
              Your profile information sources
            </CardDescription>
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
              <div className="space-y-4 pb-4">
                {renderDataSourceStatus(
                  connectedDataSources?.resume || false,
                  'Resume',
                  <FileText className="h-4 w-4" />,
                  connectedDataSources?.resume
                    ? 'Last updated recently'
                    : 'Not connected'
                )}
                {renderDataSourceStatus(
                  connectedDataSources?.github || false,
                  'GitHub',
                  <Github className="h-4 w-4" />,
                  connectedDataSources?.github
                    ? 'Repositories analyzed'
                    : 'Not connected'
                )}
                {renderDataSourceStatus(
                  connectedDataSources?.leetcode || false,
                  'LeetCode',
                  <Code className="h-4 w-4" />,
                  connectedDataSources?.leetcode
                    ? 'Problems analyzed'
                    : 'Not connected'
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="w-full lg:col-span-2 h-[85vh] flex flex-col border-2 border-purple-200 shadow-lg overflow-auto">
          <CardHeader className="px-4 sm:px-6 pb-3 flex-shrink-0 rounded-t-lg">
            <CardTitle className="text-gray-800">My Skills</CardTitle>
            <CardDescription className="text-gray-600">
              Your current skill ratings based on your data sources
            </CardDescription>
          </CardHeader>
          <CardContent className="px-4 sm:px-6 flex-1 overflow-hidden">
            {isLoadingSkills ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-rose-600" />
              </div>
            ) : skillsError ? (
              <div className="text-center py-8 text-red-600">
                <p>Failed to load skills data</p>
              </div>
            ) : userSkills ? (
              <div className="h-full overflow-y-auto pr-2 scrollbar-thin">
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 pb-4">
                  {userSkills.languages &&
                    userSkills.languages.length > 0 &&
                    renderSkillCategory(
                      userSkills.languages,
                      'Programming Languages'
                    )}
                  {userSkills.frontend_frameworks_libraries &&
                    userSkills.frontend_frameworks_libraries.length > 0 &&
                    renderSkillCategory(
                      userSkills.frontend_frameworks_libraries,
                      'Frontend Frameworks'
                    )}
                  {userSkills.backend_frameworks_runtime &&
                    userSkills.backend_frameworks_runtime.length > 0 &&
                    renderSkillCategory(
                      userSkills.backend_frameworks_runtime,
                      'Backend & Runtime'
                    )}
                  {userSkills.cloud_platforms &&
                    userSkills.cloud_platforms.length > 0 &&
                    renderSkillCategory(
                      userSkills.cloud_platforms,
                      'Cloud Platforms'
                    )}
                  {userSkills.database_tools_orms &&
                    userSkills.database_tools_orms.length > 0 &&
                    renderSkillCategory(
                      userSkills.database_tools_orms,
                      'Database & ORMs'
                    )}
                  {userSkills.databases_datastores &&
                    userSkills.databases_datastores.length > 0 &&
                    renderSkillCategory(
                      userSkills.databases_datastores,
                      'Databases & Data Stores'
                    )}
                  {userSkills.devops_cicd &&
                    userSkills.devops_cicd.length > 0 &&
                    renderSkillCategory(
                      userSkills.devops_cicd,
                      'DevOps & CI/CD'
                    )}
                  {userSkills.security &&
                    userSkills.security.length > 0 &&
                    renderSkillCategory(userSkills.security, 'Security')}
                  {userSkills.testing_quality &&
                    userSkills.testing_quality.length > 0 &&
                    renderSkillCategory(
                      userSkills.testing_quality,
                      'Testing & Quality'
                    )}
                  {userSkills.apis_communication &&
                    userSkills.apis_communication.length > 0 &&
                    renderSkillCategory(
                      userSkills.apis_communication,
                      'APIs & Communication'
                    )}
                  {userSkills.frontend_styling_ui &&
                    userSkills.frontend_styling_ui.length > 0 &&
                    renderSkillCategory(
                      userSkills.frontend_styling_ui,
                      'Frontend Styling & UI'
                    )}
                  {userSkills.architecture_design_patterns &&
                    userSkills.architecture_design_patterns.length > 0 &&
                    renderSkillCategory(
                      userSkills.architecture_design_patterns,
                      'Architecture & Design'
                    )}
                  {userSkills.methodologies_collaboration &&
                    userSkills.methodologies_collaboration.length > 0 &&
                    renderSkillCategory(
                      userSkills.methodologies_collaboration,
                      'Methodologies & Collaboration'
                    )}
                  {userSkills.infrastructure_as_code_config &&
                    userSkills.infrastructure_as_code_config.length > 0 &&
                    renderSkillCategory(
                      userSkills.infrastructure_as_code_config,
                      'Infrastructure as Code'
                    )}
                  {userSkills.operating_systems &&
                    userSkills.operating_systems.length > 0 &&
                    renderSkillCategory(
                      userSkills.operating_systems,
                      'Operating Systems'
                    )}
                  {userSkills.web_servers_proxies &&
                    userSkills.web_servers_proxies.length > 0 &&
                    renderSkillCategory(
                      userSkills.web_servers_proxies,
                      'Web Servers & Proxies'
                    )}
                  {userSkills.ai_ml_datascience &&
                    userSkills.ai_ml_datascience.length > 0 &&
                    renderSkillCategory(
                      userSkills.ai_ml_datascience,
                      'AI/ML & Data Science'
                    )}
                  {userSkills.mobile_development &&
                    userSkills.mobile_development.length > 0 &&
                    renderSkillCategory(
                      userSkills.mobile_development,
                      'Mobile Development'
                    )}
                  {userSkills.monitoring_observability &&
                    userSkills.monitoring_observability.length > 0 &&
                    renderSkillCategory(
                      userSkills.monitoring_observability,
                      'Monitoring & Observability'
                    )}
                  {userSkills.other_technologies_concepts &&
                    userSkills.other_technologies_concepts.length > 0 &&
                    renderSkillCategory(
                      userSkills.other_technologies_concepts,
                      'Other Technologies'
                    )}
                  {userSkills.other_relevent_info &&
                    userSkills.other_relevent_info.length > 0 &&
                    renderInfoSection(
                      userSkills.other_relevent_info,
                      'Key Insights & Achievements'
                    )}
                  {userSkills.brief_job_description &&
                    userSkills.brief_job_description.length > 0 &&
                    renderInfoSection(
                      userSkills.brief_job_description,
                      'Professional Summary'
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
