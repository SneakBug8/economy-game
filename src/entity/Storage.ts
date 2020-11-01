import { Factory } from "./Factory";
import { Good } from "./Good";
import { Connection } from "DataBase";

export class Storage
{
    public id;
    public factoryId: number;

    public async getFactory(): Promise<Factory>
    {
        return Factory.GetById(this.factoryId);
    }

    public setFactory(factory: Factory)
    {
        this.factoryId = factory.id;
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

    public amount: number;

    public static async From(dbobject: any)
    {
        const res = new Storage();
        res.id = dbobject.id;
        res.factoryId = dbobject.factoryId;
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

    public static async GetWithGoodAndFactory(factory: Factory, good: Good): Promise<Storage>
    {
        const data = await StorageRepository()
            .select()
            .where("factoryId", factory.id)
            .andWhere("goodId", good.id)
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
            factoryId: record.factoryId,
            amount: record.amount,
        });

        return d[0];
    }


    public static async Insert(record: Storage): Promise<number>
    {
        const d = await StorageRepository().insert({
            id: record.id,
            goodId: record.goodId,
            factoryId: record.factoryId,
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

    public static async AddGoodTo(factory: Factory, good: Good, amount: number)
    {
        const existingstorage = await this.GetWithGoodAndFactory(factory, good);

        if (existingstorage) {
            existingstorage.amount += amount;
            await this.Update(existingstorage);
            return;
        }

        const newStorage = new Storage();
        newStorage.setFactory(factory);
        newStorage.setGood(good);
        newStorage.amount = amount;

        await this.Insert(newStorage);
    }

    public static async Has(factory: Factory, good: Good, amount: number): Promise<boolean>
    {
        const existingstorage = await this.GetWithGoodAndFactory(factory, good);

        if (existingstorage && existingstorage.amount >= amount) {
            return true;
        }

        return false;
    }

    public static async Amount(factory: Factory, good: Good): Promise<number>
    {
        const existingstorage = await this.GetWithGoodAndFactory(factory, good);

        if (existingstorage && existingstorage.amount) {
            return existingstorage.amount;
        }

        return 0;
    }

    public static async TakeGoodFrom(factory: Factory, good: Good, amount: number): Promise<boolean>
    {
        const existingstorage = await this.GetWithGoodAndFactory(factory, good);

        if (existingstorage && existingstorage.amount >= amount) {
            existingstorage.amount -= amount;
            await this.Update(existingstorage);
            return true;
        }

        return false;

    }
}

export const StorageRepository = () => Connection<Storage>("Storages");
