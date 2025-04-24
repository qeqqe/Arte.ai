'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { saveOnboardingData } from '@/libs/api';

export function useOnboarding() {
  const [onboardingData, setOnboardingData] = useState<Record<string, any>>({});

  const updateOnboardingData = (newData: Record<string, any>) => {
    setOnboardingData((prev) => ({
      ...prev,
      ...newData,
    }));
  };

  const { mutateAsync: submitOnboarding, isPending } = useMutation({
    mutationFn: async () => {
      return await saveOnboardingData(onboardingData);
    },
  });

  return {
    onboardingData,
    updateOnboardingData,
    submitOnboarding,
    isSubmitting: isPending,
  };
}
