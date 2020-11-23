import { Connection } from "DataBase";
import { Good } from "./Good";
import { Turn } from "./Turn";

export class Statistics<T>
{
    public id: number;
    public type: StatisticsTypes;
    public playerId: number;
    public turnId: number;
    public value: string;
    public Value: T;

    public static From<T>(dbobject: any): Statistics<T>
    {
        const res = new Statistics<T>();
        res.id = dbobject.id;
        res.playerId = dbobject.playerId;
        res.turnId = dbobject.turnId;
        res.type = dbobject.type;
        res.value = dbobject.value;
        res.Value = JSON.parse(res.value) as T;

        return res;
    }

    public static async Create<T>(playerId: (number | null), turnId: number, type: StatisticsTypes, Value: T)
    {
        const record = new Statistics<T>();
        record.playerId = playerId;
        record.turnId = turnId;
        record.type = type;
        record.value = JSON.stringify(Value);

        return await this.Insert(record);
    }

    public static async GetWithPlayer<T>(playerId: number): Promise<Array<Statistics<T>>>
    {
        const data = await StatisticsRepository().select()
            .where("playerId", playerId);

        const res = new Array<Statistics<T>>();

        if (data) {
            for (const entry of data) {
                res.push(await this.From<T>(entry));
            }
        }

        return res;
    }

    public static async GetWithPlayerAndTurn<T>(playerId: number, turnId: number): Promise<Array<Statistics<T>>>
    {
        const data = await StatisticsRepository().select()
            .where("playerId", playerId)
            .andWhere("turnId", turnId);

        const res = new Array<Statistics<T>>();

        if (data) {
            for (const entry of data) {
                res.push(await this.From<T>(entry));
            }
        }

        return res;
    }

    public static async GetWithPlayerAndType<T>(playerId: number, type: StatisticsTypes): Promise<Array<Statistics<T>>>
    {
        const data = await StatisticsRepository().select()
            .where("playerId", playerId)
            .andWhere("type", type);

        const res = new Array<Statistics<T>>();

        if (data) {
            for (const entry of data) {
                res.push(await this.From<T>(entry));
            }
        }

        return res;
    }

    public static async GetWithType<T>(type: StatisticsTypes): Promise<Array<Statistics<T>>>
    {
        const data = await StatisticsRepository().select()
            .andWhere("type", type);

        const res = new Array<Statistics<T>>();

        if (data) {
            for (const entry of data) {
                res.push(await this.From<T>(entry));
            }
        }

        return res;
    }

    public static async GetWithPlayerAndTurnAndType<T>(playerId: number | null, turnId: number, type: StatisticsTypes): Promise<Statistics<T>>
    {
        const data = await StatisticsRepository().select()
            .where("playerId", playerId)
            .andWhere("turnId", turnId)
            .andWhere("type", type).first();

        if (data) {
            return await this.From<T>(data);
        }

        return null;
    }

    public static async Update<T>(record: Statistics<T>): Promise<number>
    {
        const d = await StatisticsRepository().where("id", record.id).update(record);

        return d[0];
    }


    public static async Insert<T>(record: Statistics<T>): Promise<number>
    {
        const d = await StatisticsRepository().insert(record);

        record.id = d[0];

        return d[0];
    }

    public static async Delete(id: number): Promise<boolean>
    {
        await StatisticsRepository().delete().where("id", id);

        return true;
    }

    public static async All(): Promise<Array<Statistics<any>>>
    {
        const data = await StatisticsRepository().select();
        const res = new Array<Statistics<any>>();

        if (data) {
            for (const entry of data) {
                res.push(await this.From(entry));
            }

            return res;
        }

        return [];
    }
}

export enum StatisticsTypes
{
    PlayerRecord,
    MedianCashRecord,
}

export interface IPlayerStatisticsRecord
{
    cash: number;
}

export interface IMedianCashRecord
{
    cash: number;
}

export const StatisticsRepository = () => Connection<Statistics<any>>("Statistics");
