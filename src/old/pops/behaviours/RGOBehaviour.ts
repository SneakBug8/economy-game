import { PopBehaviour } from "../popbehaviour";
import { GoodsMarket } from "old/goods/GoodsMarket";

export class RGOBehaviour extends PopBehaviour {
    public constructor() {
        super();

        this.Name = "RGOBehaviour";
        this.addClass("RGOBehaviour");
    }

    public Start(): void
    {
    }

    public Update(): void
    {
        const rgo = this.Population.Province.RGO;

        if (!this.Population) {
            console.log("NO Pop");
            return;
        }

        if (!this.Population.Province) {
            console.log("NO Province");
            return;
        }

        if (!rgo) {
            console.log("NO RGO");
            return;
        }

        let gain = Math.round(rgo.NaturalWealth * rgo.RGOEfficiency() * this.Population.Size * (Math.random() + 0.5));

        if (gain > rgo.MaxRGOGain()) {
            gain = rgo.MaxRGOGain();
        }

        this.Population.Inventory.Add(rgo.Good, gain);
        GoodsMarket.GetMarket(rgo.Good).WantToSell(this.Population, gain);

        console.log(this.Population.Name + " produced " + gain + " units of " + rgo.Good.Name);
    }
}