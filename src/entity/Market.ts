import { Connection } from "DataBase";

export class Market {
    public id: number;

    public static async From(dbobject: any) {
        const res = new Market();
        res.id = dbobject.id;

        return res;
    }

    public static async GetById(id: number): Promise<Market> {
        const data = await MarketRepository().select().where("id", id).first();

        if (data) {
            return this.From(data);
        }

        return null;
    }

    public static async Exists(id: number): Promise<boolean> {
        const res = await MarketRepository().count("id as c").where("id", id).first() as any;

        return res.c > 0;
    }

    public static async All(): Promise<Market[]> {
        const data = await MarketRepository().select();
        const res = new Array<Market>();

        if (data) {
            for (const entry of data) {
                res.push(await this.From(entry));
            }

            return res;
        }

        return [];
    }
}

export const MarketRepository = () => Connection("Markets");