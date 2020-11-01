import { Connection } from "DataBase";

export class Turn
{
    public id: number;
    public datetime: string;
    public totalcash: number;
    public cashperplayer: number;
    public freecash: number;

    public static CurrentTurn: Turn;

    public static async From(dbobject: any) {
        const res = new Turn();
        res.id = dbobject.id;
        res.datetime = dbobject.datetime;
        res.totalcash = dbobject.totalcash;
        res.cashperplayer = dbobject.cashperplayer;
        res.freecash = dbobject.freecash;

        return res;
    }

    public ModifyFreeCash(amount: number) {
        this.freecash += amount;
    }

    public static async GetById(id: number): Promise<Turn> {
        const data = await TurnRepository().select().where("id", id).first();

        if (data) {
            return this.From(data);
        }

        return null;
    }

    public static async Exists(id: number): Promise<boolean> {
        const res = await TurnRepository().count("id as c").where("id", id).first() as any;

        return res.c > 0;
    }

    public static async Insert(turn: Turn): Promise<number>
    {
        /*
        res.id = dbobject.id;
        res.datetime = dbobject.datetime;
        res.totalcash = dbobject.totalcash;
        res.cashperplayer = dbobject.cashperplayer;
        res.freecash = dbobject.freecash;*/
        const d = await TurnRepository().insert({
            datetime: turn.datetime,
            totalcash: turn.totalcash,
            cashperplayer: turn.cashperplayer,
            freecash: turn.freecash,
        });

        turn.id = d[0];

        return d[0];
    }

    public static async Last(): Promise<Turn> {
        const data = await TurnRepository().select().orderBy("id", "desc").first();

        if (data) {
            return this.From(data);
        }

        return null;
    }
}

export const TurnRepository = () => Connection("Turns");
