'use client';

import { Code, FileText, Github, Loader2 } from 'lucide-react';
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
        <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
          {categoryName}
        </h3>
        <div className="space-y-3">
          {skills.slice(0, 4).map((skill, index) => {
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
                className={`p-4 rounded-xl border-2 ${level.borderColor} ${level.bgGradient} hover:shadow-lg transition-all duration-300 hover:scale-[1.02]`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-2">
                    <span className="text-base font-semibold text-gray-900">
                      {skillName}
                    </span>
                    <span
                      className={`self-start px-3 py-1.5 rounded-full text-xs font-bold text-white ${level.gradient} shadow-sm`}
                    >
                      {level.text}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-700">
                      {validScore > 0 ? `${Math.round(validScore)}%` : 'N/A'}
                    </div>
                    <div className="w-16 h-2 bg-gray-200 rounded-full mt-1 overflow-hidden">
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

  return (
    <div className="grid w-full gap-4 sm:gap-6 max-w-none">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 w-full">
        <Card className="w-full">
          <CardHeader className="px-4 sm:px-6">
            <CardTitle>Connected Data Sources</CardTitle>
            <CardDescription>Your profile information sources</CardDescription>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            {isLoadingDataSources ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-rose-600" />
              </div>
            ) : dataSourcesError ? (
              <div className="text-center py-4 text-red-600">
                <p>Failed to load data sources</p>
              </div>
            ) : (
              <div className="space-y-2 sm:space-y-3">
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

        <Card className="w-full lg:col-span-2">
          <CardHeader className="px-4 sm:px-6">
            <CardTitle>My Skills</CardTitle>
            <CardDescription>
              Your current skill ratings based on your data sources
            </CardDescription>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            {isLoadingSkills ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-rose-600" />
              </div>
            ) : skillsError ? (
              <div className="text-center py-4 text-red-600">
                <p>Failed to load skills data</p>
              </div>
            ) : userSkills ? (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {userSkills.languages &&
                  userSkills.languages.length > 0 &&
                  renderSkillCategory(
                    userSkills.languages,
                    '💻 Programming Languages'
                  )}
                {userSkills.frontend_frameworks_libraries &&
                  userSkills.frontend_frameworks_libraries.length > 0 &&
                  renderSkillCategory(
                    userSkills.frontend_frameworks_libraries,
                    '🎨 Frontend Frameworks'
                  )}
                {userSkills.backend_frameworks_runtime &&
                  userSkills.backend_frameworks_runtime.length > 0 &&
                  renderSkillCategory(
                    userSkills.backend_frameworks_runtime,
                    '⚡ Backend & Runtime'
                  )}
                {userSkills.cloud_platforms &&
                  userSkills.cloud_platforms.length > 0 &&
                  renderSkillCategory(
                    userSkills.cloud_platforms,
                    '☁️ Cloud Platforms'
                  )}
                {userSkills.database_tools_orms &&
                  userSkills.database_tools_orms.length > 0 &&
                  renderSkillCategory(
                    userSkills.database_tools_orms,
                    '🗄️ Database & Tools'
                  )}
                {userSkills.devops_cicd &&
                  userSkills.devops_cicd.length > 0 &&
                  renderSkillCategory(
                    userSkills.devops_cicd,
                    '🚀 DevOps & CI/CD'
                  )}
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                <p>No skills data available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
