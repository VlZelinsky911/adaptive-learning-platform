import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TopicsModule } from './topics/topics.module';
import { Topic } from './topics/topic.entity';
import { UserRegisteredListener } from './topics/listeners/user-registered.listener';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: +(process.env.DB_PORT || 5432),
      username: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      entities: [Topic],
      synchronize: true, // dev only
    }),
    TopicsModule,
  ],
  providers: [UserRegisteredListener],
})
export class AppModule {}
