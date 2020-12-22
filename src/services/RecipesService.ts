import { timeStamp } from "console";
import { Good } from "entity/Good";
import { Log } from "entity/Log";
import { Recipe, RecipeEntry } from "entity/Recipe";
import { GoodsList } from "./GoodsList";

export class RecipesService
{
    public static firstgood: Good;

    public static async Init()
    {
        this.All = this.All.concat(await Recipe.All());

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

    public static async PrepareToRender(recipe: Recipe) {
        const entry = {
            name: recipe.name || recipe.id,
            id: recipe.id,
            requisites: "",
            results: "",
            workers: recipe.employeesneeded,
            instrument: null,
            chance: (recipe.InstrumentBreakChance) ? recipe.InstrumentBreakChance * 100 : null,
        };

        const instrgood = await Good.GetById(recipe.InstrumentGoodId);
        if (instrgood) {
            entry.instrument = instrgood.name;
        }

        let i = 0;
        for (const input of recipe.Requisites) {
            const good = await Good.GetById(input.GoodId);

            if (recipe.Requisites.length === 1 || i === recipe.Requisites.length - 1) {
                entry.requisites += `<a href="/good/${good.id}">${input.Amount} ${good.name}</a>`;
            }
            else {
                entry.requisites += `<a href="/good/${good.id}">${input.Amount} ${good.name}</a>, `;
            }

            i++;
        }

        i = 0;

        for (const output of recipe.Results) {
            const good = await Good.GetById(output.GoodId);
            if (recipe.Results.length === 1 || i === recipe.Results.length - 1) {
                entry.results += `<a href="/good/${good.id}">${output.Amount} ${good.name}</a>`;
            }
            else {
                entry.results += `<a href="/good/${good.id}">${output.Amount} ${good.name}</a>, `;
            }

            i++;
        }

        return entry;
    }

    public static GetWithGood(goodID: number)
    {
        const res: Recipe[] = [];

        loop1:
        for (const recipe of this.All) {
            for (const req of recipe.Requisites) {
                if (req.GoodId === goodID) {
                    res.push(recipe);
                    break loop1;
                }
            }
            for (const preres of recipe.Results) {
                if (preres.GoodId === goodID) {
                    res.push(recipe);
                    break loop1;
                }
            }
        }

        return res;
    }

    static All: Recipe[] = [];
}