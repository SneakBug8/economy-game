import { GoodsInventory } from "engine/goods/GoodsInventory";
import { Goods } from "engine/goods/Goods";

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