'use client';

import { Code, FileText, Github, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

export function MyDataView() {
  return (
    <div className="grid w-full gap-4 sm:gap-6 max-w-none">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 w-full">
        <Card className="w-full">
          <CardHeader className="px-4 sm:px-6">
            <CardTitle>Connected Data Sources</CardTitle>
            <CardDescription>Your profile information sources</CardDescription>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <div className="space-y-2 sm:space-y-3">
              <div className="flex items-center gap-2 sm:gap-3 p-1.5 sm:p-2 rounded-lg border border-rose-100">
                <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
                  <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium">Resume</p>
                  <p className="text-xs text-muted-foreground">
                    Last updated 2 days ago
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className="bg-emerald-50 text-emerald-600 hover:bg-emerald-100 text-xs"
                >
                  Active
                </Badge>
              </div>

              <div className="flex items-center gap-2 sm:gap-3 p-1.5 sm:p-2 rounded-lg border border-rose-100">
                <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
                  <Github className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium">GitHub</p>
                  <p className="text-xs text-muted-foreground">
                    15 repositories analyzed
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className="bg-emerald-50 text-emerald-600 hover:bg-emerald-100 text-xs"
                >
                  Active
                </Badge>
              </div>

              <div className="flex items-center gap-2 sm:gap-3 p-1.5 sm:p-2 rounded-lg border border-rose-100 bg-rose-50/50">
                <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
                  <Code className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium">LeetCode</p>
                  <p className="text-xs text-muted-foreground">Not connected</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-100 px-2"
                >
                  Connect
                </Button>
              </div>
            </div>
          </CardContent>
          <CardFooter className="border-t pt-3 sm:pt-4 px-4 sm:px-6">
            <Button
              variant="outline"
              className="w-full text-rose-600 border-rose-200 hover:bg-rose-50 hover:text-rose-700 text-xs sm:text-sm"
            >
              <Plus className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
              Add Data Source
            </Button>
          </CardFooter>
        </Card>

        <Card className="w-full">
          <CardHeader className="px-4 sm:px-6">
            <CardTitle>My Skills</CardTitle>
            <CardDescription>
              Your current skill ratings based on your data sources
            </CardDescription>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <div className="space-y-3 sm:space-y-4">
              <div>
                <div className="text-xs sm:text-sm font-medium mb-1 sm:mb-2">
                  Languages
                </div>
                <div className="space-y-1.5 sm:space-y-2">
                  <div>
                    <div className="flex items-center justify-between mb-0.5 sm:mb-1">
                      <span className="text-xs sm:text-sm">JavaScript</span>
                      <span className="text-xs text-muted-foreground">85%</span>
                    </div>
                    <Progress value={85} className="h-1.5 sm:h-2 bg-rose-100" />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-0.5 sm:mb-1">
                      <span className="text-xs sm:text-sm">TypeScript</span>
                      <span className="text-xs text-muted-foreground">75%</span>
                    </div>
                    <Progress value={75} className="h-1.5 sm:h-2 bg-rose-100" />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-0.5 sm:mb-1">
                      <span className="text-xs sm:text-sm">Python</span>
                      <span className="text-xs text-muted-foreground">60%</span>
                    </div>
                    <Progress value={60} className="h-1.5 sm:h-2 bg-rose-100" />
                  </div>
                </div>
              </div>

              <div>
                <div className="text-xs sm:text-sm font-medium mb-1 sm:mb-2">
                  Frameworks
                </div>
                <div className="space-y-1.5 sm:space-y-2">
                  <div>
                    <div className="flex items-center justify-between mb-0.5 sm:mb-1">
                      <span className="text-xs sm:text-sm">React</span>
                      <span className="text-xs text-muted-foreground">90%</span>
                    </div>
                    <Progress value={90} className="h-1.5 sm:h-2 bg-rose-100" />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-0.5 sm:mb-1">
                      <span className="text-xs sm:text-sm">Node.js</span>
                      <span className="text-xs text-muted-foreground">70%</span>
                    </div>
                    <Progress value={70} className="h-1.5 sm:h-2 bg-rose-100" />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-0.5 sm:mb-1">
                      <span className="text-xs sm:text-sm">Next.js</span>
                      <span className="text-xs text-muted-foreground">80%</span>
                    </div>
                    <Progress value={80} className="h-1.5 sm:h-2 bg-rose-100" />
                  </div>
                </div>
              </div>

              <div>
                <div className="text-xs sm:text-sm font-medium mb-1 sm:mb-2">
                  Other Skills
                </div>
                <div className="space-y-1.5 sm:space-y-2">
                  <div>
                    <div className="flex items-center justify-between mb-0.5 sm:mb-1">
                      <span className="text-xs sm:text-sm">AWS</span>
                      <span className="text-xs text-muted-foreground">50%</span>
                    </div>
                    <Progress value={50} className="h-1.5 sm:h-2 bg-rose-100" />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-0.5 sm:mb-1">
                      <span className="text-xs sm:text-sm">Docker</span>
                      <span className="text-xs text-muted-foreground">65%</span>
                    </div>
                    <Progress value={65} className="h-1.5 sm:h-2 bg-rose-100" />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-0.5 sm:mb-1">
                      <span className="text-xs sm:text-sm">SQL</span>
                      <span className="text-xs text-muted-foreground">80%</span>
                    </div>
                    <Progress value={80} className="h-1.5 sm:h-2 bg-rose-100" />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
