'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import {
  ConnectedDataSources,
  RecentJobComparison,
  UserSkillsData,
} from '../types/dashboard';

/**
 * fetches the recent job comparisons for the user
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

              if (job.comparison) {
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
                return null;
              }

              let parsedJobInfo = null;
              if (job.jobInfo) {
                try {
                  parsedJobInfo =
                    typeof job.jobInfo === 'string'
                      ? JSON.parse(job.jobInfo)
                      : job.jobInfo;
                } catch (e) {
                  console.warn('Failed to parse jobInfo:', e);
                }
              }

              return {
                ...job,
                parsedJobInfo,
              };
            } catch (parseError) {
              console.error('Error processing job data:', parseError, job);
              return null; // Return null instead of partial object to ensure consistent data
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

/**
 * fetches all job comparisons for the user
 */
export function useAllJobComparisons() {
  const router = useRouter();

  return useQuery<RecentJobComparison[]>({
    queryKey: ['allJobComparisons'],
    queryFn: async () => {
      try {
        console.log('Fetching all job comparisons...');
        const response = await fetch('/api/dashboard/all-comparison', {
          credentials: 'include',
        });

        if (response.status === 401) {
          console.error('Unauthorized access to all job comparisons');
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
            `Failed to fetch all job comparisons: ${response.statusText}`
          );
        }

        const responseData = await response.json();
        console.log('All jobs API response received, processing...');

        const jobsArray = Array.isArray(responseData)
          ? responseData
          : responseData
            ? [responseData]
            : [];

        if (jobsArray.length === 0) {
          console.log('No job comparisons found');
          return [];
        }

        console.log(`Processing ${jobsArray.length} job comparisons`);

        return jobsArray
          .map((job) => {
            try {
              let parsedJobInfo = job.parsedJobInfo;
              if (!parsedJobInfo && job.jobInfo) {
                try {
                  parsedJobInfo =
                    typeof job.jobInfo === 'string' &&
                    job.jobInfo.trim().startsWith('{')
                      ? JSON.parse(job.jobInfo)
                      : job.jobInfo;
                } catch (e) {
                  console.warn('Failed to parse jobInfo:', e);
                }
              }

              return {
                ...job,
                parsedJobInfo,
              };
            } catch (parseError) {
              console.error('Error processing job data:', parseError, job);
              return null;
            }
          })
          .filter(Boolean);
      } catch (error) {
        console.error('Error in useAllJobComparisons hook:', error);
        throw error;
      }
    },
    enabled: false, // dont auto-fetch
    retry: 1,
  });
}

/**
 * Fetches the user's processed skills data
 */
export function useUserSkills() {
  const router = useRouter();

  return useQuery<UserSkillsData>({
    queryKey: ['userProcessedSkills'],
    queryFn: async () => {
      try {
        console.log('Fetching user skills...');
        const response = await fetch('/api/dashboard/user-skills', {
          credentials: 'include',
        });

        if (response.status === 401) {
          console.error('Unauthorized access to user skills');
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
            `Failed to fetch user skills: ${response.statusText}`
          );
        }

        const data = await response.json();
        console.log('User skills API response:', data);
        return data;
      } catch (error) {
        console.error('Error in useUserSkills hook:', error);
        throw error;
      }
    },
    retry: 1,
  });
}
