'use client';

import type React from 'react';

import { useState } from 'react';
import { AtSign, CircleCheck, Info } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface UsernameStepProps {
  data: any;
  updateData: (data: any) => void;
}

export default function LeetcodeStep({ data, updateData }: UsernameStepProps) {
  const [username, setUsername] = useState(data?.username || '');

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
    updateData({ username: e.target.value });
  };

  return (
    <div className="space-y-8 flex-1">
      <div className="text-center mb-8 animate-fade-in">
        <div className="bg-gradient-to-br from-rose-100 to-rose-200 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5 shadow-md">
          <AtSign className="h-10 w-10 text-rose-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Your GitHub Username
        </h2>
        <p className="text-gray-600 max-w-md mx-auto">
          We'll use this to fetch your GitHub profile and repositories.
        </p>
      </div>

      <div className="space-y-6">
        <div className="space-y-3 bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
          <Label htmlFor="github-username" className="text-gray-700 text-base">
            GitHub Username
          </Label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <AtSign className="h-5 w-5 text-rose-400" />
            </div>
            <Input
              id="github-username"
              type="text"
              placeholder="octocat"
              value={username}
              onChange={handleUsernameChange}
              className="pl-10 border-gray-200 focus:border-rose-300 focus:ring focus:ring-rose-200 focus:ring-opacity-50 h-12 text-lg rounded-lg shadow-sm"
            />
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Enter your GitHub username without the @ symbol
          </p>
        </div>

        <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-xl border border-gray-100 shadow-sm mt-6">
          <h3 className="font-medium text-gray-900 mb-3 flex items-center">
            <div className="bg-rose-100 p-1 rounded-full mr-2">
              <Info className="h-4 w-4 text-rose-600" />
            </div>
            Why we need this:
          </h3>
          <p className="text-sm text-gray-600 mb-3">
            Your GitHub username helps us personalize your experience by:
          </p>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-center">
              <div className="bg-rose-50 p-1 rounded-full mr-2">
                <CircleCheck className="h-3.5 w-3.5 text-rose-500" />
              </div>
              Displaying your repositories and contributions
            </li>
            <li className="flex items-center">
              <div className="bg-rose-50 p-1 rounded-full mr-2">
                <CircleCheck className="h-3.5 w-3.5 text-rose-500" />
              </div>
              Suggesting projects based on your interests
            </li>
            <li className="flex items-center">
              <div className="bg-rose-50 p-1 rounded-full mr-2">
                <CircleCheck className="h-3.5 w-3.5 text-rose-500" />
              </div>
              Connecting you with developers with similar skills
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
