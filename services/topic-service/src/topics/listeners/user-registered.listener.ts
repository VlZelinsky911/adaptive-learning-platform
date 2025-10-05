import { Injectable, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { TopicsService } from '../../topics/topics.service';

@Injectable()
export class UserRegisteredListener {
  private readonly logger = new Logger(UserRegisteredListener.name);

  constructor(private readonly topicsService: TopicsService) {}

  @EventPattern('USER_REGISTERED')
  async handleUserRegistered(
    @Payload() data: { email: string; userId: string },
  ) {
    this.logger.log(`Received USER_REGISTERED for user: ${data.email}`);

    await this.topicsService.create({
      title: 'Welcome to Adaptive Learning!',
      description: 'Your first learning topic has been created automatically.',
      userId: data.userId,
    });
  }
}
