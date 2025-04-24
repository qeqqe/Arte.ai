'use client';

import { useState } from 'react';
import {
  AtSign,
  CircleCheck,
  Info,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

interface UsernameStepProps {
  data: any;
  updateData: (data: any) => void;
}

export default function LeetcodeStep({ data, updateData }: UsernameStepProps) {
  const [username, setUsername] = useState(data?.leetcodeUsername || '');
  const [isValidating, setIsValidating] = useState(false);
  const [validationStatus, setValidationStatus] = useState<
    'idle' | 'success' | 'error'
  >('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [leetcodeData, setLeetcodeData] = useState<any>(
    data?.leetcodeData || null
  );

  const validateUsername = async () => {
    if (!username.trim()) return;

    setIsValidating(true);
    setValidationStatus('idle');
    setErrorMessage('');

    try {
      const response = await fetch('/api/onboarding/leetcode', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to validate username');
      }

      const data = await response.json();
      setLeetcodeData(data);
      setValidationStatus('success');
      updateData({
        leetcodeUsername: username,
        leetcodeData: data,
        leetcodeValidated: true,
      });
    } catch (error: any) {
      setValidationStatus('error');
      setErrorMessage(error.message || 'Could not find this username');
      updateData({
        leetcodeUsername: username,
        leetcodeValidated: false,
      });
    } finally {
      setIsValidating(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    validateUsername();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUsername(value);
    updateData({ leetcodeUsername: value });

    if (validationStatus !== 'idle') {
      setValidationStatus('idle');
      setErrorMessage('');
    }
  };

  return (
    <div className="space-y-8 flex-1">
      <div className="text-center mb-8 animate-fade-in">
        <div className="bg-gradient-to-br from-rose-100 to-rose-200 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5 shadow-md">
          <AtSign className="h-10 w-10 text-rose-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Your LeetCode Username
        </h2>
        <p className="text-gray-600 max-w-md mx-auto">
          We'll use this to fetch your Leetcode profile and progress.
        </p>
      </div>

      <div className="space-y-6">
        <form
          onSubmit={handleSubmit}
          className="space-y-3 bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300"
        >
          <Label
            htmlFor="leetcode-username"
            className="text-gray-700 text-base"
          >
            Leetcode Username
          </Label>
          <div className="flex gap-3">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <AtSign className="h-5 w-5 text-rose-400" />
              </div>
              <Input
                id="leetcode-username"
                type="text"
                placeholder="qeqqer"
                value={username}
                onChange={handleInputChange}
                className="pl-10 border-gray-200 focus:border-rose-300 focus:ring focus:ring-rose-200 focus:ring-opacity-50 h-12 text-lg rounded-lg shadow-sm"
                disabled={isValidating}
              />
            </div>
            <Button
              type="submit"
              disabled={isValidating || !username.trim()}
              className="bg-rose-500 hover:bg-rose-600 text-white shadow-sm"
            >
              {isValidating ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                'Validate'
              )}
            </Button>
          </div>

          {validationStatus === 'success' && (
            <div className="flex items-center text-green-600 text-sm mt-2">
              <CheckCircle2 className="h-4 w-4 mr-1" />
              Username validated successfully
            </div>
          )}

          {validationStatus === 'error' && (
            <div className="flex items-center text-red-500 text-sm mt-2">
              <AlertCircle className="h-4 w-4 mr-1" />
              {errorMessage}
            </div>
          )}
        </form>

        {validationStatus === 'success' && leetcodeData && (
          <div className="bg-gradient-to-br from-green-50 to-white p-5 rounded-xl border border-green-100 shadow-sm mt-6">
            <h3 className="font-medium text-gray-900 mb-3 flex items-center">
              <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
              Leetcode Profile Found
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-white p-3 rounded-lg border border-gray-100">
                <div className="text-gray-500">Total Solved</div>
                <div className="text-xl font-bold text-gray-800">
                  {leetcodeData.totalSolved || 0}
                </div>
              </div>
              <div className="bg-white p-3 rounded-lg border border-gray-100">
                <div className="text-gray-500">Ranking</div>
                <div className="text-xl font-bold text-gray-800">
                  #{leetcodeData.ranking || 'N/A'}
                </div>
              </div>
              <div className="col-span-2 bg-white p-3 rounded-lg border border-gray-100">
                <div className="text-gray-500 mb-1">Solved by Difficulty</div>
                <div className="flex space-x-4">
                  <div>
                    <span className="text-green-500 font-medium">Easy: </span>
                    <span className="font-bold">
                      {leetcodeData.easySolved || 0}
                    </span>
                  </div>
                  <div>
                    <span className="text-yellow-500 font-medium">
                      Medium:{' '}
                    </span>
                    <span className="font-bold">
                      {leetcodeData.mediumSolved || 0}
                    </span>
                  </div>
                  <div>
                    <span className="text-red-500 font-medium">Hard: </span>
                    <span className="font-bold">
                      {leetcodeData.hardSolved || 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-xl border border-gray-100 shadow-sm mt-6">
          <h3 className="font-medium text-gray-900 mb-3 flex items-center">
            <div className="bg-rose-100 p-1 rounded-full mr-2">
              <Info className="h-4 w-4 text-rose-600" />
            </div>
            Why we need this:
          </h3>
          <p className="text-sm text-gray-600 mb-3">
            Your Leetcode username helps us personalize your experience by:
          </p>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-center">
              <div className="bg-rose-50 p-1 rounded-full mr-2">
                <CircleCheck className="h-3.5 w-3.5 text-rose-500" />
              </div>
              Seeing your Leetcode progress and stats
            </li>
            <li className="flex items-center">
              <div className="bg-rose-50 p-1 rounded-full mr-2">
                <CircleCheck className="h-3.5 w-3.5 text-rose-500" />
              </div>
              Analyzing your coding skills and strengths
            </li>
            <li className="flex items-center">
              <div className="bg-rose-50 p-1 rounded-full mr-2">
                <CircleCheck className="h-3.5 w-3.5 text-rose-500" />
              </div>
              Providing personalized resources
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
