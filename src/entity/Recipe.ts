import { Connection } from "DataBase";
import { Good } from "./Good";

export class Recipe
{
    public id: number;
    public name: string;
    public Requisites: RecipeEntry[] = [];
    public Results: RecipeEntry[] = [];
    public employeesneeded: number = 1;
    public InstrumentGoodId: number = null;
    public InstrumentBreakChance: number = 0;

    public static async From(dbobject: any)
    {
        const res = new Recipe();

        res.id = dbobject.id;
        res.name = dbobject.name;

        res.Requisites = RecipeEntry.Deserialize(dbobject.Requisites);
        res.Results = RecipeEntry.Deserialize(dbobject.Results);
        res.InstrumentGoodId = dbobject.InstrumentGoodId;
        res.InstrumentBreakChance = dbobject.InstrumentBreakChance;
        res.employeesneeded = dbobject.employeesneeded || res.employeesneeded;
        return res;
    }

    public static async All(): Promise<Recipe[]> {
        const data = await RecipesRepository().select();
        const res = new Array<Recipe>();

        if (data) {
            for (const entry of data) {
                res.push(await this.From(entry));
            }

            return res;
        }

        return [];
    }

    public static Create(id: number, name: string, requisites?: RecipeEntry[], results?: RecipeEntry[], employeesneeded?: number,
        InstrumentGoodId?: number, InstrumentBreakChance?: number)
    {
        const r = new Recipe();
        r.id = id;
        r.name = name || id + "";

        if (requisites) {
            r.Requisites = requisites;
        }
        if (results) {
            r.Results = results;
        }
        if (employeesneeded) {
            r.employeesneeded = employeesneeded;
        }
        if (InstrumentGoodId) {
            r.InstrumentGoodId = InstrumentGoodId;
        }
        if (InstrumentBreakChance) {
            r.InstrumentBreakChance = InstrumentBreakChance;
        }
        return r;
    }
}

export class RecipeEntry
{
    public GoodId: number;
    public Amount: number;

    constructor(goodId?: number, amount?: number)
    {
        if (goodId) {
            this.GoodId = goodId;
        }

        if (amount) {
            this.Amount = amount;
        }
    }

    public static Deserialize(input: string) {
        const r = new Map<number, number>(JSON.parse(input));
        const m: RecipeEntry[] = [];
        for (const i of r) {
            m.push(new RecipeEntry(i[0], i[1]));
        }
        return m;
    }

    public static async toString(inp: RecipeEntry[]) {
        let res = "";
        let i = 0;
        for (const cost of inp) {
            const good = await Good.GetById(cost.GoodId);
            if (inp.length === 1 || i === inp.length - 1) {
                res += `${cost.Amount} ${good.name}`;
            }
            else {
                res += `${cost.Amount} ${good.name}, `;
            }
            i++;
        }

        return res;
    }
}
export const RecipesRepository = () => Connection<Recipe>("Recipes");
