'use client';

import { ArrowRight, CheckCircle2, FileText, Github, Code } from 'lucide-react';
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
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid w-full gap-4 sm:gap-6 max-w-none">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 w-full">
        <Card className="w-full">
          <CardHeader className="px-4 sm:px-6">
            <CardTitle>Recent Job Matches</CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            {recentJobs && recentJobs.length > 0 ? (
              <div className="space-y-3">
                {recentJobs.map((job, index) => (
                  <RecentJobCard
                    key={index}
                    job={job}
                    onClick={() => setActiveView('job-analysis')}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center py-8">
                <p className="text-muted-foreground">
                  No recent job comparisons found
                </p>
                <Button
                  className="mt-4 bg-rose-500 hover:bg-rose-600 text-white"
                  onClick={() => setActiveView('job-analysis')}
                >
                  Analyze a Job Posting
                </Button>
              </div>
            )}
          </CardContent>
          <CardFooter className="border-t pt-3 sm:pt-4 px-4 sm:px-6">
            <Button
              variant="outline"
              className="w-full text-rose-600 border-rose-200 hover:bg-rose-50 hover:text-rose-700 text-xs sm:text-sm"
              onClick={() => setActiveView('job-analysis')}
            >
              View All Job Comparisons
            </Button>
          </CardFooter>
        </Card>

        <Card className="w-full">
          <CardHeader className="px-4 sm:px-6">
            <CardTitle>Connected Data Sources</CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            {dataSources ? (
              <div className="space-y-2 sm:space-y-3">
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
          <CardFooter className="border-t pt-3 sm:pt-4 px-4 sm:px-6">
            <Button
              variant="outline"
              className="w-full text-rose-600 border-rose-200 hover:bg-rose-50 hover:text-rose-700 text-xs sm:text-sm"
              onClick={() => setActiveView('my-data')}
            >
              Manage Data Sources
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

function RecentJobCard({
  job,
  onClick,
}: {
  job: RecentJobComparison;
  onClick: () => void;
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
        company: 'Tech Company',
        location: 'Remote',
      };
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

  return (
    <div
      className="flex items-center gap-2 sm:gap-4 p-2 sm:p-3 rounded-lg border border-rose-100 hover:bg-rose-50 transition-colors cursor-pointer"
      onClick={onClick}
    >
      <Avatar className="h-8 w-8 sm:h-10 sm:w-10 rounded-md">
        <AvatarImage
          src={jobInfo?.companyLogo || '/placeholder.svg'}
          alt={jobInfo?.company}
        />
        <AvatarFallback className="rounded-md bg-rose-100 text-rose-700">
          {jobInfo?.company?.substring(0, 2) || 'JD'}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <h4 className="font-medium truncate text-xs sm:text-sm">
          {jobInfo?.title || 'Software Engineering Role'}
        </h4>
        <p className="text-xs text-muted-foreground truncate">
          {jobInfo?.company || 'Tech Company'} • {jobInfo?.location || 'Remote'}
        </p>
      </div>
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="text-right">
          <div className="text-xs sm:text-sm font-medium">Match</div>
          <div
            className={`text-sm sm:text-lg font-bold ${
              matchPercentage >= 80
                ? 'text-emerald-600'
                : matchPercentage >= 70
                  ? 'text-amber-600'
                  : 'text-rose-600'
            }`}
          >
            {matchPercentage}%
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="text-rose-500 h-7 w-7 sm:h-8 sm:w-8"
        >
          <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
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
  return (
    <div
      className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg border border-rose-100 hover:bg-rose-50 transition-colors cursor-pointer"
      onClick={onClick}
    >
      <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-md bg-rose-100 flex items-center justify-center text-rose-600">
        {title.toLowerCase() === 'resume' ? (
          <FileText className="h-4 w-4" />
        ) : title.toLowerCase() === 'github' ? (
          <Github className="h-4 w-4" />
        ) : title.toLowerCase() === 'leetcode' ? (
          <Code className="h-4 w-4" />
        ) : (
          <FileText className="h-4 w-4" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs sm:text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      {isConnected ? (
        <div className="px-2 py-1 bg-emerald-50 text-emerald-600 text-xs rounded-md border border-emerald-100">
          <CheckCircle2 className="inline-block h-3 w-3 mr-1" />
          <span>Connected</span>
        </div>
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
}
