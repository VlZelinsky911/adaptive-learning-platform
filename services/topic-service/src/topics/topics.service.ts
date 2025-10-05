import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Topic } from './topic.entity';
import { CreateTopicDto } from './dto/create-topic.dto';
import { UpdateTopicDto } from './dto/update-topic.dto';
import {
  ClientProxy,
  ClientProxyFactory,
  Transport,
} from '@nestjs/microservices';

@Injectable()
export class TopicsService {
  private rmqClient: ClientProxy;

  constructor(
    @InjectRepository(Topic) private readonly topicRepo: Repository<Topic>,
  ) {
    this.rmqClient = ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: [process.env.RABBITMQ_URL || 'amqp://rabbitmq:5672'],
        queue: process.env.RABBITMQ_QUEUE || 'topic_queue',
      },
    });
  }

  async create(dto: CreateTopicDto) {
    const topic = this.topicRepo.create(dto);
    const saved = await this.topicRepo.save(topic);

    this.rmqClient.emit('TOPIC_CREATED', {
      topicId: saved.id,
      userId: saved.userId,
    });

    return saved;
  }

  async findAll() {
    return this.topicRepo.find();
  }

  async findByUser(userId: string) {
    return this.topicRepo.find({ where: { userId } });
  }

  async update(id: string, dto: UpdateTopicDto) {
    await this.topicRepo.update(id, dto);
    return this.topicRepo.findOne({ where: { id } });
  }

  async remove(id: string) {
    return this.topicRepo.delete(id);
  }
}
