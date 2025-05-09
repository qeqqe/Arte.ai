'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { ConnectedDataSources, RecentJobComparison } from '../types/dashboard';

/**
 * Fetches the recent job comparisons for the user
 */
export function useRecentJobComparisons() {
  const router = useRouter();

  return useQuery<RecentJobComparison[]>({
    queryKey: ['recentJobComparisons'],
    queryFn: async () => {
      try {
        console.log('Fetching recent job comparisons...');
        const response = await fetch('/api/dashboard/recent-jobs', {
          credentials: 'include',
        });

        if (response.status === 401) {
          console.error('Unauthorized access to recent job comparisons');
          router.push('/');
          throw new Error('Unauthorized');
        }

        if (!response.ok) {
          console.error(
            'API response not OK:',
            response.status,
            response.statusText
          );
          throw new Error(
            `Failed to fetch recent job comparisons: ${response.statusText}`
          );
        }

        const responseData = await response.json();
        console.log('Recent jobs API response received, processing...');

        // Handle both array and non-array responses
        const jobsArray = Array.isArray(responseData)
          ? responseData
          : responseData
            ? [responseData]
            : [];

        if (jobsArray.length === 0) {
          console.log('No recent job comparisons found');
          return [];
        }

        // Process and validate each job
        return jobsArray
          .map((job) => {
            try {
              if (!job) return null;

              // Check for the comparison structure
              if (job.comparison) {
                // Log structure type (new or legacy) for debugging
                if (job.comparison.overallScore) {
                  console.log(
                    'Processing job with new SkillGapAnalysis format'
                  );
                } else if (job.comparison.matchPercentage !== undefined) {
                  console.log('Processing job with legacy format');
                } else {
                  console.warn('Unknown comparison format:', job.comparison);
                }
              } else {
                console.warn('Job missing comparison data:', job);
              }

              return {
                ...job,
                // Only try to parse if it's a string and not already an object
                parsedJobInfo:
                  typeof job.jobInfo === 'string'
                    ? JSON.parse(job.jobInfo)
                    : job.jobInfo,
              };
            } catch (parseError) {
              console.error('Error processing job data:', parseError, job);
              return {
                ...job,
                parsedJobInfo: null,
              };
            }
          })
          .filter(Boolean);
      } catch (error) {
        console.error('Error in useRecentJobComparisons hook:', error);
        throw error;
      }
    },
    retry: 1,
  });
}

/**
 * Fetches the connected data sources status for the user
 */
export function useConnectedDataSources() {
  const router = useRouter();

  return useQuery<ConnectedDataSources>({
    queryKey: ['connectedDataSources'],
    queryFn: async () => {
      try {
        console.log('Fetching connected data sources...');
        const response = await fetch('/api/dashboard/connected-data', {
          credentials: 'include',
        });

        if (response.status === 401) {
          console.error('Unauthorized access to connected data sources');
          router.push('/');
          throw new Error('Unauthorized');
        }

        if (!response.ok) {
          console.error(
            'API response not OK:',
            response.status,
            response.statusText
          );
          throw new Error(
            `Failed to fetch connected data sources: ${response.statusText}`
          );
        }

        const data = await response.json();
        console.log('Connected data sources API response:', data);

        // Ensure the response matches our expected format
        const defaultDataSources: ConnectedDataSources = {
          github: false,
          leetcode: false,
          resume: false,
        };

        // Merge received data with defaults to ensure we have all expected fields
        return {
          ...defaultDataSources,
          ...(data || {}),
        };
      } catch (error) {
        console.error('Error in useConnectedDataSources hook:', error);
        throw error;
      }
    },
    retry: 1,
  });
}
