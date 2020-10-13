import { Good } from "./Good";
import { Population } from "../pops/population";
import { UpdatedEntity } from "engine/updatedentity";

export class GoodsMarket extends UpdatedEntity {
    Good: Good;

    Buyers: MarketOffer[] = new Array<MarketOffer>();
    Sellets: MarketOffer[] = new Array<MarketOffer>();

    public static Markets: GoodsMarket[] = new Array<GoodsMarket>();

    public static GetMarket(good: Good): GoodsMarket {
        if (!good) {
            return;
        }

        for (const market of this.Markets) {
            if (market.Good === good) {
                return market;
            }
        }

        const newmarket = new GoodsMarket();
        newmarket.Good = good;

        return newmarket;
    }

    public constructor() {
        super();

        this.addClass("GoodsMarket");
        this.Name = "GoodsMarket";

        GoodsMarket.Markets.push(this);
    }

    public Start(): void {
    }
    public Update(): void {
        //TODO: Realize buying/selling mechanism
        console.log("TODO: Realize buying/selling mechanism");
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
        if (!population.Inventory.Has(this.Good, amount)) {
            return;
        }

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

class MarketsList {
    Good: Good;
    Market: GoodsMarket;
}
