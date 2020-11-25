import { Good } from "./Good";
import { Connection } from "DataBase";
import { Player } from "./Player";

export class Storage
{
    public id;
    public playerId: number;
    public marketId: number;

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
        res.playerId = dbobject.actorId;
        res.goodId = dbobject.goodId;
        res.amount = dbobject.amount;
        res.marketId = dbobject.marketId;

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

    public static async ___GetWithActor(playerId: number): Promise<Storage[]>
    {
        const data = await StorageRepository()
            .select()
            .where("playerId", playerId);

        const res = new Array<Storage>();

        if (data) {
            for (const entry of data) {
                res.push(await this.From(entry));
            }

            return res;
        }

        return [];
    }

    public static async AGetWithPlayer(playerId: number): Promise<Storage[]>
    {
        return this.GetWithPlayer(
            (await Player.GetById(playerId)).CurrentMarketId,
            playerId,
        );
    }

    public static async GetWithPlayer(marketId: number, playerId: number): Promise<Storage[]>
    {
        const data = await StorageRepository()
            .select()
            .where("playerId", playerId)
            .andWhere("marketId", marketId)
            .orderBy("goodId");

        const res = new Array<Storage>();

        if (data) {
            for (const entry of data) {
                res.push(await this.From(entry));
            }

            return res;
        }

        return [];
    }

    public static async GetWithGoodMarketAndPlayer(marketId: number, playerId: number, goodid: number): Promise<Storage>
    {
        const data = await StorageRepository()
            .select()
            .where("playerId", playerId)
            .andWhere("goodId", goodid)
            .andWhere("marketId", marketId)
            .first();

        if (data) {
            return this.From(data);
        }

        return null;
    }

    public static async Count(): Promise<number>
    {
        const data = await StorageRepository().count("id as c").first() as any;

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
            playerId: record.playerId,
            amount: record.amount,
            marketId: record.marketId,
        });

        return d[0];
    }


    public static async Insert(record: Storage): Promise<number>
    {
        const d = await StorageRepository().insert({
            id: record.id,
            goodId: record.goodId,
            playerId: record.playerId,
            amount: record.amount,
            marketId: record.marketId,
        });

        record.id = d[0];

        return d[0];
    }

    public static async Delete(id: number): Promise<boolean>
    {
        await StorageRepository().delete().where("id", id);

        return true;
    }

    public static async SumWithGoodAndPlayer(goodId: number, playerId: number): Promise<number>
    {
        const data = await StorageRepository()
            .sum("amount as c")
            .where("goodId", goodId)
            .andWhere("playerId", playerId)
            .first() as any;

        return data.c || 0;
    }

    public static async SumWithGood(goodId: number): Promise<number>
    {
        const data = await StorageRepository()
            .sum("amount as c")
            .where("goodId", goodId)
            .first() as any;

        return data.c || 0;
    }

    public static async AllWithGood(goodId: number): Promise<Storage[]>
    {
        const data = await StorageRepository()
            .select()
            .where("goodId", goodId)
            .orderBy("goodId");

        const res = new Array<Storage>();

        if (data) {
            for (const entry of data) {
                res.push(await this.From(entry));
            }

            return res;
        }

        return [];
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

    public static async AddGoodTo(marketId: number, playerId: number, goodid: number, amount: number)
    {
        const existingstorage = await this.GetWithGoodMarketAndPlayer(marketId, playerId, goodid);

        if (existingstorage) {
            existingstorage.amount += amount;
            await this.Update(existingstorage);
            return;
        }

        const newStorage = new Storage();
        newStorage.playerId = playerId;
        newStorage.setGoodId(goodid);
        newStorage.marketId = marketId;
        newStorage.amount = amount;

        await this.Insert(newStorage);
    }

    public static async Has(marketId: number, playerId: number, goodId: number, amount: number): Promise<boolean>
    {
        const existingstorage = await this.GetWithGoodMarketAndPlayer(marketId, playerId, goodId);

        if (existingstorage && existingstorage.amount >= amount) {
            return true;
        }

        return false;
    }

    public static async Amount(marketId: number, playerId: number, goodId: number): Promise<number>
    {
        const existingstorage = await this.GetWithGoodMarketAndPlayer(marketId, playerId, goodId);

        if (existingstorage && existingstorage.amount) {
            return existingstorage.amount;
        }

        return 0;
    }

    public static async TakeGoodFrom(marketId: number, playerId: number, goodId: number, amount: number): Promise<boolean>
    {
        const existingstorage = await this.GetWithGoodMarketAndPlayer(marketId, playerId, goodId);

        if (existingstorage && existingstorage.amount >= amount) {
            existingstorage.amount -= amount;
            await this.Update(existingstorage);
            return true;
        }

        return false;

    }
}

export const StorageRepository = () => Connection<Storage>("Storages");
