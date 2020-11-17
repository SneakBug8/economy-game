import { MarketOffer } from "./MarketOffer";
import { Connection } from "DataBase";
import { Market } from "./Market";
import { MarketActor } from "./MarketActor";
import { Good } from "./Good";
import { Storage } from "entity/Storage";
import { Player } from "./Player";
import { Turn } from "./Turn";

export class SellOffer extends MarketOffer
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
    public getActorId(): number
    {
        return this.actorId;
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
        const res = new SellOffer();
        return res.From(dbobject);
    }

    public static async GetById(id: number): Promise<SellOffer>
    {
        const data = await SellOfferRepository().select().where("id", id).first();

        if (data) {
            return this.From(data);
        }

        return null;
    }

    public static async Create(good: Good, amount: number, price: number, actor: MarketActor)
    {
        const player = await Player.GetWithActor(actor);

        if (!await Storage.Has(actor, good, amount)) {
            return "Not enough resources";
        }

        const offer = new SellOffer();
        offer.marketId = Market.DefaultMarket.id;
        offer.setGood(good);
        offer.amount = amount;
        offer.price = price;
        offer.setActor(actor);

        await Storage.AddGoodTo(actor.id, good.id, -amount);

        return await this.Insert(offer);
    }

    public static async Exists(id: number): Promise<boolean>
    {
        const res = await SellOfferRepository().count("id as c").where("id", id).first() as any;

        return res.c > 0;
    }

    public static async Update(offer: SellOffer): Promise<number>
    {
        const d = await SellOfferRepository().where("id", offer.id).update({
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

    public static async Insert(offer: SellOffer): Promise<number>
    {
        const d = await SellOfferRepository().insert({
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
        await SellOfferRepository().delete().where("id", id);

        return true;
    }

    public static async Refund(id: number): Promise<boolean>
    {
        const offer = await this.GetById(id);

        if (!offer) {
            return;
        }

        await Storage.AddGoodTo(offer.actorId, offer.goodId, offer.amount);

        await SellOfferRepository().delete().where("id", id);

        return true;
    }

    public static async All(): Promise<SellOffer[]>
    {
        const data = await SellOfferRepository().select();
        const res = new Array<SellOffer>();

        if (data) {
            for (const entry of data) {
                res.push(await this.From(entry));
            }

            return res;
        }

        return [];
    }

    public static async GetWithGoodOrdered(good: Good, sort: string = "asc"): Promise<SellOffer[]>
    {
        const data = await SellOfferRepository().where("good_id", good.id).select().orderBy("price", sort);
        const res = new Array<SellOffer>();

        if (data) {
            for (const entry of data) {
                res.push(await this.From(entry));
            }

            return res;
        }

        return [];
    }

    public static async GetWithActor(actorId: number): Promise<SellOffer[]>
    {
        const data = await SellOfferRepository().where("actor_id", actorId).select();
        const res = new Array<SellOffer>();

        if (data) {
            for (const entry of data) {
                res.push(await this.From(entry));
            }

            return res;
        }

        return [];
    }
}

export const SellOfferRepository = () => Connection("SellOffers");