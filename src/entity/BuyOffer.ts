import { MarketOffer } from "./MarketOffer";
import { Connection } from "DataBase";
import { MarketActor } from "./MarketActor";
import { Market } from "entity/Market";
import { Good } from "./Good";
import { Turn } from "./Turn";

export class BuyOffer extends MarketOffer
{
    public async getGood(): Promise<Good>
    {
        return Good.GetById(this.goodId);
    }
    public setGood(good: Good)
    {
        this.goodId = good.id;
    }
    public getMarket(): Promise<Market>
    {
        return Market.GetById(this.marketId);
    }
    public setMarket(market: Market)
    {
        this.marketId = market.id;
    }
    public getTurn(): Promise<Turn>
    {
        return Turn.GetById(this.turn_id);
    }
    public setTurn(turn: Turn)
    {
        this.turn_id = turn.id;
    }
    public getActor(): Promise<MarketActor>
    {
        return MarketActor.GetById(this.actorId);
    }
    public setActor(actor: MarketActor)
    {
        this.actorId = actor.id;
    }

    public async From(dbobject: any)
    {
        this.id = dbobject.id;
        this.marketId = dbobject.market_id;
        this.actorId = dbobject.actor_id;
        this.goodId = dbobject.good_id;
        this.amount = dbobject.amount;
        this.price = dbobject.price;
        this.turn_id = dbobject.turn_id;

        return this;
    }

    public static async From(dbobject: any)
    {
        const res = new BuyOffer();
        return res.From(dbobject);
    }

    public static async Create(good: Good, amount: number, price: number, actor: MarketActor)
    {
        const offer = new BuyOffer();
        offer.marketId = Market.DefaultMarket.id;
        offer.setGood(good);
        offer.amount = amount;
        offer.price = price;
        offer.setActor(actor);

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
            market_id: offer.marketId,
            actor_id: offer.actorId,
            good_id: offer.goodId,
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
            market_id: offer.marketId,
            actor_id: offer.actorId,
            good_id: offer.goodId,
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

    public static async All(): Promise<BuyOffer[]>
    {
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

    public static async GetWithGoodOrdered(good: Good, sort: string = "desc"): Promise<BuyOffer[]>
    {
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

    public static async GetWithActor(actorId: number): Promise<BuyOffer[]>
    {
        const data = await BuyOfferRepository().where("actor_id", actorId).select();
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