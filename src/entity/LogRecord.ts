import { Connection } from "DataBase";
import { Player } from "./Player";
import { Turn } from "./Turn";

export class LogRecord {

    public id: number;
    public turnId: number;
    public playerId: number;
    public text: string;

    public static async From(dbobject: any)
    {
        const res = new LogRecord();
        res.id = dbobject.id;
        res.turnId = dbobject.turnId;
        res.playerId = dbobject.playerId;
        res.text = dbobject.text;
        return res;
    }

    public static async Log(player: Player, turn: Turn, text: string) {
        const record = new LogRecord();
        record.playerId = player.id;
        record.turnId = turn.id;
        record.text = text;

        await this.Insert(record);
    }

    public static async GetById(id: number): Promise<LogRecord>
    {
        const data = await LogRecordRepository().select().where("id", id).first();

        if (data) {
            return this.From(data);
        }

        return null;
    }

    public static async Count(): Promise<number> {
        const data = await LogRecordRepository().count("id as c").first() as any;

        console.log(data);

        if (data) {
            return data.c;
        }

        return null;
    }

    public static async Exists(id: number): Promise<boolean>
    {
        const res = await LogRecordRepository().count("id as c").where("id", id).first() as any;

        return res.c > 0;
    }

    public static async Update(record: LogRecord): Promise<number>
    {
        const d = await LogRecordRepository().where("id", record.id).update({
            playerId: record.playerId,
            turnId: record.turnId,
            text: record.text,
        });

        return d[0];
    }


    public static async Insert(record: LogRecord): Promise<number>
    {
        const d = await LogRecordRepository().insert({
            playerId: record.playerId,
            turnId: record.turnId,
            text: record.text,
        });

        record.id = d[0];

        return d[0];
    }

    public static async Delete(id: number): Promise<boolean>
    {
        await LogRecordRepository().delete().where("id", id);

        return true;
    }

    public static async All(): Promise<LogRecord[]> {
        const data = await LogRecordRepository().select();
        const res = new Array<LogRecord>();

        if (data) {
            for (const entry of data) {
                res.push(await this.From(entry));
            }

            return res;
        }

        return [];
    }
}

export const LogRecordRepository = () => Connection<LogRecord>("LogRecords");