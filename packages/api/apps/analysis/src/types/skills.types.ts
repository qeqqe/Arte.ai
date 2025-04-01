export interface SkillsData {
  [category: string]: string[];
}

export interface SimilarSkill {
  category: string;
  skill: string;
  similarity: number;
}
