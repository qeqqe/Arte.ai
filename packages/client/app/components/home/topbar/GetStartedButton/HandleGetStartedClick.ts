'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export const useGetStartedHandler = () => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleGetStartedClick = () => {
    setIsLoading(true);
    // Simulate loading for demo purposes
    setTimeout(() => {
      router.push('/auth/signin');
      setIsLoading(false);
    }, 500);
  };

  return { handleGetStartedClick, isLoading };
};
