import { Connection } from "DataBase";
import { ModifierType } from "./ModifierType";

export class Modifier
{
    public id: number;
    public name: string;
    public type: ModifierType;
    public value: number;

    public static async From(dbobject: any)
    {
        const res = new Modifier();
        res.id = dbobject.id;
        res.name = dbobject.name;
        res.value = dbobject.value;

        return res;
    }

    public static async GetById(id: number): Promise<Modifier>
    {
        const data = await ModifierRepository().select().where("id", id).first();

        if (data) {
            return this.From(data);
        }

        return null;
    }

    public static async Exists(id: number): Promise<boolean>
    {
        const res = await ModifierRepository().count("id as c").where("id", id).first() as any;

        return res.c > 0;
    }

    public static async All(): Promise<Modifier[]>
    {
        const data = await ModifierRepository().select();
        const res = new Array<Modifier>();

        if (data) {
            for (const entry of data) {
                res.push(await this.From(entry));
            }

            return res;
        }

        return [];
    }
}

export const ModifierRepository = () => Connection("Modifiers");
