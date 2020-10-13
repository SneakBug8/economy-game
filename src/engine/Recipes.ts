import { Good } from "entity/Good";

export class Recipe
{
    public Requisites: RecipeEntry[];
    public employeesneeded: number = 1;
    public Results: RecipeEntry[];

    constructor(requisites?: RecipeEntry[], results?: RecipeEntry[], employeesneeded?: number)
    {
        if (requisites) {
            this.Requisites = requisites;
        }
        if (results) {
            this.Results = results;
        }
        if (employeesneeded) {
            this.employeesneeded = employeesneeded;
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

export class Recipes
{
    // tslint:disable: one-variable-per-declaration
    public static FirstToFirst;

    public static firstgood;

    public static async Init()
    {
        this.firstgood = await Good.GetById(1);
        this.FirstToFirst = new Recipe(
            [
                new RecipeEntry(this.firstgood, 1),
            ],
            [
                new RecipeEntry(this.firstgood, 2),
            ]
        );
        this.All[1] = this.FirstToFirst;
    }

    public static All = [];
}