import { Population } from "./population";
import { Farmers } from "./types/Farmers";
import { Aristocrats } from "./types/Aristocrats";
import { Bureucrats } from "./types/Bureucrats";
import { Miners } from "./types/Miners";
import { Workers } from "./types/Workers";

export class Populations {

    public static ReadPopulation(pop: any): Population {
        let res: Population;
        if (pop.type === "aristocrats") {
            res = new Aristocrats();
        } else if (pop.type === "bureucrats") {
            res = new Bureucrats();
        } else if (pop.type === "farmers") {
            res = new Farmers();
        } else if (pop.type === "miners") {
            res = new Miners();
        } else if (pop.type === "workers") {
            res = new Workers();
        } else {
            return null;
        }

        if (pop.Name) {
            res.Name = pop.Name;
        }

        if (pop.Size) {
            res.Size = pop.Size;
        }

        if (pop.Cash) {
            res.Cash.Amount = pop.Cash;
        }

        return res;
    }
}
