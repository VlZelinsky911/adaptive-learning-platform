import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import {
  ClientProxy,
  ClientProxyFactory,
  Transport,
} from '@nestjs/microservices';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private rmqClient: ClientProxy;

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {
    const url = process.env.RABBITMQ_URL || 'amqp://rabbitmq:5672';
    const queue = process.env.RABBITMQ_QUEUE || 'auth_queue';

    this.rmqClient = ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: [url],
        queue,
        queueOptions: { durable: false },
      },
    });
  }

  async register(email: string, password: string) {
    const existing = await this.usersService.findByEmail(email);
    if (existing) {
      throw new ConflictException('User with this email already exists');
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await this.usersService.create({ email, passwordHash });

    try {
      this.rmqClient.emit('USER_REGISTERED', {
        userId: user.id,
        email: user.email,
      });
    } catch (err) {
      // не критично — логування
      this.logger.warn(
        'Failed to emit USER_REGISTERED: ' + (err as Error).message,
      );
    }

    return { id: user.id, email: user.email, createdAt: user.createdAt };
  }

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) return null;
    const matches = await bcrypt.compare(password, user.passwordHash);
    if (!matches) return null;
    return user;
  }

  async login(email: string, password: string) {
    const user = await this.validateUser(email, password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user.id, email: user.email };
    const access_token = this.jwtService.sign(payload);
    return { access_token, expiresIn: process.env.JWT_EXPIRES_IN || '3600s' };
  }
}
