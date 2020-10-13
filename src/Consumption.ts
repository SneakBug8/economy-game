import { getAsync } from "DB";
import { Market } from "Market";
import { Good } from "Good";

export class Consumption {
    public id: number;
    public market_id: number;
    public Market: Market;
    public good_id: number;
    public Good: Good;
    public amount: number;
    public maxprice: number;

    static Consumptions: { [id: number]: Consumption; } = {};

    public static async From(dbobject: any) {
        const res = new Consumption();
        res.id = dbobject.id;
        res.market_id = dbobject.market_id;
        res.good_id = dbobject.good_id;
        res.amount = dbobject.amount;
        res.maxprice = dbobject.maxprice;
        await res.LoadDependencies();

        return res;
    }

    public async LoadDependencies() {
        this.Good = await Good.GetById(this.good_id);
        this.Market = await Market.GetById(this.market_id);
    }

    public static async GetById(id: number): Promise<Consumption>
    {
        if (this.Consumptions[id]) {
            return this.Consumptions[id];
        }

        const data = await getAsync("select * from Consumptions where id = ?", id);

        this.Consumptions[id] = await Consumption.From(data);

        return this.Consumptions[id];
    }

    public static async Exists(id: number): Promise<boolean>
    {
        if (this.Consumptions[id]) {
            return true;
        }

        const data = await getAsync("select count(id) as c from Consumptions where id = ?", id);

        return data.c > 0;
    }
}