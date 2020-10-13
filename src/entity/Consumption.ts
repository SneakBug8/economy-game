import { Market } from "./Market";
import { Good } from "./Good";
import { Connection } from "DataBase";

export class Consumption {
    public id: number;
    public market_id: number;
    public Market: Market;
    public good_id: number;
    public Good: Good;
    public amount: number;
    public maxprice: number;

    public static async From(dbobject: any) : Promise<Consumption> {
        const res = new Consumption();
        res.id = dbobject.id;
        res.market_id = dbobject.market_id;
        res.good_id = dbobject.good_id;
        res.amount = dbobject.amount;
        res.maxprice = dbobject.maxprice;

        if (res.market_id) {
            res.Market = await Market.GetById(res.market_id);
        }
        if (res.good_id) {
            res.Good = await Good.GetById(res.good_id);
        }

        return res;
    }

    public static async GetById(id: number): Promise<Consumption> {
        const data = await ConsumptionRepository().select().where("id", id).first();

        if (data) {
            return this.From(data);
        }

        return null;
    }

    public static async Exists(id: number): Promise<boolean> {
        const res = await ConsumptionRepository().count("id as c").where("id", id).first() as any;

        return res.c > 0;
    }

    public static async Insert(cons: Consumption): Promise<number> {
        const d = await ConsumptionRepository().insert({
            id: cons.id,
            market_id: cons.market_id,
            good_id: cons.Good.id || cons.good_id,
            amount: cons.amount,
            maxprice: cons.maxprice,
        });

        cons.id = d[0];

        return d[0];
    }

    public static async Delete(id: number): Promise<boolean> {
        await ConsumptionRepository().delete().where("id", id);

        return true;
    }

    public static async All(): Promise<Consumption[]> {
        const data = await ConsumptionRepository().select();
        const res = new Array<Consumption>();

        if (data) {
            for (const entry of data) {
                res.push(await this.From(entry));
            }

            return res;
        }

        return [];
    }
}

export const ConsumptionRepository = () => Connection("Consumptions");
