import { Good } from "./Good";

export class GoodsInventory {
    private Inventory: GoodItem[] = new Array<GoodItem>();

    public constructor(items?: GoodItem[]) {
        if (items) {
            this.Inventory = items;
        } else {
            this.Inventory = new Array<GoodItem>();
        }
    }


    public Has(good: Good, amount: number): boolean {
        /*for (const gooditem of this.Inventory) {
            if (gooditem.Good === good && gooditem.Amount >= amount) {
                return true;
            }
        }

        return false;*/

        return this.AmountOf(good) >= amount;
    }

    public AmountOf(good: Good): number {
        for (const gooditem of this.Inventory) {
            if (gooditem.Good === good) {
                return gooditem.Amount;
            }
        }

        return 0;
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

    /// Transfers goods to other inventory
    public Transfer(inventory: GoodsInventory, good: Good, amount: number) {
        if (!this.Has(good, amount)) {
            return;
        }

        this.Remove(good, amount);
        inventory.Add(good, amount);
        /*if (!inventory.Has(good, amount)) {
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
        }*/
    }

    public Remove(good: Good, amount: number) {
        if (!this.Has(good, amount)) {
            return;
        }

        for (const gooditem of this.Inventory) {
            if (gooditem.Good === good) {
                gooditem.Amount -= amount;
                return;
            }
        }
    }

    public Add(good: Good, amount: number) {
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

    public TotalItems(): number {
        let res = 0;

        for (const keyvalue of this.Inventory) {
            res += keyvalue.Amount;
        }

        return res;
    }

    public GetItems() : GoodItem[] {
        return this.Inventory;
    }
}

class GoodItem {
    Good: Good;
    Amount: number;
}
