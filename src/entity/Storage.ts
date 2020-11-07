import { Good } from "./Good";
import { Connection } from "DataBase";
import { MarketActor } from "./MarketActor";

export class Storage
{
    public id;
    public actorId: number;
    public async getActor(): Promise<MarketActor>
    {
        return MarketActor.GetById(this.actorId);
    }
    public setActor(actor: MarketActor)
    {
        this.actorId = actor.id;
    }

    public getActorId()
    {
        return this.actorId;
    }
    public setActorId(actorid: number)
    {
        this.actorId = actorid;
    }

    public goodId: number;

    public async getGood(): Promise<Good>
    {
        return Good.GetById(this.goodId);
    }
    public setGood(good: Good)
    {
        this.goodId = good.id;
    }
    public getGoodId(): number
    {
        return this.goodId;
    }
    public setGoodId(goodid: number)
    {
        this.goodId = goodid;
    }

    public amount: number;

    public static async From(dbobject: any)
    {
        const res = new Storage();
        res.id = dbobject.id;
        res.actorId = dbobject.actorId;
        res.goodId = dbobject.goodId;
        res.amount = dbobject.amount;

        return res;
    }

    public static async GetById(id: number): Promise<Storage>
    {
        const data = await StorageRepository().select().where("id", id).first();

        if (data) {
            return this.From(data);
        }

        return null;
    }

    public static async GetWithActor(actor: MarketActor): Promise<Storage[]>
    {
        const data = await StorageRepository()
            .select()
            .where("actorId", actor.id);

        const res = new Array<Storage>();

        if (data) {
            for (const entry of data) {
                res.push(await this.From(entry));
            }

            return res;
        }

        return [];
    }

    public static async GetWithGoodAndActor(actorid: number, goodid: number): Promise<Storage>
    {
        const data = await StorageRepository()
            .select()
            .where("actorId", actorid)
            .andWhere("goodId", goodid)
            .first();

        if (data) {
            return this.From(data);
        }

        return null;
    }

    public static async Count(): Promise<number>
    {
        const data = await StorageRepository().count("id as c").first() as any;

        console.log(data);

        if (data) {
            return data.c;
        }

        return null;
    }

    public static async Exists(id: number): Promise<boolean>
    {
        const res = await StorageRepository().count("id as c").where("id", id).first() as any;

        return res.c > 0;
    }

    public static async Update(record: Storage): Promise<number>
    {
        const d = await StorageRepository().where("id", record.id).update({
            goodId: record.goodId,
            actorId: record.actorId,
            amount: record.amount,
        });

        return d[0];
    }


    public static async Insert(record: Storage): Promise<number>
    {
        const d = await StorageRepository().insert({
            id: record.id,
            goodId: record.goodId,
            actorId: record.actorId,
            amount: record.amount
        });

        record.id = d[0];

        return d[0];
    }

    public static async Delete(id: number): Promise<boolean>
    {
        await StorageRepository().delete().where("id", id);

        return true;
    }

    public static async All(): Promise<Storage[]>
    {
        const data = await StorageRepository().select();
        const res = new Array<Storage>();

        if (data) {
            for (const entry of data) {
                res.push(await this.From(entry));
            }

            return res;
        }

        return [];
    }

    public static async AddGoodTo(actorid: number, goodid: number, amount: number)
    {
        const existingstorage = await this.GetWithGoodAndActor(actorid, goodid);

        if (existingstorage) {
            existingstorage.amount += amount;
            await this.Update(existingstorage);
            return;
        }

        const newStorage = new Storage();
        newStorage.setActorId(actorid);
        newStorage.setGoodId(goodid);
        newStorage.amount = amount;

        await this.Insert(newStorage);
    }

    public static async Has(actor: MarketActor, good: Good, amount: number): Promise<boolean>
    {
        const existingstorage = await this.GetWithGoodAndActor(actor.id, good.id);

        if (existingstorage && existingstorage.amount >= amount) {
            return true;
        }

        return false;
    }

    public static async Amount(actor: MarketActor, good: Good): Promise<number>
    {
        const existingstorage = await this.GetWithGoodAndActor(actor.id, good.id);

        if (existingstorage && existingstorage.amount) {
            return existingstorage.amount;
        }

        return 0;
    }

    public static async TakeGoodFrom(actor: MarketActor, good: Good, amount: number): Promise<boolean>
    {
        const existingstorage = await this.GetWithGoodAndActor(actor.id, good.id);

        if (existingstorage && existingstorage.amount >= amount) {
            existingstorage.amount -= amount;
            await this.Update(existingstorage);
            return true;
        }

        return false;

    }
}

export const StorageRepository = () => Connection<Storage>("Storages");
