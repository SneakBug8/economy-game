import { MarketOffer } from "./MarketOffer";
import { Connection } from "DataBase";
import { MarketActor } from "./MarketActor";
import { Market } from "entity/Market";
import { Good } from "./Good";
import { Turn } from "./Turn";
import { Player } from "./Player";
import { TurnsService } from "services/TurnsService";
import { TradeEventType } from "events/types/TradeEvent";

export class Transaction
{
    public id: number;
    amount: number;
    price: number;
    public type: TradeEventType;
    public turnId: number;
    protected actorId: number;
    protected goodId: number;

    public async getGood(): Promise<Good>
    {
        return Good.GetById(this.goodId);
    }
    public setGood(good: Good)
    {
        this.goodId = good.id;
    }
    public getTurn(): Promise<Turn>
    {
        return Turn.GetById(this.turnId);
    }
    public setTurn(turn: Turn)
    {
        this.turnId = turn.id;
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
        this.actorId = dbobject.actorId;
        this.goodId = dbobject.goodId;
        this.amount = dbobject.amount;
        this.price = dbobject.price;
        this.turnId = dbobject.turnId;
        this.type = dbobject.type;

        return this;
    }

    public static async From(dbobject: any)
    {
        const res = new Transaction();
        return res.From(dbobject);
    }

    public static async Create(good: Good, amount: number, price: number, actor: MarketActor, type: TradeEventType)
    {
        const player = await Player.GetWithActor(actor);

        if (!await Player.HasCash(player.id, amount * price)) {
            return false;
        }

        const offer = new Transaction();
        offer.setGood(good);
        offer.amount = amount;
        offer.price = price;
        offer.setActor(actor);
        offer.turnId = TurnsService.CurrentTurn.id;
        offer.type = type;

        return await this.Insert(offer);
    }

    public static async GetById(id: number): Promise<Transaction>
    {
        const data = await TransactionRepository().select().where("id", id).first();

        if (data) {
            return this.From(data);
        }

        return null;
    }

    public static async Exists(id: number): Promise<boolean>
    {
        const res = await TransactionRepository().count("id as c").where("id", id).first() as any;

        return res.c > 0;
    }

    public static async Update(offer: Transaction): Promise<number>
    {
        const d = await TransactionRepository().where("id", offer.id).update({
            actorId: offer.actorId,
            goodId: offer.goodId,
            amount: offer.amount,
            price: offer.price,
            turnId: offer.turnId,
            type: offer.type,
        });

        offer.id = d[0];

        return d[0];
    }

    public static async Insert(offer: Transaction): Promise<number>
    {
        const d = await TransactionRepository().insert({
            actorId: offer.actorId,
            goodId: offer.goodId,
            amount: offer.amount,
            price: offer.price,
            turnId: offer.turnId,
            type: offer.type,
        });

        offer.id = d[0];

        return d[0];
    }

    public static async Delete(id: number): Promise<boolean>
    {
        await TransactionRepository().delete().where("id", id);

        return true;
    }

    public static async All(): Promise<Transaction[]>
    {
        const data = await TransactionRepository().select();
        const res = new Array<Transaction>();

        if (data) {
            for (const entry of data) {
                res.push(await this.From(entry));
            }

            return res;
        }

        return [];
    }

    public static async GetWithGoodOrdered(good: Good, sort: string = "desc"): Promise<Transaction[]>
    {
        const data = await TransactionRepository().where("goodId", good.id).select().orderBy("price", sort);
        const res = new Array<Transaction>();

        if (data) {
            for (const entry of data) {
                res.push(await this.From(entry));
            }

            return res;
        }

        return [];
    }

    public static async GetWithActor(actorId: number): Promise<Transaction[]>
    {
        const data = await TransactionRepository().where("actorId", actorId).select();
        const res = new Array<Transaction>();

        if (data) {
            for (const entry of data) {
                res.push(await this.From(entry));
            }

            return res;
        }

        return [];
    }

    public static async TopWithGood(goodId: number): Promise<Transaction[]>
    {
        const data = await TransactionRepository()
            .where("goodId", goodId)
            .groupBy("actorId")
            .select("sum(amount) as a, avg(price) as b")
            .orderBy("a * b", "desc");
        const res = new Array<Transaction>();

        if (data) {
            for (const entry of data) {
                res.push(await this.From(entry));
            }

            return res;
        }

        return [];
    }
}

export const TransactionRepository = () => Connection("Transactions");
