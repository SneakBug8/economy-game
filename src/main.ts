import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import session = require('express-session');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(session());
  await app.listen(3000);
}
bootstrap();
