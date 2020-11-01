import { MarketOffer } from "./MarketOffer";
import { Connection } from "DataBase";
import { MarketActor } from "./MarketActor";
import { Market } from "entity/Market";
import { Good } from "./Good";

export class BuyOffer extends MarketOffer
{
    public static async From(dbobject: any)
    {
        const res = new BuyOffer();
        res.id = dbobject.id;
        res.marketId = dbobject.market_id;
        res.actorId = dbobject.actor_id;
        res.goodId = dbobject.good_id;
        res.amount = dbobject.amount;
        res.price = dbobject.price;
        res.turn_id = dbobject.turn_id;

        if (res.marketId) {
            res.Market = await Market.GetById(res.marketId);
        }
        if (res.actorId) {
            res.MarketActor = await MarketActor.GetById(res.actorId);
        }
        if (res.goodId) {
            res.Good = await Good.GetById(res.goodId);
        }

        return res;
    }

    public static async Create(good: Good, amount: number, price: number, actor: MarketActor) {
        const offer = new BuyOffer();
        offer.marketId = Market.DefaultMarket.id;
        offer.Good = good;
        offer.amount = amount;
        offer.price = price;
        offer.MarketActor = actor;

        this.Insert(offer);
    }

    public static async GetById(id: number): Promise<BuyOffer>
    {
        const data = await BuyOfferRepository().select().where("id", id).first();

        if (data) {
            return this.From(data);
        }

        return null;
    }

    public static async Exists(id: number): Promise<boolean>
    {
        const res = await BuyOfferRepository().count("id as c").where("id", id).first() as any;

        return res.c > 0;
    }

    public static async Update(offer: BuyOffer): Promise<number>
    {
        const d = await BuyOfferRepository().where("id", offer.id).update({
            market_id: offer.Market.id || offer.marketId,
            actor_id: offer.MarketActor.id || offer.actorId,
            good_id: offer.Good.id || offer.goodId,
            amount: offer.amount,
            price: offer.price,
            turn_id: offer.turn_id,
        });

        offer.id = d[0];

        return d[0];
    }


    public static async Insert(offer: BuyOffer): Promise<number>
    {
        const d = await BuyOfferRepository().insert({
            market_id: offer.Market.id || offer.marketId,
            actor_id: offer.MarketActor.id || offer.actorId,
            good_id: offer.Good.id || offer.goodId,
            amount: offer.amount,
            price: offer.price,
            turn_id: offer.turn_id,
        });

        offer.id = d[0];

        return d[0];
    }

    public static async Delete(id: number): Promise<boolean>
    {
        await BuyOfferRepository().delete().where("id", id);

        return true;
    }

    public static async All(): Promise<BuyOffer[]> {
        const data = await BuyOfferRepository().select();
        const res = new Array<BuyOffer>();

        if (data) {
            for (const entry of data) {
                res.push(await this.From(entry));
            }

            return res;
        }

        return [];
    }

    public static async GetWithGoodOrdered(good: Good, sort: string = "desc") : Promise<BuyOffer[]> {
        const data = await BuyOfferRepository().where("good_id", good.id).select().orderBy("price", sort);
        const res = new Array<BuyOffer>();

        if (data) {
            for (const entry of data) {
                res.push(await this.From(entry));
            }

            return res;
        }

        return [];
    }
}

export const BuyOfferRepository = () => Connection("BuyOffers");