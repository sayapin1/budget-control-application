import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { logger: new Logger() });

  if (process.env.NODE_ENV === 'local') {
    app.useLogger(new Logger('verbose'));
  }
  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe());

  const configService = app.get<ConfigService>(ConfigService);
  const port = configService.get<string>('SERVER_PORT');

  await app.listen(port);
}
bootstrap();
