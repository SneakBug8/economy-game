import { Connection } from "DataBase";
import { Log } from "./Log";
import { Player } from "./Player";
import { Good } from "./Good";
import { Logger } from "utility/Logger";

export class RGOType
{
    public id: number;
    public efficiency: number = 1;
    private goodId: number;

    public async getGood(): Promise<Good>
    {
        return Good.GetById(this.goodId);
    }
    public getGoodId(): number
    {
        return this.goodId;
    }
    public setGood(good: Good)
    {
        this.goodId = good.id;
    }
    public setGoodId(goodId: number)
    {
        this.goodId = goodId;
    }

    public static async From(dbobject: any): Promise<RGOType>
    {
        const res = new RGOType();
        res.id = dbobject.id;
        res.efficiency = dbobject.efficiency;
        res.goodId = dbobject.goodId;

        return res;
    }

    public static async GetById(id: number): Promise<RGOType>
    {
        const data = await RGOTypeRepository().select().where("id", id).first();

        if (data) {
            return this.From(data);
        }

        return null;
    }

    public static async GetWithPlayer(player: Player): Promise<RGOType[]>
    {
        const data = await RGOTypeRepository().select().where("playerId", player.id);

        const res = new Array<RGOType>();

        if (data) {
            for (const entry of data) {
                res.push(await this.From(entry));
            }

            return res;
        }

        return [];
    }

    public static async Exists(id: number): Promise<boolean>
    {
        const res = await RGOTypeRepository().count("id as c").where("id", id).first() as any;

        return res.c > 0;
    }

    public static async Update(type: RGOType)
    {
        await RGOTypeRepository().where("id", type.id).update({
            efficiency: type.efficiency,
            goodId: type.goodId,
        });
    }

    public static async Insert(type: RGOType): Promise<number>
    {
        const d = await RGOTypeRepository().insert({
            efficiency: type.efficiency,
            goodId: type.goodId
        });

        type.id = d[0];

        Logger.info("Created RGOType " + type.id);

        return d[0];
    }

    public static async Delete(id: number): Promise<boolean>
    {
        const RGOType = await this.GetById(id);

        await RGOTypeRepository().delete().where("id", id);

        Log.LogText("Deleted RGOType id " + id);

        return true;
    }

    public static async All(): Promise<RGOType[]>
    {
        const data = await RGOTypeRepository().select();
        const res = new Array<RGOType>();

        if (data) {
            for (const entry of data) {
                res.push(await this.From(entry));
            }

            return res;
        }

        return [];
    }
}

export interface IRGOTypeSettings
{
    testSetting: boolean;
}

export const RGOTypeRepository = () => Connection("RGOTypes");