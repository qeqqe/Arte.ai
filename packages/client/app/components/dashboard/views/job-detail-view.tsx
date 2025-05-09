'use client';

import { useState } from 'react';
import {
  ArrowLeft,
  BookOpen,
  ChevronRight,
  ExternalLink,
  GraduationCap,
  LineChart,
  Target,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Comparison, JobInfo, ProcessedSkill } from '@/types/dashboard';
import { useDashboard } from '../dashboard-context';

interface JobDetailProps {
  jobId: string;
  onBack: () => void;
}

export function JobDetailView({ jobId, onBack }: JobDetailProps) {
  const [job] = useState({
    id: jobId,
    jobInfo: {
      title: 'Senior Frontend Developer',
      company: 'TechCorp Inc.',
      location: 'Remote',
      companyLogo: '/placeholder.svg',
      url: 'https://example.com/job',
      description:
        'We are looking for a Senior Frontend Developer with experience in React, TypeScript, and Next.js...',
    } as JobInfo,
    comparison: {
      // Legacy format support
      matchPercentage: 85,
      matchedSkills: [
        { name: 'React', category: 'frontend_frameworks_libraries', level: 4 },
        { name: 'TypeScript', category: 'languages', level: 3 },
        {
          name: 'Next.js',
          category: 'frontend_frameworks_libraries',
          level: 3,
        },
      ] as ProcessedSkill[],
      missingSkills: [
        { name: 'GraphQL', category: 'apis_communication', level: 2 },
      ] as ProcessedSkill[],

      // New format
      overallScore: {
        value: 85,
        category: 'good',
      },
      matchedSkillsDetailed: [
        {
          skill: 'React',
          candidateLevel: 4,
          requiredLevel: 4,
          matchPercentage: 100,
          details:
            'Strong proficiency in React with advanced state management techniques',
        },
        {
          skill: 'TypeScript',
          candidateLevel: 3,
          requiredLevel: 4,
          matchPercentage: 75,
          details:
            'Good TypeScript knowledge but could benefit from more advanced type system features',
        },
        {
          skill: 'Next.js',
          candidateLevel: 3,
          requiredLevel: 3,
          matchPercentage: 100,
          details: 'Solid understanding of Next.js framework capabilities',
        },
      ],
      gapAnalysis: [
        {
          skill: 'GraphQL',
          proficiencyGap: 2,
          estimatedTimeToClose: {
            value: 2,
            unit: 'weeks',
          },
          priority: 'medium',
          learningResources: [
            {
              type: 'course',
              title: 'GraphQL Fundamentals',
              url: 'https://example.com/graphql-course',
            },
            {
              type: 'documentation',
              title: 'Apollo GraphQL Docs',
              url: 'https://www.apollographql.com/docs/',
            },
          ],
        },
      ],
      recommendations: [
        {
          focus: 'GraphQL',
          action: 'Complete a GraphQL course and build a small project',
          timeframe: '2-3 weeks',
        },
        {
          focus: 'TypeScript',
          action: 'Practice advanced TypeScript patterns and generics',
          timeframe: '1-2 weeks',
        },
      ],
      insights:
        'You are well-qualified for this position with strong React skills. Focus on improving GraphQL knowledge to become an even stronger candidate.',
    } as Comparison,
  });

  const matchPercentage =
    job.comparison?.overallScore?.value ?? job.comparison?.matchPercentage ?? 0;

  const getMatchColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600';
    if (score >= 70) return 'text-amber-600';
    return 'text-rose-600';
  };

  const matchColor = getMatchColor(matchPercentage);
  const matchCategory = job.comparison?.overallScore?.category
    ? job.comparison.overallScore.category.charAt(0).toUpperCase() +
      job.comparison.overallScore.category.slice(1)
    : matchPercentage >= 80
      ? 'Excellent'
      : matchPercentage >= 70
        ? 'Good'
        : matchPercentage >= 60
          ? 'Adequate'
          : 'Insufficient';

  const { setActiveView } = useDashboard();

  return (
    <div className="grid w-full gap-4 sm:gap-6 max-w-none">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="text-rose-600"
          onClick={onBack}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Jobs
        </Button>
      </div>

      <Card className="w-full">
        <CardHeader className="px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex items-start gap-4">
              <Avatar className="h-14 w-14 rounded-md">
                <AvatarImage
                  src={job.jobInfo.companyLogo || '/placeholder.svg'}
                  alt={job.jobInfo.company}
                />
                <AvatarFallback className="rounded-md bg-rose-100 text-rose-700">
                  {job.jobInfo.company.substring(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-xl">{job.jobInfo.title}</CardTitle>
                <CardDescription className="text-sm mt-1">
                  {job.jobInfo.company} • {job.jobInfo.location}
                </CardDescription>
                {job.jobInfo.url && (
                  <a
                    href={job.jobInfo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-xs text-rose-600 mt-1 hover:underline"
                  >
                    View Original Job Posting
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                )}
              </div>
            </div>
            <div className="flex flex-col items-center justify-center bg-rose-50 p-3 rounded-md border border-rose-100">
              <div className="text-sm font-medium">Match Score</div>
              <div className={`text-2xl font-bold ${matchColor}`}>
                {matchPercentage}%
              </div>
              <div className={`text-xs ${matchColor}`}>{matchCategory}</div>
            </div>
          </div>
        </CardHeader>

        <Tabs defaultValue="overview" className="w-full">
          <div className="px-4 sm:px-6 border-b">
            <TabsList className="mb-0">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="skills-match">Skills Match</TabsTrigger>
              <TabsTrigger value="learning-path">Learning Path</TabsTrigger>
              <TabsTrigger value="description">Job Description</TabsTrigger>
            </TabsList>
          </div>

          <CardContent className="p-4 sm:p-6">
            <TabsContent value="overview" className="mt-0 pt-2">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-base">
                      Analysis Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm mb-4">
                      {job.comparison?.insights ||
                        'Based on your profile, you match many of the key requirements for this position.'}
                    </p>

                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium mb-2">
                          Key Strengths
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {(
                            job.comparison?.matchedSkillsDetailed ||
                            job.comparison?.matchedSkills ||
                            []
                          )
                            .slice(0, 5)
                            .map((skill, index) => (
                              <Badge
                                key={index}
                                className="bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                              >
                                {'skill' in skill ? skill.skill : skill.name}
                              </Badge>
                            ))}
                        </div>
                      </div>

                      {job.comparison?.gapAnalysis?.length ||
                      job.comparison?.missingSkills?.length ? (
                        <div>
                          <h4 className="text-sm font-medium mb-2">
                            Areas to Improve
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {(
                              job.comparison?.gapAnalysis ||
                              job.comparison?.missingSkills ||
                              []
                            )
                              .slice(0, 4)
                              .map((skill, index) => (
                                <Badge
                                  key={index}
                                  variant="outline"
                                  className="bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100"
                                >
                                  {'skill' in skill ? skill.skill : skill.name}
                                </Badge>
                              ))}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">
                      Recommended Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {job.comparison?.recommendations ? (
                      job.comparison.recommendations.map((rec, index) => (
                        <div
                          key={index}
                          className="flex gap-3 pb-2 last:pb-0 last:border-0 border-b border-b-slate-100"
                        >
                          <div className="mt-0.5">
                            <Target className="h-5 w-5 text-rose-500" />
                          </div>
                          <div>
                            <h5 className="text-sm font-medium">{rec.focus}</h5>
                            <p className="text-xs text-muted-foreground">
                              {rec.action}
                            </p>
                            {rec.timeframe && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {rec.timeframe}
                              </p>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-muted-foreground">
                        Focus on improving skills identified in the gap analysis
                        to increase your match score.
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="skills-match" className="mt-0 pt-2">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-3">Matched Skills</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {(job.comparison?.matchedSkillsDetailed || []).length >
                    0 ? (
                      job.comparison?.matchedSkillsDetailed?.map(
                        (skill, index) => (
                          <Card key={index} className="overflow-hidden">
                            <div
                              className={`h-1 ${skill.matchPercentage >= 90 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                            ></div>
                            <CardContent className="p-3">
                              <div className="flex justify-between items-center mb-2">
                                <h4 className="font-medium">{skill.skill}</h4>
                                <Badge
                                  className={
                                    skill.matchPercentage >= 90
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : 'bg-amber-100 text-amber-800'
                                  }
                                >
                                  {skill.matchPercentage}% match
                                </Badge>
                              </div>
                              <div className="text-xs text-muted-foreground">
                                <span>
                                  Your level: {skill.candidateLevel}/5
                                </span>
                                <span className="mx-1">•</span>
                                <span>Required: {skill.requiredLevel}/5</span>
                              </div>
                              {skill.details && (
                                <p className="text-xs mt-2">{skill.details}</p>
                              )}
                            </CardContent>
                          </Card>
                        )
                      )
                    ) : job.comparison?.matchedSkills?.length ? (
                      // Fallback to legacy format
                      job.comparison.matchedSkills.map((skill, index) => (
                        <Card key={index}>
                          <CardContent className="p-3">
                            <div className="flex justify-between items-center">
                              <h4 className="font-medium">{skill.name}</h4>
                              <Badge className="bg-emerald-100 text-emerald-800">
                                Matched
                              </Badge>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              <span>
                                Category: {skill.category.replace(/_/g, ' ')}
                              </span>
                              {skill.level && (
                                <>
                                  <span className="mx-1">•</span>
                                  <span>Level: {skill.level}/5</span>
                                </>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <div className="md:col-span-2 lg:col-span-3 text-center py-4">
                        <p className="text-sm text-muted-foreground">
                          No matched skills data available
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-3">Skill Gaps</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {(job.comparison?.gapAnalysis || []).length > 0 ? (
                      job.comparison?.gapAnalysis?.map((skill, index) => (
                        <Card key={index} className="overflow-hidden">
                          <div
                            className={`h-1 ${
                              skill.priority === 'high'
                                ? 'bg-rose-500'
                                : skill.priority === 'medium'
                                  ? 'bg-amber-500'
                                  : 'bg-emerald-500'
                            }`}
                          ></div>
                          <CardContent className="p-3">
                            <div className="flex justify-between items-center mb-2">
                              <h4 className="font-medium">{skill.skill}</h4>
                              <Badge
                                className={
                                  skill.priority === 'high'
                                    ? 'bg-rose-100 text-rose-800'
                                    : skill.priority === 'medium'
                                      ? 'bg-amber-100 text-amber-800'
                                      : 'bg-emerald-100 text-emerald-800'
                                }
                              >
                                {skill.priority} priority
                              </Badge>
                            </div>
                            <div className="text-xs space-y-1">
                              <p>Gap level: {skill.proficiencyGap} out of 5</p>
                              <p>
                                Est. time to close:{' '}
                                {skill.estimatedTimeToClose.value}{' '}
                                {skill.estimatedTimeToClose.unit}
                              </p>

                              {skill.learningResources &&
                                skill.learningResources.length > 0 && (
                                  <div className="mt-2">
                                    <p className="text-xs font-medium mb-1">
                                      Learning Resources:
                                    </p>
                                    <ul className="space-y-1">
                                      {skill.learningResources.map(
                                        (resource, idx) => (
                                          <li
                                            key={idx}
                                            className="flex items-center gap-1"
                                          >
                                            {resource.type === 'course' ? (
                                              <GraduationCap className="h-3 w-3 text-rose-500" />
                                            ) : resource.type === 'book' ? (
                                              <BookOpen className="h-3 w-3 text-rose-500" />
                                            ) : (
                                              <ExternalLink className="h-3 w-3 text-rose-500" />
                                            )}
                                            {resource.url ? (
                                              <a
                                                href={resource.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-xs text-rose-600 hover:underline truncate"
                                              >
                                                {resource.title}
                                              </a>
                                            ) : (
                                              <span className="text-xs truncate">
                                                {resource.title}
                                              </span>
                                            )}
                                          </li>
                                        )
                                      )}
                                    </ul>
                                  </div>
                                )}
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    ) : job.comparison?.missingSkills?.length ? (
                      // Fallback to legacy format
                      job.comparison.missingSkills.map((skill, index) => (
                        <Card key={index}>
                          <CardContent className="p-3">
                            <div className="flex justify-between items-center">
                              <h4 className="font-medium">{skill.name}</h4>
                              <Badge className="bg-rose-100 text-rose-800">
                                Missing
                              </Badge>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              <span>
                                Category: {skill.category.replace(/_/g, ' ')}
                              </span>
                              {skill.level && (
                                <>
                                  <span className="mx-1">•</span>
                                  <span>Required Level: {skill.level}/5</span>
                                </>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <div className="md:col-span-2 lg:col-span-3 text-center py-4">
                        <p className="text-sm text-muted-foreground">
                          No skill gap data available
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="learning-path" className="mt-0 pt-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    Personalized Learning Path
                  </CardTitle>
                  <CardDescription>
                    Follow these recommendations to improve your match score
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {job.comparison?.recommendations ? (
                    <div className="space-y-6">
                      {job.comparison.recommendations.map((rec, index) => (
                        <div key={index} className="space-y-2">
                          <h3 className="text-base font-medium flex items-center">
                            <Target className="h-5 w-5 text-rose-500 mr-2" />
                            Focus on: {rec.focus}
                            {rec.timeframe && (
                              <Badge className="ml-2 bg-rose-50 text-rose-700">
                                {rec.timeframe}
                              </Badge>
                            )}
                          </h3>
                          <p className="text-sm ml-7">{rec.action}</p>

                          {job.comparison?.gapAnalysis?.find(
                            (g) => g.skill === rec.focus
                          )?.learningResources && (
                            <div className="ml-7 mt-2">
                              <h4 className="text-sm font-medium mb-1">
                                Suggested Resources:
                              </h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {job.comparison.gapAnalysis
                                  .find((g) => g.skill === rec.focus)
                                  ?.learningResources?.map((resource, idx) => (
                                    <a
                                      key={idx}
                                      href={resource.url || '#'}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex items-center gap-2 p-2 rounded border border-rose-100 hover:bg-rose-50 transition-colors"
                                    >
                                      {resource.type === 'course' ? (
                                        <GraduationCap className="h-4 w-4 text-rose-500 flex-shrink-0" />
                                      ) : resource.type === 'book' ? (
                                        <BookOpen className="h-4 w-4 text-rose-500 flex-shrink-0" />
                                      ) : resource.type === 'documentation' ? (
                                        <FileText className="h-4 w-4 text-rose-500 flex-shrink-0" />
                                      ) : (
                                        <ExternalLink className="h-4 w-4 text-rose-500 flex-shrink-0" />
                                      )}
                                      <span className="text-sm flex-1 truncate">
                                        {resource.title}
                                      </span>
                                      <ChevronRight className="h-4 w-4 text-rose-400" />
                                    </a>
                                  ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}

                      <div className="pt-2 border-t">
                        <Button
                          variant="outline"
                          className="text-rose-600 border-rose-200 hover:bg-rose-50 hover:text-rose-700"
                          onClick={() => setActiveView('profile')}
                        >
                          <LineChart className="h-4 w-4 mr-2" />
                          View Full Learning Path
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="py-8 text-center">
                      <p className="text-sm text-muted-foreground mb-4">
                        No personalized learning path available for this job
                        yet.
                      </p>
                      <Button
                        variant="outline"
                        className="text-rose-600 border-rose-200 hover:bg-rose-50 hover:text-rose-700"
                      >
                        Generate Learning Path
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="description" className="mt-0 pt-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Job Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none">
                    {job.jobInfo.description ? (
                      <p>{job.jobInfo.description}</p>
                    ) : (
                      <p className="text-muted-foreground">
                        No detailed job description available.
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </CardContent>
        </Tabs>

        <CardFooter className="border-t pt-4 px-4 sm:px-6 flex flex-wrap justify-between gap-2">
          <Button
            variant="outline"
            className="text-rose-600 border-rose-200 hover:bg-rose-50 hover:text-rose-700 text-xs sm:text-sm"
          >
            Export Analysis
          </Button>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="text-rose-600 border-rose-200 hover:bg-rose-50 hover:text-rose-700 text-xs sm:text-sm"
            >
              Compare with Another Job
            </Button>
            <Button className="bg-rose-600 hover:bg-rose-700 text-white text-xs sm:text-sm">
              Apply to Job
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

function FileText(props: React.SVGProps<SVGSVGElement>) {
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
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" x2="8" y1="13" y2="13" />
      <line x1="16" x2="8" y1="17" y2="17" />
      <line x1="10" x2="8" y1="9" y2="9" />
    </svg>
  );
}
