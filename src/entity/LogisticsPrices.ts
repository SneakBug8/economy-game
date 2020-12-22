import { Config } from "config";
import { Connection } from "DataBase";
import { GoodsList } from "services/GoodsList";

export class LogisticsPrice
{
    public id: number;
    public fromId: number;
    public toId: number;
    public shipsCost: number;
    public shipsBreakChance: number;
    public horsesCost: number;
    public horsesBreakChance: number;

    public static TradeShipsGoodId = GoodsList.TradeShips;
    public static HorseGoodId = GoodsList.Horses;

    public static async From(dbobject: any, reverse: boolean = false)
    {
        const res = new LogisticsPrice();
        res.id = dbobject.id;
        if (!reverse) {
            res.fromId = dbobject.fromId;
            res.toId = dbobject.toId;
        }
        else {
            res.toId = dbobject.fromId;
            res.fromId = dbobject.toId;
        }
        res.shipsCost = dbobject.shipsCost;
        res.shipsBreakChance = dbobject.shipsBreakChance;
        res.horsesCost = dbobject.horsesCost;
        res.horsesBreakChance = dbobject.horsesBreakChance;

        return res;
    }

    public static async GetFromTo(fromId: number, toId: number): Promise<LogisticsPrice>
    {
        const r1 = await LogisticsPricessRepository().select()
            .where("fromId", fromId)
            .andWhere("toId", toId).first();

        if (r1) {
            return this.From(r1);
        }

        const r2 = await LogisticsPricessRepository().select()
            .where("toId", fromId)
            .andWhere("fromId", toId).first();

        if (r2) {
            return this.From(r2, true);
        }

        return null;
    }

    public static async GetFrom(fromId: number): Promise<LogisticsPrice[]>
    {
        const r1 = await LogisticsPricessRepository().select()
            .where("fromId", fromId);
        const r2 = await LogisticsPricessRepository().select()
            .where("toId", fromId);

        const res = new Array<LogisticsPrice>();

        if (r1) {
            for (const entry of r1) {
                res.push(await this.From(entry));
            }
        }
        if (r2) {
            for (const entry of r2) {
                res.push(await this.From(entry, true));
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
