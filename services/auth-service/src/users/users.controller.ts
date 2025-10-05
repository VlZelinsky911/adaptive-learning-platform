import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  async list() {
    const users = await this.usersService.listAll();
    return users.map((u) => ({
      id: u.id,
      email: u.email,
      createdAt: u.createdAt,
    }));
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@Request() req: { user: { sub: string; email: string } }) {
    return { id: req.user.sub, email: req.user.email };
  }
}
