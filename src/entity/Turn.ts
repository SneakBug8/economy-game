import { Connection } from "DataBase";

export class Turn
{
    public id: number;
    public datetime: string;
    public totalcash: number = 0;
    public freecash: number = 0;
    public cashperplayer: number = 0;
    public totalworkers: number = 0;
    public averageworkers: number = 0;
    public medianworkers: number = 0;

    public static async From(dbobject: any)
    {
        const res = new Turn();
        res.id = dbobject.id;
        res.datetime = dbobject.datetime;
        res.totalcash = dbobject.totalcash;
        res.cashperplayer = dbobject.cashperplayer;
        res.totalworkers = dbobject.totalworkers;
        res.freecash = dbobject.freecash;
        res.averageworkers = dbobject.averageworkers;
        res.medianworkers = dbobject.medianworkers;

        return res;
    }

    public static async GetById(id: number): Promise<Turn>
    {
        const data = await TurnRepository().select().where("id", id).first();

        if (data) {
            return this.From(data);
        }

        return null;
    }

    public static async Exists(id: number): Promise<boolean>
    {
        const res = await TurnRepository().count("id as c").where("id", id).first() as any;

        return res.c > 0;
    }

    public static async Insert(turn: Turn): Promise<number>
    {
        const d = await TurnRepository().insert({
            datetime: turn.datetime,
            totalcash: turn.totalcash,
            cashperplayer: turn.cashperplayer,
            totalworkers: turn.totalworkers,
            freecash: turn.freecash,
            medianworkers: turn.medianworkers,
            averageworkers: turn.averageworkers,
        });

        turn.id = d[0];

        return d[0];
    }

    public static async Update(turn: Turn): Promise<number>
    {
        const d = await TurnRepository().where("id", turn.id).update({
            datetime: turn.datetime,
            totalcash: turn.totalcash,
            cashperplayer: turn.cashperplayer,
            totalworkers: turn.totalworkers,
            freecash: turn.freecash,
            medianworkers: turn.medianworkers,
            averageworkers: turn.averageworkers,
        });

        turn.id = d[0];

        return d[0];
    }

    public static async Last(): Promise<Turn>
    {
        const data = await TurnRepository().select().orderBy("id", "desc").first();

        if (data) {
            return this.From(data);
        }

        return null;
    }

    public static async All(limit: number = 180): Promise<Turn[]>
    {
        const data = await TurnRepository().select().limit(limit);
        const res = new Array<Turn>();

        if (data) {
            for (const entry of data) {
                res.push(await this.From(entry));
            }

            return res;
        }

        return [];
    }
}

export const TurnRepository = () => Connection("Turns");
