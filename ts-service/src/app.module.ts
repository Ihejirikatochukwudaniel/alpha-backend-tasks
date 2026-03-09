import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { ConfigModule } from './config/config.module';
import { DatabaseModule } from './database/database.module';
import { CandidatesModule } from './candidates/candidates.module';

@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: () => ({
        redis: {
          host: process.env.REDIS_HOST || '127.0.0.1',
          port: Number(process.env.REDIS_PORT || 6379)
        }
      })
    }),
    TypeOrmModule.forFeature([]),
    CandidatesModule
  ]
})
export class AppModule {}
