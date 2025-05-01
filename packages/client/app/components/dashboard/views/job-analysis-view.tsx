'use client';

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

interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  match: number;
  logo: string;
}

export function JobAnalysisView() {
  const analyzedJobs = [
    {
      id: 1,
      title: 'Senior Frontend Developer',
      company: 'TechCorp Inc.',
      location: 'Remote',
      match: 85,
      logo: '/placeholder.svg?height=40&width=40',
    },
    {
      id: 2,
      title: 'Full Stack Engineer',
      company: 'InnovateSoft',
      location: 'San Francisco, CA',
      match: 72,
      logo: '/placeholder.svg?height=40&width=40',
    },
    {
      id: 3,
      title: 'React Developer',
      company: 'WebSolutions',
      location: 'New York, NY',
      match: 91,
      logo: '/placeholder.svg?height=40&width=40',
    },
  ];

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
            {analyzedJobs.map((job) => (
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
          <Badge
            variant="outline"
            className="bg-rose-50 text-rose-600 hover:bg-rose-100 text-xs"
          >
            React
          </Badge>
          <Badge
            variant="outline"
            className="bg-rose-50 text-rose-600 hover:bg-rose-100 text-xs"
          >
            TypeScript
          </Badge>
          <Badge
            variant="outline"
            className="bg-rose-50 text-rose-600 hover:bg-rose-100 text-xs"
          >
            +3 more
          </Badge>
        </div>
      </div>
      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:gap-2 mt-2 sm:mt-0 pt-2 sm:pt-0 border-t sm:border-t-0">
        <div className="text-center sm:text-right">
          <div className="text-xs sm:text-sm font-medium">Match</div>
          <div
            className={`text-sm sm:text-lg font-bold ${job.match >= 80 ? 'text-emerald-600' : job.match >= 70 ? 'text-amber-600' : 'text-rose-600'}`}
          >
            {job.match}%
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
