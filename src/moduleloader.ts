// import * as appmodulepath from "app-module-path";
import "app-module-path/register";

import "reflect-metadata";
import * as db from "DB";
//appmodulepath.addPath(__dirname);

console.log("Modules initialized in " + __dirname);

export default __dirname;