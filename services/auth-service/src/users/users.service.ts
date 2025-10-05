import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private readonly usersRepo: Repository<User>) {}

  async findByEmail(email: string): Promise<User | undefined> {
    const user = await this.usersRepo.findOne({ where: { email } });
    return user ?? undefined;
  }

  async findById(id: string): Promise<User | undefined> {
    const user = await this.usersRepo.findOne({ where: { id } });
    return user ?? undefined;
  }

  async create(data: { email: string; passwordHash: string }): Promise<User> {
    const user = this.usersRepo.create(data as Partial<User>);
    return this.usersRepo.save(user);
  }

  async listAll(): Promise<User[]> {
    return this.usersRepo.find();
  }
}
