import { getAsync } from "DB";

export class MarketActor {
    public id: number;

    static Actors: { [id: number]: MarketActor; } = {};

    public constructor(dbobject: any) {
        this.id = dbobject.id;
    }

    public static async GetById(id: number): Promise<MarketActor> {
        if (this.Actors[id]) {
            return this.Actors[id];
        }

        const data = await getAsync("select * from MarketActors where id = ?", id);

        /*Connection.get("select * from BuyOffers where id = ?", id, (err, data) => {
            console.log(data);
        });*/

        this.Actors[id] = new MarketActor(data);

        return this.Actors[id];
    }

    public static async Exists(id: number): Promise<boolean>
    {
        if (this.Actors[id]) {
            return true;
        }

        const data = await getAsync("select count(id) as c from MarketActors where id = ?", id);

        return data.c > 0;
    }
}