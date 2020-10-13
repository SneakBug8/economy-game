import { getAsync, runAsync } from "DB";

export class Turn
{
    public id: number;
    public datetime: Text;
    public totalcash: number;
    public cashperplayer: number;
    public freecash: number;

    public constructor(dbobject: any)
    {
        this.id = dbobject.id;
        this.datetime = dbobject.datetime;
        this.totalcash = dbobject.totalcash;
        this.cashperplayer = dbobject.cashperplayer;
        this.freecash = dbobject.freecash;
    }

    public static async GetById(id: number): Promise<Turn>
    {
        const data = await getAsync("select * from Turns where id = ?", id);

        if (!data) {
            return null;
        }

        return new Turn(data);
    }

    public static async Add(totalcash: number, cashperplayer: number, freecash: number)
    {
        await runAsync(`insert into Turns(datetime, totalcash, cashperplayer, freecash) values(?, ?, ?, ?);`,
            [new Date().toString(), totalcash, cashperplayer, freecash]);

        const res = await getAsync("SELECT last_insert_rowid() as id", []);

        return res;
    }

    public static async Delete(id: number)
    {
        await runAsync("delete from Turns where id = ?", id);
    }

    public static async Exists(id: number): Promise<boolean>
    {
        /*if (this.BuyOffers[id]) {
            return true;
        }*/

        const data = await getAsync("select count(id) as c from Turns where id = ?", id);

        return data.c > 0;
    }
}