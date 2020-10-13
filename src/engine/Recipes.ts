import { Good } from "entity/Good";

export class Recipe
{
    public id: number;
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
    public static FirstToFirst: Recipe;

    public static firstgood: Good;

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
        this.FirstToFirst.id = 1;
        this.All.push(this.FirstToFirst);
    }

    public static GetById(id: number) {
        for (const recipe of this.All) {
            if (recipe.id === id) {
                return recipe;
            }
        }

        return null;
    }

    static All = new Array<Recipe>();
}