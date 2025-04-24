'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { Check, ChevronRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import GithubAgreement from './steps/github/github-agreement';
import ResumeStep from './steps/resume/resume-step';
import LeetcodeStep from './steps/leetcode/leetcode-step';
import { useOnboarding } from '@/libs/hooks/use-onboarding';

export default function OnboardingForm() {
  const [currentStep, setCurrentStep] = useState(0);
  const router = useRouter();
  const queryClient = useQueryClient();
  const { onboardingData, updateOnboardingData, submitOnboarding } =
    useOnboarding();

  const steps = [
    { id: 'agreement', title: 'Github access', component: GithubAgreement },
    { id: 'resume', title: 'Resume Upload', component: ResumeStep },
    { id: 'username', title: 'Leetcode Username', component: LeetcodeStep },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    if (currentStep < steps.length - 1) {
      updateOnboardingData({ [`${steps[currentStep].id}Skipped`]: true });
      setCurrentStep(currentStep + 1);
    }
  };

  const handleComplete = async () => {
    try {
      await submitOnboarding();
      if (queryClient) {
        queryClient.invalidateQueries({ queryKey: ['user'] });
      }
      router.push('/dashboard');
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
    }
  };

  const CurrentStepComponent = steps[currentStep].component;

  return (
    <div className="p-8">
      {/* Progress indicator */}
      <div className="mb-10">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div
                className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300 shadow-sm ${
                  index < currentStep
                    ? 'bg-rose-500 border-rose-500 text-white'
                    : index === currentStep
                      ? 'border-rose-500 text-rose-500 scale-110 shadow-rose-200'
                      : 'border-gray-200 text-gray-300'
                }`}
              >
                {index < currentStep ? (
                  <Check className="w-6 h-6" />
                ) : (
                  index + 1
                )}
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`w-20 h-1.5 mx-2 rounded-full transition-all duration-500 ${
                    index < currentStep ? 'bg-rose-500' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-3">
          {steps.map((step, index) => (
            <div
              key={`title-${step.id}`}
              className={`text-sm font-medium transition-colors duration-300 ${
                index === currentStep ? 'text-rose-600' : 'text-gray-500'
              }`}
              style={{ width: '33.333%' }}
            >
              {step.title}
            </div>
          ))}
        </div>
      </div>

      {/* Current step content */}
      <div className="py-6 min-h-[400px] flex flex-col">
        <CurrentStepComponent
          data={onboardingData}
          updateData={updateOnboardingData}
        />
      </div>

      {/* Navigation buttons */}
      <div className="flex justify-between mt-8 pt-4 border-t border-gray-100">
        {currentStep > 0 ? (
          <Button
            variant="outline"
            onClick={() => setCurrentStep(currentStep - 1)}
            className="border-rose-200 text-rose-700 hover:bg-rose-50 transition-all duration-200"
          >
            Back
          </Button>
        ) : (
          <div></div>
        )}
        <div className="flex gap-3 ml-auto">
          {currentStep < steps.length - 1 && (
            <Button
              variant="ghost"
              onClick={handleSkip}
              className="text-gray-500 hover:text-rose-700 hover:bg-rose-50 transition-all duration-200"
            >
              Skip this step
            </Button>
          )}
          <Button
            onClick={handleNext}
            className="bg-rose-500 hover:bg-rose-600 text-white shadow-md hover:shadow-lg transition-all duration-200"
          >
            {currentStep === steps.length - 1 ? 'Complete' : 'Continue'}
            {currentStep !== steps.length - 1 && (
              <ChevronRight className="ml-2 h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
