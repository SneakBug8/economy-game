import { Connection } from "DataBase";
import { Good } from "entity/Good";

export class Invention
{
    public playerId: number;
    public inventionId: number;

    public static async From(dbobject: any)
    {
        const res = new Invention();
        res.playerId = dbobject.playerId;
        res.inventionId = dbobject.inventionId;

        return res;
    }

    public static async HasInvention(playerId: number, inventionId: number): Promise<Invention>
    {
        const data = await InventionRepository()
        .select().where("playerId", playerId).andWhere("inventionId", inventionId)
        .first();

        if (data) {
            return this.From(data);
        }

        return null;
    }

    public static async UnlockInvention(playerId: number, inventionId: number)
    {
        const data = await InventionRepository().insert({playerId, inventionId});

        return data[0] || null;
    }

    public static async All(): Promise<Invention[]>
    {
        const data = await InventionRepository().select();
        const res = new Array<Invention>();

        if (data) {
            for (const entry of data) {
                res.push(await this.From(entry));
            }

            return res;
        }

        return [];
    }
}

export const InventionRepository = () => Connection<Invention>("Inventions");
