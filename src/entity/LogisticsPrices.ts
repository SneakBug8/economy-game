import { Config } from "config";
import { Connection } from "DataBase";

export class LogisticsPrice
{
    public id: number;
    public fromId: number;
    public toId: number;
    public shipsCost: number;
    public shipsBreakChance: number;
    public horsesCost: number;
    public horsesBreakChance: number;

    public static TradeShipGoodId = Config.TradeShipGoodId;
    public static HorseGoodId = Config.HorseGoodId;

    public static async From(dbobject: any)
    {
        const res = new LogisticsPrice();
        res.id = dbobject.id;
        res.fromId = dbobject.fromId;
        res.toId = dbobject.toId;
        res.shipsCost = dbobject.shipsCost;
        res.shipsBreakChance = dbobject.shipsBreakChance;
        res.horsesCost = dbobject.horsesCost;
        res.horsesBreakChance = dbobject.horsesBreakChance;

        return res;
    }

    public static async GetFromTo(fromId: number, toId: number): Promise<LogisticsPrice>
    {
        const data = await LogisticsPricessRepository().select()
            .where("fromId", fromId)
            .andWhere("toId", toId).first();

        if (data) {
            return this.From(data);
        }

        return null;
    }

    public static async GetFrom(fromId: number): Promise<LogisticsPrice[]>
    {
        const data = await LogisticsPricessRepository().select()
            .where("fromId", fromId);

        const res = new Array<LogisticsPrice>();

        if (data) {
            for (const entry of data) {
                res.push(await this.From(entry));
            }
        }

        return res;
    }

    public static async Count(): Promise<number>
    {
        const data = await LogisticsPricessRepository().count("id as c").first() as any;

        if (data) {
            return data.c;
        }

        return null;
    }

    public static async Exists(id: number): Promise<boolean>
    {
        const res = await LogisticsPricessRepository().count("id as c").where("id", id).first() as any;

        return res.c > 0;
    }

    public static async All(): Promise<LogisticsPrice[]>
    {
        const data = await LogisticsPricessRepository().select();
        const res = new Array<LogisticsPrice>();

        if (data) {
            for (const entry of data) {
                res.push(await this.From(entry));
            }

            return res;
        }

        return [];
    }
}

export const LogisticsPricessRepository = () => Connection<LogisticsPrice>("LogisticsPrices");
