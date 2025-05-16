'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

interface UserProfile {
  username: string;
  avatarUrl: string;
}

/**
 * A hook to get the user profile information (username and avatar URL)
 * directly from a dedicated API endpoint
 */
export function useUserProfile() {
  const router = useRouter();

  return useQuery<UserProfile>({
    queryKey: ['userProfile'],
    queryFn: async () => {
      try {
        // handles SSR case - return default data
        if (typeof window === 'undefined') {
          return { username: 'User', avatarUrl: '' };
        }

        const response = await fetch('/api/user/profile', {
          credentials: 'include',
          headers: {
            'Cache-Control': 'no-cache',
          },
        });

        if (response.status === 401) {
          console.error('Unauthorized access to user profile');
          if (typeof window !== 'undefined') {
            router.push('/');
          }
          return { username: 'User', avatarUrl: '' };
        }

        if (!response.ok) {
          console.error(
            'API response not OK:',
            response.status,
            response.statusText
          );
          return { username: 'User', avatarUrl: '' };
        }

        const data = await response.json();
        if (!data || typeof data !== 'object') {
          console.error('Invalid user profile data received:', data);
          return { username: 'User', avatarUrl: '' };
        }

        return {
          username: data.username || 'User',
          avatarUrl: data.avatarUrl || '',
        };
      } catch (error) {
        console.error('Error fetching user profile:', error);
        return { username: 'User', avatarUrl: '' };
      }
    },
    retry: 1,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
}
