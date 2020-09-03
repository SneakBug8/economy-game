import { World } from "./World";
import { UpdateAlgorithm } from "./UpdateAlgorithm";
import { sleep } from "../utility/sleep";
import { Countries } from "./countries/Countries";
import {Provinces} from "./provinces/Provinces";
import {Goods} from "./goods/Goods";

export class Runner {
    public async Start(): Promise<void> {
        const world = new World();
        const algorithm = new UpdateAlgorithm();

        Countries.Countries.length;
        Provinces.Provinces.length;

        console.log("Initializing objects");
        algorithm.Start();

        while (true) {
            algorithm.Update();
            await sleep(1000);
        }
    }
}
