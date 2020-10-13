import { getAsync } from "DB";

export class Market {
    static Markets: { [id: number]: Market; } = {};

    public id: number;

    public constructor(dbobject: any)
    {
        this.id = dbobject.id;
    }

    public static async GetById(id: number): Promise<Market>
    {
        if (this.Markets[id]) {
            return this.Markets[id];
        }

        const data = await getAsync("select * from Markets where id = ?", id);

        /*Connection.get("select * from BuyOffers where id = ?", id, (err, data) => {
            console.log(data);
        });*/

        this.Markets[id] = new Market(data);

        return this.Markets[id];
    }

    public static async Exists(id: number): Promise<boolean>
    {
        if (this.Markets[id]) {
            return true;
        }

        const data = await getAsync("select count(id) as c from Markets where id = ?", id);

        return data.c > 0;
    }
}