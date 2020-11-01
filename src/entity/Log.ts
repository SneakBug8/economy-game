import { Connection } from "DataBase";
import { Player } from "./Player";
import { Turn } from "./Turn";
import { TurnsService } from "services/TurnsService";

export class Log {

    public id: number;
    public turnId: number;
    public text: string;

    public static async From(dbobject: any)
    {
        const res = new Log();
        res.id = dbobject.id;
        res.turnId = dbobject.turnId;
        res.text = dbobject.text;
        return res;
    }

    public static async Log(turn: Turn, text: string) {
        const record = new Log();
        record.turnId = turn.id;
        record.text = text;

        await this.Insert(record);

        console.log(`${turn.id}: ${text}`);
    }

    public static async LogText(text: string) {
        this.Log(Turn.CurrentTurn, text);
    }

    public static async LogTemp(text: string) {
        console.log(`${Turn.CurrentTurn.id}: ${text}`);
    }

    public static async Insert(record: Log): Promise<number>
    {
        const d = await LogRecordRepository().insert({
            turnId: record.turnId,
            text: record.text,
        });

        record.id = d[0];

        return d[0];
    }
}

export const LogRecordRepository = () => Connection<Log>("LogRecords");