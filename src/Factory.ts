import { getAsync } from "DB";
import { Good } from "Good";

export class Factory {
    public id: number;
    public good_id: number;
    public employees_count: number;
    public salary: number;
    public Good: Good;

    static Factories: { [id: number]: Factory; } = {};

    public static async From(dbobject: any) {
        const res = new Factory();
        res.id = dbobject.id;
        res.good_id = dbobject.good_id;
        res.employees_count = dbobject.employees_count;
        res.salary = dbobject.salary;
        await res.LoadDependencies();

        return res;
    }

    public async LoadDependencies() {
        this.Good = await Good.GetById(this.good_id);
    }

    public static async GetById(id: number): Promise<Factory>
    {
        if (this.Factories[id]) {
            return this.Factories[id];
        }

        const data = await getAsync("select * from Factories where id = ?", id);

        this.Factories[id] = await Factory.From(data);

        return this.Factories[id];
    }

    public static async Exists(id: number): Promise<boolean>
    {
        if (this.Factories[id]) {
            return true;
        }

        const data = await getAsync("select count(id) as c from Factories where id = ?", id);

        return data.c > 0;
    }
}