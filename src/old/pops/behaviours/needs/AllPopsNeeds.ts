import { GoodsInventory } from "old/goods/GoodsInventory";
import { Goods } from "old/goods/Goods";

export class AllPopsNeeds {
    public static Farmers: PopNeedsPack = {
        Basic: new GoodsInventory([
            {
                Good: Goods.Food,
                Amount: 1,
            },
        ]),
        Everyday:  new GoodsInventory([
            {
                Good: Goods.Food,
                Amount: 1,
            },
        ]),
        Luxury: new GoodsInventory([
            {
                Good: Goods.Food,
                Amount: 1,
            },
        ]),
    };
}

class PopNeedsPack {
    Basic: GoodsInventory;
    Everyday: GoodsInventory;
    Luxury: GoodsInventory;
}