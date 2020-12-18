import { Good } from "./Good";

export class Recipe
{
    public id: number;
    public name: string;
    public Requisites: RecipeEntry[];
    public employeesneeded: number = 1;
    public Results: RecipeEntry[];

    public InstrumentGoodId: number = null;
    public InstrumentBreakChance: number = 0;

    constructor(id: number, name: string, requisites?: RecipeEntry[], results?: RecipeEntry[], employeesneeded?: number,
        InstrumentGoodId?: number, InstrumentBreakChance?: number)
    {
        this.id = id;
        this.name = name;

        if (requisites) {
            this.Requisites = requisites;
        }
        if (results) {
            this.Results = results;
        }
        if (employeesneeded) {
            this.employeesneeded = employeesneeded;
        }
        if (InstrumentGoodId) {
            this.InstrumentGoodId = InstrumentGoodId;
        }
        if (InstrumentBreakChance) {
            this.InstrumentBreakChance = InstrumentBreakChance;
        }
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