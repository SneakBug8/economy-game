import { Load } from "../moduleloader";
import { sleep } from "utility/sleep";
import { TurnsService } from "services/TurnsService";

Load();

exports.mochaHooks = {
    async afterEach()
    {
        await TurnsService.CheckBalance();
    }
};