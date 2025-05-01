'use client';

import { ArrowRight, Code, FileText, Github, Plus } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';

interface RecentJob {
  id: number;
  title: string;
  company: string;
  location: string;
  match: number;
  logo: string;
}

export function DashboardView() {
  const recentJobs = [
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 w-full">
        <Card className="w-full">
          <CardHeader className="px-4 sm:px-6">
            <CardTitle>Recent Job Comparisons</CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <div className="space-y-2 sm:space-y-4">
              {recentJobs.map((job) => (
                <RecentJobCard key={job.id} job={job} />
              ))}
            </div>
          </CardContent>
          <CardFooter className="border-t pt-3 sm:pt-4 px-4 sm:px-6">
            <Button
              variant="outline"
              className="w-full text-rose-600 border-rose-200 hover:bg-rose-50 hover:text-rose-700 text-xs sm:text-sm"
            >
              View All Job Comparisons
            </Button>
          </CardFooter>
        </Card>

        <Card className="w-full">
          <CardHeader className="px-4 sm:px-6">
            <CardTitle>Connected Data Sources</CardTitle>
            <CardDescription>Your profile information sources</CardDescription>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <div className="space-y-2 sm:space-y-3">
              <div className="flex items-center gap-2 sm:gap-3 p-1.5 sm:p-2 rounded-lg border border-rose-100">
                <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
                  <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium">Resume</p>
                  <p className="text-xs text-muted-foreground">
                    Last updated 2 days ago
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className="bg-emerald-50 text-emerald-600 hover:bg-emerald-100 text-xs"
                >
                  Active
                </Badge>
              </div>

              <div className="flex items-center gap-2 sm:gap-3 p-1.5 sm:p-2 rounded-lg border border-rose-100">
                <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
                  <Github className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium">GitHub</p>
                  <p className="text-xs text-muted-foreground">
                    15 repositories analyzed
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className="bg-emerald-50 text-emerald-600 hover:bg-emerald-100 text-xs"
                >
                  Active
                </Badge>
              </div>

              <div className="flex items-center gap-2 sm:gap-3 p-1.5 sm:p-2 rounded-lg border border-rose-100 bg-rose-50/50">
                <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
                  <Code className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium">LeetCode</p>
                  <p className="text-xs text-muted-foreground">Not connected</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-100 px-2"
                >
                  Connect
                </Button>
              </div>
            </div>
          </CardContent>
          <CardFooter className="border-t pt-3 sm:pt-4 px-4 sm:px-6">
            <Button
              variant="outline"
              className="w-full text-rose-600 border-rose-200 hover:bg-rose-50 hover:text-rose-700 text-xs sm:text-sm"
            >
              <Plus className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
              Add Data Source
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

function RecentJobCard({ job }: { job: RecentJob }) {
  return (
    <div className="flex items-center gap-2 sm:gap-4 p-2 sm:p-3 rounded-lg border border-rose-100 hover:bg-rose-50 transition-colors">
      <Avatar className="h-8 w-8 sm:h-10 sm:w-10 rounded-md">
        <AvatarImage src={job.logo || '/placeholder.svg'} alt={job.company} />
        <AvatarFallback className="rounded-md bg-rose-100 text-rose-700">
          {job.company.substring(0, 2)}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <h4 className="font-medium truncate text-xs sm:text-sm">{job.title}</h4>
        <p className="text-xs text-muted-foreground truncate">
          {job.company} • {job.location}
        </p>
      </div>
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="text-right">
          <div className="text-xs sm:text-sm font-medium">Match</div>
          <div
            className={`text-sm sm:text-lg font-bold ${job.match >= 80 ? 'text-emerald-600' : job.match >= 70 ? 'text-amber-600' : 'text-rose-600'}`}
          >
            {job.match}%
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
