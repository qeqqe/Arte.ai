'use client';
import Toast from '@/app/components/base/toast/Toast';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export const useGetStartedHandler = () => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleError = (errorMessage: string) => {
    Toast.notify({
      type: 'error',
      message: errorMessage,
      duration: 5000,
    });
  };

  const handleGetStartedClick = async () => {
    setIsLoading(true);

    try {
      const BACKEND_AUTH_URL = process.env.NEXT_PUBLIC_BACKEND_AUTH_URL;

      if (!BACKEND_AUTH_URL || BACKEND_AUTH_URL === '') {
        handleError('Authentication server not found. Please try again later.');
        setIsLoading(false);
        return;
      }

      router.push(`${BACKEND_AUTH_URL}/auth/github`);
    } catch (error) {
      setIsLoading(false);
      handleError(
        'Failed to connect to authentication service. Please try again later.'
      );
      console.error('GitHub OAuth error:', error);
    }
  };

  return { handleGetStartedClick, isLoading };
};
