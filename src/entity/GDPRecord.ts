import { Connection } from "DataBase";
import { Good } from "./Good";
import { Turn } from "./Turn";

export class GDPRecord {

    public id?: number;
    public turnId?: number;
    public amount: number = 0;

    public static async From(dbobject: any)
    {
        const res = new GDPRecord();
        res.id = dbobject.id;
        res.turnId = dbobject.turnId;
        res.amount = dbobject.amount;
        return res;
    }

    public static async Create(turnId: number, amount: number) {
        const record = new GDPRecord();
        record.turnId = turnId;
        record.amount = amount;

        this.Insert(record);
    }

    public static async GetById(id: number): Promise<GDPRecord>
    {
        const data = await GDPRecordRepository().select().where("id", id).first();

        if (data) {
            return this.From(data);
        }

        return null;
    }

    public static async GetWithTurn(turnid: number): Promise<GDPRecord>
    {
        const data = await GDPRecordRepository().select().where("turnId", turnid).first();

        if (data) {
            return this.From(data);
        }

        return null;
    }

    public static async Count(): Promise<number> {
        const data = await GDPRecordRepository().count("id as c").first() as any;

        if (data) {
            return data.c;
        }

        return null;
    }

    public static async Exists(id: number): Promise<boolean>
    {
        const res = await GDPRecordRepository().count("id as c").where("id", id).first() as any;

        return res.c > 0;
    }

    public static async Update(record: GDPRecord): Promise<number>
    {
        const d = await GDPRecordRepository().where("id", record.id).update(record);

        return d[0];
    }


    public static async Insert(record: GDPRecord): Promise<number>
    {
        const d = await GDPRecordRepository().insert(record);

        record.id = d[0];

        return d[0];
    }

    public static async Delete(id: number): Promise<boolean>
    {
        await GDPRecordRepository().delete().where("id", id);

        return true;
    }

    public static async All(): Promise<GDPRecord[]> {
        const data = await GDPRecordRepository().select();
        const res = new Array<GDPRecord>();

        if (data) {
            for (const entry of data) {
                res.push(await this.From(entry));
            }

            return res;
        }

        return [];
    }
}

export const GDPRecordRepository = () => Connection<GDPRecord>("GDPRecords");