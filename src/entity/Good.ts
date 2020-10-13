import { Connection } from "DataBase";

export class Good
{
    id: number;
    name: string;
    image: string;

    public static async From(dbobject: any) {
        const res = new Good();
        res.id = dbobject.id;
        res.name = dbobject.name;
        res.image = dbobject.image;

        return res;
    }

    public static async GetById(id: number): Promise<Good> {
        const data = await GoodRepository().select().where("id", id).first();

        if (data) {
            return this.From(data);
        }

        return null;
    }

    public static async All(): Promise<Good[]> {
        const data = await GoodRepository().select();
        const res = new Array<Good>();

        if (data) {
            for (const entry of data) {
                res.push(await this.From(entry));
            }

            return res;
        }

        return [];
    }

    public static async Exists(id: number): Promise<boolean> {
        const res = await GoodRepository().count("id as c").where("id", id).first() as any;

        return res.c > 0;
    }
}

export const GoodRepository = () => Connection<Good>("Goods");