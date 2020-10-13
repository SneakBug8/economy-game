import { MarketOffer } from "MarketOffer";
import { Connection, getAsync, runAsync } from "DB";
import * as util from 'util';
import { Good } from "Good";
import { Market } from "Market";

export class BuyOffer extends MarketOffer
{
    static BuyOffers: { [id: number]: BuyOffer; } = {};

    public static async From(dbobject: any) {
        const res = new BuyOffer();
        res.id = dbobject.id;
        res.market_id = dbobject.id;
        res.actor_id = dbobject.actor_id;
        res.good_id = dbobject.good_id;
        res.amount = dbobject.amount;
        res.price = dbobject.price;
        res.turn_id = dbobject.turn_id;
        await res.LoadDependencies();

        return res;
    }

    public async LoadDependencies()
    {
        this.Good = await Good.GetById(this.good_id);
        this.Market = await Market.GetById(this.market_id);
    }

    public static async Exists(id: number): Promise<boolean>
    {
        if (this.BuyOffers[id]) {
            return true;
        }

        const data = await getAsync("select count(id) as c from BuyOffers where id = ?", id);

        return data.c > 0;
    }

    public static async GetById(id: number): Promise<BuyOffer>
    {
        if (this.BuyOffers[id]) {
            return this.BuyOffers[id];
        }

        const data = await getAsync("select * from BuyOffers where id = ?", id);

        /*Connection.get("select * from BuyOffers where id = ?", id, (err, data) => {
            console.log(data);
        });*/

        this.BuyOffers[id] = await BuyOffer.From(data);

        return this.BuyOffers[id];
    }

    public static async Add(market_id: number, actor_id: number, good_id: number, amount: number, price: number, turn_id: number)
    {
        await runAsync(`insert into BuyOffers(market_id, actor_id, good_id, amount, price, turn_id)
        values(?, ?, ?, ?, ?, ?);`,
            [market_id, actor_id, good_id, amount, price, turn_id]);

        const res = await getAsync("SELECT last_insert_rowid() as id", []);

        return res;
    }
}