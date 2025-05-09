'use client';

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function JobCardSkeleton() {
  return (
    <div className="flex items-center gap-2 sm:gap-4 p-2 sm:p-3 rounded-lg border border-rose-100">
      <Skeleton className="h-8 w-8 sm:h-10 sm:w-10 rounded-md" />
      <div className="flex-1 min-w-0 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="text-right">
          <Skeleton className="h-4 w-12" />
        </div>
        <Skeleton className="h-7 w-7 sm:h-8 sm:w-8 rounded-md" />
      </div>
    </div>
  );
}

export function DashboardCardSkeleton() {
  return (
    <Card className="w-full">
      <CardHeader className="px-4 sm:px-6">
        <Skeleton className="h-6 w-1/3 mb-2" />
      </CardHeader>
      <CardContent className="px-4 sm:px-6">
        <div className="space-y-4">
          <JobCardSkeleton />
          <JobCardSkeleton />
          <JobCardSkeleton />
        </div>
      </CardContent>
      <CardFooter className="border-t pt-3 sm:pt-4 px-4 sm:px-6">
        <Skeleton className="h-5 w-24" />
      </CardFooter>
    </Card>
  );
}

export function DataSourcesSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {[...Array(3)].map((_, index) => (
        <div
          key={index}
          className="flex items-center gap-3 p-4 border rounded-lg"
        >
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="grid w-full gap-4 sm:gap-6 max-w-none">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 w-full">
        <DashboardCardSkeleton />
        <DashboardCardSkeleton />
      </div>
    </div>
  );
}
