// import { NestFactory } from '@nestjs/core';
// import { AppModule } from './app.module';
// import session = require('express-session');

import {Load} from "./moduleloader";

async function bootstrap() {
  // const app = await NestFactory.create(AppModule);
  // app.use(session());
  // await app.listen(3000);

  console.log("Starting game server");

  await Load();

  require("console/main");

  // await new Runner().Start();

  // BuyOffer.GetById(1);
}

bootstrap();
