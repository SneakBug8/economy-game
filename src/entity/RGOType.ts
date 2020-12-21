import { Connection } from "DataBase";
import { Player } from "./Player";
import { RecipeEntry } from "./Recipe";

export class RGOType
{
    public id: number;
    public name: string;
    public efficiency: number = 1;
    public Produces: RecipeEntry[];
    public lockedByDefault: boolean;

    public InstrumentGoodId: number = null;
    public InstrumentBreakChance: number = 0;

    public async getProducesString() {
        return await RecipeEntry.toString(this.Produces);
    }

    public static From(dbobject: any): RGOType
    {
        const res = new RGOType();
        res.id = dbobject.id;
        res.efficiency = dbobject.efficiency;
        res.Produces = RecipeEntry.Deserialize(dbobject.Produces);
        res.name = dbobject.name;
        res.lockedByDefault = dbobject.lockedByDefault === 1;
        res.InstrumentBreakChance = dbobject.InstrumentBreakChance;
        res.InstrumentGoodId = dbobject.InstrumentGoodId;

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

    public static FromQuery(data: any[]): RGOType[]
    {
        const res = new Array<RGOType>();

        if (data) {
            for (const entry of data) {
                res.push(this.From(entry));
            }

            return res;
        }

        return [];
    }

    public static async All(): Promise<RGOType[]>
    {
        const data = await RGOTypeRepository().select();
        return this.FromQuery(data);
    }
}

export interface IRGOTypeSettings
{
    testSetting: boolean;
}

export const RGOTypeRepository = () => Connection<RGOType>("RGOTypes");