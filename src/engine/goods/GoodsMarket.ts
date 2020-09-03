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

    public WantToBuy(population: Population, amount: number) {}
    public WantToSell(population: Population, amount: number) {}
}

class MarketOffer {
    Population: Population;
    Amount: number;
}
