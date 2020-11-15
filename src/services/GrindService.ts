import { Good } from "entity/Good";
import { Log } from "entity/Log";

export class GrindRecipe
{
    public id: number;
    public name: string;
    public Results: GrindEntry[];

    constructor(id: number, name: string, results: GrindEntry[])
    {
        this.id = id;
        this.name = name;
        if (results) {
            this.Results = results;
        }
    }
}

export class GrindEntry
{
    public goodId: number;
    public amount: number;

    constructor(goodId?: number, amount?: number)
    {
        if (goodId) {
            this.goodId = goodId;
        }

        if (amount) {
            this.amount = amount;
        }
    }
}

export class GrindService
{
    // tslint:disable: one-variable-per-declaration

    public static async Init()
    {
        // Where recipes are added
        // this.All.push();

        const woodrecipe = new GrindRecipe(1, "Chop wood", [{
            goodId: 1,
            amount: 1,
        }]);

        this.All.push(woodrecipe);

        Log.LogText("Grind initialized");
    }

    public static GetById(id: number) {
        for (const recipe of this.All) {
            if (recipe.id === id) {
                return recipe;
            }
        }

        return null;
    }

    static All = new Array<GrindRecipe>();
}