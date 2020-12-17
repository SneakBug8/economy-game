import { Good } from "entity/Good";
import { Log } from "entity/Log";

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
}

export class RecipeEntry
{
    public Good: Good;
    public amount: number;

    constructor(good?: Good, amount?: number)
    {
        if (good) {
            this.Good = good;
        }

        if (amount) {
            this.amount = amount;
        }
    }
}

export class RecipesService
{
    // tslint:disable: one-variable-per-declaration
    public static FirstToFirst: Recipe;

    public static firstgood: Good;

    public static async Init()
    {
        // Where recipes are added
        this.firstgood = await Good.GetById(2);
        this.FirstToFirst = new Recipe(1, "Test",
            [
                new RecipeEntry(this.firstgood, 1),
            ],
            [
                new RecipeEntry(this.firstgood, 2),
            ],
            1,
            2,
            0.1,
        );

        this.All.push(this.FirstToFirst);

        Log.LogText("Recipes initialized");
    }

    public static GetById(id: number)
    {
        for (const recipe of this.All) {
            if (recipe.id === id) {
                return recipe;
            }
        }

        return null;
    }

    static All = new Array<Recipe>();
}