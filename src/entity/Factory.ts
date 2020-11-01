import { Connection } from "DataBase";
import { Log } from "./Log";

export class Factory {
    public id: number;
    public employeesCount: number;
    public targetEmployees: number;
    public salary: number;
    public RecipeId: number;

    public static async From(dbobject: any): Promise<Factory> {
        const res = new Factory();
        res.id = dbobject.id;
        res.employeesCount = dbobject.employees_count;
        res.targetEmployees = dbobject.targetEmployees;
        res.salary = dbobject.salary;
        res.RecipeId = dbobject.recipe_id;

        return res;
    }

    public static async GetById(id: number): Promise<Factory> {
        const data = await FactoryRepository().select().where("id", id).first();

        if (data) {
            return this.From(data);
        }

        return null;
    }

    public static async Exists(id: number): Promise<boolean> {
        const res = await FactoryRepository().count("id as c").where("id", id).first() as any;

        return res.c > 0;
    }

    public static async Update(factory: Factory)
    {
        await FactoryRepository().where("id", factory.id).update({
            employees_count: factory.employeesCount,
            targetEmployees: factory.targetEmployees,
            salary: factory.salary,
            recipe_id: factory.RecipeId,
        });
    }

    public static async Insert(factory: Factory): Promise<number> {
        const d = await FactoryRepository().insert({
            id: factory.id,
            employees_count: factory.employeesCount,
            targetEmployees: factory.targetEmployees,
            salary: factory.salary,
            recipe_id: factory.RecipeId,
        });

        factory.id = d[0];

        return d[0];
    }

    public static async Delete(id: number): Promise<boolean> {
        await FactoryRepository().delete().where("id", id);

        Log.LogText("Deleted factory id " + id);

        return true;
    }

    public static async All(): Promise<Factory[]> {
        const data = await FactoryRepository().select();
        const res = new Array<Factory>();

        if (data) {
            for (const entry of data) {
                res.push(await this.From(entry));
            }

            return res;
        }

        return [];
    }
}

export const FactoryRepository = () => Connection("Factories");