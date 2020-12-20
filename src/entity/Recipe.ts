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

        const r = new Map<number, number>(JSON.parse(dbobject.Requisites));
        for (const i of r) {
            res.Requisites.push(new RecipeEntry(i[0], i[1]));
        }
        const m = new Map<number, number>(JSON.parse(dbobject.Requisites));
        for (const i of m) {
            res.Results.push(new RecipeEntry(i[0], i[1]));
        }
        res.InstrumentGoodId = dbobject.InstrumentGoodId;
        res.InstrumentBreakChance = dbobject.InstrumentBreakChance;
        res.employeesneeded = dbobject.employeesneeded;
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

    async Init() {
        for (const req of this.Requisites) {
            await req.Init();
        }
        for (const req of this.Results) {
            await req.Init();
        }
    }
}

export class RecipeEntry
{
    public GoodId: number;
    public Good: Good;
    public amount: number;

    constructor(goodId?: number, amount?: number)
    {
        if (goodId) {
            this.GoodId = goodId;
        }

        if (amount) {
            this.amount = amount;
        }
    }

    async Init() {
        this.Good = await Good.GetById(this.GoodId);
    }
}
export const RecipesRepository = () => Connection<Recipe>("Recipes");
