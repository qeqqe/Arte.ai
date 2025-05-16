'use client';

import {
  ArrowRight,
  CheckCircle2,
  FileText,
  Github,
  Code,
  Plus,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  useRecentJobComparisons,
  useConnectedDataSources,
} from '@/hooks/use-dashboard-data';
import { useDashboard } from '../dashboard-context';
import { DashboardSkeleton, DataSourcesSkeleton } from '../skeletons';
import { RecentJobComparison } from '@/types/dashboard';

export function DashboardView() {
  const { setActiveView } = useDashboard();
  const {
    data: recentJobs,
    isLoading: isLoadingJobs,
    error: jobsError,
  } = useRecentJobComparisons();
  const {
    data: dataSources,
    isLoading: isLoadingDataSources,
    error: dataSourcesError,
  } = useConnectedDataSources();

  if (isLoadingJobs || isLoadingDataSources) {
    return <DashboardSkeleton />;
  }

  // Check for errors and log them
  const hasJobsError = !!jobsError;
  const hasDataSourcesError = !!dataSourcesError;

  if (hasJobsError || hasDataSourcesError) {
    console.error('Dashboard errors:', {
      jobsError: jobsError instanceof Error ? jobsError.message : jobsError,
      dataSourcesError:
        dataSourcesError instanceof Error
          ? dataSourcesError.message
          : dataSourcesError,
    });

    return (
      <div className="flex flex-col items-center justify-center h-full w-full p-6">
        <div className="bg-red-50 text-red-800 p-4 rounded-lg max-w-lg">
          <h3 className="text-lg font-semibold mb-2">
            Error loading dashboard data
          </h3>
          <p className="mb-2">
            We couldn't fetch your dashboard information. Please try again
            later.
          </p>
          {process.env.NODE_ENV !== 'production' && (
            <div className="text-xs bg-red-100 p-2 rounded mb-3 overflow-auto max-h-40">
              <p className="font-medium">Debug information:</p>
              {jobsError && (
                <p>
                  Jobs error:{' '}
                  {jobsError instanceof Error
                    ? jobsError.message
                    : String(jobsError)}
                </p>
              )}
              {dataSourcesError && (
                <p>
                  Data sources error:{' '}
                  {dataSourcesError instanceof Error
                    ? dataSourcesError.message
                    : String(dataSourcesError)}
                </p>
              )}
            </div>
          )}
          <Button
            className="mt-4"
            variant="outline"
            onClick={() =>
              typeof window !== 'undefined' && window.location.reload()
            }
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-none px-0 sm:px-1 py-2">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 sm:gap-8 w-full">
        {/* Main content - Job Matches (3 columns) */}
        <div className="lg:col-span-3">
          <Card className="w-full overflow-hidden rounded-xl border border-slate-200/70 bg-white shadow-sm hover:shadow-md transition-all duration-300">
            <CardHeader className="px-6 sm:px-8 py-5 bg-gradient-to-br from-white via-slate-50 to-blue-50/30 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-slate-800 font-bold text-lg">
                    Recent Job Matches
                  </CardTitle>
                  <p className="text-slate-500 text-sm mt-1">
                    Compare your skills against recent job postings
                  </p>
                </div>
                <Button
                  variant="outline"
                  className="hidden sm:flex h-9 bg-white border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 shadow-sm transition-all duration-200"
                  onClick={() => setActiveView('job-analysis')}
                >
                  <Plus className="mr-1.5 h-4 w-4" />
                  New Analysis
                </Button>
              </div>
            </CardHeader>
            <CardContent className="px-6 sm:px-8 py-5 sm:py-6 bg-gradient-to-br from-white to-slate-50/30">
              {recentJobs && recentJobs.length > 0 ? (
                <div className="space-y-4 sm:space-y-5">
                  {recentJobs.map((job, index) => (
                    <RecentJobCard
                      key={index}
                      job={job}
                      onClick={() => setActiveView('job-analysis')}
                      isLast={index === recentJobs.length - 1}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center py-12 px-4">
                  <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mb-4">
                    <ArrowRight className="h-7 w-7 text-blue-400" />
                  </div>
                  <h3 className="font-medium text-slate-700 mb-2">
                    No job comparisons yet
                  </h3>
                  <p className="text-slate-500 text-sm max-w-xs mb-6">
                    Compare your skills against job requirements to get
                    personalized insights
                  </p>
                  <Button
                    className="bg-gradient-to-br from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-sm transition-all"
                    onClick={() => setActiveView('job-analysis')}
                  >
                    Analyze a Job Posting
                  </Button>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex items-center border-t border-slate-100 pt-4 px-6 sm:px-8 pb-5 bg-gradient-to-br from-white via-slate-50 to-blue-50/20">
              <Button
                variant="ghost"
                className="w-full text-blue-600 hover:text-blue-700 hover:bg-blue-50/50 text-sm font-medium"
                onClick={() => setActiveView('job-analysis')}
              >
                View All Job Comparisons
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Sidebar - Data Sources (2 columns) */}
        <div className="lg:col-span-2">
          <Card className="w-full overflow-hidden rounded-xl border border-slate-200/70 bg-white shadow-sm hover:shadow-md transition-all duration-300">
            <CardHeader className="px-6 py-5 bg-gradient-to-br from-white via-slate-50 to-indigo-50/30 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <CardTitle className="text-slate-800 font-bold text-lg">
                  Connected Data Sources
                </CardTitle>
                <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                  {dataSources
                    ? Object.values(dataSources).filter(Boolean).length
                    : 0}{' '}
                  of 3
                </span>
              </div>
            </CardHeader>
            <CardContent className="px-6 py-5 bg-gradient-to-br from-white to-slate-50/30">
              {dataSources ? (
                <div className="space-y-4">
                  <DataSourceItem
                    title="Resume"
                    isConnected={dataSources.resume}
                    description={
                      dataSources.resume
                        ? 'Resume uploaded'
                        : 'No resume uploaded'
                    }
                    onClick={() => setActiveView('my-data')}
                  />
                  <DataSourceItem
                    title="GitHub"
                    isConnected={dataSources.github}
                    description={
                      dataSources.github
                        ? 'Connected to GitHub'
                        : 'Not connected to GitHub'
                    }
                    onClick={() => setActiveView('my-data')}
                  />
                  <DataSourceItem
                    title="LeetCode"
                    isConnected={dataSources.leetcode}
                    description={
                      dataSources.leetcode
                        ? 'Connected to LeetCode'
                        : 'Not connected to LeetCode'
                    }
                    onClick={() => setActiveView('my-data')}
                  />
                </div>
              ) : (
                <div className="py-4">
                  <DataSourcesSkeleton />
                </div>
              )}
            </CardContent>
            <CardFooter className="flex items-center border-t border-slate-100 pt-4 px-6 pb-5 bg-gradient-to-br from-white via-slate-50 to-indigo-50/20">
              <Button
                variant="ghost"
                className="w-full text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50/50 text-sm font-medium"
                onClick={() => setActiveView('my-data')}
              >
                Manage Data Sources
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}

function RecentJobCard({
  job,
  onClick,
  isLast = false,
}: {
  job: RecentJobComparison;
  onClick: () => void;
  isLast?: boolean;
}) {
  // Parse job info with enhanced error handling and data extraction
  let jobInfo;
  try {
    // Parse jobInfo if it's a string
    if (
      typeof job.jobInfo === 'string' &&
      job.jobInfo.trim().length > 0 &&
      (job.jobInfo.trim().startsWith('{') || job.jobInfo.trim().startsWith('['))
    ) {
      jobInfo = JSON.parse(job.jobInfo);
    } else if (typeof job.jobInfo === 'object' && job.jobInfo !== null) {
      jobInfo = job.jobInfo;
    } else {
      jobInfo = {
        title: 'Software Engineering Position',
        company: job.organization?.name || 'Tech Company',
        location: job.organization?.location || 'Remote',
        companyLogo: job.organization?.logo_url || '',
      };
    }

    // If we have organization data, use it to enhance jobInfo
    if (job.organization) {
      jobInfo.company = job.organization.name || jobInfo.company;
      jobInfo.location = job.organization.location || jobInfo.location;
      jobInfo.companyLogo = job.organization.logo_url || jobInfo.companyLogo;
    }

    // Better title extraction logic
    if (!jobInfo.title) {
      // Try to get title from processedSkills if available
      const jobDescription = job.processedSkills?.brief_job_description;
      if (jobDescription && jobDescription.length > 0) {
        const titleLine = jobDescription[0];
        jobInfo.title =
          titleLine.length > 50
            ? titleLine.substring(0, 50) + '...'
            : titleLine;
      } else if (typeof jobInfo.description === 'string') {
        // Extract from description as fallback
        const firstLine = jobInfo.description.split('\n')[0];
        jobInfo.title =
          firstLine.length > 50
            ? firstLine.substring(0, 50) + '...'
            : firstLine;
      }
    }

    // Clean up and enhance title if needed
    if (jobInfo.title) {
      // Remove "Job Title:" prefix if present
      jobInfo.title = jobInfo.title.replace(/^job title:\s*/i, '');

      // Capitalize first letter if it's lowercase
      if (jobInfo.title.charAt(0).match(/[a-z]/)) {
        jobInfo.title =
          jobInfo.title.charAt(0).toUpperCase() + jobInfo.title.slice(1);
      }
    }

    // Better company name extraction
    if (!jobInfo.company) {
      // Try to extract from title if it contains "at Company"
      if (jobInfo.title && jobInfo.title.includes(' at ')) {
        const titleParts = jobInfo.title.split(' at ');
        if (titleParts.length > 1) {
          jobInfo.company = titleParts[1].trim();
          // Update title to remove the company part
          jobInfo.title = titleParts[0].trim();
        }
      }
      // Check processed skills for company name
      else {
        const relevantInfo = job.processedSkills?.other_relevent_info;
        if (relevantInfo && relevantInfo.length > 0) {
          const companyLine = relevantInfo.find((line) =>
            line.toLowerCase().includes('company:')
          );
          if (companyLine) {
            jobInfo.company = companyLine.replace(/^company:\s*/i, '').trim();
          }
        }
      }
    }

    // Better location handling
    if (!jobInfo.location) {
      const relevantInfo = job.processedSkills?.other_relevent_info;
      if (relevantInfo && relevantInfo.length > 0) {
        const locationLine = relevantInfo.find((line) =>
          line.toLowerCase().includes('location:')
        );
        if (locationLine) {
          jobInfo.location = locationLine.replace(/^location:\s*/i, '').trim();
        }
      }
    }
  } catch (error) {
    console.error('Error parsing job info:', error, job);
    jobInfo = {
      title: `Software Engineering Role`,
      company: 'Tech Company',
      location: 'Remote',
    };
  }

  // Handle match percentage with fallbacks for both legacy and new format
  let matchPercentage = 0;
  if (job.comparison) {
    if (typeof job.comparison.matchPercentage === 'number') {
      // Legacy format
      matchPercentage = job.comparison.matchPercentage;
    } else if (job.comparison.overallScore?.value) {
      // New format
      matchPercentage = Math.round(job.comparison.overallScore.value);
    }
  }

  // Determine match color and text
  const getMatchColor = () => {
    if (matchPercentage >= 85)
      return {
        bg: 'bg-emerald-500',
        text: 'text-emerald-700',
        light: 'bg-emerald-50',
        border: 'border-emerald-200',
        pill: 'from-emerald-500 to-green-600',
      };
    if (matchPercentage >= 70)
      return {
        bg: 'bg-blue-500',
        text: 'text-blue-700',
        light: 'bg-blue-50',
        border: 'border-blue-200',
        pill: 'from-blue-500 to-indigo-600',
      };
    if (matchPercentage >= 50)
      return {
        bg: 'bg-amber-500',
        text: 'text-amber-700',
        light: 'bg-amber-50',
        border: 'border-amber-200',
        pill: 'from-amber-500 to-orange-600',
      };
    return {
      bg: 'bg-rose-500',
      text: 'text-rose-700',
      light: 'bg-rose-50',
      border: 'border-rose-200',
      pill: 'from-rose-500 to-pink-600',
    };
  };

  const matchColor = getMatchColor();
  const matchStatusText =
    matchPercentage >= 85
      ? 'Excellent'
      : matchPercentage >= 70
        ? 'Good'
        : matchPercentage >= 50
          ? 'Fair'
          : 'Low';

  // Extract key skills (if available)
  const keySkills: string[] = [];
  if (
    job.comparison?.matchedSkills &&
    job.comparison.matchedSkills.length > 0
  ) {
    job.comparison.matchedSkills.slice(0, 2).forEach((skill) => {
      if (skill && typeof skill === 'object' && 'name' in skill) {
        keySkills.push(skill.name);
      }
    });
  } else if (
    job.comparison?.matchedSkillsDetailed &&
    job.comparison.matchedSkillsDetailed.length > 0
  ) {
    job.comparison.matchedSkillsDetailed.slice(0, 2).forEach((skill) => {
      if (skill && typeof skill === 'object' && 'skill' in skill) {
        keySkills.push(skill.skill);
      }
    });
  }

  return (
    <div
      className={`flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 sm:p-5 rounded-xl border border-slate-100 bg-white hover:bg-slate-50/80 hover:border-blue-100 transition-all duration-200 cursor-pointer shadow-sm hover:shadow ${!isLast ? 'mb-2 sm:mb-3' : ''}`}
      onClick={onClick}
    >
      {/* Left Side with Company Logo */}
      <div className="flex-shrink-0">
        <div className="relative">
          <Avatar className="h-12 w-12 sm:h-14 sm:w-14 rounded-md shadow-sm overflow-hidden ring-1 ring-slate-200/50">
            <AvatarImage
              src={
                job.organization?.logo_url ||
                jobInfo?.companyLogo ||
                '/placeholder.svg'
              }
              alt={job.organization?.name || jobInfo?.company || 'Company'}
              className="object-cover"
            />
            <AvatarFallback className="rounded-md bg-gradient-to-br from-slate-50 to-slate-200 text-slate-600 font-medium">
              {(job.organization?.name || jobInfo?.company || 'JD')
                .substring(0, 2)
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>

          {/* Match Score Badge (Small Circle) */}
          <div className="absolute -bottom-2 -right-2 flex items-center justify-center">
            <div
              className={`relative w-7 h-7 rounded-full bg-gradient-to-br ${matchColor.pill} shadow-md flex items-center justify-center`}
            >
              <span className="text-[10px] font-bold text-white">
                {matchPercentage}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Middle - Job Details */}
      <div className="flex-1 min-w-0 sm:pr-4 mt-2 sm:mt-0">
        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3">
          <h4 className="font-semibold truncate text-sm sm:text-base text-slate-800">
            {jobInfo?.title || 'Software Engineering Role'}
          </h4>

          {/* Posted time pill - only on desktop */}
          {job.postedTimeAgo && (
            <span className="hidden sm:inline-block text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full whitespace-nowrap">
              {job.postedTimeAgo}
            </span>
          )}
        </div>

        <div className="flex items-center flex-wrap gap-3 text-xs sm:text-sm text-slate-500 mt-1.5">
          <span className="flex items-center font-medium text-slate-700">
            {job.organization?.name || jobInfo?.company || 'Tech Company'}
          </span>
          <span className="flex items-center">
            {job.organization?.location || jobInfo?.location || 'Remote'}
          </span>
          {job.postedTimeAgo && (
            <span className="sm:hidden text-slate-400">
              {job.postedTimeAgo}
            </span>
          )}
        </div>

        {/* Key Skills */}
        {keySkills.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {keySkills.map((skill, idx) => (
              <span
                key={idx}
                className="inline-flex items-center px-2 py-0.5 rounded-md text-xs bg-blue-50 text-blue-700 border border-blue-100"
              >
                {skill}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Right - Match Details */}
      <div className="flex items-center gap-3 sm:gap-4 mt-2 sm:mt-0 pt-3 sm:pt-0 border-t sm:border-0 border-slate-100 w-full sm:w-auto">
        {/* Match Score Visualization */}
        <div className="flex flex-col items-start sm:items-center gap-1.5">
          <div className="flex items-center gap-1.5">
            <div className="relative w-full sm:w-20 h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${matchColor.bg}`}
                style={{ width: `${matchPercentage}%` }}
              ></div>
            </div>
          </div>
          <div className="flex items-center justify-between w-full">
            <span className={`text-xs font-semibold ${matchColor.text}`}>
              {matchStatusText}
            </span>
            <span className="text-xs text-slate-500 font-medium ml-2">
              {matchPercentage}% match
            </span>
          </div>
        </div>

        {/* View Button */}
        <Button
          variant="ghost"
          size="sm"
          className="px-3 h-8 text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50/70 transition-all duration-200 ml-auto whitespace-nowrap"
        >
          <span className="mr-1">View</span>
          <ArrowRight className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}

function DataSourceItem({
  title,
  isConnected,
  description,
  onClick,
}: {
  title: string;
  isConnected: boolean;
  description: string;
  onClick: () => void;
}) {
  // Determine icon and colors based on data source
  const getIconForSource = (sourceType: string) => {
    switch (sourceType.toLowerCase()) {
      case 'resume':
        return <FileText className="h-5 w-5" />;
      case 'github':
        return <Github className="h-5 w-5" />;
      case 'leetcode':
        return <Code className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  const getColorClasses = () => {
    if (title.toLowerCase() === 'resume') {
      return {
        border: isConnected
          ? 'border-indigo-100/70 bg-indigo-50/30'
          : 'border-slate-200/70 bg-white',
        hover: 'hover:border-indigo-200 hover:bg-indigo-50/40',
        iconBg: isConnected
          ? 'bg-gradient-to-br from-indigo-100 to-blue-200 ring-2 ring-indigo-200/50'
          : 'bg-slate-100',
        iconColor: isConnected ? 'text-indigo-700' : 'text-slate-500',
        iconHover: 'group-hover:text-indigo-700',
      };
    } else if (title.toLowerCase() === 'github') {
      return {
        border: isConnected
          ? 'border-slate-200/70 bg-slate-50/30'
          : 'border-slate-200/70 bg-white',
        hover: 'hover:border-slate-300 hover:bg-slate-50/40',
        iconBg: isConnected
          ? 'bg-gradient-to-br from-slate-100 to-zinc-200 ring-2 ring-slate-200/50'
          : 'bg-slate-100',
        iconColor: isConnected ? 'text-slate-700' : 'text-slate-500',
        iconHover: 'group-hover:text-slate-700',
      };
    } else if (title.toLowerCase() === 'leetcode') {
      return {
        border: isConnected
          ? 'border-amber-100/70 bg-amber-50/30'
          : 'border-slate-200/70 bg-white',
        hover: 'hover:border-amber-200 hover:bg-amber-50/40',
        iconBg: isConnected
          ? 'bg-gradient-to-br from-amber-100 to-orange-200 ring-2 ring-amber-200/50'
          : 'bg-slate-100',
        iconColor: isConnected ? 'text-amber-700' : 'text-slate-500',
        iconHover: 'group-hover:text-amber-700',
      };
    } else {
      return {
        border: isConnected
          ? 'border-blue-100/70 bg-blue-50/30'
          : 'border-slate-200/70 bg-white',
        hover: 'hover:border-blue-200 hover:bg-blue-50/40',
        iconBg: isConnected
          ? 'bg-gradient-to-br from-blue-100 to-indigo-200 ring-2 ring-blue-200/50'
          : 'bg-slate-100',
        iconColor: isConnected ? 'text-blue-700' : 'text-slate-500',
        iconHover: 'group-hover:text-blue-700',
      };
    }
  };

  const colors = getColorClasses();
  const icon = getIconForSource(title);

  return (
    <div
      className={`group flex items-center gap-4 p-4 rounded-xl border ${colors.border} ${colors.hover} transition-all duration-200 shadow-sm cursor-pointer`}
      onClick={onClick}
    >
      {/* Icon Container */}
      <div className="relative">
        <div
          className={`h-12 w-12 rounded-lg shadow-sm flex items-center justify-center 
          ${colors.iconBg} transition-all duration-200 group-hover:shadow group-hover:scale-105`}
        >
          <div className={`${colors.iconColor} ${colors.iconHover}`}>
            {icon}
          </div>
        </div>

        {/* Connection Status Indicator */}
        <div
          className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white 
          ${isConnected ? 'bg-emerald-500' : 'bg-slate-300'}`}
        >
          {isConnected && (
            <CheckCircle2 className="h-full w-full p-0.5 text-white" />
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-slate-800">{title}</p>
          <div
            className={`px-1.5 py-0.5 rounded-full ${isConnected ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'} text-[10px] font-medium`}
          >
            {isConnected ? 'CONNECTED' : 'DISCONNECTED'}
          </div>
        </div>
        <p className="text-xs text-slate-500 mt-0.5">{description}</p>

        {/* Action text */}
        <p
          className={`mt-1 text-xs font-medium ${isConnected ? 'text-emerald-600' : 'text-indigo-600'} flex items-center gap-1`}
        >
          {isConnected ? 'Manage connection' : 'Connect now'}
          <ArrowRight className="h-3 w-3" />
        </p>
      </div>

      {/* Status Indicator (right side) */}
      <div className="flex items-center self-stretch">
        <div
          className={`w-1 self-stretch rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-slate-200'}`}
        ></div>
      </div>
    </div>
  );
}
