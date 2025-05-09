'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Hook to check if user is authenticated and redirect if not
 * @param redirectPath The path to redirect to if user is not authenticated
 */
export function useAuthGuard(redirectPath: string = '/') {
  const router = useRouter();

  useEffect(() => {
    // Check if the user has an access token
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/check', {
          credentials: 'include',
        });

        if (!response.ok) {
          router.push(redirectPath);
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        router.push(redirectPath);
      }
    };

    checkAuth();
  }, [router, redirectPath]);
}
