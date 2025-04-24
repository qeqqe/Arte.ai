'use client';

import type React from 'react';

import { useState } from 'react';
import { Github } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { TopRepository } from '@/types/onboarding/githubData';

interface AgreementStepProps {
  data: any;
  updateData: (data: any) => void;
}

export default function GithubAgreement({
  data,
  updateData,
}: AgreementStepProps) {
  const [agreed, setAgreed] = useState(data?.agreed || false);
  const [userGithubData, setUserGithubData] = useState<TopRepository | null>(
    null
  );
  const handleAgree = async (checked: boolean) => {
    setAgreed(checked);
    updateData({ agreed: checked });

    if (checked) {
      try {
        const response = await fetch('/api/onboarding/github');
        const data = await response.json();
        setUserGithubData(data);
      } catch (error) {
        console.error('Error fetching GitHub data:', error);
      }
    }
  };

  return (
    <div className="space-y-8 flex-1">
      <div className="text-center mb-8 animate-fade-in">
        <div className="bg-gradient-to-br from-rose-100 to-rose-200 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5 shadow-md">
          <Github className="h-10 w-10 text-rose-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Access Your GitHub Repositories
        </h2>
        <p className="text-gray-600 max-w-md mx-auto">
          We need your permission to access your pinned repositories to
          personalize your experience.
        </p>
      </div>

      <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
        <h3 className="font-medium text-gray-900 mb-4">What we'll access:</h3>
        <ul className="space-y-3 text-gray-600">
          <li className="flex items-start">
            <div className="bg-rose-100 p-1.5 rounded-full mr-3 mt-0.5 shadow-sm">
              <Check className="h-3.5 w-3.5 text-rose-600" />
            </div>
            <span>Your public profile information</span>
          </li>
          <li className="flex items-start">
            <div className="bg-rose-100 p-1.5 rounded-full mr-3 mt-0.5 shadow-sm">
              <Check className="h-3.5 w-3.5 text-rose-600" />
            </div>
            <span>Your pinned repositories</span>
          </li>
          <li className="flex items-start">
            <div className="bg-rose-100 p-1.5 rounded-full mr-3 mt-0.5 shadow-sm">
              <Check className="h-3.5 w-3.5 text-rose-600" />
            </div>
            <span>Repository metadata (stars, forks, etc.)</span>
          </li>
        </ul>
      </div>

      <div className="flex items-start space-x-4 pt-6 bg-white p-4 rounded-lg border border-gray-100 shadow-sm mt-6 hover:border-rose-200 transition-all duration-300">
        <Checkbox
          id="terms"
          checked={agreed}
          onCheckedChange={handleAgree}
          className="data-[state=checked]:bg-rose-500 data-[state=checked]:border-rose-500 h-5 w-5 mt-0.5"
        />
        <div className="grid gap-1.5 leading-none">
          <Label
            htmlFor="terms"
            className="text-base font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            I agree to allow access to my GitHub repositories
          </Label>
          <p className="text-sm text-gray-500 mt-1">
            You can revoke this permission at any time in your account settings.
          </p>
        </div>
      </div>
    </div>
  );
}

function Check(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
