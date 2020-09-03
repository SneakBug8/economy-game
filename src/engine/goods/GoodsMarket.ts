import { Good } from "./Good";
import { Population } from "../pops/population";
import { UpdatedEntity } from "engine/updatedentity";

export class GoodsMarket extends UpdatedEntity {

    Good: Good;

    Buyers: MarketOffer[];
    Sellets: MarketOffer[];

    public constructor() {
        super();

        this.addClass("GoodsMarket");
    }

    public Start(): void {
    }
    public Update(): void {
    }

    public WantToBuy(population: Population, amount: number) {
        if (!population.Cash.Has(this.Good.Price * amount)) {
            return;
        }

        this.Buyers.push({
            Population: population,
            Amount: amount,
        });
    }
    public WantToSell(population: Population, amount: number) {
        //TODO: Check if has enough goods
        //if (!population.Cash.Has(this.Good.Price * amount)) {
        //    return;
        //}

        this.Sellets.push({
            Population: population,
            Amount: amount,
        });
    }
}

class MarketOffer {
    Population: Population;
    Amount: number;
}
