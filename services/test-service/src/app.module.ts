import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Test } from './tests/test.entity';
import { TestsModule } from './tests/tests.module';
import { TopicCreatedListener } from './tests/listeners/topic-created.listener';

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
      entities: [Test],
      synchronize: true,
    }),
    TestsModule,
  ],
  providers: [TopicCreatedListener],
})
export class AppModule {}
