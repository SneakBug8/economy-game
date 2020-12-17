import { Connection } from "DataBase";
import { Good } from "entity/Good";
import { IGoodsBucket } from "entity/interfaces/IGoodsBucket";
import { IInventionEffects } from "./InventionEffects";

export class InventionType
{
    public id: number;
    public name: string;
    public costs: string;
    public Costs: IGoodsBucket;
    public effects: string;
    public Effects: IInventionEffects;

    public parentId: number;

    public static async From(dbobject: any)
    {
        const res = new InventionType();
        res.id = dbobject.id;
        res.name = dbobject.name;
        res.costs = dbobject.costs;
        res.parentId = dbobject.parentId || null;

        res.Costs = new Map(JSON.parse(res.costs));

        res.effects = dbobject.effects;
        res.Effects = JSON.parse(res.effects);

        return res;
    }

    public static async GetById(id: number): Promise<InventionType>
    {
        const data = await InventionRepository().select().where("id", id).first();

        if (data) {
            return this.From(data);
        }

        return null;
    }

    public static async Exists(id: number): Promise<boolean>
    {
        const res = await InventionRepository().count("id as c").where("id", id).first() as any;

        return res.c > 0;
    }

    public static async All(): Promise<InventionType[]>
    {
        const data = await InventionRepository().select();
        const res = new Array<InventionType>();

        if (data) {
            for (const entry of data) {
                res.push(await this.From(entry));
            }

            return res;
        }

        return [];
    }
}

export const InventionRepository = () => Connection("InventionTypes");
