import { Good } from "./Good";
import { Population } from "../pops/population";

export class GoodsMarket {
    Good: Good;

    Buyers: MarketOffer[];
    Sellets: MarketOffer[];

    public WantToBuy(population: Population, amount: number) {}
    public WantToSell(population: Population, amount: number) {}
}

class MarketOffer {
    Population: Population;
    Amount: number;
}
