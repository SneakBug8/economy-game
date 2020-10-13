import { getAsync } from "DB";

export class Good
{
    id: number;
    name: string;

    static Goods: { [id: number]: Good; } = {};

    public constructor(dbobject: any)
    {
        this.id = dbobject.id;
        this.name = dbobject.name;
    }

    public static async GetById(id: number): Promise<Good>
    {
        if (this.Goods[id]) {
            return this.Goods[id];
        }

        const data = await getAsync("select * from Goods where id = ?", id);

        /*Connection.get("select * from BuyOffers where id = ?", id, (err, data) => {
            console.log(data);
        });*/

        this.Goods[id] = new Good(data);

        return this.Goods[id];
    }

    public static async Exists(id: number): Promise<boolean>
    {
        if (this.Goods[id]) {
            return true;
        }

        const data = await getAsync("select count(id) as c from Goods where id = ?", id);

        return data.c > 0;
    }
}