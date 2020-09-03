//import { NestFactory } from '@nestjs/core';
//import { AppModule } from './app.module';
//import session = require('express-session');
import { Runner } from "./engine/Runner";

async function bootstrap() {
  //const app = await NestFactory.create(AppModule);
  //app.use(session());
  //await app.listen(3000);

  console.log("Starting game server");

  await new Runner().Start();
}

import * as appmodulepath from "app-module-path";
appmodulepath.addPath(__dirname);

console.log("Modules initialized in " + __dirname);

bootstrap();
