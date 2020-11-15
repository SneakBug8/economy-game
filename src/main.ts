// import { NestFactory } from '@nestjs/core';
// import { AppModule } from './app.module';
// import session = require('express-session');


import {Load} from "./moduleloader";
import { RecipesService } from "services/RecipesService";
import { Runner } from "Runner";

async function bootstrap() {
  // const app = await NestFactory.create(AppModule);
  // app.use(session());
  // await app.listen(3000);

  console.log("Starting game server");
  console.time("Game server started");

  await Load();

  await Runner.Init();

  console.timeEnd("Game server started");

  require("api/console/main");

  // await new Runner().Start();
}

bootstrap();
