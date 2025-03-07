import { PinnedRepo } from '@app/common/github';
import { UserLeetcode } from '@app/common/leetcode/leetcode.schema';

export interface UserStatResponse {
  leetCodeStat?: Omit<UserLeetcode, 'userId'>;
  userGithubRepos: Omit<PinnedRepo, 'userId'>[];
}
