'use client';

import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Plus } from 'lucide-react';
import { useRecentJobComparisons } from '@/hooks/use-dashboard-data';
import { Comparison } from '@/types/dashboard';
import { JobDetailView } from './job-detail-view';

interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  logo?: string;
  comparison?: Comparison;
  // Fields to support new format
  skillTags?: string[];
}

export function JobAnalysisView() {
  const { data: recentJobs, isLoading } = useRecentJobComparisons();
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  // Show job details view if a job is selected
  if (selectedJobId) {
    return (
      <JobDetailView
        jobId={selectedJobId}
        onBack={() => setSelectedJobId(null)}
      />
    );
  }

  // Show loading state while fetching data
  if (isLoading) {
    return (
      <div className="grid w-full gap-4 sm:gap-6 max-w-none">
        <Card className="w-full">
          <CardHeader className="px-4 sm:px-6">
            <div className="animate-pulse h-6 w-48 bg-rose-100 rounded"></div>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <div className="space-y-3 sm:space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-4 border rounded-lg"
                >
                  <div className="animate-pulse h-12 w-12 bg-rose-100 rounded-md"></div>
                  <div className="flex-1">
                    <div className="animate-pulse h-4 w-3/4 bg-rose-100 rounded mb-2"></div>
                    <div className="animate-pulse h-3 w-1/2 bg-rose-100 rounded"></div>
                  </div>
                  <div className="animate-pulse h-8 w-16 bg-rose-100 rounded"></div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Mock data for fallback
  const analyzedJobs: Job[] = [
    {
      id: 1,
      title: 'Senior Frontend Developer',
      company: 'TechCorp Inc.',
      location: 'Remote',
      logo: '/placeholder.svg?height=40&width=40',
      comparison: {
        matchPercentage: 85,
      },
      skillTags: ['React', 'TypeScript', 'Next.js'],
    },
    {
      id: 2,
      title: 'Full Stack Engineer',
      company: 'InnovateSoft',
      location: 'San Francisco, CA',
      logo: '/placeholder.svg?height=40&width=40',
      comparison: {
        matchPercentage: 72,
      },
      skillTags: ['JavaScript', 'Node.js', 'MongoDB'],
    },
    {
      id: 3,
      title: 'React Developer',
      company: 'WebSolutions',
      location: 'New York, NY',
      logo: '/placeholder.svg?height=40&width=40',
      comparison: {
        matchPercentage: 91,
      },
      skillTags: ['React', 'Redux', 'CSS'],
    },
  ];

  // Transform API data to our Job format if available
  const transformedJobs =
    recentJobs?.map((apiJob, index) => {
      // Parse job info if it's a string
      let jobInfo;
      try {
        if (
          typeof apiJob.jobInfo === 'string' &&
          apiJob.jobInfo.trim().length > 0 &&
          (apiJob.jobInfo.trim().startsWith('{') ||
            apiJob.jobInfo.trim().startsWith('['))
        ) {
          jobInfo = JSON.parse(apiJob.jobInfo);
        } else if (
          typeof apiJob.jobInfo === 'object' &&
          apiJob.jobInfo !== null
        ) {
          jobInfo = apiJob.jobInfo;
        } else {
          jobInfo = {
            title: `Job ${index + 1}`,
            company: 'Unknown Company',
            location: 'Unknown Location',
          };
        }
      } catch (error) {
        console.error('Error parsing job info:', error);
        jobInfo = {
          title: `Job ${index + 1}`,
          company: 'Unknown Company',
          location: 'Unknown Location',
        };
      }

      // Extract skills for tags
      let skillTags: string[] = [];

      // Try to extract skill tags from both formats
      if (
        apiJob.comparison?.matchedSkills &&
        Array.isArray(apiJob.comparison.matchedSkills)
      ) {
        // Legacy format
        skillTags = apiJob.comparison.matchedSkills
          .slice(0, 3)
          .map((skill) => skill.name);
      } else if (
        apiJob.comparison?.matchedSkillsDetailed &&
        Array.isArray(apiJob.comparison.matchedSkillsDetailed)
      ) {
        // New format
        skillTags = apiJob.comparison.matchedSkillsDetailed
          .slice(0, 3)
          .map((skill) => skill.skill);
      }

      return {
        id: index + 1,
        title: jobInfo.title || 'Untitled Job',
        company: jobInfo.company || 'Unknown Company',
        location: jobInfo.location || 'Unknown',
        logo: jobInfo.companyLogo || '/placeholder.svg?height=40&width=40',
        comparison: apiJob.comparison,
        skillTags,
      };
    }) || analyzedJobs;

  const displayJobs =
    transformedJobs.length > 0 ? transformedJobs : analyzedJobs;

  return (
    <div className="grid w-full gap-4 sm:gap-6 max-w-none">
      <Card className="w-full">
        <CardHeader className="px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <CardTitle>Analyzed Jobs</CardTitle>
              <CardDescription className="mt-1">
                Jobs you've already analyzed
              </CardDescription>
            </div>
            <div className="flex items-center">
              <Button className="bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-xs sm:text-sm">
                <Plus className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                <span className="sm:inline">Compare to New Job</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          <div className="space-y-3 sm:space-y-4">
            {displayJobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        </CardContent>
        <CardFooter className="border-t pt-3 sm:pt-4 px-4 sm:px-6 flex flex-col sm:flex-row justify-between gap-2">
          <Button
            variant="outline"
            className="text-rose-600 border-rose-200 hover:bg-rose-50 hover:text-rose-700 text-xs sm:text-sm w-full sm:w-auto"
          >
            Load More Jobs
          </Button>
          <Button
            variant="outline"
            className="text-rose-600 border-rose-200 hover:bg-rose-50 hover:text-rose-700 text-xs sm:text-sm w-full sm:w-auto"
          >
            Compare Selected Jobs
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

function JobCard({ job }: { job: Job }) {
  // Calculate match percentage from either format
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

  // Extract skill tags
  const skillTags = job.skillTags || ['React', 'TypeScript', '+3 more'];

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg border border-rose-100 hover:bg-rose-50 transition-colors">
      <Avatar className="h-10 w-10 sm:h-12 sm:w-12 rounded-md">
        <AvatarImage src={job.logo || '/placeholder.svg'} alt={job.company} />
        <AvatarFallback className="rounded-md bg-rose-100 text-rose-700">
          {job.company.substring(0, 2)}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-sm sm:text-base">{job.title}</h4>
        <p className="text-xs sm:text-sm text-muted-foreground">
          {job.company} • {job.location}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-1 sm:gap-2">
          {skillTags.slice(0, 2).map((skill, index) => (
            <Badge
              key={index}
              variant="outline"
              className="bg-rose-50 text-rose-600 hover:bg-rose-100 text-xs"
            >
              {skill}
            </Badge>
          ))}

          {(skillTags.length > 2 || !skillTags.length) && (
            <Badge
              variant="outline"
              className="bg-rose-50 text-rose-600 hover:bg-rose-100 text-xs"
            >
              +{skillTags.length > 2 ? skillTags.length - 2 : 3} more
            </Badge>
          )}
        </div>
      </div>
      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:gap-2 mt-2 sm:mt-0 pt-2 sm:pt-0 border-t sm:border-t-0">
        <div className="text-center sm:text-right">
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
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="text-rose-600 border-rose-200 hover:bg-rose-50 hover:text-rose-700 h-7 text-xs px-2"
          >
            View Details
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-rose-600 hover:bg-rose-50 hover:text-rose-700 h-7 text-xs px-2"
          >
            Compare
          </Button>
        </div>
      </div>
    </div>
  );
}
