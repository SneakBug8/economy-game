import { MarketOffer } from "./MarketOffer";
import { Connection } from "DataBase";
import { Market } from "./Market";
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
    public setGoodId(goodId: number)
    {
        this.goodId = goodId;
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

    public async From(dbobject: any)
    {
        this.id = dbobject.id;
        this.marketId = dbobject.marketId;
        this.playerId = dbobject.playerId;
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

    public static async Create(marketId: number, goodId: number, amount: number, price: number, playerId: number)
    {
        const player = await Player.GetById(playerId);

        if (!player) {
            return "No such player";
        }

        if (!await Storage.Has(marketId, playerId, goodId, amount)) {
            return "Not enough resources";
        }

        const offer = new SellOffer();
        offer.marketId = marketId;
        offer.setGoodId(goodId);
        offer.amount = amount;
        offer.price = price;
        offer.playerId = playerId;

        await Storage.AddGoodTo(marketId, playerId, goodId, -amount);

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
            marketId: offer.marketId,
            playerId: offer.playerId,
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
            marketId: offer.marketId,
            playerId: offer.playerId,
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

        await Storage.AddGoodTo(offer.marketId, offer.playerId, offer.goodId, offer.amount);

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

    public static async GetWithGood(goodId: number, sort: string = "asc"): Promise<SellOffer[]>
    {
        const data = await SellOfferRepository().where("good_id", goodId).select().orderBy("price", sort);
        const res = new Array<SellOffer>();

        if (data) {
            for (const entry of data) {
                res.push(await this.From(entry));
            }

            return res;
        }

        return [];
    }

    public static async GetWithGoodAndMarket(marketId: number, goodId: number, sort: string = "desc"): Promise<SellOffer[]>
    {
        const data = await SellOfferRepository()
        .where("good_id", goodId).andWhere("marketId", marketId)
        .select().orderBy("price", sort);
        const res = new Array<SellOffer>();

        if (data) {
            for (const entry of data) {
                res.push(await this.From(entry));
            }

            return res;
        }

        return [];
    }

    public static async GetWithPlayer(playerId: number): Promise<SellOffer[]>
    {
        const data = await SellOfferRepository().where("playerId", playerId).select();
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