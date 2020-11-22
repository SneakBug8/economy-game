import { Connection } from "DataBase";
import { Good } from "./Good";
import { Turn } from "./Turn";

export class PlayerProfitPerGood
{
    public id: number;
    public playerId: number;
    public goodId: number;
    public profit: number;
    public sold: number;
    public bought: number;

    public tradeamount: number;

    public static async From(dbobject: any)
    {
        const res = new PlayerProfitPerGood();
        res.id = dbobject.id;
        res.playerId = dbobject.playerId;
        res.goodId = dbobject.goodId;
        res.profit = dbobject.profit;
        res.sold = dbobject.sold;
        res.bought = dbobject.bought;
        return res;
    }

    public static async Create(playerId: number, goodid: number)
    {
        const record = new PlayerProfitPerGood();
        record.playerId = playerId;
        record.goodId = goodid;
        record.profit = 0;
        record.sold = 0;
        record.bought = 0;

        await this.Insert(record);
    }

    public static async GetWithPlayerAndGood(playerId: number, goodId: number): Promise<PlayerProfitPerGood>
    {
        const data = await PlayerProfitPerGoodRepository().select()
            .where("goodId", goodId)
            .andWhere("playerId", playerId).first();

        if (data) {
            return this.From(data);
        }

        return null;
    }

    public static async Count(): Promise<number>
    {
        const data = await PlayerProfitPerGoodRepository().count("id as c").first() as any;

        if (data) {
            return data.c;
        }

        return null;
    }

    public static async Exists(id: number): Promise<boolean>
    {
        const res = await PlayerProfitPerGoodRepository().count("id as c").where("id", id).first() as any;

        return res.c > 0;
    }

    public static async Update(record: PlayerProfitPerGood): Promise<number>
    {
        const d = await PlayerProfitPerGoodRepository().where("id", record.id).update(record);

        return d[0];
    }


    public static async Insert(record: PlayerProfitPerGood): Promise<number>
    {
        const d = await PlayerProfitPerGoodRepository().insert(record);

        record.id = d[0];

        return d[0];
    }

    public static async Delete(id: number): Promise<boolean>
    {
        await PlayerProfitPerGoodRepository().delete().where("id", id);

        return true;
    }

    public static async All(): Promise<PlayerProfitPerGood[]>
    {
        const data = await PlayerProfitPerGoodRepository().select();
        const res = new Array<PlayerProfitPerGood>();

        if (data) {
            for (const entry of data) {
                res.push(await this.From(entry));
            }

            return res;
        }

        return [];
    }
}

export const PlayerProfitPerGoodRepository = () => Connection<PlayerProfitPerGood>("PlayerProfitPerGood");
