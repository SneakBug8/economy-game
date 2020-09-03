import { Good } from "./Good";
import goods = require("./goods.json");

class GoodsClass {
    Goods: Good[];

    public constructor() {
        this.Goods = goods as Good[];
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