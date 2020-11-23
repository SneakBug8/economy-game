import { Connection } from "DataBase";
import { Good } from "./Good";
import { Turn } from "./Turn";

export class CalculatedPrice
{
    public id: number;
    public type: CalculatedPriceType;
    public playerId: number;
    public goodId: number;
    public price: number;
    public amount: number;


    public static async From(dbobject: any)
    {
        const res = new CalculatedPrice();
        res.id = dbobject.id;
        res.playerId = dbobject.playerId;
        res.goodId = dbobject.goodId;
        res.type = dbobject.type;
        res.price = dbobject.price;
        res.amount = dbobject.amount;
        return res;
    }

    public static async Create(playerId: number, goodid: number, type: CalculatedPriceType, price: number, amount: number)
    {
        const record = new CalculatedPrice();
        record.playerId = playerId;
        record.goodId = goodid;
        record.type = type;
        record.price = price;
        record.amount = amount;

        await this.Insert(record);
    }

    public static async GetWithPlayer(playerId: number): Promise<CalculatedPrice[]>
    {
        const data = await CalculatedPricesRepository().select()
            .where("playerId", playerId);

        const res = new Array<CalculatedPrice>();

        if (data) {
            for (const entry of data) {
                res.push(await this.From(entry));
            }
        }

        return res;
    }

    public static async GetWithPlayerAndGood(playerId: number, goodId: number): Promise<CalculatedPrice>
    {
        const data = await CalculatedPricesRepository().select()
            .where("goodId", goodId)
            .andWhere("playerId", playerId).first();

        if (data) {
            return this.From(data);
        }

        return null;
    }

    public static async GetWithGood(goodId: number): Promise<CalculatedPrice[]>
    {
        const data = await CalculatedPricesRepository().select()
            .where("goodId", goodId)
            .orderBy("profit", "desc");

        const res = new Array<CalculatedPrice>();

        if (data) {
            for (const entry of data) {
                res.push(await this.From(entry));
            }
        }

        return res;
    }

    public static async Count(): Promise<number>
    {
        const data = await CalculatedPricesRepository().count("id as c").first() as any;

        if (data) {
            return data.c;
        }

        return null;
    }

    public static async Exists(id: number): Promise<boolean>
    {
        const res = await CalculatedPricesRepository().count("id as c").where("id", id).first() as any;

        return res.c > 0;
    }

    public static async Update(record: CalculatedPrice): Promise<number>
    {
        const d = await CalculatedPricesRepository().where("id", record.id).update(record);

        return d[0];
    }


    public static async Insert(record: CalculatedPrice): Promise<number>
    {
        const d = await CalculatedPricesRepository().insert(record);

        record.id = d[0];

        return d[0];
    }

    public static async Delete(id: number): Promise<boolean>
    {
        await CalculatedPricesRepository().delete().where("id", id);

        return true;
    }

    public static async All(): Promise<CalculatedPrice[]>
    {
        const data = await CalculatedPricesRepository().select();
        const res = new Array<CalculatedPrice>();

        if (data) {
            for (const entry of data) {
                res.push(await this.From(entry));
            }

            return res;
        }

        return [];
    }
}

export enum CalculatedPriceType
{
    Buy,
    Sell,
}

export const CalculatedPricesRepository = () => Connection<CalculatedPrice>("CalculatedPrices");
