// import * as appmodulepath from "app-module-path";
import "app-module-path/register";

import "reflect-metadata";
import {conn} from "DB";
// appmodulepath.addPath(__dirname);

export const Load = async () => {
    console.log("Modules initialized in " + __dirname);
    await conn();
};