'use client';
import React, { useState } from 'react';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import {
  Building2,
  MapPin,
  Clock,
  TrendingUp,
  CheckCircle2,
} from 'lucide-react';

interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  logo?: string;
  comparison?: any;
  skillTags?: string[];
  postedTimeAgo?: string;
  jobInfo?: string;
  processedSkills?: any;
  organization?: {
    name: string;
    location: string;
    logo_url: string;
  };
}

interface JobComparisonDialogProps {
  children: React.ReactNode;
  jobData: Job;
}

const JobComparisonDialog: React.FC<JobComparisonDialogProps> = ({
  children,
  jobData,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  // Calculate match percentage
  const getMatchPercentage = () => {
    if (jobData.comparison?.matchPercentage) {
      return jobData.comparison.matchPercentage;
    }
    if (jobData.comparison?.overallScore?.value) {
      return jobData.comparison.overallScore.value;
    }
    return 0;
  };

  const matchPercentage = getMatchPercentage();

  // Get match color and category
  const getMatchInfo = () => {
    if (matchPercentage >= 80)
      return {
        color: 'text-emerald-600',
        bg: 'bg-emerald-500',
        category: 'Excellent Match',
      };
    if (matchPercentage >= 60)
      return {
        color: 'text-blue-600',
        bg: 'bg-blue-500',
        category: 'Good Match',
      };
    if (matchPercentage >= 40)
      return {
        color: 'text-orange-600',
        bg: 'bg-orange-500',
        category: 'Fair Match',
      };
    return {
      color: 'text-red-600',
      bg: 'bg-red-500',
      category: 'Poor Match',
    };
  };

  const matchInfo = getMatchInfo();

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-3xl max-h-[85vh] overflow-y-auto bg-white">
        {/* Header */}
        <DialogHeader className="pb-6 border-b">
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <DialogTitle className="text-xl font-semibold text-gray-900">
                  {jobData.title}
                </DialogTitle>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Building2 className="h-4 w-4" />
                    {jobData.company}
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {jobData.location}
                  </div>
                  {jobData.postedTimeAgo && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {jobData.postedTimeAgo}
                    </div>
                  )}
                </div>
              </div>
              <Badge className={`${matchInfo.color} bg-gray-50 border-current`}>
                {matchInfo.category}
              </Badge>
            </div>

            {/* Match Score */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-700">
                  Overall Match
                </span>
                <span className={`text-2xl font-bold ${matchInfo.color}`}>
                  {Math.round(matchPercentage)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 ${matchInfo.bg} rounded-full transition-all duration-500`}
                  style={{ width: `${matchPercentage}%` }}
                />
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="py-6 space-y-6">
          {/* Skills Analysis */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Skills Analysis
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Matched Skills */}
              {jobData.comparison?.matchedSkillsDetailed &&
                jobData.comparison.matchedSkillsDetailed.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      <span className="font-medium text-gray-900">
                        Your Strengths
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        {jobData.comparison.matchedSkillsDetailed.length}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      {jobData.comparison.matchedSkillsDetailed
                        .slice(0, 6)
                        .map((skill: any, index: number) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-2 bg-emerald-50 rounded-md"
                          >
                            <span className="text-sm font-medium text-gray-900">
                              {skill.skill}
                            </span>
                            <span className="text-xs text-emerald-700 font-medium">
                              {Math.round(skill.matchPercentage || 0)}%
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

              {/* Skills to Improve */}
              {jobData.comparison?.gapAnalysis &&
                jobData.comparison.gapAnalysis.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-orange-600" />
                      <span className="font-medium text-gray-900">
                        Areas for Growth
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        {jobData.comparison.gapAnalysis.length}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      {jobData.comparison.gapAnalysis
                        .slice(0, 6)
                        .map((gap: any, index: number) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-2 bg-orange-50 rounded-md"
                          >
                            <span className="text-sm font-medium text-gray-900">
                              {gap.skill}
                            </span>
                            <Badge
                              variant={
                                gap.priority === 'high'
                                  ? 'destructive'
                                  : 'secondary'
                              }
                            >
                              {gap.priority}
                            </Badge>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
            </div>
          </div>

          {/* Key Recommendations */}
          {jobData.comparison?.recommendations &&
            jobData.comparison.recommendations.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Recommendations
                </h3>
                <div className="space-y-3">
                  {jobData.comparison.recommendations
                    .slice(0, 3)
                    .map((rec: any, index: number) => (
                      <div
                        key={index}
                        className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500"
                      >
                        <div className="font-medium text-gray-900 mb-1">
                          {rec.focus}
                        </div>
                        <div className="text-sm text-gray-600">
                          {rec.action}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

          {/* AI Insights */}
          {jobData.comparison?.insights && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">
                AI Analysis
              </h3>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-700 leading-relaxed">
                  {jobData.comparison.insights}
                </p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="pt-6 border-t">
          <DialogClose asChild>
            <Button variant="outline" className="w-full">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default JobComparisonDialog;
