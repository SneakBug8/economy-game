import { Connection } from "DataBase";
import { TurnsService } from "services/TurnsService";
import { Logger } from "utility/Logger";
import { Player } from "./Player";
import { Turn } from "./Turn";

export class PlayerLog {

    public id: number;
    public turnId: number;
    public playerId: number;
    public text: string;
    public timestamp: number = Date.now();

    public static async From(dbobject: any)
    {
        const res = new PlayerLog();
        res.id = dbobject.id;
        res.turnId = dbobject.turnId;
        res.playerId = dbobject.playerId;
        res.text = dbobject.text;
        res.timestamp = dbobject.timestamp;
        return res;
    }

    public static async Log(playerId: number, turn: Turn, text: string) {
        const record = new PlayerLog();
        record.playerId = playerId;
        record.turnId = turn.id;
        record.text = text;

        await this.Insert(record);
    }

    public static async LogNow(playerId: number, text: string) {
        return this.Log(playerId, TurnsService.CurrentTurn, text);
    }

    public static async GetById(id: number): Promise<PlayerLog>
    {
        const data = await LogRecordRepository().select().where("id", id).first();

        if (data) {
            return this.From(data);
        }

        return null;
    }

    public static async GetWithPlayer(id: number): Promise<PlayerLog[]>
    {
        const data = await LogRecordRepository().select().where("playerId", id).orderBy("timestamp", "desc").limit(25);

        const res = new Array<PlayerLog>();

        if (data) {
            for (const entry of data) {
                res.push(await this.From(entry));
            }

            return res;
        }

        return [];
    }

    public static async Count(): Promise<number> {
        const data = await LogRecordRepository().count("id as c").first() as any;

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

    public static async Update(record: PlayerLog): Promise<number>
    {
        const d = await LogRecordRepository().where("id", record.id).update({
            playerId: record.playerId,
            turnId: record.turnId,
            text: record.text,
            timestamp: record.timestamp,
        });

        return d[0];
    }


    public static async Insert(record: PlayerLog): Promise<number>
    {
        const d = await LogRecordRepository().insert({
            playerId: record.playerId,
            turnId: record.turnId,
            text: record.text,
            timestamp: record.timestamp,
        });

        record.id = d[0];

        return d[0];
    }

    public static async Delete(id: number): Promise<boolean>
    {
        await LogRecordRepository().delete().where("id", id);

        return true;
    }

    public static async All(): Promise<PlayerLog[]> {
        const data = await LogRecordRepository().select();
        const res = new Array<PlayerLog>();

        if (data) {
            for (const entry of data) {
                res.push(await this.From(entry));
            }

            return res;
        }

        return [];
    }
}

export const LogRecordRepository = () => Connection<PlayerLog>("PlayerLogs");