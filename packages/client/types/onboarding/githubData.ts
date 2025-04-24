export interface TopRepository {
  id?: string;
  name: string;
  url: string;
  description: string;
  stargazerCount: number;
  forkCount: number;
  userId?: string;
  primaryLanguage: string;
  repositoryTopics: string[] | string;
  languages: Record<string, number> | string;
  readme?: string;
}
