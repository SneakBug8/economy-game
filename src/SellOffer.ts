import { MarketOffer } from "MarketOffer";
import { getAsync } from "DB";
import { Good } from "Good";
import { Market } from "Market";

export class SellOffer extends MarketOffer
{
    static SellOffers: { [id: number]: SellOffer; } = {};

    public static async From(dbobject: any) {
        const res = new SellOffer();
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

    public async LoadDependencies() {
        this.Good = await Good.GetById(this.good_id);
        this.Market = await Market.GetById(this.market_id);
    }

    public static async Exists(id: number): Promise<boolean> {
        if (this.SellOffers[id]) {
            return true;
        }

        const data = await getAsync("select count(id) as c from SellOffers where id = ?", id);

        return data.c > 0;
    }

    public static async GetById(id: number): Promise<SellOffer>
    {
        if (this.SellOffers[id]) {
            return this.SellOffers[id];
        }

        const data = await getAsync("select * from SellOffers where id = ?", id);

        /*Connection.get("select * from BuyOffers where id = ?", id, (err, data) => {
            console.log(data);
        });*/

        this.SellOffers[id] = await SellOffer.From(data);

        return this.SellOffers[id];
    }
}