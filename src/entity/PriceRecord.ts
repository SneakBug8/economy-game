import { Connection } from "DataBase";
import { TurnsService } from "services/TurnsService";
import { Good } from "./Good";
import { Turn } from "./Turn";

export class PriceRecord {

    public id?: number;
    public turnId?: number;
    public goodId: number;
    public minprice: number;
    public maxprice: number;

    public tradeamount: number;

    public static async From(dbobject: any)
    {
        const res = new PriceRecord();
        res.id = dbobject.id;
        res.turnId = dbobject.turnId;
        res.goodId = dbobject.goodId;
        res.minprice = dbobject.minprice;
        res.maxprice = dbobject.maxprice;
        res.tradeamount = dbobject.tradeamount;
        return res;
    }

    public static async Create(turnId: number, goodid: number, minprice: number, maxprice: number, tradeamount: number) {
        const record = new PriceRecord();
        record.turnId = turnId;
        record.goodId = goodid;
        record.minprice = minprice;
        record.maxprice = maxprice;

        record.tradeamount = tradeamount;

        this.Insert(record);
    }

    public static async GetById(id: number): Promise<PriceRecord>
    {
        const data = await PriceRecordRepository().select().where("id", id).first();

        if (data) {
            return this.From(data);
        }

        return null;
    }

    public static async GetLastWithGood(goodId: number): Promise<PriceRecord>
    {
        const data = await PriceRecordRepository().select()
        .where("goodId", goodId)
        .andWhere("turnId", TurnsService.CurrentTurn.id - 1)
        .first();

        if (data) {
            return this.From(data);
        }

        return null;
    }

    public static async GetWithGood(turnId: number, goodId: number): Promise<PriceRecord>
    {
        const data = await PriceRecordRepository().select().where("goodId", goodId).andWhere("turnId", turnId).first();

        if (data) {
            return this.From(data);
        }

        return null;
    }

    public static async Count(): Promise<number> {
        const data = await PriceRecordRepository().count("id as c").first() as any;

        if (data) {
            return data.c;
        }

        return null;
    }

    public static async Exists(id: number): Promise<boolean>
    {
        const res = await PriceRecordRepository().count("id as c").where("id", id).first() as any;

        return res.c > 0;
    }

    public static async Update(record: PriceRecord): Promise<number>
    {
        const d = await PriceRecordRepository().where("id", record.id).update(record);

        return d[0];
    }


    public static async Insert(record: PriceRecord): Promise<number>
    {
        const d = await PriceRecordRepository().insert(record);

        record.id = d[0];

        return d[0];
    }

    public static async Delete(id: number): Promise<boolean>
    {
        await PriceRecordRepository().delete().where("id", id);

        return true;
    }

    public static async All(): Promise<PriceRecord[]> {
        const data = await PriceRecordRepository().select();
        const res = new Array<PriceRecord>();

        if (data) {
            for (const entry of data) {
                res.push(await this.From(entry));
            }

            return res;
        }

        return [];
    }
}

export const PriceRecordRepository = () => Connection<PriceRecord>("PriceRecords");