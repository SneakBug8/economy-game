import { Connection } from "DataBase";

export class RGOMarketToType
{
    public id: number;
    public marketId: number;
    public typeId: number;
    public maxAmount: number = 1;

    public static async From(dbobject: any): Promise<RGOMarketToType>
    {
        const res = new RGOMarketToType();
        res.id = dbobject.id;
        res.marketId = dbobject.marketId;
        res.typeId = dbobject.typeId;
        res.maxAmount = dbobject.maxAmount;

        return res;
    }

    public static async GetById(id: number): Promise<RGOMarketToType>
    {
        const data = await RGOMarketToTypesRepository().select().where("id", id).first();

        if (data) {
            return this.From(data);
        }

        return null;
    }

    public static async Exists(id: number): Promise<boolean>
    {
        const res = await RGOMarketToTypesRepository().count("id as c").where("id", id).first() as any;

        return res.c > 0;
    }

    /*public static async BuildableWithinRegion(marketId: number): Promise<RGOMarketToType[]>
    {
        const data = await Connection.raw("select * from RGOTypes where marketId = 1 " +
        "and (select count(id) from RGOs where RGOs.typeId = RGOTypes.id) < maxAmount;");
        const res = new Array<RGOMarketToType>();

        if (data) {
            for (const entry of data) {
                res.push(await this.From(entry));
            }

            return res;
        }

        return [];
    }*/

    public static async All(): Promise<RGOMarketToType[]>
    {
        const data = await RGOMarketToTypesRepository().select();
        const res = new Array<RGOMarketToType>();

        if (data) {
            for (const entry of data) {
                res.push(await this.From(entry));
            }

            return res;
        }

        return [];
    }
}

export const RGOMarketToTypesRepository = () => Connection("RGOMarketToType");
