import { getAsync } from "DB";
import { Good } from "Good";
import { Market } from "Market";

export class Production {
    public id: number;
    public market_id: number;
    public good_id: number;
    public amount: number;
    public minprice: number;
    public Good: Good;
    public Market: Market;

    static Productions: { [id: number]: Production; } = {};

    public static async From(dbobject: any) {
        const res = new Production();
        res.id = dbobject.id;
        res.market_id = dbobject.market_id;
        res.good_id = dbobject.good_id;
        res.amount = dbobject.amount;
        res.minprice = dbobject.minprice;
        await res.LoadDependencies();

        return res;
    }

    public async LoadDependencies() {
        this.Good = await Good.GetById(this.good_id);
        this.Market = await Market.GetById(this.market_id);
    }

    public static async GetById(id: number): Promise<Production>
    {
        if (this.Productions[id]) {
            return this.Productions[id];
        }

        const data = await getAsync("select * from Productions where id = ?", id);

        this.Productions[id] = await Production.From(data);

        return this.Productions[id];
    }

    public static async Exists(id: number): Promise<boolean>
    {
        if (this.Productions[id]) {
            return true;
        }

        const data = await getAsync("select count(id) as c from Productions where id = ?", id);

        return data.c > 0;
    }
}