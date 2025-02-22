import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq } from 'drizzle-orm';
import { DRIZZLE } from '@app/common/drizzle/drizzle.module';
import { users, User, NewUser } from '@app/common/user/user.schema';
import {
  userGithubSchema,
  UserGithub,
  NewUserGithub,
} from '@app/common/github/github.schema';
import { GithubUserDto } from '@app/dtos/github';

type UserWithGithub = {
  user: User;
  github: UserGithub;
};

@Injectable()
export class UserService {
  constructor(
    @Inject(DRIZZLE)
    private readonly db: NodePgDatabase,
  ) {}

  async findByGithubId(githubId: string): Promise<UserWithGithub | null> {
    const result = await this.db
      .select({
        user: users,
        github: userGithubSchema,
      })
      .from(userGithubSchema)
      .leftJoin(users, eq(users.id, userGithubSchema.userId))
      .where(eq(userGithubSchema.githubId, githubId));

    return result[0] || null;
  }

  async createUser(githubUser: GithubUserDto): Promise<UserWithGithub> {
    const newUser = await this.db.transaction(async (tx) => {
      const [user] = await tx
        .insert(users)
        .values({
          avatarUrl: githubUser.avatarUrl,
        } satisfies Partial<NewUser>)
        .returning();

      const [githubData] = await tx
        .insert(userGithubSchema)
        .values({
          userId: user.id,
          githubId: githubUser.id,
          accessToken: githubUser.accessToken,
          username: githubUser.username,
          email: githubUser.email,
        } satisfies Partial<NewUserGithub>)
        .returning();

      return { user, github: githubData };
    });

    return newUser;
  }

  async updateUserRefreshToken(
    userId: string,
    refreshToken: string | null,
  ): Promise<void> {
    const result = await this.db
      .update(users)
      .set({
        refreshToken,
        updatedAt: new Date(),
        lastLogin: new Date(),
      } satisfies Partial<NewUser>)
      .where(eq(users.id, userId))
      .returning();

    if (!result.length) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
  }
}
