import { Controller, Get, Param } from '@nestjs/common';

@Controller('new-leetcode')
export class NewLeetcodeController {
  @Get()
  getAll() {
    return { message: 'New LeetCode base path works!' };
  }

  @Get(':username')
  getByUsername(@Param('username') username: string) {
    return { message: `Username parameter received: ${username}` };
  }
}
