import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard, UserPayload } from '@app/common';
import { UserService } from '../../services/user/user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getUserProfile(@Req() request: Request): Promise<any> {
    const user = request['user'] as UserPayload;
    return await this.userService.getUserProfile(user.id);
  }
}
