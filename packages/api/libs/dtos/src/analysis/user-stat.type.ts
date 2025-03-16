import { PinnedRepo } from '@app/common/github';
import { UserLeetcode } from '@app/common/leetcode/leetcode.schema';

export interface UserStatResponse {
  leetCodeStat?: Omit<
    UserLeetcode,
    'userId' | 'id' | 'createdAt' | 'updatedAt'
  >;
  userGithubRepos: Omit<
    PinnedRepo,
    'userId' | 'createdAt' | 'updatedAt' | 'id'
  >[];
  resume?: string;
}
