export interface TopRepository {
  name: string;
  url: string;
  description: string;
  stargazerCount: number;
  forkCount: number;
  primaryLanguage: PrimaryLanguage;
  repositoryTopics: RepositoryTopics;
}

export interface RepositoryTopics {
  nodes: Node[];
}

export interface Node {
  topic: PrimaryLanguage;
}

export interface PrimaryLanguage {
  name: string;
}
