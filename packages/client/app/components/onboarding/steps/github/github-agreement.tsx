'use client';

import { useState } from 'react';
import { Github, Loader2 } from 'lucide-react';
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
  const [isLoading, setIsLoading] = useState(false);
  const [fetchComplete, setFetchComplete] = useState(false);

  const handleAgree = async (checked: boolean) => {
    setAgreed(checked);
    updateData({ agreed: checked });

    if (checked) {
      setIsLoading(true);
      try {
        const response = await fetch('/api/onboarding/github');
        const data = await response.json();
        setUserGithubData(data);
      } catch (error) {
        console.error('Error fetching GitHub data:', error);
      } finally {
        setIsLoading(false);
        setFetchComplete(true);
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

      <div className="flex items-start space-x-4 pt-4 bg-white p-5 rounded-lg border border-gray-100 shadow-sm hover:border-rose-200 transition-all duration-300">
        <Checkbox
          id="terms"
          checked={agreed}
          onCheckedChange={handleAgree}
          disabled={isLoading || fetchComplete}
          className={`${
            isLoading || fetchComplete
              ? 'bg-gray-200 border-gray-300 cursor-not-allowed data-[state=checked]:bg-rose-500 data-[state=checked]:border-rose-500'
              : 'data-[state=checked]:bg-rose-500 data-[state=checked]:border-rose-500'
          } h-5 w-5 mt-0.5 transition-colors duration-300`}
        />
        <div className="grid gap-1.5 leading-none">
          <Label
            htmlFor="terms"
            className={`text-base font-medium leading-none peer-disabled:cursor-not-allowed ${
              isLoading ? 'text-gray-400' : 'text-gray-900'
            }`}
          >
            I agree to allow access to my GitHub repositories
            {isLoading && (
              <span className="ml-2 inline-flex items-center text-gray-500">
                <Loader2 className="animate-spin h-4 w-4 mr-1" />
                Fetching repositories...
              </span>
            )}
            {fetchComplete && agreed && (
              <span className="ml-2 inline-flex items-center text-green-600">
                <Check className="h-4 w-4 mr-1" />
                Repositories fetched
              </span>
            )}
          </Label>
          <p className="text-sm text-gray-500 mt-1.5">
            You can revoke this permission at any time in your account settings.
          </p>
        </div>
      </div>

      {isLoading && <FetchingAnimation />}
    </div>
  );
}

function FetchingAnimation() {
  return (
    <div className="mt-6 overflow-hidden">
      <div className="bg-white border border-rose-100 rounded-lg shadow-sm">
        <div className="p-4 border-b border-rose-50">
          <div className="flex items-center">
            <Loader2 className="animate-spin h-4 w-4 text-rose-500 mr-2" />
            <span className="text-sm font-medium text-rose-700">
              Fetching your GitHub repositories...
            </span>
          </div>
        </div>

        <div className="p-5 space-y-4">
          <div className="flex space-x-1.5 items-center">
            {['#3178c6', '#f1e05a', '#e34c26', '#563d7c', '#2b7489'].map(
              (color, i) => (
                <div
                  key={i}
                  className="rounded-full"
                  style={{
                    backgroundColor: color,
                    height: '8px',
                    width: '8px',
                    animation: `pulse 1.5s infinite ${i * 0.15}s`,
                    opacity: 0.8,
                  }}
                />
              )
            )}
            <div className="text-xs text-gray-500 ml-2">
              Analyzing language distribution
            </div>
          </div>

          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center space-x-3">
                <div
                  className="h-8 w-8 rounded bg-gray-100 animate-pulse"
                  style={{ animationDelay: `${i * 0.1}s` }}
                />
                <div className="space-y-2 flex-1">
                  <div
                    className="h-3.5 bg-gray-100 rounded w-3/4 animate-pulse"
                    style={{ animationDelay: `${i * 0.1 + 0.1}s` }}
                  />
                  <div
                    className="h-2.5 bg-gray-100 rounded-sm w-1/2 animate-pulse"
                    style={{ animationDelay: `${i * 0.1 + 0.2}s` }}
                  />
                </div>
                <div
                  className="h-3 w-10 bg-gray-100 rounded animate-pulse"
                  style={{ animationDelay: `${i * 0.1 + 0.3}s` }}
                />
              </div>
            ))}
          </div>

          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mt-4">
            <div
              className="h-full bg-rose-400"
              style={{
                width: '60%',
                animation: 'progressBar 3s infinite linear',
              }}
            />
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes pulse {
          0%,
          100% {
            transform: scale(1);
            opacity: 0.8;
          }
          50% {
            transform: scale(1.1);
            opacity: 1;
          }
        }
        @keyframes progressBar {
          0% {
            width: 10%;
          }
          50% {
            width: 70%;
          }
          100% {
            width: 95%;
          }
        }
      `}</style>
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
