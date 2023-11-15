import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import * as redisStore from 'cache-manager-ioredis';

import { User } from './entity/user.entity';
import { Budget } from './entity/budget.entity';
import { Expense } from './entity/expense.entity';
import { MonthlyExpense } from './entity/monthlyExpense.entity';

import { AuthModule } from './feature/auth/auth.module';
import { BudgetModule } from './feature/budget/budget.module';
import { DailyModule } from './feature/daily/daily.module';
import { ExpenseModule } from './feature/expense/expense.module';
import { StatisticsModule } from './feature/statistics/statistics.module';
import { UtilModule } from './util/util.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.${process.env.NODE_ENV}.env`,
    }),
    CacheModule.register({
      isGlobal: true,
      store: redisStore,
      host: 'localhost',
      port: 6379,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          type: 'mysql',
          host: 'localhost',
          port: parseInt(configService.get<string>('DB_PORT')),
          username: configService.get<string>('DB_USERNAME'),
          password: configService.get<string>('DB_PASSWORD'),
          database: configService.get<string>('DB_DATABASE'),
          entities: [User, Budget, Expense, MonthlyExpense],
          synchronize: true, // 사용시에만 true
          logging: configService.get<string>('NODE_ENV') === 'local',
          namingStrategy: new SnakeNamingStrategy(), // 컬럼명 snake case로 변환
        };
      },
    }),
    AuthModule,
    BudgetModule,
    DailyModule,
    ExpenseModule,
    StatisticsModule,
    UtilModule,
  ],
  providers: [],
})
export class AppModule {}
