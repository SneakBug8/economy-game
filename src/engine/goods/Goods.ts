import { Good } from "./Good";
import { UpdatedEntity } from "engine/updatedentity";

import fs = require("fs");
import { Config } from "config";
const goods = JSON.parse(fs.readFileSync(Config.dataPath() + "/goods.json", "utf8"));

class GoodsClass extends UpdatedEntity {

    Goods: Good[] = new Array<Good>();
    Food: Good;

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

        if (res.Name === "Food") {
            this.Food = res;
        }

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