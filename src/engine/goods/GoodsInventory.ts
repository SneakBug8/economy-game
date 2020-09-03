import { Good } from "./Good";

export class GoodsInventory {
    Inventory: GoodItem[];

    public Has(good: Good, amount: number): boolean {
        for (const gooditem of this.Inventory) {
            if (gooditem.Good === good && gooditem.Amount >= amount) {
                return true;
            }
        }

        return false;
    }

    public Create(good: Good, amount: number) {
        for (const gooditem of this.Inventory) {
            if (gooditem.Good === good) {
                gooditem.Amount += amount;
                return;
            }
        }

        this.Inventory.push({
            Good: good,
            Amount: amount,
        });
    }

    public Take(inventory: GoodsInventory, good: Good, amount:number) {
        if (!inventory.Has(good, amount)) {
            return;
        }

        for (const gooditem of inventory.Inventory) {
            if (gooditem.Good === good) {
                for (const j of this.Inventory) {
                    if (j.Good === good) {
                        j.Amount += amount;
                        gooditem.Amount -= amount;
                        return;
                    }
                }

                this.Inventory.push({
                    Good: good,
                    Amount: amount,
                });
                gooditem.Amount -= amount;
                return;
            }
        }
    }
}

class GoodItem {
    Good: Good;
    Amount: number;
}
