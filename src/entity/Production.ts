import { Good } from "./Good";
import { Market } from "./Market";
import { Connection } from "DataBase";

export class Production {
    public id: number;
    public amount: number;
    public minprice: number;
    public good_id: number;

    public async getGood(): Promise<Good> {
        return Good.GetById(this.good_id);
    }
    public setGood(good: Good) {
        this.good_id = good.id;
    }

    public market_id: number;

    public async getMarket() : Promise<Market> {
        return Market.GetById(this.market_id);
    }

    public setMarket(market: Market) {
        this.market_id = market.id;
    }

    public static async From(dbobject: any) {
        const res = new Production();
        res.id = dbobject.id;
        res.amount = dbobject.amount;
        res.minprice = dbobject.minprice;
        res.good_id = dbobject.good_id;
        res.market_id = dbobject.market_id;

        return res;
    }

    public static async GetById(id: number): Promise<Production> {
        const data = await ProductionRepository().select().where("id", id).first();

        if (data) {
            return this.From(data);
        }

        return null;
    }

    public static async GetWithGood(good: Good): Promise<Production[]> {
        const data = await ProductionRepository().select().where("good_id", good.id);

        const res = new Array<Production>();

        if (data) {
            for (const entry of data) {
                res.push(await this.From(entry));
            }

            return res;
        }

        return [];
    }

    public static async Exists(id: number): Promise<boolean> {
        const res = await ProductionRepository().count("id as c").where("id", id).first() as any;

        return res.c > 0;
    }

    public static async Insert(prod: Production): Promise<number> {
        const d = await ProductionRepository().insert({
            id: prod.id,
            market_id: prod.market_id,
            good_id: prod.good_id,
            amount: prod.amount,
            minprice: prod.minprice,
        });

        prod.id = d[0];

        return d[0];
    }

    public static async Delete(id: number): Promise<boolean> {
        await ProductionRepository().delete().where("id", id);

        return true;
    }

    public static async All(): Promise<Production[]> {
        const data = await ProductionRepository().select();
        const res = new Array<Production>();

        if (data) {
            for (const entry of data) {
                res.push(await this.From(entry));
            }

            return res;
        }

        return [];
    }
}

export const ProductionRepository = () => Connection("Productions");