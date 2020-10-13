import { Connection } from "DataBase";

export class MarketActor {
    public id: number;

    public static async From(dbobject: any) {
        const res = new MarketActor();
        res.id = dbobject.id;

        return res;
    }

    public static async GetById(id: number): Promise<MarketActor> {
        const data = await MarketActorRepository().select().where("id", id).first();

        if (data) {
            return this.From(data);
        }

        return null;
    }

    public static async Exists(id: number): Promise<boolean> {
        const res = await MarketActorRepository().count("id as c").where("id", id).first() as any;

        return res.c > 0;
    }

    public static async Insert(actor: MarketActor): Promise<number> {
        const d = await MarketActorRepository().insert({
            id: actor.id,
        });

        actor.id = d[0];

        return d[0];
    }

    public static async Delete(id: number): Promise<boolean> {
        await MarketActorRepository().delete().where("id", id);

        return true;
    }
}

export const MarketActorRepository = () => Connection("MarketActors");