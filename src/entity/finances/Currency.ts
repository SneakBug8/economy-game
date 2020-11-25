import { Connection } from "DataBase";
import { Good } from "entity/Good";

export class Currency
{
    public id: number;
    public name: string;
    public color: string;
    public goodId: number;
    public exchangeRate: number;

    public static async From(dbobject: any)
    {
        const res = new Currency();
        res.id = dbobject.id;
        res.name = dbobject.name;
        res.color = dbobject.color;
        res.goodId = dbobject.goodId;
        res.exchangeRate = dbobject.exchangeRate;

        return res;
    }

    public async getGood()
    {
        return Good.GetById(this.goodId);
    }

    public static async GetById(id: number): Promise<Currency>
    {
        const data = await CurrencyRepository().select().where("id", id).first();

        if (data) {
            return this.From(data);
        }

        return null;
    }

    public static async Exists(id: number): Promise<boolean>
    {
        const res = await CurrencyRepository().count("id as c").where("id", id).first() as any;

        return res.c > 0;
    }

    public static async All(): Promise<Currency[]>
    {
        const data = await CurrencyRepository().select();
        const res = new Array<Currency>();

        if (data) {
            for (const entry of data) {
                res.push(await this.From(entry));
            }

            return res;
        }

        return [];
    }
}

export const CurrencyRepository = () => Connection("Currencies");