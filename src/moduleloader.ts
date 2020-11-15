// import * as appmodulepath from "app-module-path";
import "app-module-path/register";
import { Logger } from "utility/Logger";

// appmodulepath.addPath(__dirname);

export const Load = async () => {
    Logger.verbose("Modules initialized in " + __dirname);
};