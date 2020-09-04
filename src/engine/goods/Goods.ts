import { Good } from "./Good";
import goods = require("../../../data/goods.json");
import { UpdatedEntity } from "engine/updatedentity";

class GoodsClass extends UpdatedEntity {

    Goods: Good[];

    public constructor() {
        super();

        this.addClass("GoodsClass");
    }

    public Start(): void
    {
        for (const good of goods) {
            this.Goods.push(this.ReadGood(good));
        }
    }
    public Update(): void
    {
    }

    public ReadGood(good: any): Good {
        const res = new Good();
        res.Id = good.Id;
        res.Name = good.Name;
        res.Price = good.BasePrice;

        return res;
    }

    public GetById(id: number): Good {
        for (const good of this.Goods) {
            if (good.Id === id) {
                return good;
            }
        }

        return null;
    }
}

export const Goods = new GoodsClass();