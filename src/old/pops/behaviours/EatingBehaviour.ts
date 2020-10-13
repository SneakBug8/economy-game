import { PopBehaviour } from "../popbehaviour";
import { GoodsInventory } from "old/goods/GoodsInventory";

export class EatingBehaviour extends PopBehaviour
{
    public Satisfaction: number = 0;
    public Inventory: GoodsInventory;

    public constructor(inventory: GoodsInventory) {
        super();

        this.Inventory = inventory;
        this.addClass("EatingBehaviour");
        this.Name = "EatingBehaviour";
    }

    public Start(): void
    {
    }

    public Update(): void {
        this.Satisfaction = 0;

        if (!this.Inventory) {
            return;
        }

        for (const item of this.Inventory.GetItems()) {
            const amountpophas = this.Population.Inventory.AmountOf(item.Good);

            if (amountpophas === 0) {
                continue;
            }

            this.Population.Inventory.Remove(item.Good, amountpophas);
            this.Satisfaction += amountpophas / item.Amount / this.Population.Inventory.TotalItems();
        }
    }
}
