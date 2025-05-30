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
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Loader2, Plus } from 'lucide-react';
import {
  useRecentJobComparisons,
  useAllJobComparisons,
} from '@/hooks/use-dashboard-data';
import { Comparison } from '@/types/dashboard';
import { JobDetailView } from './job-detail-view';
import { compareToJob } from '@/libs/api';
import { toast } from 'sonner';
import JobComparisonDialog from './job-comparison-dialog';
// Compare Job Dialog Component
function CompareJobDialog({
  children,
  onSuccess,
}: {
  children: React.ReactNode;
  onSuccess?: (jobId: string) => void;
}) {
  const [jobUrl, setJobUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!jobUrl.trim()) {
      setError('Please enter a LinkedIn job URL or ID.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const jobId = extractJobId(jobUrl);

      if (!jobId) {
        throw new Error(
          'Invalid LinkedIn job URL. Please check and try again.'
        );
      }

      console.log(`Sending job comparison request for ID: ${jobId}`);
      const result = await compareToJob(jobId);
      console.log('Job comparison result:', result);

      toast.success('Job analysis complete!');

      if (onSuccess) {
        onSuccess(jobId);
      }

      // Close dialog on success
      setIsOpen(false);
      setJobUrl('');
    } catch (err) {
      console.error('Error in job comparison:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Something went wrong. Please try again.'
      );
      toast.error('Failed to analyze job');
    } finally {
      setIsLoading(false);
    }
  };

  const extractJobId = (input: string): string | null => {
    // Check if input is just an ID
    if (/^\d+$/.test(input.trim())) {
      return input.trim();
    }

    try {
      // Handle various LinkedIn URL formats:
      // 1. https://www.linkedin.com/jobs/view/4136871040
      // 2. https://www.linkedin.com/jobs/view/job-title-at-company-4136871040
      // 3. https://www.linkedin.com/jobs/view/4136871040/
      // 4. https://linkedin.com/jobs/view/4136871040

      let match = input.match(/linkedin\.com\/jobs\/view\/(\d+)/i);

      // If that doesn't work, try a more permissive pattern
      if (!match) {
        match = input.match(/linkedin\.com\/jobs\/view\/[^\/]*?(\d{8,})/i);
      }

      console.log('Extracted job ID:', match ? match[1] : 'none');
      return match ? match[1] : null;
    } catch (e) {
      console.error('Error extracting job ID:', e);
      return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md bg-white">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="space-y-3 mb-4">
            <DialogTitle className="text-xl font-semibold text-slate-800">
              Compare to New Job
            </DialogTitle>
            <p className="text-slate-600 text-sm">
              Enter a LinkedIn job URL or ID to analyze how well your profile
              matches with this job opportunity.
            </p>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="job-url"
                className="text-sm font-medium text-slate-700 mb-1 block"
              >
                LinkedIn Job URL or ID
              </label>
              <Input
                id="job-url"
                value={jobUrl}
                onChange={(e) => setJobUrl(e.target.value)}
                placeholder="https://www.linkedin.com/jobs/view/0123456789"
                className="w-full placeholder:text-slate-400/80"
                disabled={isLoading}
              />
              {error && <p className="text-rose-600 text-xs mt-1">{error}</p>}
            </div>

            <div className="text-xs text-slate-500">
              <p>
                Tip: Just paste the complete LinkedIn job URL directly from your
                browser.
              </p>
            </div>
          </div>

          <DialogFooter className="mt-6">
            <DialogClose asChild>
              <Button
                type="button"
                variant="outline"
                className="text-slate-600 border-slate-200 hover:bg-white hover:border-slate-300 hover:text-slate-800"
                disabled={isLoading}
              >
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="submit"
              className="bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white shadow-sm"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                'Analyze Job'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  logo?: string;
  comparison?: Comparison;
  // Fields to support new format
  skillTags?: string[];
  // Additional fields from API
  postedTimeAgo?: string;
  jobInfo?: string;
  processedSkills?: any;
  organization?: {
    name: string;
    location: string;
    logo_url: string;
  };
}

export function JobAnalysisView() {
  const { data: recentJobs, isLoading } = useRecentJobComparisons();
  const {
    data: allJobs,
    refetch: fetchAllJobs,
    isFetching: isLoadingAll,
  } = useAllJobComparisons();
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [showingAll, setShowingAll] = useState(false);

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
  const currentJobs = showingAll ? allJobs : recentJobs;
  const transformedJobs =
    currentJobs?.map((apiJob, index) => {
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

      // Use organization data if available
      return {
        id: index + 1,
        title: jobInfo.title || 'Untitled Job',
        company:
          apiJob.organization?.name || jobInfo.company || 'Unknown Company',
        location:
          apiJob.organization?.location || jobInfo.location || 'Unknown',
        logo:
          apiJob.organization?.logo_url ||
          jobInfo.companyLogo ||
          '/placeholder.svg?height=40&width=40',
        comparison: apiJob.comparison,
        skillTags,
        postedTimeAgo: apiJob.postedTimeAgo || '',
        jobInfo: apiJob.jobInfo,
        processedSkills: apiJob.processedSkills,
        organization: apiJob.organization,
      };
    }) || analyzedJobs;

  let displayJobs = transformedJobs.length > 0 ? transformedJobs : analyzedJobs;
  displayJobs.reverse();
  return (
    <div className="grid w-full gap-5 sm:gap-7 max-w-none">
      <Card className="w-full overflow-hidden shadow-md border-slate-200 bg-white hover:shadow-lg transition-shadow duration-300">
        <CardHeader className="px-5 sm:px-7 border-b border-slate-100">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <CardTitle className="text-slate-800 font-bold">
                Analyzed Jobs
              </CardTitle>
              <CardDescription className="mt-1.5 text-slate-500">
                Jobs you've already analyzed and compared to your profile
              </CardDescription>
            </div>
            <div className="flex items-center">
              <CompareJobDialog onSuccess={() => window.location.reload()}>
                <Button className="bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white shadow-sm text-xs sm:text-sm transition-colors">
                  <Plus className="mr-1.5 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  <span>Compare to New Job</span>
                </Button>
              </CompareJobDialog>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-5 sm:px-7 py-4 sm:py-5">
          {displayJobs.length > 0 ? (
            <div className="space-y-4 sm:space-y-5">
              {displayJobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center py-10 px-4">
              <div className="text-slate-400 mb-3">
                <Plus className="h-12 w-12 mx-auto opacity-30" />
              </div>
              <p className="text-slate-500 mb-4">
                No job analyses found. Start by comparing your profile to a job
                posting.
              </p>
              <CompareJobDialog onSuccess={() => window.location.reload()}>
                <Button className="mt-2 bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white shadow-sm">
                  Compare to New Job
                </Button>
              </CompareJobDialog>
            </div>
          )}
        </CardContent>
        <CardFooter className="border-t border-slate-100 pt-3 sm:pt-4 px-5 sm:px-7 flex flex-col sm:flex-row justify-between gap-3 bg-gradient-to-r from-slate-50 to-rose-50/30">
          {!showingAll && (
            <Button
              variant="outline"
              className="text-slate-600 border-slate-200 hover:bg-white hover:border-slate-300 hover:text-slate-800 text-xs sm:text-sm w-full sm:w-auto font-medium shadow-sm transition-colors"
              onClick={async () => {
                await fetchAllJobs();
                setShowingAll(true);
              }}
              disabled={isLoadingAll}
            >
              {isLoadingAll ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                'Load More'
              )}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}

function JobCard({ job, isLast = false }: { job: Job; isLast?: boolean }) {
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

  // Determine match color and text
  const getMatchInfo = () => {
    if (matchPercentage >= 85)
      return {
        bg: 'bg-emerald-500',
        bgLight: 'bg-emerald-50',
        text: 'text-emerald-700',
        border: 'border-emerald-200',
        label: 'Excellent Match',
      };
    if (matchPercentage >= 70)
      return {
        bg: 'bg-blue-500',
        bgLight: 'bg-blue-50',
        text: 'text-blue-700',
        border: 'border-blue-200',
        label: 'Good Match',
      };
    if (matchPercentage >= 50)
      return {
        bg: 'bg-amber-500',
        bgLight: 'bg-amber-50',
        text: 'text-amber-700',
        border: 'border-amber-200',
        label: 'Fair Match',
      };
    return {
      bg: 'bg-rose-500',
      bgLight: 'bg-rose-50',
      text: 'text-rose-700',
      border: 'border-rose-200',
      label: 'Needs Development',
    };
  };

  const matchInfo = getMatchInfo();

  // Extract skill tags
  const skillTags = job.skillTags || ['React', 'TypeScript', '+3 more'];

  return (
    <div
      className={`rounded-xl border border-slate-200 bg-white hover:bg-blue-50/10 shadow-sm hover:shadow transition-all duration-200 group
      ${isLast ? '' : 'mb-4'}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-start p-0 overflow-hidden">
        {/* Match Quality Indicator (left bar) */}
        <div className={`w-full h-1 sm:w-1.5 sm:h-auto ${matchInfo.bg}`}></div>

        <div className="flex flex-col sm:flex-row w-full p-4">
          {/* Company Logo + Match Badge */}
          <div className="relative mb-3 sm:mb-0 sm:mr-4">
            <div className="relative">
              <Avatar className="h-14 w-14 sm:h-16 sm:w-16 rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                <AvatarImage
                  src={job.logo || '/placeholder.svg'}
                  alt={job.company}
                  className="object-cover"
                />
                <AvatarFallback className="rounded-xl bg-gradient-to-br from-slate-50 to-slate-200 text-slate-600 font-semibold">
                  {job.company.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              {/* Match Badge */}
              <div className="absolute -bottom-2 -right-2 sm:-right-3">
                <div
                  className={`flex items-center gap-1 px-2 py-0.5 rounded-full border ${matchInfo.bgLight} ${matchInfo.border} ${matchInfo.text} text-xs font-semibold shadow-sm`}
                >
                  {matchPercentage}%
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-start flex-1 gap-4">
            {/* Job Info Area */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-semibold text-sm sm:text-base text-slate-800">
                  {job.title}
                </h4>
                <span
                  className={`inline-block px-2 py-0.5 text-xs rounded-full ${matchInfo.bgLight} ${matchInfo.text} font-medium`}
                >
                  {matchInfo.label}
                </span>
              </div>

              <div className="flex items-center flex-wrap mt-1 text-xs sm:text-sm">
                <span className="font-medium text-slate-700 mr-2">
                  {job.company}
                </span>
                <span className="text-slate-500">{job.location}</span>
              </div>

              {/* Skills Section */}
              <div className="mt-3">
                <div className="flex items-center gap-1 mb-1.5">
                  <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                  <span className="text-xs font-medium text-slate-700">
                    Key Skills
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {skillTags.slice(0, 3).map((skill, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="bg-white border-slate-200 text-slate-700 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 text-xs py-0.5 px-2 transition-colors"
                    >
                      {skill}
                    </Badge>
                  ))}

                  {skillTags.length > 3 && (
                    <Badge
                      variant="outline"
                      className="bg-white border-slate-200 text-slate-600 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 text-xs py-0.5 px-2 transition-colors"
                    >
                      +{skillTags.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Match + Actions Area */}
            <div className="flex flex-row sm:flex-col items-center sm:items-stretch gap-3 mt-3 sm:mt-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100 sm:min-w-[160px]">
              {/* Match Visualization */}
              <div className="flex-1 sm:mb-3 w-full">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="text-xs text-slate-500 font-medium">
                    Skill Match
                  </div>
                  <span className={`text-xs font-semibold ${matchInfo.text}`}>
                    {matchPercentage}%
                  </span>
                </div>

                <div className="h-2 bg-slate-100 rounded-full overflow-hidden w-full">
                  <div
                    className={`h-full ${matchInfo.bg}`}
                    style={{ width: `${matchPercentage}%` }}
                  ></div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex sm:flex-col gap-2 w-full">
                <JobComparisonDialog jobData={job}>
                  <Button
                    variant="default"
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-white h-8 text-xs font-medium px-3 shadow-sm w-full"
                  >
                    View Details
                  </Button>
                </JobComparisonDialog>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
